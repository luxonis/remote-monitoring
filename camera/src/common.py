import ctypes
import logging
import os
import time
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path
from typing import List

import psutil
from imutils.video import FPS
import cv2
from multiprocessing import Process, Value, Manager, Lock
import boto3
import numpy as np
import io
import depthai  # access the camera and its data packets
import consts.resource_paths  # load paths to depthai resources

from src.config import AWS_SERVER_PUBLIC_KEY, AWS_SERVER_SECRET_KEY, VIDEO_WRITER_FOURCC, VIDEO_WRITER_CONTENT_TYPE, \
    IMAGE_WRITER_CONTENT_TYPE, IMAGE_WRITER_EXT, STORAGE_PATH, MAX_PARALLEL_UPLOADS, CRITICAL_REQUIRED_SPACE, \
    DISABLE_NETWORK, AWS_SERVER_BUCKET_NAME
from src.variables import DetectionTypes, MB

log = logging.getLogger(__name__)


def max_central_square_crop(image):
    height, width = image.shape[:2]

    if width > height:
        image = image[:, (width - height) // 2:(width - height) // 2 + height]
    else:
        image = image[(height - width) // 2:(height - width) // 2 + width, :]

    return image


def crop_resize(image, width, height):
    image = cv2.resize(image, (width, height))
    return image


class SourceNotAvailableException(Exception):
    pass


class MuxingFailedException(Exception):
    pass


class OutOfStorageException(Exception):
    pass


class DepthAI:
    car_label = 1
    person_label = 2

    @staticmethod
    def create_pipeline(config):
        log.info("Creating DepthAI pipeline...")
        if not depthai.init_device(consts.resource_paths.device_cmd_fpath):
            raise RuntimeError("Error initializing device. Try to reset it.")
        pipeline = depthai.create_pipeline(config)
        if pipeline is None:
            raise RuntimeError("Pipeline was not created.")
        log.info("Pipeline created.")
        return pipeline

    def __init__(self, model_location, model_label):
        self.model_label = model_label
        self.config = {
            # metaout - contains neural net output
            # previewout - color video
            'streams': ["metaout", {'name': 'previewout', "max_fps": 15.0}, "video", "meta_d2h"],
            'ai': {
                # The paths below are based on the tutorial steps.
                'blob_file': str(Path(model_location, 'model.blob').absolute()),
                'blob_file_config': str(Path(model_location, 'config.json').absolute())
            }
        }
        self.pipeline = DepthAI.create_pipeline(self.config)
        self.streams = [stream if isinstance(stream, str) else stream['name'] for stream in self.config['streams']]
        self.network_results = []
        self.encoded = []
        self.temperature = Manager().Value(ctypes.c_wchar_p, '{}')

    def capture(self):
        while True:
            nnet_packets, data_packets = self.pipeline.get_available_nnet_and_data_packets()
            for _, nnet_packet in enumerate(nnet_packets):
                self.network_results = []
                # Shape: [1, 1, N, 7], where N is the number of detected bounding boxes
                for _, e in enumerate(nnet_packet.entries()):
                    if e[0]['image_id'] == -1.0 or e[0]['conf'] == 0.0:
                        break
                    if e[0]['conf'] > 0.5 and e[0]['label'] in (self.car_label, self.person_label):
                        self.network_results.append(e[0])

            for packet in data_packets:
                if packet.stream_name not in self.streams:
                    log.error(f"Received a frame with unknown stream name! packet.stream_name = '{packet.stream_name}'")
                    continue

                try:
                    data = packet.getData()
                    if data is None:
                        continue
                except:
                    log.exception("Exception occured while getting packet data")
                    continue

                if packet.stream_name == 'previewout':
                    # The format of previewout image is CHW (Chanel, Height, Width), but OpenCV needs HWC, so we
                    # change shape (3, 300, 300) -> (300, 300, 3).
                    data0 = data[0, :, :]
                    data1 = data[1, :, :]
                    data2 = data[2, :, :]
                    frame = cv2.merge([data0, data1, data2])

                    img_h = frame.shape[0]
                    img_w = frame.shape[1]

                    boxes = []
                    for e in self.network_results:
                        try:
                            boxes.append({
                                'detector': DetectionTypes.Person if e['label'] == self.person_label else DetectionTypes.Car,
                                'conf': e['conf'],
                                'left': int(e['x_min'] * img_w),
                                'top': int(e['y_min'] * img_h),
                                'right': int(e['x_max'] * img_w),
                                'bottom': int(e['y_max'] * img_h),
                            })
                        except:
                            log.exception("Error while normalizing bounding boxes!")
                            continue
                    yield frame, boxes, self.encoded
                    self.encoded = []
                elif packet.stream_name == 'video':
                    self.encoded.append(data)
                elif packet.stream_name == 'meta_d2h':
                    self.temperature.value = packet.getDataAsStr()

    def __del__(self):
        if hasattr(self, 'pipeline'):
            del self.pipeline
        depthai.deinit_device()


class DepthAIDebug(DepthAI):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fps = FPS()
        self.fps.start()

    def capture(self):
        for frame, boxes, encoded in super().capture():
            self.fps.update()
            for box in boxes:
                cv2.rectangle(frame, (box['left'], box['top']), (box['right'], box['bottom']), (0, 255, 0), 2)
            yield frame, boxes, encoded

    def __del__(self):
        super().__del__()
        self.fps.stop()
        log.info("[INFO] elapsed time: {:.2f}".format(self.fps.elapsed()))
        log.info("[INFO] approx. FPS: {:.2f}".format(self.fps.fps()))


class DepthAIWriter:
    def __init__(self, output):
        self.output = output
        self.stream_path = Path(output).with_suffix('.h264')
        self.stream_file = open(self.stream_path, 'wb')

    def store(self, encoded: List[np.ndarray]):
        for item in encoded:
            if get_available_storage_space() < CRITICAL_REQUIRED_SPACE:
                raise OutOfStorageException("Unable to store the video, not enough space left!")
            item.tofile(self.stream_file)

    def close(self):
        self.stream_file.close()


class VideoSource(Iterator):
    def __init__(self, source):
        self.droppedFrames = 0

        log.info("Creating video capture with source: {}".format(source))
        self.capture = cv2.VideoCapture(int(source) if source.isdigit() else source)
        if self.capture is None or not self.capture.isOpened():
            raise SourceNotAvailableException('Warning: unable to open video source: {}'.format(source))
        log.info("Video capture setup complete.")

    def __next__(self):
        read_correctly, frame = self.capture.read()
        if not read_correctly:
            if self.droppedFrames < 5:
                log.info("Dropped frame... ({})".format(self.droppedFrames))
                self.droppedFrames += 1
                return self.__next__()
            log.info("Detected end of the stream, exiting frame iteration...")
            self.capture.release()
            raise StopIteration

        return frame


class VideoSourceDebug(VideoSource):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fps = FPS()
        self.fps.start()

    def __next__(self):
        try:
            result = super().__next__()
        except StopIteration:
            self.fps.stop()
            log.info("[INFO] elapsed time: {:.2f}".format(self.fps.elapsed()))
            log.info("[INFO] approx. FPS: {:.2f}".format(self.fps.fps()))
            raise
        self.fps.update()
        return result


class Writer:
    def __init__(self, output):
        self.output = output
        self.writer = None
        self.fourcc = cv2.VideoWriter_fourcc(*VIDEO_WRITER_FOURCC)

    def __enter__(self):
        return self

    def write_frame(self, frame):
        if self.writer is None:
            (H, W) = frame.shape[:2]
            self.writer = cv2.VideoWriter(self.output, self.fourcc, 30, (W, H), True)
        self.writer.write(frame)

    def __exit__(self, *args, **kwargs):
        self.close()

    def close(self):
        if self.writer is not None:
            self.writer.release()
            self.writer = None


class SourceWriter:
    def __init__(self, source, output):
        self.output = output
        self.source = source
        self.fourcc = cv2.VideoWriter_fourcc(*VIDEO_WRITER_FOURCC)

    def __enter__(self):
        return self

    def _write_frames_proc(self):
        source = VideoSource(self.source)
        writer = None
        for frame in source:
            if writer is None:
                (H, W) = frame.shape[:2]
                writer = cv2.VideoWriter(self.output, self.fourcc, 20, (W, H), True)
            writer.write(frame)

            if self.finish_process.value == 1:
                writer.release()
                return

    def start(self):
        self.finish_process = Value('i', 0)
        self.process = Process(target=self._write_frames_proc, args=())
        self.process.start()

    def __exit__(self, *args, **kwargs):
        self.stop()

    def stop(self):
        self.finish_process.value = 1
        self.process.join()


def get_available_storage_space(path=STORAGE_PATH):
    usage = psutil.disk_usage(path)
    return usage.free


class S3:
    current_uploads = Value('i', 0)
    current_uploads_lock = Lock()
    session = boto3.Session(
        aws_access_key_id=AWS_SERVER_PUBLIC_KEY,
        aws_secret_access_key=AWS_SERVER_SECRET_KEY,
    )
    s3 = session.resource('s3')
    public_prefix = "https://{}.s3.amazonaws.com/".format(AWS_SERVER_BUCKET_NAME)
    tasks = []

    def __init__(self, video_storage_mode):
        self.video_storage_mode = video_storage_mode

    @contextmanager
    def _available_net(self):
        available = False
        while not available:
            self.current_uploads_lock.acquire()
            available = self.current_uploads.value < MAX_PARALLEL_UPLOADS
            if not available:
                self.current_uploads_lock.release()
                log.info("Upload pending - parallel uploads limit reached")
                time.sleep(1)
            else:
                self.current_uploads.value += 1
                self.current_uploads_lock.release()
        log.info("Current uploads: {} (max: {})".format(self.current_uploads.value, MAX_PARALLEL_UPLOADS))
        try:
            yield
        finally:
            self.current_uploads_lock.acquire()
            log.info("Upload finished")
            self.current_uploads.value -= 1
            self.current_uploads_lock.release()

    def mux_stream(self, path):
        stream_path = Path(path).with_suffix('.h264')
        command = f"ffmpeg -hide_banner -loglevel panic -y -framerate 30 -i {stream_path} -c copy {path}"
        exit_code = os.system(command)
        if exit_code != 0:
            raise MuxingFailedException(f"Command \"{command}\" failed with exit code {exit_code}")
        stream_path.unlink()
        return exit_code

    def _store_frame_proc(self, frame, key):
        buf = io.BytesIO(cv2.imencode(IMAGE_WRITER_EXT, frame)[1])
        obj = self.s3.Object(AWS_SERVER_BUCKET_NAME, key)
        with self._available_net():
            obj.upload_fileobj(buf, ExtraArgs={'ContentType': IMAGE_WRITER_CONTENT_TYPE})

    def _store_video_proc(self, path, key):
        self.mux_stream(path)
        if self.video_storage_mode in ('cloud', 'full'):
            with open(path, 'rb') as f:
                buf = io.BytesIO(f.read())
            obj = self.s3.Object(AWS_SERVER_BUCKET_NAME, key)
            with self._available_net():
                obj.upload_fileobj(buf, ExtraArgs={'ContentType': VIDEO_WRITER_CONTENT_TYPE})
        if self.video_storage_mode == 'cloud':
            Path(path).unlink()

    def store_frame(self, frame, key):
        if DISABLE_NETWORK:
            return None

        log.info("Storing frame at key {}".format(key))
        p = Process(target=self._store_frame_proc, args=(frame, key))
        p.start()
        self.tasks.append(p)
        result = self.public_prefix + key
        log.info("Frame stored. URL: {}".format(result))
        return result

    def store_video(self, path, key):
        if DISABLE_NETWORK:
            return None

        if self.video_storage_mode == "local":
            p = Process(target=self.mux_stream, args=(path, ))
            p.start()
            self.tasks.append(p)
            return None
        log.info("Storing video from {} at key {}".format(path, key))
        p = Process(target=self._store_video_proc, args=(path, key))
        p.start()
        self.tasks.append(p)
        result = self.public_prefix + key
        log.info("Video stored. URL: {}".format(result))
        return result

    def __enter__(self):
        return self

    def __exit__(self, *args, **kwargs):
        self.close()

    def close(self):
        for p in self.tasks:
            p.join()

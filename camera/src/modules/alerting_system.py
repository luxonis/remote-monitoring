import json
import logging
import os
from datetime import datetime, timedelta
from pathlib import Path
from uuid import uuid4

import requests

from src.common import S3, DepthAIWriter, MuxingFailedException, MB, get_available_storage_space, OutOfStorageException
from src.config import DEVICE_ID, API_URL, VIDEO_WRITER_EXT, IMAGE_WRITER_EXT, STORAGE_PATH, OPERATIONAL_REQUIRED_SPACE, \
    DISABLE_VIDEO, DISABLE_INCIDENTS
from src.variables import DetectionTypes, DiskFullActions, VideoStorage, RecordingConfig

log = logging.getLogger(__name__)


class AlertingSystem:  # TODO extract Incident class and more all incident-related fields and methods inside it
    def __init__(self, recording_config):
        self.last_detection_time = None
        self.positive_frames = 0  # frames with at least one detection
        self.negative_frames = 0  # frames with no detections
        self.negative_frames_buffer = 0  # negative frames from last detection, that are at the end of the video
        self.max_detected = 0  # most bounding boxes detected on a single frame
        self.writer = None
        self.incident_key = None
        self.incident_data = {}
        self.s3 = S3(video_storage_mode=recording_config['video_storage'])
        self.recording_config = recording_config

    def update(self, new_config):
        self.s3.video_storage_mode = new_config['video_storage']
        self.recording_config = new_config

    def get_incident_path(self):
        if self.incident_key:
            return STORAGE_PATH / Path(self.incident_key + VIDEO_WRITER_EXT)

    def free_disk_space(self):
        # get all files starting from most recent one
        for item in sorted(Path(STORAGE_PATH).glob('*' + VIDEO_WRITER_EXT), key=os.path.getmtime):
            if item.is_file():
                try:
                    item.unlink()
                    log.info(f"Removed file: {item}")
                except Exception as e:
                    log.info(f"Unable to remove file: {item}, moving to next one. Error: {e}")
                    continue
            if get_available_storage_space() > OPERATIONAL_REQUIRED_SPACE:
                return True
        return get_available_storage_space() > OPERATIONAL_REQUIRED_SPACE

    @property
    def video_enabled(self):
        if DISABLE_VIDEO:
            return False

        if get_available_storage_space() < OPERATIONAL_REQUIRED_SPACE:
            log.info("Reached required space limit (space left: {:.2f}MB)".format(get_available_storage_space() / MB))
            action = self.recording_config['disk_full_action']
            if action == DiskFullActions.Cloud and self.s3.video_storage_mode != VideoStorage.Cloud:
                log.info("Changing storage of the videos to only cloud")
                self.s3.video_storage_mode = VideoStorage.Cloud
            elif action == DiskFullActions.Rolling:
                log.info("Attempting to free the disk space from oldest files...")
                success = self.free_disk_space()
                if not success:
                    log.info("Unable to free the disk space, video recording turned off")
                    return False
                log.info("Disk has been freed successfully")
            else:
                log.info("Video recording turned off")
                return False
        elif self.s3.video_storage_mode != self.recording_config['video_storage']:
            log.info(f"Disk space is available again, switching video storage from cloud to {self.recording_config['video_storage']}")
            self.s3.video_storage_mode = self.recording_config['video_storage']

        return self.recording_config.get('mode', RecordingConfig.Non) != RecordingConfig.Non

    def start_incident(self, frame):
        self.incident_key = str(uuid4())
        self.last_detection_time = None
        self.positive_frames = 0
        self.negative_frames = 0
        self.negative_frames_buffer = 0
        self.max_detected = 0
        self.incident_data = {
            'start_timestamp': datetime.now().isoformat(),
            'preview_url': self.s3.store_frame(frame, 'incidents/{}-prev{}'.format(self.incident_key, IMAGE_WRITER_EXT))
        }
        if self.video_enabled:
            self.writer = DepthAIWriter(self.get_incident_path())
        log.info("New incident registered: {}".format(self.incident_key))

    def on_incident(self, frame, detections, encoded):
        if self.writer is not None:
            try:
                self.writer.store(encoded)
            except OutOfStorageException:
                log.exception("Ran out of storage space while recording incident video! Stopping the recording...")
                self.finalize_movie()

    def parse_frame(self, frame, results, encoded):
        if DISABLE_INCIDENTS:
            return

        in_zone_detections = [
            box
            for box, in_zone, _ in results
            if in_zone
        ]

        if len(in_zone_detections) > 0:
            if not self.incident_key:
                self.start_incident(frame)
            self.positive_frames += 1
            self.negative_frames += self.negative_frames_buffer
            self.negative_frames_buffer = 0
            self.max_detected = max(self.max_detected, len(in_zone_detections))
            self.last_detection_time = datetime.now()
        else:
            self.negative_frames_buffer += 1

        if self.last_detection_time and datetime.now() - self.last_detection_time < timedelta(seconds=10):
            self.on_incident(frame, in_zone_detections, encoded)
        elif self.incident_key:
            if self.writer:
                self.finalize_movie()
            self.finish_incident()

    def finalize_movie(self):
        log.info("Finalizing video for incident: {}".format(self.incident_key))
        try:
            self.writer.close()
            url = self.s3.store_video(self.get_incident_path(), 'incidents/' + self.incident_key + VIDEO_WRITER_EXT)
            if url is not None:
                log.info("Video for incident {} stored: {}".format(self.incident_key, url))
                self.incident_data['video_url'] = url
        except MuxingFailedException as e:
            log.exception("Saving video as mp4 file failed")
        finally:
            self.writer = None

    def finish_incident(self):
        log.info("Reporting incident {} ...".format(self.incident_key))
        payload = {
            'camera_id': DEVICE_ID,
            'incident_id': self.incident_key,
            'zone': self.recording_config['zone']['id'],
            'data': json.dumps({
                **self.incident_data,
                'last_detection_timestamp': self.last_detection_time.isoformat(),
                'end_timestamp': datetime.now().isoformat(),
                'positive_frames': self.positive_frames,
                'negative_frames': self.negative_frames,
                'max_detected': self.max_detected,
            }),
        }
        try:
            request = requests.post(API_URL + '/incidents/', data=payload)
            request.raise_for_status()
            log.info("Reported incident {}".format(self.incident_key))
        except Exception as e:
            log.error("Error while storing incident! Error: {}".format(str(e)))
        finally:
            self.incident_key = None

    def close(self):
        if self.incident_key:
            if self.writer:
                self.finalize_movie()
            self.finish_incident()
        if self.writer:
            self.writer.close()
        if self.s3:
            self.s3.close()


import logging
import os
import time
from datetime import datetime, timedelta, timezone
from multiprocessing import Value

import numpy as np
import requests

from src.common import S3, DepthAI
from src.config import API_URL, DEVICE_ID, CAR_PERSON_DETECTOR_MODEL_PATH

log = logging.getLogger(__name__)


class ConfigProvider:
    _raw_config = {}
    config_url = API_URL + '/cameras/' + DEVICE_ID + '/'
    should_update = Value('i', 0)

    def __init__(self, source, on_update):
        self.source = source
        self.on_update = on_update
        self.fetch_config()

    def _watch_for_changes(self):
        since = datetime.now(tz=timezone.utc).isoformat().replace('+00:00', 'Z')
        while True:
            time.sleep(1)
            try:
                updated_url = ConfigProvider.config_url + 'has_updated/?since=' + since
                request = requests.head(updated_url)
                if request.status_code == 200:
                    self.should_update.value = 1
                    since = datetime.now(tz=timezone.utc).isoformat().replace('+00:00', 'Z')
            except:
                log.exception("Exception while fetching latest config updates")

    def update_if_needed(self):
        if self.should_update.value == 1:
            self.fetch_config()
            self.on_update()
            self.should_update.value = 0

    def __getattr__(self, item):
        return self._raw_config[item]

    def fetch_config(self):
        request = requests.get(self.config_url)
        log.info(
            "Request for camera config ({}) returned {}: {}".format(self.config_url, request.status_code, request.text)
        )
        if request.status_code == 200:
            self._raw_config = request.json()
            log.info("Loaded {} zones".format(len(self.zones)))
        elif request.status_code == 404:
            self.register_device()
            raise RuntimeError('No config is present for camera_id "{}"'.format(DEVICE_ID))
        else:
            raise RuntimeError('API returned unknown error: {}'.format(request.status_code))

    def get_registration_frame(self):
        frame = next(self.source)
        return frame

    def register_device(self):
        log.info('No config detected, attempting to register as pending...')
        frame = self.get_registration_frame()
        with S3(video_storage_mode='full') as s3:
            url = s3.store_frame(frame, f'pending/{DEVICE_ID}_{int(time.time())}.png')

            payload = {
                'camera_id': DEVICE_ID,
                'frame_url': url,
            }
            pending_req = requests.post(API_URL + '/pendingcameras/', data=payload)
            log.info("Registration request for device {} returned {}: {}".format(
                DEVICE_ID, pending_req.status_code,pending_req.text
            ))


class DepthAIConfigProvider(ConfigProvider):
    def __init__(self, on_update):
        super().__init__(None, on_update)

    def get_registration_frame(self):
        source = DepthAI.create_pipeline({
            'streams': ['previewout'],
            'ai': {
                'blob_file': os.path.join(CAR_PERSON_DETECTOR_MODEL_PATH, 'model.blob'),
                'blob_file_config': os.path.join(CAR_PERSON_DETECTOR_MODEL_PATH, 'config.json')
            }
        })
        log.info("Running DepthAI previewout stream, waiting 10 secs for focus...")
        frame = None
        start_time = datetime.now()
        while datetime.now() - start_time < timedelta(seconds=10):
            try:
                output = next(iter([
                    np.transpose(packet.getData(), (1, 2, 0))
                    for packet in source.get_available_data_packets()
                    if packet.stream_name == 'previewout'
                ]), None)
                if output is not None:
                    frame = output
            except:
                continue
        if frame is None:
            raise RuntimeError('Unable to get any frame from DepthAI!')
        log.info("Frame from DepthAI received.")
        del source
        return frame

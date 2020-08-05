import json
import logging

from src.modules.alerting_system import AlertingSystem
from src.modules.in_zone_presence_detector import InZonePresenceDetector, InZonePresenceDetectorDebug

log = logging.getLogger(__name__)


def recording_config(zone_config, full_config):
    return {
        'mode': zone_config['alerting_mode'],
        'offset': zone_config['alerting_mode_offset'],
        'video_storage': full_config.video_storage,
        'disk_full_action': full_config.disk_full_action,
        'zone': zone_config,
    }


class Zone:
    in_zone_detector_class = InZonePresenceDetector

    def __init__(self, zone_config, full_config):
        self.config = zone_config
        self.alerting_system = AlertingSystem(recording_config(zone_config, full_config))
        self.in_zone_detector = self.in_zone_detector_class(
            [(elem['x'], elem['y']) for elem in zone_config['polygon']]
        )

    def update(self, new_config, full_config):
        self.alerting_system.update(recording_config(new_config, full_config))
        self.in_zone_detector = self.in_zone_detector_class(
            [(elem['x'], elem['y']) for elem in new_config['polygon']]
        )
        self.config = new_config

    def parse(self, frame, boxes, encoded):
        current_boxes = [box for box in boxes if box['detector'] in self.config['detection_types']]
        detector_results = self.in_zone_detector.parse(frame, current_boxes)
        self.alerting_system.parse_frame(frame, detector_results, encoded)

    def close(self):
        self.alerting_system.close()


class ZoneDebug(Zone):
    in_zone_detector_class = InZonePresenceDetectorDebug

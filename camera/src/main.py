import logging
from multiprocessing import Process
from pathlib import Path

import cv2

from src.common import DepthAIWriter, DepthAI, DepthAIDebug
from src.config import DEBUG, OUTPUT, VIDEO_WRITER_EXT, \
    CAR_PERSON_DETECTOR_MODEL_PATH
from src.modules.config_provider import DepthAIConfigProvider
from src.modules.system_monitor import system_monitor
from src.modules.zone import Zone, ZoneDebug


log = logging.getLogger(__name__)


class Main:
    zone_class = Zone
    depthai_class = DepthAI

    def __init__(self):
        log.info("loading config...")
        self.config = DepthAIConfigProvider(on_update=self.on_config_update)
        self.depthai = self.depthai_class(model_location=CAR_PERSON_DETECTOR_MODEL_PATH, model_label="multi")
        log.info("loading zones...")
        self.zones = [
            self.zone_class(zone, self.config)
            for zone in self.config.zones
        ]
        log.info("Starting background tasks...")
        self.background_tasks = [
            Process(target=system_monitor, args=(self.depthai.temperature, )),
            Process(target=self.config._watch_for_changes)
        ]
        for task in self.background_tasks:
            task.start()

        if OUTPUT is not None:
            log.warning('OUTPUT env variable is set (value - "{}") - this will cause the framerate to be lower!!'.format(OUTPUT))
            output_filename = Path(OUTPUT).with_suffix(VIDEO_WRITER_EXT).name
            log.info('Setting up output writer to file {}...'.format(output_filename))
            self.writer = DepthAIWriter(output_filename)


    def on_config_update(self):
        zone_ids = [zone['id'] for zone in self.config.zones]
        removed_zones = [zone for zone in self.zones if zone.config['id'] not in zone_ids]
        for removed_zone in removed_zones:
            removed_zone.close()

        for zone in self.config.zones:
            current = next(filter(lambda item: item.config['id'] == zone['id'], self.zones), None)
            if current is not None:
                current.update(zone, self.config)
            else:
                self.zones.append(self.zone_class(zone, self.config))

    def parse_frame(self, frame, results, encoded):
        self.config.update_if_needed()
        for zone in self.zones:
            zone.parse(frame, results, encoded)
        if OUTPUT is not None:
            self.writer.store(encoded)

    def run(self):
        try:
            log.info("Setup complete, parsing frames...")
            for frame, results, encoded in self.depthai.capture():
                self.parse_frame(frame, results, encoded)
        except StopIteration:
            raise
        except:
            log.exception("Error occured while parsing frames")
        finally:
            for zone in self.zones:
                zone.close()
            for task in self.background_tasks:
                task.terminate()
            if OUTPUT is not None:
                self.writer.close()
            del self.depthai


class MainDebug(Main):
    zone_class = ZoneDebug
    depthai_class = DepthAIDebug

    def parse_frame(self, frame, results, encoded):
        super().parse_frame(frame, results, encoded)

        cv2.imshow("Frame", frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord("q"):
            raise StopIteration()


if __name__ == '__main__':
    if DEBUG:
        log.info("Setting up debug run...")
        MainDebug().run()
    else:
        log.info("Setting up non-debug run...")
        Main().run()

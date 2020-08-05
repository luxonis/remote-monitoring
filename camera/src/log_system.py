import logging
import sys
from pathlib import Path

from concurrent_log_handler import ConcurrentRotatingFileHandler


def init_log_system():
    root = logging.getLogger()
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    root.addHandler(handler)

    path = Path('log/camera.log').absolute()
    path.parent.mkdir(exist_ok=True)

    # Rotate log after reaching 512K, keep 5 old copies.
    rotate_handler = ConcurrentRotatingFileHandler(str(path), "a", 512 * 1024, 5)
    rotate_handler.setFormatter(formatter)
    root.addHandler(rotate_handler)
    root.setLevel(logging.INFO)
    root.info("Logging system initialized, kept in file {}...".format(str(path)))


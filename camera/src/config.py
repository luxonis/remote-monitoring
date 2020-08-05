import logging
import os
from pathlib import Path
from src.log_system import init_log_system
from src.variables import MB

init_log_system()

log = logging.getLogger(__name__)

DISABLE_VIDEO = os.getenv('DISABLE_VIDEO', 'false') not in ('false', '0')
DISABLE_NETWORK = os.getenv('DISABLE_NETWORK', 'false') not in ('false', '0')
DISABLE_INCIDENTS = os.getenv('DISABLE_INCIDENTS', 'false') not in ('false', '0')
DEBUG = os.getenv('DEBUG', 'true') not in ('false', '0')
CAR_PERSON_DETECTOR_MODEL_PATH = os.getenv("CAR_PERSON_DETECTOR_MODEL_PATH", str(Path('models/pedestrian-and-vehicle-detector-adas-0001').resolve().absolute()))
SOURCE = os.getenv('SOURCE', '0')
OUTPUT = os.getenv('OUTPUT')
assert 'DEVICE_ID' in os.environ, "Please set up DEVICE_ID as environment variable"
DEVICE_ID = os.getenv('DEVICE_ID')
log.info('Device id: {}'.format(DEVICE_ID))
API_URL = os.getenv('API_URL', 'http://localhost:8000/api')
AWS_SERVER_PUBLIC_KEY = None
AWS_SERVER_SECRET_KEY = None
AWS_SERVER_BUCKET_NAME = None
assert None not in (AWS_SERVER_PUBLIC_KEY, AWS_SERVER_SECRET_KEY, AWS_SERVER_BUCKET_NAME), "Please set up your AWS credentials"
MAX_PARALLEL_UPLOADS = 1

STORAGE_PATH = Path(os.getenv("STORAGE_PATH", Path("incidents").resolve())).absolute()
STORAGE_PATH.mkdir(parents=True, exist_ok=True)
assert os.access(STORAGE_PATH, os.R_OK), "Path {} is not readable".format(STORAGE_PATH)
assert os.access(STORAGE_PATH, os.W_OK), "Path {} is not writeable".format(STORAGE_PATH)

IMAGE_WRITER_EXT = ".png"
IMAGE_WRITER_CONTENT_TYPE = "image/png"
VIDEO_WRITER_FOURCC = "H264"
VIDEO_WRITER_EXT = ".mp4"
VIDEO_WRITER_CONTENT_TYPE = "video/mp4"

OPERATIONAL_REQUIRED_SPACE = 500 * MB  # how much space is required for video recording, when to start cleanup
CRITICAL_REQUIRED_SPACE = 50 * MB  # how much space is a minimum value for the system to run

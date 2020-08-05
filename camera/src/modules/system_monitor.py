import logging
from datetime import datetime
from multiprocessing import Value
from pathlib import Path
from time import sleep

import psutil
import json

from src.common import get_available_storage_space
from src.config import CRITICAL_REQUIRED_SPACE

log = logging.getLogger(__name__)


def make_report(depthai_temp: Value):
    data = {
        'timestamp': datetime.now().isoformat()
    }
    for i, perc in enumerate(psutil.cpu_percent(interval=1, percpu=True)):
        data['cpu_usage_' + str(i + 1)] = perc
    cpu_avg_1_min, cpu_avg_5_min, cpu_avg_15_min = psutil.getloadavg()
    data['cpu_average_1_minute'] = cpu_avg_1_min
    data['cpu_average_5_minutes'] = cpu_avg_5_min
    data['cpu_average_15_minutes'] = cpu_avg_15_min

    memory = psutil.virtual_memory()
    data['ram_usage_percentage'] = memory.percent
    data['ram_total'] = memory.total
    data['ram_available'] = memory.available

    for i, disk in enumerate(psutil.disk_partitions()):
        try:
            usage = psutil.disk_usage(disk.mountpoint)
        except OSError:
            continue

        data[f'disk_{i + 1}_device'] = disk.device
        data[f'disk_{i + 1}_usage'] = usage.percent
        data[f'disk_{i + 1}_total'] = usage.total
        data[f'disk_{i + 1}_available'] = usage.free
        data[f'disk_{i + 1}_used'] = usage.used

    for i, (name, net) in enumerate(filter(lambda item: item[1].bytes_sent > 0 and item[0] != 'lo',
                                           psutil.net_io_counters(pernic=True).items())):
        data[f"net_{i + 1}_name"] = name
        data[f"net_{i + 1}_bytes_sent"] = net.bytes_sent
        data[f"net_{i + 1}_bytes_recv"] = net.bytes_recv
        data[f"net_{i + 1}_errin"] = net.errin
        data[f"net_{i + 1}_errout"] = net.errout
        data[f"net_{i + 1}_dropin"] = net.dropin
        data[f"net_{i + 1}_dropout"] = net.dropout

    for i, (deviceName, fansData) in enumerate(psutil.sensors_fans().items()):
        data[f"fans_{i + 1}_name"] = deviceName
        for j, fanData in enumerate(fansData):
            data[f"fans_{i + 1}_fan_{j + 1}_rpm"] = fanData.current

    temp_counter = -1
    for temp_counter, (deviceName, temps) in enumerate(psutil.sensors_temperatures().items()):
        data[f"temp_{temp_counter + 1}_name"] = deviceName
        for j, temp in enumerate(temps):
            if temp.label != '':
                data[f"temp_{temp_counter + 1}_temp_{j + 1}_label"] = temp.label
            data[f"temp_{temp_counter + 1}_temp_{j + 1}_current"] = temp.current

    temp_counter += 1
    try:
        temperature = json.loads(depthai_temp.value)['sensors']['temperature']
    except:
        log.exception("Error when loading depthAI temperature readings")
        temperature = {}

    for j, depth_temp_key in enumerate(['css', 'mss', 'upa0', 'upa1']):
        data[f"temp_{temp_counter + 1}_name"] = 'DepthAI'
        data[f"temp_{temp_counter + 1}_temp_{j + 1}_label"] = depth_temp_key
        data[f"temp_{temp_counter + 1}_temp_{j + 1}_current"] = temperature.get(depth_temp_key, 0)

    return data


#  https://stackoverflow.com/a/44599922/5494277
def append_to_json(_dict, path):
    with open(path, 'ab+') as f:
        f.seek(0, 2)  # Go to the end of file
        if f.tell() == 0:  # Check if file is empty
            f.write(json.dumps([_dict]).encode())  # If empty, write an array
        else:
            f.seek(-1, 2)
            f.truncate()  # Remove the last character, open the array
            f.write(' , '.encode())  # Write the separator
            f.write(json.dumps(_dict).encode())  # Dump the dictionary
            f.write(']'.encode())


def system_monitor(depthai_temp: Value):
    path = Path('data/system_monitor_log.json').resolve()
    path.parent.mkdir(exist_ok=True)
    while True:
        sleep(30)
        if get_available_storage_space(str(path.parent.absolute())) < CRITICAL_REQUIRED_SPACE:
            log.warning("Not enough storage space to write system monitor log, skipping!")
            continue
        append_to_json(make_report(depthai_temp), path)

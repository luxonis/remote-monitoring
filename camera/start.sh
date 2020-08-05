#!/bin/bash

export PYTHONUNBUFFERED=1
export DEBUG=true
export API_URL=http://192.168.1.21:8000/api
export DEVICE_ID=luke1
export PYTHONPATH=$PYTHONPATH:$PWD

python src/main.py 2>&1 | tee >(split --additional-suffix=.log -d -u -b 30000000 - log/$(date +'%Y%m%d%H%M').debug.0)
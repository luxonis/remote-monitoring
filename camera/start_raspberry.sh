#!/bin/bash
set -e

vino_source=/opt/intel/openvino/bin/setupvars.sh
if [ -f "$vino_source" ]; then
	source $vino_source
fi

eth0_mac=$(cat /sys/class/net/eth0/address)

export DEBUG=false
export LD_PRELOAD=/usr/lib/arm-linux-gnueabihf/libatomic.so.1
export PYTHONPATH=$PYTHONPATH:/home/pi/remote-monitoring/camera
export DEVICE_ID=$eth0_mac
export MOUNT_SSD=false
export SSD_ROOT=/home/pi/ssd

#source any persistent device config files
override_source=/data/remote-monitoring/overrides.sh
if [ -f "$override_source" ]; then
        source $override_source
fi


cd /home/pi/remote-monitoring/camera/

if [ "$MOUNT_SSD" = true ]; then
	echo "create root ssd dir"
	mkdir -p $SSD_ROOT
	echo "checking for mountable SSD"
	system_ssd=$(sudo fdisk -l | grep "/dev/sda") || true
	if [ -z "$system_ssd" ]
	then
		echo "no ssd found"
	else
		echo "found ssd; mounting to $SSD_ROOT"
		sudo mount /dev/sda1 $SSD_ROOT || true
		export STORAGE_PATH=$SSD_ROOT
	fi
fi

#run main app
python3.7 src/main.py 2>&1 | tee >(split --additional-suffix=.log -d -u -b 30000000 - log/$(date +'%Y%m%d-%H%M').debug.0)

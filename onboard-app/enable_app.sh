#!/bin/bash

sudo apt update
sudo apt install -y nginx
sudo ln -fs /home/pi/remote-monitoring/onboard-app/nginx-wrapper.conf /etc/nginx/nginx.conf
sudo systemctl enable nginx
sudo systemctl restart nginx
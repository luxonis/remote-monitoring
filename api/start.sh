#!/bin/bash

python manage.py migrate
python manage.py loaddata fixtures/*.json
printenv | sed 's/^\(.*\)$/export \1/g' > /project_env.sh
service cron restart
python manage.py runserver 0.0.0.0:8000
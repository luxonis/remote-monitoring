FROM python:3.8

RUN apt-get update && apt-get install -y cron
ADD crontab /etc/cron.d/remote-monitoring-cron
RUN chmod 0644 /etc/cron.d/remote-monitoring-cron
RUN crontab /etc/cron.d/remote-monitoring-cron
RUN touch /var/log/cron.log

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["bash", "start.sh"]
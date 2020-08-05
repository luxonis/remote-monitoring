import json

from django.db import models, transaction
from django.contrib.postgres.fields import JSONField
from django.core.mail import send_mail

from config.settings import EMAIL_HOST_USER


class CameraPendingConfig(models.Model):
    camera_id = models.TextField(primary_key=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    frame_url = models.TextField()

    def __str__(self):
        return self.camera_id


class CameraConfig(models.Model):
    VIDEO_STORAGE_CHOICES = (
        ('cloud', 'Cloud'),
        ('local', 'Local'),
        ('full', 'Full'),
    )
    DISK_FULL_ACTION_CHOICES = (
        ('cloud', 'Cloud'),
        ('rolling', 'Rolling'),
        ('no_video', 'No video'),
    )
    camera_id = models.TextField(primary_key=True)
    frame_url = models.TextField()
    latitude = models.DecimalField(max_digits=22, decimal_places=16)
    longitude = models.DecimalField(max_digits=22, decimal_places=16)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    dashboard_pass = models.TextField(null=True, blank=True)
    video_storage = models.CharField(max_length=8, choices=VIDEO_STORAGE_CHOICES, default='cloud')
    disk_full_action = models.CharField(max_length=10, choices=DISK_FULL_ACTION_CHOICES, default='rolling')

    @transaction.atomic
    def save(self, *args, **kwargs):
        if not CameraConfig.objects.filter(camera_id=self.camera_id).exists():
            CameraPendingConfig.objects.filter(camera_id=self.camera_id).delete()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.camera_id


class ZoneConfig(models.Model):
    ALERTING_CHOICES = (
        ('full', 'Full'),
        ('none', 'None'),
        ('boundary', 'Boundary'),
    )
    name = models.TextField(null=True, blank=True)
    detection_types = JSONField()
    polygon = JSONField()
    alerting_mode = models.CharField(max_length=8, choices=ALERTING_CHOICES)
    alerting_mode_offset = models.IntegerField(default=0)
    camera = models.ForeignKey(to=CameraConfig, on_delete=models.CASCADE, related_name='zones')


class Incident(models.Model):
    incident_id = models.TextField(primary_key=True)
    zone = models.ForeignKey(ZoneConfig, related_name="incidents", on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    data = JSONField(default=dict)

    def __str__(self):
        return self.incident_id


class AlertingGroup(models.Model):
    ALERT_TYPES = (
        ('every', 'Every incident'),
        ('daily', 'Daily summary'),
    )
    name = models.TextField()
    zones = models.ManyToManyField(ZoneConfig, related_name='alerting_groups')
    sms_config = JSONField(default=dict)
    email_config = JSONField(default=dict)
    webhook_config = JSONField(default=dict)
    alert_type = models.CharField(default='every', max_length=16, choices=ALERT_TYPES)

    def notify(self, incident: Incident):
        if self.alert_type != 'every':
            return
        email_title = 'New incident reported! ID {}'.format(incident.incident_id)
        email_content = '''Fellow user,
A new incident was reported in camera {} zone {} assigned to group {}!

Incident data: {}
Indicent timestamp: {}'''.format(
            incident.zone.camera_id, incident.zone.name, self.name,
            json.dumps(incident.data, indent=2), incident.timestamp.isoformat(' ')
        )
        self.send_emails(email_title, email_content)

    def send_emails(self, title, text):
        if self.email_config.get('enabled', False):
            for recipient in self.email_config.get('items', []):
                print('Sending email notification to {}'.format(recipient))
                send_mail(title, text, EMAIL_HOST_USER, [recipient], fail_silently=False)

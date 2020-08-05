import logging

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from apps.core.models import Incident
from apps.modules import ocr

log = logging.getLogger(__name__)


@receiver(post_save, sender=Incident)
def send_alerting_groups_notifications(instance: Incident, **kwargs):
    try:
        log.info("Received signal from incident {}, sending notifications...".format(instance.incident_id))
        for alerting_group in instance.zone.alerting_groups.all():
            alerting_group.notify(incident=instance)
    except Exception as e:
        log.error(str(e))


@receiver(pre_save, sender=Incident)
def perform_license_plates_ocr(instance: Incident, **kwargs):
    try:
        if 'plate_url' not in instance.data or 'plate_text' in instance.data:
            return

        log.info("Received signal from incident {} with license plate, performing OCR...".format(instance.incident_id))
        instance.data['plate_text'] = ocr.parse_image(instance.data['plate_url'])
    except Exception as e:
        log.error(str(e))

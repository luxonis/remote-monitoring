import json
from datetime import timedelta

from django.utils import timezone

from apps.core.models import AlertingGroup


def clear(arr):
    return [item for item in arr if item is not None]


def send_summaries():
    summary = """
Dear user,

Please find the summary below for {date}
Group name: {group_name}
Zones taken into account: {zones}


Total number of incidents: {total_incidents}
Incidents reported per zones: {total_per_incidents}

List of incidents: 
{incident_list}
"""
    report_day = timezone.now() - timedelta(days=1)
    start_time = report_day.replace(hour=0, minute=0, second=0, microsecond=0)
    end_time = report_day.replace(hour=23, minute=59, second=59)
    for group in AlertingGroup.objects.filter(alert_type='daily'):
        data = {
            'date': report_day.strftime('%A, %d %B'),
            'group_name': group.name,
            'zones': [],
            'total_incidents': 0,
            'total_per_incidents': [],
            'incident_list': []
        }
        for zone in group.zones.all():
            data['zones'].append(zone.name)
            zone_incidents = zone.incidents.filter(timestamp__range=(start_time, end_time))
            data['total_per_incidents'].append(f"{zone.name} ({zone.camera_id}): {zone_incidents.count()}")
            data['total_incidents'] += zone_incidents.count()
            data['incident_list'].append(f"In zone {zone.name} ({zone.camera_id}):")
            for incident in zone_incidents.order_by('timestamp'):
                data['incident_list'].append(
                    f"[{str(incident.timestamp)}] {incident.incident_id}: {json.dumps(incident.data)}"
                )
            if zone_incidents.count() == 0:
                data['incident_list'].append("Empty.")
        data['zones'] = ', '.join(clear(data['zones']))
        data['total_per_incidents'] = ', '.join(clear(data['total_per_incidents']))
        data['incident_list'] = '\n'.join(clear(data['incident_list']))
        group.send_emails(f"Daily report for {report_day.strftime('%A, %d %B')}", summary.format(**data))

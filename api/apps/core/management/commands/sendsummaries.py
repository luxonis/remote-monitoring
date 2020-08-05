from django.core.management.base import BaseCommand, CommandError

from apps.core.periodic import send_summaries


class Command(BaseCommand):
    help = 'Sends incidents summaries'

    def handle(self, *args, **options):
        send_summaries()

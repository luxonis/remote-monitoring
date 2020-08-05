# Generated by Django 3.0.2 on 2020-04-28 11:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0015_auto_20200303_1908'),
    ]

    operations = [
        migrations.AddField(
            model_name='alertinggroup',
            name='alert_type',
            field=models.CharField(choices=[('every', 'Every incident'), ('daily', 'Daily summary')], default='every', max_length=16),
        ),
    ]
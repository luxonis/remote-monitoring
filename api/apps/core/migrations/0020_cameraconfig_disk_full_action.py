# Generated by Django 3.0.2 on 2020-05-06 08:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0019_cameraconfig_video_storage'),
    ]

    operations = [
        migrations.AddField(
            model_name='cameraconfig',
            name='disk_full_action',
            field=models.CharField(choices=[('cloud', 'Cloud'), ('rolling', 'Rolling'), ('no_video', 'No video')], default='rolling', max_length=10),
        ),
    ]

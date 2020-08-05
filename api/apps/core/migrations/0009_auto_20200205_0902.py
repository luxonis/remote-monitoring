# Generated by Django 3.0.2 on 2020-02-05 09:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0008_auto_20200129_1011'),
    ]

    operations = [
        migrations.AddField(
            model_name='cameraconfig',
            name='alerting_mode',
            field=models.CharField(choices=[('full', 'Full'), ('none', 'None'), ('boundary', 'Boundary')], default='full', max_length=8),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='cameraconfig',
            name='alerting_mode_offset',
            field=models.IntegerField(default=0),
        ),
    ]

# Generated by Django 3.0.2 on 2020-01-20 20:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_auto_20200120_1557'),
    ]

    operations = [
        migrations.AddField(
            model_name='cameraconfig',
            name='latitude',
            field=models.IntegerField(default=None),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='cameraconfig',
            name='longitude',
            field=models.IntegerField(default=None),
            preserve_default=False,
        ),
    ]

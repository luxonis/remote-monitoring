# Generated by Django 3.0.2 on 2020-03-03 19:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0014_auto_20200302_1501'),
    ]

    operations = [
        migrations.AlterField(
            model_name='zoneconfig',
            name='name',
            field=models.TextField(blank=True, null=True),
        ),
    ]
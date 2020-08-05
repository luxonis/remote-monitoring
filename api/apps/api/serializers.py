from rest_framework import serializers

from apps.core.models import CameraPendingConfig, CameraConfig, Incident, AlertingGroup, ZoneConfig


class CameraPendingConfigSerializer(serializers.ModelSerializer):
    def validate_camera_id(self, value):
        if CameraConfig.objects.filter(camera_id=value).exists():
            raise serializers.ValidationError("Camera is already configured in the dashboard")
        return value

    class Meta:
        model = CameraPendingConfig
        fields = '__all__'


class AlertingGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertingGroup
        fields = '__all__'


class ZoneConfigSerializer(serializers.ModelSerializer):
    alerting_groups = AlertingGroupSerializer(many=True, read_only=True)

    class Meta:
        model = ZoneConfig
        fields = '__all__'


class IncidentListSerializer(serializers.ModelSerializer):
    zone = ZoneConfigSerializer(read_only=True)

    class Meta:
        model = Incident
        fields = '__all__'


class IncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = '__all__'


class CameraConfigSerializer(serializers.ModelSerializer):
    zones = ZoneConfigSerializer(many=True, read_only=True)

    class Meta:
        model = CameraConfig
        fields = '__all__'

import dateutil.parser
from django.db import transaction
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.api.filters import IncidentFilter
from apps.api.serializers import CameraPendingConfigSerializer, CameraConfigSerializer, IncidentSerializer, \
    AlertingGroupSerializer, ZoneConfigSerializer, IncidentListSerializer
from apps.core.models import CameraPendingConfig, CameraConfig, Incident, AlertingGroup, ZoneConfig


class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all().order_by('-timestamp')
    filter_class = IncidentFilter

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return IncidentListSerializer
        return IncidentSerializer


class CameraPendingConfigViewSet(viewsets.ModelViewSet):
    queryset = CameraPendingConfig.objects.all().order_by('-timestamp')
    serializer_class = CameraPendingConfigSerializer


class AlertingGroupViewSet(viewsets.ModelViewSet):
    queryset = AlertingGroup.objects.all()
    serializer_class = AlertingGroupSerializer


class CameraConfigViewSet(viewsets.ModelViewSet):
    queryset = CameraConfig.objects.all().order_by('-modified_at')
    serializer_class = CameraConfigSerializer

    @action(methods=['head'], detail=True)
    def has_updated(self, request, pk):
        since = dateutil.parser.parse(request.query_params['since'])
        config = CameraConfig.objects.get(camera_id=pk)
        if config.modified_at > since:
            return HttpResponse(status=200)
        else:
            return HttpResponse(status=201)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        for zone in request.data['zones']:
            zone['camera'] = request.data['camera_id']
            serializer = ZoneConfigSerializer(data=zone)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object(), data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        ZoneConfig.objects\
            .exclude(pk__in=list(map(lambda item: item['id'], filter(lambda item: 'id' in item, request.data['zones']))))\
            .filter(camera=request.data['camera_id'])\
            .delete()
        for zone in request.data['zones']:
            zone['camera'] = request.data['camera_id']
            if 'id' in zone:
                serializer = ZoneConfigSerializer(ZoneConfig.objects.get(pk=zone['id']), data=zone)
            else:
                serializer = ZoneConfigSerializer(data=zone)
            serializer.is_valid(raise_exception=True)
            serializer.save()

        return Response(serializer.data)

from django.urls import path, include
from rest_framework.routers import SimpleRouter

from apps.api import views

router = SimpleRouter()
router.register(r'pendingcameras', views.CameraPendingConfigViewSet)
router.register(r'cameras', views.CameraConfigViewSet)
router.register(r'incidents', views.IncidentViewSet)
router.register(r'alertinggroups', views.AlertingGroupViewSet)


urlpatterns = [
    path('', include(router.urls)),
]

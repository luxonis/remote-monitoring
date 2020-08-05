from django.contrib import admin

# Register your models here.
from apps.core.models import CameraPendingConfig, CameraConfig, Incident, AlertingGroup

admin.site.register(CameraPendingConfig, admin.ModelAdmin)
admin.site.register(CameraConfig, admin.ModelAdmin)
admin.site.register(Incident, admin.ModelAdmin)
admin.site.register(AlertingGroup, admin.ModelAdmin)

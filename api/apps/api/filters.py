from django_filters import NumberFilter, BaseInFilter, FilterSet

from apps.core.models import Incident


class NumberInFilter(BaseInFilter, NumberFilter):
    pass


class IncidentFilter(FilterSet):
    zone__in = NumberInFilter(field_name='zone', lookup_expr='in')

    class Meta:
        model = Incident
        fields = ('zone',)

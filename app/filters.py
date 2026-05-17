import django_filters
from .models import Plant


class PlantFilter(django_filters.FilterSet):
    price_min = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    price_max = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    category = django_filters.CharFilter(field_name='category__slug', lookup_expr='exact')
    care_level = django_filters.CharFilter(field_name='care_level', lookup_expr='exact')
    is_available = django_filters.BooleanFilter(field_name='is_available')

    class Meta:
        model = Plant
        fields = ['price_min', 'price_max', 'category', 'care_level', 'is_available']
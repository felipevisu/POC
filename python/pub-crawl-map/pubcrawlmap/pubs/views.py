# pubs/views.py

from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from rest_framework import generics
from rest_framework.response import Response

from .models import Pub
from .serializers import PubSerializer


class PubListView(generics.ListAPIView):
    serializer_class = PubSerializer

    def get_queryset(self):
        lat = self.request.query_params.get("lat")
        lng = self.request.query_params.get("lng")
        radius = self.request.query_params.get("radius", "5")

        if not lat or not lng:
            return Pub.objects.none()

        try:
            lat = float(lat)
            lng = float(lng)
            radius = float(radius)

            center_point = Point(lng, lat, srid=4326)

            queryset = (
                Pub.objects.filter(location__distance_lte=(center_point, D(km=radius)))
                .annotate(distance=Distance("location", center_point))
                .order_by("distance")
            )

            return queryset

        except ValueError:
            return Pub.objects.none()

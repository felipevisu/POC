from rest_framework import serializers

from .models import Pub


class PubSerializer(serializers.ModelSerializer):
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    distance = serializers.SerializerMethodField()

    class Meta:
        model = Pub
        fields = "__all__"

    def get_latitude(self, obj):
        return obj.location.y

    def get_longitude(self, obj):
        return obj.location.x

    def get_distance(self, obj):
        if hasattr(obj, "distance"):
            return round(obj.distance.km, 2)
        return None

from django.contrib.gis import admin

from .models import Pub


@admin.register(Pub)
class PubAdmin(admin.GISModelAdmin):
    list_display = ["name", "address"]
    search_fields = ["name", "address"]

    gis_widget_kwargs = {
        "attrs": {
            "default_lon": -46.6333,
            "default_lat": -23.5505,
            "default_zoom": 12,
        }
    }

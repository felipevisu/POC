from django.urls import path

from .views import PubListView

urlpatterns = [
    path("pubs/", PubListView.as_view(), name="pub-list"),
]

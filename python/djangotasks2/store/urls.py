from django.urls import path

from .views import enqueue_task, store

urlpatterns = [
    path("", store),
    path("enqueue/", enqueue_task, name="enqueue_task"),
]

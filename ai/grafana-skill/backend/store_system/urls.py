from django.contrib import admin
from django.urls import path
from django.http import HttpResponse
from graphene_django.views import GraphQLView
from django.views.decorators.csrf import csrf_exempt
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST


def metrics_view(request):
    return HttpResponse(generate_latest(), content_type=CONTENT_TYPE_LATEST)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('graphql/', csrf_exempt(GraphQLView.as_view(graphiql=True))),
    path('metrics/', metrics_view),
]

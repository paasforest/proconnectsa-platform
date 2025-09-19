from django.urls import path
from . import services_views

urlpatterns = [
    path('', services_views.my_services, name='my_services'),  # GET and POST
    path('<str:service_id>/', services_views.update_service, name='update_service'),
    path('<str:service_id>/delete/', services_views.delete_service, name='delete_service'),
    path('stats/', services_views.service_stats, name='service_stats'),
]

from django.urls import path
from . import views

urlpatterns = [
    path('registrations/', views.create_business_registration, name='create_business_registration'),
    path('registrations/<str:registration_id>/', views.get_business_registration, name='get_business_registration'),
]



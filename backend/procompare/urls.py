"""
URL configuration for ProConnectSA.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import monitoring

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth & users
    path('api/auth/', include('backend.users.urls')),
    path('api/', include('backend.users.urls')),

    # Core business
    path('api/leads/', include('backend.leads.urls')),
    path('api/reviews/', include('backend.reviews.urls')),
    path('api/notifications/', include('backend.notifications.urls')),
    path('api/payments/', include('backend.payments.urls')),

    # Services
    path('api/services/', include('backend.users.services_urls')),

    # Google OAuth
    path('accounts/', include('allauth.urls')),

    # Health checks
    path('health/', monitoring.health_check, name='health-check'),
    path('ready/', monitoring.readiness_check, name='readiness-check'),
    path('live/', monitoring.liveness_check, name='liveness-check'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

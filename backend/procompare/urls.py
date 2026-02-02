"""
URL configuration for ProCompare project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import monitoring

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/auth/', include('backend.users.urls')),
    path('api/leads/', include('backend.leads.urls')),  # Must come before 'api/' to avoid shadowing
    path('api/', include('backend.users.urls')),  # Direct API access for client dashboard
    path('api/reviews/', include('backend.reviews.urls')),
    path('api/notifications/', include('backend.notifications.urls')),
    path('api/payments/', include('backend.payments.urls')),
    path('api/support/', include('backend.support.urls')),
    path('api/business/', include('backend.business.urls')),
    
    # Services endpoints
    path('api/services/', include('backend.users.services_urls')),
    
    # WebSocket endpoints - with fallback handling
    # Note: WebSocket routing is handled in asgi.py with fallback
    
    # Django Allauth URLs for Google OAuth
    path('accounts/', include('allauth.urls')),
    
    # Monitoring endpoints
    path('health/', monitoring.health_check, name='health-check'),
    path('metrics/', monitoring.metrics, name='metrics'),
    path('ready/', monitoring.readiness_check, name='readiness-check'),
    path('live/', monitoring.liveness_check, name='liveness-check'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

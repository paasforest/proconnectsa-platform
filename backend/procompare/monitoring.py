"""
Health check endpoints for ProConnectSA.
Simplified — no Redis dependency.
"""
import time
import logging

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
from django.db import connection
from django.conf import settings

logger = logging.getLogger(__name__)


@require_http_methods(["GET"])
def health_check(request):
    health = {'status': 'healthy', 'timestamp': time.time(), 'services': {}}

    # Database
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        health['services']['database'] = 'healthy'
    except Exception as e:
        health['services']['database'] = f'unhealthy: {e}'
        health['status'] = 'unhealthy'

    # Cache
    try:
        cache.set('health_check', 'ok', 10)
        health['services']['cache'] = 'healthy' if cache.get('health_check') == 'ok' else 'unhealthy'
    except Exception as e:
        health['services']['cache'] = f'unhealthy: {e}'

    return JsonResponse(health, status=200 if health['status'] == 'healthy' else 503)


@require_http_methods(["GET"])
def metrics(request):
    from django.contrib.auth import get_user_model
    from backend.leads.models import Lead

    User = get_user_model()

    return JsonResponse({
        'timestamp': time.time(),
        'users': {
            'total': User.objects.count(),
            'clients': User.objects.filter(user_type='client').count(),
            'providers': User.objects.filter(user_type='provider').count(),
        },
        'leads': {
            'total': Lead.objects.count(),
            'active': Lead.objects.filter(status='active').count(),
        },
        'system': {
            'debug': settings.DEBUG,
        }
    })


@require_http_methods(["GET"])
def readiness_check(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return JsonResponse({'status': 'ready'}, status=200)
    except Exception as e:
        return JsonResponse({'status': 'not ready', 'error': str(e)}, status=503)


@require_http_methods(["GET"])
def liveness_check(request):
    return JsonResponse({'status': 'alive'}, status=200)

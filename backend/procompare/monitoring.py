"""
Monitoring and health check utilities for ProCompare
"""
import logging
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
from django.db import connection
from django.conf import settings
import redis
import time

logger = logging.getLogger(__name__)

@require_http_methods(["GET"])
def health_check(request):
    """
    Comprehensive health check endpoint
    """
    health_status = {
        'status': 'healthy',
        'timestamp': time.time(),
        'services': {}
    }
    
    # Database health check
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            health_status['services']['database'] = 'healthy'
    except Exception as e:
        health_status['services']['database'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    # Redis health check
    try:
        redis_client = redis.from_url(settings.CACHES['default']['LOCATION'])
        redis_client.ping()
        health_status['services']['redis'] = 'healthy'
    except Exception as e:
        health_status['services']['redis'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    # Cache health check
    try:
        cache.set('health_check', 'ok', 10)
        cache_result = cache.get('health_check')
        if cache_result == 'ok':
            health_status['services']['cache'] = 'healthy'
        else:
            health_status['services']['cache'] = 'unhealthy'
    except Exception as e:
        health_status['services']['cache'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    # Return appropriate HTTP status
    status_code = 200 if health_status['status'] == 'healthy' else 503
    
    return JsonResponse(health_status, status=status_code)

@require_http_methods(["GET"])
def metrics(request):
    """
    Basic metrics endpoint for monitoring
    """
    from django.contrib.auth import get_user_model
    from backend.leads.models import Lead
    from backend.payments.models import CreditTransaction, ManualDeposit
    
    User = get_user_model()
    
    metrics_data = {
        'timestamp': time.time(),
        'users': {
            'total': User.objects.count(),
            'clients': User.objects.filter(user_type='client').count(),
            'providers': User.objects.filter(user_type='provider').count(),
        },
        'leads': {
            'total': Lead.objects.count(),
            'active': Lead.objects.filter(status='active').count(),
            'completed': Lead.objects.filter(status='completed').count(),
        },
        'payments': {
            'total_transactions': CreditTransaction.objects.count(),
            'pending_deposits': ManualDeposit.objects.filter(status='pending').count(),
            'verified_deposits': ManualDeposit.objects.filter(status='verified').count(),
        },
        'system': {
            'debug_mode': settings.DEBUG,
            'database_engine': settings.DATABASES['default']['ENGINE'],
            'cache_backend': settings.CACHES['default']['BACKEND'],
        }
    }
    
    return JsonResponse(metrics_data)

@require_http_methods(["GET"])
def readiness_check(request):
    """
    Readiness check for Kubernetes/Docker
    """
    try:
        # Check if database is accessible
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        # Check if Redis is accessible
        redis_client = redis.from_url(settings.CACHES['default']['LOCATION'])
        redis_client.ping()
        
        return JsonResponse({'status': 'ready'}, status=200)
    except Exception as e:
        logger.error(f"Readiness check failed: {str(e)}")
        return JsonResponse({'status': 'not ready', 'error': str(e)}, status=503)

@require_http_methods(["GET"])
def liveness_check(request):
    """
    Liveness check for Kubernetes/Docker
    """
    return JsonResponse({'status': 'alive'}, status=200)










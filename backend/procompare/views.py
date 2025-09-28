from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

@require_http_methods(["GET", "POST", "PUT", "PATCH", "DELETE"])
def rate_limit_exceeded(request, exception=None):
    """
    Custom view for rate limit exceeded responses
    """
    return JsonResponse({
        'error': 'Rate limit exceeded',
        'message': 'Too many requests. Please slow down and try again later.',
        'retry_after': 60,  # seconds
        'help_text': 'You have exceeded the rate limit for this endpoint. Please wait before making more requests.'
    }, status=429)

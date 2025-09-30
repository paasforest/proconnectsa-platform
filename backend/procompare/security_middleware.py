"""
Security middleware for input validation and protection
"""
import json
import re
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from django.core.exceptions import SuspiciousOperation


class SecurityMiddleware(MiddlewareMixin):
    """
    Security middleware for input validation and protection
    """
    
    def process_request(self, request):
        """Process incoming requests for security checks"""
        
        # Check request size
        if hasattr(request, 'META') and 'CONTENT_LENGTH' in request.META:
            content_length_str = request.META.get('CONTENT_LENGTH', '0')
            content_length = int(content_length_str) if content_length_str else 0
            max_size = getattr(settings, 'DATA_UPLOAD_MAX_MEMORY_SIZE', 10 * 1024 * 1024)
            
            if content_length > max_size:
                return JsonResponse({
                    'error': 'Request too large',
                    'message': 'Request size exceeds maximum allowed limit'
                }, status=413)
        
        # Check for suspicious patterns in POST data
        if request.method == 'POST':
            try:
                # Get raw body for inspection
                body = request.body.decode('utf-8')
                
                # Check for SQL injection patterns
                sql_patterns = [
                    r'union\s+select', r'drop\s+table', r'delete\s+from',
                    r'insert\s+into', r'update\s+set', r'exec\s*\(',
                    r'script\s*>', r'<script', r'javascript:',
                    r'<iframe', r'<object', r'<embed'
                ]
                
                for pattern in sql_patterns:
                    if re.search(pattern, body, re.IGNORECASE):
                        return JsonResponse({
                            'error': 'Invalid request',
                            'message': 'Request contains potentially malicious content'
                        }, status=400)
                        
            except (UnicodeDecodeError, json.JSONDecodeError):
                return JsonResponse({
                    'error': 'Invalid request',
                    'message': 'Request contains invalid data'
                }, status=400)
        
        return None
    
    def process_response(self, request, response):
        """Add security headers to responses"""
        
        # Add security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Add CSP header for production
        if not settings.DEBUG:
            response['Content-Security-Policy'] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self' data:; "
                "connect-src 'self' https://api.proconnectsa.co.za; "
                "frame-ancestors 'none';"
            )
        
        return response

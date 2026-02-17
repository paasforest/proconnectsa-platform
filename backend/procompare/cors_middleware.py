"""
Custom CORS middleware to ensure CORS headers are always sent
"""
from django.utils.deprecation import MiddlewareMixin


class CustomCorsMiddleware(MiddlewareMixin):
    """
    Custom CORS middleware that ensures CORS headers are always sent
    """
    
    def process_response(self, request, response):
        # Add CORS headers to all responses
        origin = request.META.get('HTTP_ORIGIN') or request.META.get('HTTP_REFERER', '').rsplit('/', 1)[0] if request.META.get('HTTP_REFERER') else None
        
        # Check if origin is allowed
        allowed_origins = [
            'http://localhost:3000',
            'http://localhost:3001', 
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'https://proconnectsa.co.za',
            'https://www.proconnectsa.co.za',
            'https://proconnectsa.vercel.app',
            'https://proconnectsa-platform.vercel.app',
            'https://proconnectsa-git-main.vercel.app',
            'https://proconnectsa-git-develop.vercel.app',
            'https://proconnectsa-git-staging.vercel.app',
        ]
        
        # Handle preflight OPTIONS requests first
        if request.method == 'OPTIONS':
            if origin and (origin.endswith('.vercel.app') or origin in allowed_origins):
                response['Access-Control-Allow-Origin'] = origin
                response['Access-Control-Allow-Credentials'] = 'true'
                response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with'
                response['Access-Control-Allow-Methods'] = 'DELETE, GET, OPTIONS, PATCH, POST, PUT'
                response['Access-Control-Max-Age'] = '86400'
                response.status_code = 200
            else:
                response.status_code = 200  # Still return 200 for OPTIONS even if origin not found
            return response
        
        # Handle regular requests
        if origin:
            # Allow all Vercel subdomains
            if origin.endswith('.vercel.app') or origin in allowed_origins:
                response['Access-Control-Allow-Origin'] = origin
                response['Access-Control-Allow-Credentials'] = 'true'
                response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with'
                response['Access-Control-Allow-Methods'] = 'DELETE, GET, OPTIONS, PATCH, POST, PUT'
                response['Access-Control-Max-Age'] = '86400'
            else:
                # SECURITY: Block unauthorized origins
                print(f"CustomCorsMiddleware: BLOCKING unauthorized origin: {origin}")
                # Don't block, just don't set CORS headers (let django-cors-headers handle it)
        
        return response

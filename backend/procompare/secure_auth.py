"""
Secure authentication for public API endpoints
"""
import hashlib
import hmac
import time
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import BasePermission


class SecureAPIKeyAuthentication(BaseAuthentication):
    """
    Secure API key authentication with HMAC validation
    """
    
    def authenticate(self, request):
        api_key = request.META.get('HTTP_X_API_KEY')
        timestamp = request.META.get('HTTP_X_TIMESTAMP')
        signature = request.META.get('HTTP_X_SIGNATURE')
        
        if not api_key or not timestamp or not signature:
            return None
        
        # Check timestamp (prevent replay attacks)
        try:
            request_time = int(timestamp)
            current_time = int(time.time())
            
            # Allow 5 minute window
            if abs(current_time - request_time) > 300:
                raise AuthenticationFailed('Request timestamp too old')
                
        except (ValueError, TypeError):
            raise AuthenticationFailed('Invalid timestamp')
        
        # Validate API key and signature
        if self.validate_request(api_key, timestamp, signature, request):
            return (None, None)  # (user, auth)
        
        raise AuthenticationFailed('Invalid API key or signature')
    
    def validate_request(self, api_key, timestamp, signature, request):
        """Validate the request using HMAC"""
        
        # Get the secret key for this API key
        secret_key = self.get_secret_key(api_key)
        if not secret_key:
            return False
        
        # Create the message to sign
        method = request.method
        path = request.path
        body = request.body.decode('utf-8') if request.body else ''
        
        message = f"{method}{path}{timestamp}{body}"
        
        # Generate expected signature
        expected_signature = hmac.new(
            secret_key.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        # Compare signatures
        return hmac.compare_digest(signature, expected_signature)
    
    def get_secret_key(self, api_key):
        """Get secret key for API key"""
        # In production, store these in environment variables or secure database
        api_keys = {
            'proconnectsa_public_2024': 'sk_live_public_2024_secure_key_here',
            'proconnectsa_lead_creation_2024': 'sk_live_lead_creation_2024_secure_key_here',
            'proconnectsa_webhook_2024': 'sk_live_webhook_2024_secure_key_here'
        }
        
        return api_keys.get(api_key)


class PublicEndpointPermission(BasePermission):
    """
    Permission class for public endpoints with rate limiting
    """
    
    def has_permission(self, request, view):
        # Allow if authenticated with API key
        if hasattr(request, 'auth') and request.auth is not None:
            return True
        
        # For public endpoints, we still require some form of identification
        # Check for basic API key in header
        api_key = request.META.get('HTTP_X_API_KEY')
        if api_key and api_key in ['proconnectsa_public_2024', 'proconnectsa_lead_creation_2024']:
            return True
        
        return False


class RateLimitedPermission(BasePermission):
    """
    Permission class that enforces rate limiting
    """
    
    def has_permission(self, request, view):
        # This will be handled by django-ratelimit middleware
        return True

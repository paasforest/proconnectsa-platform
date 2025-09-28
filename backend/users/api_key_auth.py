"""
API Key Authentication for public endpoints
"""
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
import hashlib
import hmac


class APIKeyAuthentication(BaseAuthentication):
    """
    API Key authentication for public endpoints
    """
    
    def authenticate(self, request):
        api_key = request.META.get('HTTP_X_API_KEY')
        
        if not api_key:
            return None
            
        # Validate API key
        if self.is_valid_api_key(api_key):
            # Return a dummy user for API key authentication
            return (None, None)  # (user, auth)
        
        raise AuthenticationFailed('Invalid API key')
    
    def is_valid_api_key(self, api_key):
        """
        Validate API key against configured keys
        """
        valid_keys = getattr(settings, 'API_KEYS', [])
        
        # For now, use a simple list of valid keys
        # In production, these should be stored securely
        if not valid_keys:
            # Default API keys for development
            valid_keys = [
                'proconnectsa_public_2024',
                'proconnectsa_lead_creation_2024',
                'proconnectsa_webhook_2024'
            ]
        
        return api_key in valid_keys


class PublicAPIKeyAuthentication(BaseAuthentication):
    """
    Lighter API key authentication for public endpoints
    """
    
    def authenticate(self, request):
        # For public endpoints, we'll use a simpler approach
        # Check for API key in header or query parameter
        api_key = (
            request.META.get('HTTP_X_API_KEY') or 
            request.GET.get('api_key')
        )
        
        if not api_key:
            # Allow requests without API key for now
            # In production, you might want to require API keys
            return None
            
        if self.is_valid_public_key(api_key):
            return (None, None)
        
        raise AuthenticationFailed('Invalid API key')
    
    def is_valid_public_key(self, api_key):
        """
        Validate public API key
        """
        public_keys = [
            'proconnectsa_public_2024',
            'proconnectsa_lead_creation_2024'
        ]
        return api_key in public_keys

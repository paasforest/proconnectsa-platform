"""
Security configuration for production deployment
"""
import os
from decouple import config

# Security settings for production
SECURITY_CONFIG = {
    # API Keys for public endpoints
    'API_KEYS': {
        'public': config('API_KEY_PUBLIC', default='proconnectsa_public_2024'),
        'lead_creation': config('API_KEY_LEAD_CREATION', default='proconnectsa_lead_creation_2024'),
        'webhook': config('API_KEY_WEBHOOK', default='proconnectsa_webhook_2024'),
    },
    
    # Rate limiting configuration
    'RATE_LIMITS': {
        'login': '10/m',  # 10 login attempts per minute
        'register': '5/m',  # 5 registrations per minute
        'lead_creation': '20/h',  # 20 lead creations per hour
        'api_requests': '1000/h',  # 1000 API requests per hour
        'public_lead': '20/h',  # 20 public lead creations per hour
    },
    
    # Input validation limits
    'INPUT_LIMITS': {
        'max_title_length': 200,
        'max_description_length': 1000,
        'max_location_length': 100,
        'max_phone_length': 15,
        'max_email_length': 254,
        'max_request_size': 10 * 1024 * 1024,  # 10MB
    },
    
    # Security headers
    'SECURITY_HEADERS': {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https://api.proconnectsa.co.za; "
            "frame-ancestors 'none';"
        ),
    },
    
    # CORS configuration
    'CORS_ORIGINS': [
        'https://proconnectsa.co.za',
        'https://www.proconnectsa.co.za',
        'https://proconnectsa.vercel.app',
        'https://proconnectsa-platform.vercel.app',
    ],
    
    # Allowed file types for uploads
    'ALLOWED_FILE_TYPES': [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'text/plain',
    ],
    
    # Maximum file size (5MB)
    'MAX_FILE_SIZE': 5 * 1024 * 1024,
}

def get_security_config():
    """Get security configuration"""
    return SECURITY_CONFIG

def is_production():
    """Check if running in production"""
    return not config('DEBUG', default=True, cast=bool)

def get_api_key(key_name):
    """Get API key by name"""
    return SECURITY_CONFIG['API_KEYS'].get(key_name)

def get_rate_limit(endpoint):
    """Get rate limit for endpoint"""
    return SECURITY_CONFIG['RATE_LIMITS'].get(endpoint, '1000/h')

def get_input_limit(field_name):
    """Get input limit for field"""
    return SECURITY_CONFIG['INPUT_LIMITS'].get(field_name, 1000)

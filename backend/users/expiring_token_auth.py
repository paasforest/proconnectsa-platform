"""
Expiring Token Authentication for Django REST Framework
Tokens expire after 14 days to enhance security
"""
from datetime import timedelta
from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed


class ExpiringTokenAuthentication(TokenAuthentication):
    """
    Token authentication with automatic expiration after 14 days.
    Backward compatible - existing tokens will work until they expire.
    """
    
    # Token expiration period (14 days)
    TOKEN_EXPIRATION_DAYS = 14
    
    def authenticate_credentials(self, key):
        """
        Authenticate the token and check if it has expired.
        """
        model = self.get_model()
        
        try:
            token = model.objects.select_related('user').get(key=key)
        except model.DoesNotExist:
            raise AuthenticationFailed('Invalid token.')

        # Check if user is active
        if not token.user.is_active:
            raise AuthenticationFailed('User inactive or deleted.')
        
        # Check token expiration
        token_age = timezone.now() - token.created
        expiration_time = timedelta(days=self.TOKEN_EXPIRATION_DAYS)
        
        if token_age > expiration_time:
            # Token has expired - delete it
            token.delete()
            raise AuthenticationFailed('Token has expired. Please login again.')

        return (token.user, token)
    
    def get_expiration_date(self, token):
        """
        Get the expiration date for a token.
        """
        return token.created + timedelta(days=self.TOKEN_EXPIRATION_DAYS)
    
    def is_token_expired(self, token):
        """
        Check if a token is expired.
        """
        return timezone.now() > self.get_expiration_date(token)


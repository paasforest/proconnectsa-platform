"""
Google OAuth API views for frontend integration
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import UserSerializer
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def google_oauth_callback(request):
    """
    Handle Google OAuth callback from frontend
    This endpoint receives the Google OAuth token from the frontend
    and creates/authenticates the user
    """
    try:
        # Get the Google OAuth token from request
        google_token = request.data.get('google_token')
        if not google_token:
            return Response(
                {'error': 'Google token is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # In a real implementation, you would verify the Google token here
        # For now, we'll simulate the process
        
        # Extract user info from Google token (this would be done by verifying the token)
        # For demo purposes, we'll use the request data
        email = request.data.get('email')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        google_id = request.data.get('google_id')
        
        if not email:
            return Response(
                {'error': 'Email is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already exists
        try:
            user = User.objects.get(email=email)
            logger.info(f"Existing user found: {email}")
        except User.DoesNotExist:
            # Create new user
            user = User.objects.create_user(
                username=email,
                email=email,
                first_name=first_name,
                last_name=last_name,
                user_type='client',  # Default to client for Google OAuth
                phone='',  # Will be filled later
                is_email_verified=True,  # Google emails are pre-verified
            )
            logger.info(f"New Google OAuth user created: {email}")
        
        # Create or get auth token
        token, created = Token.objects.get_or_create(user=user)
        
        # Send welcome email
        try:
            from backend.notifications.email_service import send_welcome_email
            send_welcome_email(user)
        except Exception as e:
            logger.error(f"Failed to send welcome email: {str(e)}")
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'Google OAuth login successful',
            'is_new_user': not hasattr(user, 'id') or user.id is None
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Google OAuth callback error: {str(e)}")
        return Response(
            {'error': 'Google OAuth authentication failed'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def google_oauth_url(request):
    """
    Get Google OAuth URL for frontend
    """
    try:
        from django.conf import settings
        
        # Construct Google OAuth URL
        client_id = settings.GOOGLE_OAUTH2_CLIENT_ID
        redirect_uri = f"{settings.FRONTEND_URL}/auth/google/callback"
        
        if not client_id:
            return Response(
                {'error': 'Google OAuth not configured'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        google_oauth_url = (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={client_id}&"
            f"redirect_uri={redirect_uri}&"
            f"response_type=code&"
            f"scope=openid%20email%20profile&"
            f"access_type=offline"
        )
        
        return Response({
            'google_oauth_url': google_oauth_url,
            'client_id': client_id,
            'redirect_uri': redirect_uri
        })
        
    except Exception as e:
        logger.error(f"Google OAuth URL error: {str(e)}")
        return Response(
            {'error': 'Failed to generate Google OAuth URL'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )










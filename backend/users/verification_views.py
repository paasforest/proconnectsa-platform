"""
API views for user verification system
Handles email verification, SMS verification, password reset, and 2FA
"""
import logging
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django_ratelimit.decorators import ratelimit
from .verification_service import VerificationService
from .serializers import (
    EmailVerificationSerializer, SMSVerificationSerializer,
    PasswordResetSerializer, PasswordResetConfirmSerializer,
    TwoFactorAuthSerializer
)

logger = logging.getLogger(__name__)
User = get_user_model()

# Initialize verification service
verification_service = VerificationService()

# EMAIL VERIFICATION ENDPOINTS

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@ratelimit(key='user', rate='5/m', method='POST')
def initiate_email_verification(request):
    """Initiate email verification for authenticated user"""
    try:
        user = request.user
        
        # Check if already verified
        if user.is_email_verified:
            return Response({
                'success': True,
                'message': 'Email is already verified',
                'is_verified': True
            }, status=status.HTTP_200_OK)
        
        result = verification_service.initiate_email_verification(user)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error in initiate_email_verification: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@ratelimit(key='user', rate='10/m', method='POST')
def verify_email_code(request):
    """Verify email verification code"""
    try:
        serializer = EmailVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        code = serializer.validated_data['code']
        token = serializer.validated_data.get('token')
        
        result = verification_service.verify_email_code(user.email, code, token)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error in verify_email_code: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# SMS VERIFICATION ENDPOINTS

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@ratelimit(key='user', rate='3/m', method='POST')
def initiate_sms_verification(request):
    """Initiate SMS verification for authenticated user"""
    try:
        user = request.user
        
        # Check if already verified
        if user.is_phone_verified:
            return Response({
                'success': True,
                'message': 'Phone number is already verified',
                'is_verified': True
            }, status=status.HTTP_200_OK)
        
        result = verification_service.initiate_sms_verification(user)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error in initiate_sms_verification: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@ratelimit(key='user', rate='10/m', method='POST')
def verify_sms_code(request):
    """Verify SMS verification code"""
    try:
        serializer = SMSVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        code = serializer.validated_data['code']
        token = serializer.validated_data.get('token')
        
        result = verification_service.verify_sms_code(user.phone, code, token)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error in verify_sms_code: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# PASSWORD RESET ENDPOINTS

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@ratelimit(key='ip', rate='5/m', method='POST')
def request_password_reset(request):
    """Request password reset via email or SMS"""
    try:
        serializer = PasswordResetSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        method = serializer.validated_data.get('method', 'email')
        
        result = verification_service.initiate_password_reset(email, method)
        
        # Always return success for security (don't reveal if email exists)
        return Response(result, status=status.HTTP_200_OK)
            
    except Exception as e:
        logger.error(f"Error in request_password_reset: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@ratelimit(key='ip', rate='10/m', method='POST')
def verify_password_reset_code(request):
    """Verify password reset code"""
    try:
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        token = serializer.validated_data['token']
        
        result = verification_service.verify_password_reset_code(email, code, token)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error in verify_password_reset_code: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@ratelimit(key='ip', rate='5/m', method='POST')
def reset_password(request):
    """Reset password after verification"""
    try:
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        new_password = serializer.validated_data['new_password']
        token = serializer.validated_data['token']
        
        result = verification_service.reset_password(email, new_password, token)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error in reset_password: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# TWO-FACTOR AUTHENTICATION ENDPOINTS

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@ratelimit(key='user', rate='3/m', method='POST')
def initiate_two_factor_auth(request):
    """Initiate two-factor authentication"""
    try:
        user = request.user
        
        result = verification_service.initiate_two_factor_auth(user)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error in initiate_two_factor_auth: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@ratelimit(key='user', rate='10/m', method='POST')
def verify_two_factor_auth(request):
    """Verify two-factor authentication code"""
    try:
        serializer = TwoFactorAuthSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        code = serializer.validated_data['code']
        token = serializer.validated_data['token']
        
        result = verification_service.verify_two_factor_auth(user.phone, code, token)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error in verify_two_factor_auth: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# UTILITY ENDPOINTS

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def verification_status(request):
    """Get current verification status for authenticated user"""
    try:
        user = request.user
        status_data = verification_service.get_user_verification_status(user)
        
        return Response({
            'success': True,
            'verification_status': status_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in verification_status: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@ratelimit(key='user', rate='3/m', method='POST')
def resend_verification(request):
    """Resend verification code via email or SMS"""
    try:
        method = request.data.get('method')
        if not method or method not in ['email', 'sms']:
            return Response({
                'success': False,
                'error': 'Invalid verification method. Must be "email" or "sms"'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        result = verification_service.resend_verification(user, method)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error in resend_verification: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)





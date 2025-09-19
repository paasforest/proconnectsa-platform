from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import update_session_auth_hash
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import logging

from .models import User, ProviderProfile
from .serializers import UserSerializer, ProviderProfileSerializer, PasswordChangeSerializer

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_details(request):
    """Get user profile details"""
    try:
        user = request.user
        user_data = UserSerializer(user).data
        
        # Get provider profile if exists
        try:
            provider_profile = user.providerprofile
            provider_data = ProviderProfileSerializer(provider_profile).data
            user_data['provider_profile'] = provider_data
        except ProviderProfile.DoesNotExist:
            user_data['provider_profile'] = None
        
        return Response({
            'success': True,
            'user': user_data
        })
    
    except Exception as e:
        logger.error(f"Error getting profile details: {str(e)}")
        return Response({
            'success': False,
            'message': 'Failed to get profile details'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update user profile information"""
    try:
        user = request.user
        data = request.data
        
        # Update basic user fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone' in data:
            user.phone = data['phone']
        
        user.save()
        
        # Update provider profile if exists
        try:
            provider_profile = user.providerprofile
            if 'business_name' in data:
                provider_profile.business_name = data['business_name']
            if 'business_description' in data:
                provider_profile.business_description = data['business_description']
            if 'business_address' in data:
                provider_profile.business_address = data['business_address']
            if 'business_phone' in data:
                provider_profile.business_phone = data['business_phone']
            if 'service_areas' in data:
                provider_profile.service_areas = data['service_areas']
            
            provider_profile.save()
        except ProviderProfile.DoesNotExist:
            pass  # User is not a provider
        
        # Return updated profile
        user_data = UserSerializer(user).data
        try:
            provider_data = ProviderProfileSerializer(user.providerprofile).data
            user_data['provider_profile'] = provider_data
        except ProviderProfile.DoesNotExist:
            user_data['provider_profile'] = None
        
        return Response({
            'success': True,
            'message': 'Profile updated successfully',
            'user': user_data
        })
    
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        return Response({
            'success': False,
            'message': 'Failed to update profile'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    try:
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            # Update session auth hash to prevent logout
            update_session_auth_hash(request, user)
            
            return Response({
                'success': True,
                'message': 'Password changed successfully'
            })
        else:
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Error changing password: {str(e)}")
        return Response({
            'success': False,
            'message': 'Failed to change password'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_image(request):
    """Upload profile image"""
    try:
        if 'image' not in request.FILES:
            return Response({
                'success': False,
                'message': 'No image file provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        image_file = request.FILES['image']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
        if image_file.content_type not in allowed_types:
            return Response({
                'success': False,
                'message': 'Invalid file type. Only JPEG, PNG, and GIF files are allowed.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (max 5MB)
        if image_file.size > 5 * 1024 * 1024:
            return Response({
                'success': False,
                'message': 'File too large. Maximum size is 5MB.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete old image if exists
        if user.profile_image and user.profile_image.name:
            try:
                if default_storage.exists(user.profile_image.name):
                    default_storage.delete(user.profile_image.name)
            except Exception as e:
                logger.warning(f"Failed to delete old profile image: {str(e)}")
        
        # Generate unique filename
        file_extension = os.path.splitext(image_file.name)[1]
        filename = f"profile_images/user_{user.id}_{int(timezone.now().timestamp())}{file_extension}"
        
        # Save new image
        user.profile_image.save(filename, ContentFile(image_file.read()), save=True)
        
        return Response({
            'success': True,
            'message': 'Profile image uploaded successfully',
            'image_url': user.profile_image.url if user.profile_image else None
        })
    
    except Exception as e:
        logger.error(f"Error uploading profile image: {str(e)}")
        return Response({
            'success': False,
            'message': 'Failed to upload profile image'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_profile_image(request):
    """Delete profile image"""
    try:
        user = request.user
        
        if not user.profile_image:
            return Response({
                'success': False,
                'message': 'No profile image to delete'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete file from storage
        try:
            if default_storage.exists(user.profile_image.name):
                default_storage.delete(user.profile_image.name)
        except Exception as e:
            logger.warning(f"Failed to delete profile image file: {str(e)}")
        
        # Clear the field
        user.profile_image = None
        user.save()
        
        return Response({
            'success': True,
            'message': 'Profile image deleted successfully'
        })
    
    except Exception as e:
        logger.error(f"Error deleting profile image: {str(e)}")
        return Response({
            'success': False,
            'message': 'Failed to delete profile image'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


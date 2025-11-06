"""
Admin API views for user management
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
import logging

from .models import User, ProviderProfile
from .serializers import UserSerializer

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def support_users_list(request):
    """
    Get list of all users for support/admin purposes
    """
    try:
        # Check if user is admin or support
        if not (request.user.is_staff or request.user.user_type in ['admin', 'support']):
            return Response({
                'error': 'Access denied. Admin or support privileges required.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get query parameters for filtering
        user_type = request.query_params.get('user_type')
        search = request.query_params.get('search')
        is_active = request.query_params.get('is_active')
        
        # Start with all users
        users = User.objects.all().order_by('-created_at')
        
        # Apply filters
        if user_type:
            users = users.filter(user_type=user_type)
        
        if is_active is not None:
            users = users.filter(is_active=is_active.lower() == 'true')
        
        if search:
            users = users.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )
        
        # Serialize users
        serializer = UserSerializer(users, many=True)
        
        return Response({
            'success': True,
            'users': serializer.data,
            'count': users.count()
        })
        
    except Exception as e:
        logger.error(f"Failed to fetch users list: {str(e)}")
        return Response(
            {'error': 'Failed to fetch users list'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def support_user_detail(request, user_id):
    """
    Get detailed information about a specific user
    """
    try:
        # Check if user is admin or support
        if not (request.user.is_staff or request.user.user_type in ['admin', 'support']):
            return Response({
                'error': 'Access denied. Admin or support privileges required.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        user = get_object_or_404(User, id=user_id)
        serializer = UserSerializer(user)
        
        # Get provider profile if exists
        provider_profile = None
        try:
            provider_profile = user.provider_profile
        except ProviderProfile.DoesNotExist:
            pass
        
        response_data = {
            'success': True,
            'user': serializer.data
        }
        
        if provider_profile:
            response_data['provider_profile'] = {
                'business_name': provider_profile.business_name,
                'business_address': provider_profile.business_address,
                'service_areas': provider_profile.service_areas,
                'service_categories': provider_profile.service_categories,
                'verification_status': provider_profile.verification_status,
                'subscription_tier': provider_profile.subscription_tier,
                'years_experience': provider_profile.years_experience,
                'service_description': provider_profile.service_description,
                'minimum_job_value': provider_profile.minimum_job_value,
                'maximum_job_value': provider_profile.maximum_job_value,
                'availability': provider_profile.availability,
                'emergency_services': provider_profile.emergency_services,
                'insurance_covered': provider_profile.insurance_covered,
                'warranty_period': provider_profile.warranty_period,
            }
        
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Failed to fetch user detail for {user_id}: {str(e)}")
        return Response(
            {'error': 'Failed to fetch user detail'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def support_user_update(request, user_id):
    """
    Update user information
    """
    try:
        # Check if user is admin or support
        if not (request.user.is_staff or request.user.user_type in ['admin', 'support']):
            return Response({
                'error': 'Access denied. Admin or support privileges required.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        user = get_object_or_404(User, id=user_id)
        
        # Update user fields
        allowed_fields = [
            'user_type', 'first_name', 'last_name', 'email', 'phone',
            'city', 'suburb', 'is_active', 'is_email_verified', 'is_phone_verified'
        ]
        
        for field in allowed_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        
        user.save()
        
        serializer = UserSerializer(user)
        return Response({
            'success': True,
            'user': serializer.data,
            'message': 'User updated successfully'
        })
        
    except Exception as e:
        logger.error(f"Failed to update user {user_id}: {str(e)}")
        return Response(
            {'error': 'Failed to update user'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def support_user_provider_profile(request, user_id):
    """
    Create or update provider profile for a user
    """
    try:
        # Check if user is admin or support
        if not (request.user.is_staff or request.user.user_type in ['admin', 'support']):
            return Response({
                'error': 'Access denied. Admin or support privileges required.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        user = get_object_or_404(User, id=user_id)
        
        # Check if user is a provider
        if user.user_type != 'provider':
            return Response({
                'error': 'User must be a provider to have a provider profile'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create or update provider profile
        profile_data = request.data
        profile, created = ProviderProfile.objects.get_or_create(
            user=user,
            defaults=profile_data
        )
        
        if not created:
            # Update existing profile
            for field, value in profile_data.items():
                if hasattr(profile, field):
                    setattr(profile, field, value)
            profile.save()
        
        return Response({
            'success': True,
            'provider_profile': {
                'business_name': profile.business_name,
                'business_address': profile.business_address,
                'service_areas': profile.service_areas,
                'service_categories': profile.service_categories,
                'verification_status': profile.verification_status,
                'subscription_tier': profile.subscription_tier,
                'years_experience': profile.years_experience,
                'service_description': profile.service_description,
                'minimum_job_value': profile.minimum_job_value,
                'maximum_job_value': profile.maximum_job_value,
                'availability': profile.availability,
                'emergency_services': profile.emergency_services,
                'insurance_covered': profile.insurance_covered,
                'warranty_period': profile.warranty_period,
            },
            'message': 'Provider profile created successfully' if created else 'Provider profile updated successfully'
        })
        
    except Exception as e:
        logger.error(f"Failed to create/update provider profile for user {user_id}: {str(e)}")
        return Response(
            {'error': 'Failed to create/update provider profile'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )










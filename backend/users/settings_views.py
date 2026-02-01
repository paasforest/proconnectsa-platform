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
from django.utils import timezone

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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_verification_documents(request):
    """List provider verification documents"""
    try:
        if request.user.user_type != 'provider':
            return Response({'success': False, 'message': 'Only providers can list documents'}, status=status.HTTP_403_FORBIDDEN)
        
        profile = request.user.provider_profile
        docs = profile.verification_documents or {}
        return Response({'success': True, 'verification_status': profile.verification_status, 'documents': docs})
    except Exception as e:
        logger.error(f"Error listing verification documents: {str(e)}")
        return Response({'success': False, 'message': 'Failed to list documents'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_verification_document(request):
    """
    Upload a verification document for provider profile.
    Form fields:
      - document_type: one of ['id_document','passport','proof_of_address','business_registration','insurance','other']
      - file: the uploaded file
    """
    try:
        if request.user.user_type != 'provider':
            return Response({'success': False, 'message': 'Only providers can upload documents'}, status=status.HTTP_403_FORBIDDEN)
        
        if 'file' not in request.FILES:
            return Response({'success': False, 'message': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        document_type = request.POST.get('document_type', 'other')
        allowed_types = {'id_document', 'passport', 'proof_of_address', 'business_registration', 'insurance', 'other'}
        if document_type not in allowed_types:
            return Response({'success': False, 'message': 'Invalid document_type'}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        allowed_mime = {'image/jpeg', 'image/png', 'application/pdf'}
        if file.content_type not in allowed_mime:
            return Response({'success': False, 'message': 'Invalid file type. JPEG, PNG, or PDF only.'}, status=status.HTTP_400_BAD_REQUEST)
        if file.size > 10 * 1024 * 1024:
            return Response({'success': False, 'message': 'File too large (max 10MB).'}, status=status.HTTP_400_BAD_REQUEST)
        
        profile = request.user.provider_profile
        
        # Save file
        _, ext = os.path.splitext(file.name)
        filename = f"verification_docs/user_{request.user.id}/{document_type}_{int(timezone.now().timestamp())}{ext}"
        saved_path = default_storage.save(filename, ContentFile(file.read()))
        file_url = default_storage.url(saved_path) if hasattr(default_storage, 'url') else f"/media/{saved_path}"
        
        # Update JSON field
        docs = profile.verification_documents or {}
        docs.setdefault(document_type, [])
        docs[document_type].append({
            'path': saved_path,
            'url': file_url,
            'uploaded_at': timezone.now().isoformat()
        })
        profile.verification_documents = docs
        # Ensure status at least pending
        if profile.verification_status in ['rejected', 'pending', 'suspended']:
            profile.verification_status = 'pending'
        profile.save(update_fields=['verification_documents', 'verification_status'])
        
        return Response({
            'success': True,
            'message': 'Document uploaded',
            'verification_status': profile.verification_status,
            'document': {'type': document_type, 'url': file_url}
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.error(f"Error uploading verification document: {str(e)}")
        return Response({'success': False, 'message': 'Failed to upload document'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def premium_listing_request(request):
    """
    Get premium listing request details with EFT instructions.
    Returns bank account details and generates a unique reference for premium payment.
    """
    try:
        if request.user.user_type != 'provider':
            return Response({
                'success': False,
                'message': 'Only providers can request premium listing'
            }, status=status.HTTP_403_FORBIDDEN)
        
        profile = request.user.provider_profile
        from backend.users.models import Wallet
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        
        # Generate unique premium reference
        import time
        import uuid
        premium_reference = f"PREMIUM{wallet.customer_code[-3:] if wallet.customer_code else 'XXX'}{int(time.time()) % 10000:04d}"
        
        # Check current premium status
        from django.utils import timezone
        now = timezone.now()
        is_premium_active = (
            profile.is_premium_listing and
            profile.premium_listing_started_at is not None and
            (
                profile.premium_listing_expires_at is None or
                profile.premium_listing_expires_at > now
            )
        )
        
        # EFT bank details (same as deposit instructions)
        eft_details = {
            'bank_name': 'Nedbank',
            'account_holder': 'ProConnectSA',
            'account_number': '1313872032',
            'branch_code': '198765',
            'account_type': 'Business',
            'reference': premium_reference,
            'amount': 'R299.00',  # Monthly premium
            'note': f'Use reference: {premium_reference} when making payment'
        }
        
        return Response({
            'success': True,
            'is_premium_active': is_premium_active,
            'premium_status': {
                'is_active': is_premium_active,
                'started_at': profile.premium_listing_started_at.isoformat() if profile.premium_listing_started_at else None,
                'expires_at': profile.premium_listing_expires_at.isoformat() if profile.premium_listing_expires_at else None,
                'payment_reference': profile.premium_listing_payment_reference or None,
            },
            'eft_details': eft_details,
            'pricing': {
                'monthly': 299.00,
                'lifetime': 2990.00,
                'currency': 'ZAR'
            },
            'benefits': [
                'Unlimited FREE leads (no credit charges)',
                'Public directory visibility',
                'Featured placement in listings',
                'Premium badge on profile',
                'SEO benefits'
            ]
        })
    
    except Exception as e:
        logger.error(f"Error getting premium listing request: {str(e)}")
        return Response({
            'success': False,
            'message': 'Failed to get premium listing details'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


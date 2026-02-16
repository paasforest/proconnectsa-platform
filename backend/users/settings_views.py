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
        if not request.user.is_provider:
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
        if not request.user.is_provider:
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
def premium_status(request):
    """
    Get premium listing status and payment verification status for the current provider
    """
    try:
        if request.user.user_type != 'provider':
            return Response({
                'success': False,
                'error': 'Only providers can check premium status'
            }, status=status.HTTP_403_FORBIDDEN)
        
        provider = request.user.provider_profile
        
        # Check for pending premium requests
        from backend.payments.models import DepositRequest, TransactionStatus
        pending_premium_deposits = DepositRequest.objects.filter(
            account__user=request.user,
            verification_notes__icontains='premium listing request',
            status=TransactionStatus.PENDING
        ).order_by('-created_at')
        
        # Get the most recent pending request
        latest_request = pending_premium_deposits.first() if pending_premium_deposits.exists() else None
        
        # Check premium listing status
        is_premium_active = provider.is_premium_listing_active if hasattr(provider, 'is_premium_listing_active') else False
        
        # Build response
        response_data = {
            'success': True,
            'has_premium_request': latest_request is not None,
            'premium_status': 'active' if is_premium_active else ('pending' if latest_request else 'none'),
            'premium_listing': {
                'is_active': is_premium_active,
                'expires_at': provider.premium_listing_expires_at.isoformat() if provider.premium_listing_expires_at else None,
                'started_at': provider.premium_listing_started_at.isoformat() if provider.premium_listing_started_at else None,
                'payment_reference': provider.premium_listing_payment_reference or None
            }
        }
        
        # Add deposit/payment information if there's a pending request
        if latest_request:
            payment_verified = bool(latest_request.bank_reference) or latest_request.is_auto_verified
            
            # Extract plan type
            verification_notes = latest_request.verification_notes or ''
            plan_type = 'monthly'
            if 'lifetime' in verification_notes.lower():
                plan_type = 'lifetime'
            elif 'monthly' in verification_notes.lower():
                plan_type = 'monthly'
            
            response_data['deposit'] = {
                'id': str(latest_request.id),
                'amount': float(latest_request.amount),
                'plan_type': plan_type,
                'reference_number': latest_request.reference_number,
                'bank_reference': latest_request.bank_reference,
                'status': latest_request.status,
                'payment_verified': payment_verified,
                'payment_status': 'verified' if payment_verified else 'pending',
                'is_auto_verified': latest_request.is_auto_verified,
                'created_at': latest_request.created_at.isoformat(),
                'age_hours': round((timezone.now() - latest_request.created_at).total_seconds() / 3600, 1)
            }
        else:
            response_data['deposit'] = None
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except ProviderProfile.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Provider profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error getting premium status: {str(e)}")
        return Response({
            'success': False,
            'error': 'Failed to get premium status'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_premium_listing(request):
    """
    Request premium listing - generates payment reference and banking details
    """
    try:
        if request.user.user_type != 'provider':
            return Response({
                'success': False,
                'error': 'Only providers can request premium listing'
            }, status=status.HTTP_403_FORBIDDEN)
        
        plan_type = request.data.get('plan_type')  # 'monthly' or 'lifetime'
        
        if plan_type not in ['monthly', 'lifetime']:
            return Response({
                'success': False,
                'error': 'Invalid plan_type. Must be "monthly" or "lifetime"'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get provider profile - handle if it doesn't exist
        try:
            provider = request.user.provider_profile
        except Exception as e:
            logger.error(f"Provider profile not found for {request.user.email}: {str(e)}")
            return Response({
                'success': False,
                'error': 'Provider profile not found. Please complete your profile setup first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or generate customer code
        customer_code = None
        if hasattr(provider, 'customer_code') and provider.customer_code:
            customer_code = provider.customer_code
        else:
            # Try to get from Wallet
            from backend.users.models import Wallet
            try:
                wallet = Wallet.objects.get(user=request.user)
                if wallet.customer_code:
                    customer_code = wallet.customer_code
            except Wallet.DoesNotExist:
                pass
        
        # If still no customer code, generate one
        if not customer_code:
            if hasattr(provider, 'generate_customer_code'):
                customer_code = provider.generate_customer_code()
                provider.customer_code = customer_code
                provider.save(update_fields=['customer_code'])
            else:
                # Fallback: use user ID
                customer_code = f"PC{str(request.user.id)[:8].upper()}"
        
        # Calculate amount and duration
        if plan_type == 'monthly':
            amount = 299.00
            months = 1
        else:  # lifetime
            amount = 2990.00
            months = 0  # 0 = lifetime
        
        # Generate unique reference number
        import uuid
        import time
        timestamp = int(time.time())
        unique_id = str(uuid.uuid4().hex[:6]).upper()
        reference_number = f"PREMIUM{unique_id}{timestamp}"
        
        # Get banking details - use defaults if service fails
        banking_details = {
            'bank_name': 'Nedbank',
            'account_number': '1313872032',
            'branch_code': '198765',
            'account_holder': 'ProConnectSA (Pty) Ltd'
        }
        
        try:
            from backend.payments.auto_deposit_service import AutoDepositService
            auto_service = AutoDepositService()
            deposit_instructions = auto_service.get_deposit_instructions(customer_code)
            if deposit_instructions.get('success') and deposit_instructions.get('instructions'):
                banking_details = deposit_instructions['instructions']
        except Exception as e:
            logger.warning(f"Could not get deposit instructions, using defaults: {str(e)}")
            # Use defaults already set above
        
        # Create deposit request for premium payment
        from backend.payments.models import DepositRequest
        from backend.payments.payment_service import PaymentService
        
        try:
            payment_service = PaymentService()
            account = payment_service.get_or_create_payment_account(request.user)
        except Exception as e:
            logger.error(f"Error creating payment account: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to create payment account',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Create deposit request with PREMIUM reference
        # NOTE: bank_reference should be None initially - it's only set when payment is detected
        try:
            deposit_request = DepositRequest.objects.create(
                account=account,
                amount=amount,
                bank_reference=None,  # Only set when payment is actually detected from bank
                reference_number=reference_number,  # This is what provider uses when making payment
                customer_code=customer_code,
                credits_to_activate=0,  # Premium doesn't give credits, it gives free leads
                status='pending',
                verification_notes=f'Premium listing request - {plan_type} plan'
            )
        except Exception as e:
            logger.error(f"Error creating deposit request: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to create deposit request',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Instructions for user
        instructions = [
            f'Make an EFT payment of R{amount:.2f} to the bank account below',
            f'IMPORTANT: Use the exact reference: {reference_number}',
            f'Bank: {banking_details.get("bank_name", "Nedbank")}',
            f'Account: {banking_details.get("account_number", "1313872032")}',
            f'Branch Code: {banking_details.get("branch_code", "198765")}',
            'Premium will activate automatically within 5 minutes of payment detection',
            'You will receive an email confirmation when premium is activated'
        ]
        
        logger.info(f"Premium listing request created for {request.user.email}: {plan_type} plan, reference {reference_number}")
        
        return Response({
            'success': True,
            'reference_number': reference_number,
            'amount': amount,
            'plan_type': plan_type,
            'banking_details': banking_details,
            'customer_code': customer_code,
            'instructions': instructions,
            'deposit_id': str(deposit_request.id)
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        import traceback
        logger.error(f"Error creating premium listing request: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return Response({
            'success': False,
            'error': 'Failed to create premium listing request',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


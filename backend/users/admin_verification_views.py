"""
Admin views for managing provider verification documents
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Q
import logging

from backend.users.models import ProviderProfile, User

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_pending_verifications(request):
    """
    Get all providers with pending verification and their documents
    """
    try:
        # Check if user is admin or staff
        if not (request.user.is_staff or request.user.user_type in ['admin', 'support']):
            return Response(
                {'error': 'Access denied. Admin or support privileges required.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get filter parameter
        status_filter = request.GET.get('status', 'pending')
        
        # Get providers with documents
        providers = ProviderProfile.objects.select_related('user').order_by('-created_at')
        
        # Filter by verification status
        if status_filter == 'pending':
            providers = providers.filter(verification_status='pending')
        elif status_filter == 'rejected':
            providers = providers.filter(verification_status='rejected')
        elif status_filter == 'verified':
            providers = providers.filter(verification_status='verified')
        # 'all' shows all statuses
        
        # Filter to only show providers with uploaded documents
        has_documents = Q(verification_documents__isnull=False) & ~Q(verification_documents={})
        providers = providers.filter(has_documents)
        
        verifications = []
        for profile in providers:
            docs = profile.verification_documents or {}
            user = profile.user
            
            # Count documents
            doc_count = 0
            doc_list = []
            for doc_type, doc_items in docs.items():
                if doc_type != 'admin_notes' and isinstance(doc_items, list):
                    doc_count += len(doc_items)
                    for doc in doc_items:
                        if isinstance(doc, dict) and 'url' in doc:
                            doc_list.append({
                                'type': doc_type,
                                'url': doc.get('url'),
                                'path': doc.get('path'),
                                'uploaded_at': doc.get('uploaded_at')
                            })
            
            verifications.append({
                'provider_id': user.id,
                'profile_id': profile.id,
                'provider_email': user.email,
                'provider_name': user.get_full_name() or user.email,
                'business_name': profile.business_name,
                'verification_status': profile.verification_status,
                'document_count': doc_count,
                'documents': doc_list,
                'admin_notes': docs.get('admin_notes', ''),
                'created_at': profile.created_at.isoformat(),
                'updated_at': profile.updated_at.isoformat(),
            })
        
        return Response({
            'success': True,
            'verifications': verifications,
            'count': len(verifications)
        })
        
    except Exception as e:
        logger.error(f"Error fetching pending verifications: {str(e)}")
        return Response(
            {'error': 'Failed to fetch verifications'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_provider_verification_detail(request, provider_id):
    """
    Get detailed verification information for a specific provider
    """
    try:
        # Check if user is admin or staff
        if not (request.user.is_staff or request.user.user_type in ['admin', 'support']):
            return Response(
                {'error': 'Access denied. Admin or support privileges required.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = User.objects.get(id=provider_id)
        if user.user_type != 'provider':
            return Response(
                {'error': 'User is not a provider'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        profile = user.provider_profile
        docs = profile.verification_documents or {}
        
        # Organize documents by type
        documents_by_type = {}
        for doc_type, doc_items in docs.items():
            if doc_type != 'admin_notes' and isinstance(doc_items, list):
                documents_by_type[doc_type] = doc_items
        
        return Response({
            'success': True,
            'provider': {
                'id': user.id,
                'email': user.email,
                'name': user.get_full_name() or user.email,
                'business_name': profile.business_name,
                'verification_status': profile.verification_status,
                'documents': documents_by_type,
                'admin_notes': docs.get('admin_notes', ''),
                'created_at': profile.created_at.isoformat(),
                'updated_at': profile.updated_at.isoformat(),
            }
        })
        
    except User.DoesNotExist:
        return Response(
            {'error': 'Provider not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error fetching verification detail: {str(e)}")
        return Response(
            {'error': 'Failed to fetch verification detail'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_approve_verification(request, provider_id):
    """
    Approve provider verification
    """
    try:
        # Check if user is admin or staff
        if not (request.user.is_staff or request.user.user_type in ['admin', 'support']):
            return Response(
                {'error': 'Access denied. Admin or support privileges required.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = User.objects.get(id=provider_id)
        if user.user_type != 'provider':
            return Response(
                {'error': 'User is not a provider'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        profile = user.provider_profile
        profile.verification_status = 'verified'
        profile.save(update_fields=['verification_status'])
        
        logger.info(f"Provider verification approved for {profile.business_name} ({user.email})")
        
        return Response({
            'success': True,
            'message': 'Provider verification approved',
            'verification_status': 'verified'
        })
        
    except User.DoesNotExist:
        return Response(
            {'error': 'Provider not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error approving verification: {str(e)}")
        return Response(
            {'error': 'Failed to approve verification'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_reject_verification(request, provider_id):
    """
    Reject provider verification with notes
    """
    try:
        # Check if user is admin or staff
        if not (request.user.is_staff or request.user.user_type in ['admin', 'support']):
            return Response(
                {'error': 'Access denied. Admin or support privileges required.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = User.objects.get(id=provider_id)
        if user.user_type != 'provider':
            return Response(
                {'error': 'User is not a provider'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        profile = user.provider_profile
        profile.verification_status = 'rejected'
        
        # Add admin notes
        admin_notes = request.data.get('admin_notes', 'Verification rejected')
        docs = profile.verification_documents or {}
        docs['admin_notes'] = admin_notes
        profile.verification_documents = docs
        
        profile.save(update_fields=['verification_status', 'verification_documents'])
        
        logger.info(f"Provider verification rejected for {profile.business_name} ({user.email})")
        
        return Response({
            'success': True,
            'message': 'Provider verification rejected',
            'verification_status': 'rejected'
        })
        
    except User.DoesNotExist:
        return Response(
            {'error': 'Provider not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error rejecting verification: {str(e)}")
        return Response(
            {'error': 'Failed to reject verification'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

"""
Admin views for managing premium listing requests
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
import logging

from backend.payments.models import DepositRequest, TransactionStatus
from backend.users.models import ProviderProfile

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_premium_requests(request):
    """
    Get all premium listing requests (pending deposits with premium notes)
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
        
        # Find premium requests (deposits with "premium listing request" in verification_notes)
        deposits = DepositRequest.objects.filter(
            verification_notes__icontains='premium listing request'
        ).select_related('account__user', 'account__user__provider_profile').order_by('-created_at')
        
        # Filter by status
        if status_filter == 'pending':
            deposits = deposits.filter(status=TransactionStatus.PENDING)
        elif status_filter == 'completed':
            deposits = deposits.filter(status=TransactionStatus.COMPLETED)
        elif status_filter == 'failed':
            deposits = deposits.filter(status=TransactionStatus.FAILED)
        # 'all' shows all statuses
        
        premium_requests = []
        for deposit in deposits:
            provider = deposit.account.user.provider_profile
            verification_notes = deposit.verification_notes or ''
            
            # Extract plan type from notes
            plan_type = 'monthly'
            if 'lifetime' in verification_notes.lower():
                plan_type = 'lifetime'
            elif 'monthly' in verification_notes.lower():
                plan_type = 'monthly'
            
            # Check payment verification status
            payment_verified = bool(deposit.bank_reference) or deposit.is_auto_verified
            payment_status = 'verified' if payment_verified else 'pending'
            
            premium_requests.append({
                'id': str(deposit.id),
                'deposit_id': str(deposit.id),
                'provider_id': deposit.account.user.id,
                'provider_email': deposit.account.user.email,
                'provider_name': deposit.account.user.get_full_name() or deposit.account.user.email,
                'business_name': provider.business_name,
                'amount': float(deposit.amount),
                'plan_type': plan_type,
                'status': deposit.status,
                'reference_number': deposit.reference_number,
                'bank_reference': deposit.bank_reference,
                'is_auto_verified': deposit.is_auto_verified,
                'payment_verified': payment_verified,
                'payment_status': payment_status,
                'verification_notes': verification_notes,
                'admin_notes': deposit.admin_notes,
                'created_at': deposit.created_at.isoformat(),
                'processed_at': deposit.processed_at.isoformat() if deposit.processed_at else None,
                'processed_by': deposit.processed_by.email if deposit.processed_by else None,
                'is_premium_active': provider.is_premium_listing_active,
                'premium_expires_at': provider.premium_listing_expires_at.isoformat() if provider.premium_listing_expires_at else None,
            })
        
        return Response({
            'success': True,
            'premium_requests': premium_requests,
            'count': len(premium_requests)
        })
        
    except Exception as e:
        logger.error(f"Error fetching premium requests: {str(e)}")
        return Response(
            {'error': 'Failed to fetch premium requests'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_approve_premium(request, deposit_id):
    """
    Approve a premium listing request and activate premium listing
    """
    try:
        # Check if user is admin or staff
        if not (request.user.is_staff or request.user.user_type in ['admin', 'support']):
            return Response(
                {'error': 'Access denied. Admin or support privileges required.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        deposit = DepositRequest.objects.get(id=deposit_id)
        
        if deposit.status != TransactionStatus.PENDING:
            return Response(
                {'error': f'Deposit is already {deposit.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # PAYMENT VERIFICATION CHECK - Only approve if payment was received
        payment_verified = bool(deposit.bank_reference) or deposit.is_auto_verified
        
        if not payment_verified:
            return Response(
                {
                    'error': 'Payment not verified',
                    'message': 'Cannot approve premium request. Payment has not been detected. Please verify payment was received before approving.',
                    'payment_status': {
                        'has_bank_reference': bool(deposit.bank_reference),
                        'is_auto_verified': deposit.is_auto_verified,
                        'reference_number': deposit.reference_number,
                        'payment_verified': False
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        provider = deposit.account.user.provider_profile
        verification_notes = deposit.verification_notes or ''
        
        # Extract plan type
        plan_type = 'monthly'
        if 'lifetime' in verification_notes.lower():
            plan_type = 'lifetime'
        elif 'monthly' in verification_notes.lower():
            plan_type = 'monthly'
        
        # Activate premium listing
        now = timezone.now()
        provider.is_premium_listing = True
        provider.premium_listing_started_at = now
        provider.premium_listing_payment_reference = deposit.reference_number or deposit.bank_reference or ''
        
        if plan_type == 'lifetime':
            provider.premium_listing_expires_at = None
        else:
            provider.premium_listing_expires_at = now + timedelta(days=30)
        
        provider.save(update_fields=[
            'is_premium_listing',
            'premium_listing_started_at',
            'premium_listing_expires_at',
            'premium_listing_payment_reference'
        ])
        
        # Approve deposit (premium requests don't add credits, so set credits_to_activate to 0)
        admin_notes = request.data.get('admin_notes', 'Premium listing approved and activated')
        
        # For premium requests, don't add credits - just mark deposit as completed
        from backend.payments.models import Transaction, TransactionType, TransactionStatus
        
        # Create transaction record for premium payment
        Transaction.objects.create(
            account=deposit.account,
            amount=deposit.amount,
            transaction_type=TransactionType.DEPOSIT,
            status=TransactionStatus.COMPLETED,
            description=f"Premium listing payment - {plan_type} plan - Ref: {deposit.reference_number}",
            reference=deposit.reference_number or deposit.bank_reference
        )
        
        # Update deposit request
        deposit.status = TransactionStatus.COMPLETED
        deposit.processed_at = now
        deposit.processed_by = request.user
        deposit.admin_notes = admin_notes
        deposit.save()
        
        logger.info(f"Premium listing approved for {provider.business_name} ({deposit.account.user.email})")
        
        return Response({
            'success': True,
            'message': f'Premium listing approved and activated ({plan_type} plan)',
            'premium_listing': {
                'is_active': True,
                'plan_type': plan_type,
                'expires_at': provider.premium_listing_expires_at.isoformat() if provider.premium_listing_expires_at else None
            }
        })
        
    except DepositRequest.DoesNotExist:
        return Response(
            {'error': 'Deposit request not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error approving premium request: {str(e)}")
        return Response(
            {'error': 'Failed to approve premium request'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_reject_premium(request, deposit_id):
    """
    Reject a premium listing request
    """
    try:
        # Check if user is admin or staff
        if not (request.user.is_staff or request.user.user_type in ['admin', 'support']):
            return Response(
                {'error': 'Access denied. Admin or support privileges required.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        deposit = DepositRequest.objects.get(id=deposit_id)
        
        if deposit.status != TransactionStatus.PENDING:
            return Response(
                {'error': f'Deposit is already {deposit.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Reject deposit
        admin_notes = request.data.get('admin_notes', 'Premium listing request rejected')
        deposit.reject(admin_user=request.user, notes=admin_notes)
        
        logger.info(f"Premium listing rejected for {deposit.account.user.email}")
        
        return Response({
            'success': True,
            'message': 'Premium listing request rejected'
        })
        
    except DepositRequest.DoesNotExist:
        return Response(
            {'error': 'Deposit request not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error rejecting premium request: {str(e)}")
        return Response(
            {'error': 'Failed to reject premium request'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

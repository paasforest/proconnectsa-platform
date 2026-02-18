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
            # IMPORTANT: If bank_reference equals reference_number, it was incorrectly set during creation
            # Real bank_reference should be different from reference_number (it comes from bank transaction)
            has_real_bank_reference = bool(deposit.bank_reference) and deposit.bank_reference != deposit.reference_number
            payment_verified = has_real_bank_reference or deposit.is_auto_verified
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
        # IMPORTANT: If bank_reference equals reference_number, it was incorrectly set during creation
        # Real bank_reference should be different from reference_number (it comes from bank transaction)
        has_real_bank_reference = bool(deposit.bank_reference) and deposit.bank_reference != deposit.reference_number
        payment_verified = has_real_bank_reference or deposit.is_auto_verified
        
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
        
        # Send activation email to provider
        try:
            from backend.utils.sendgrid_service import sendgrid_service
            
            expires_text = 'never expires' if plan_type == 'lifetime' else f"expires on {provider.premium_listing_expires_at.strftime('%B %d, %Y')}"
            
            email_subject = "🎉 Your Premium Listing is Now Active!"
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #10B981;">🎉 Premium Listing Activated!</h2>
                <p>Hello {deposit.account.user.get_full_name() or deposit.account.user.email},</p>
                <p><strong>Great news!</strong> Your premium listing has been approved and is now active.</p>
                
                <div style="background: #ECFDF5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
                    <h3 style="color: #065F46; margin-top: 0;">Premium Details</h3>
                    <p><strong>Plan:</strong> {plan_type.title()} Premium</p>
                    <p><strong>Status:</strong> <span style="color: #10B981; font-weight: bold;">ACTIVE</span></p>
                    <p><strong>Expires:</strong> {expires_text}</p>
                    <p><strong>Payment Reference:</strong> {deposit.reference_number}</p>
                </div>
                
                <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #92400E; margin-top: 0;">✨ What You Get Now:</h3>
                    <ul style="color: #78350F; padding-left: 20px;">
                        <li>⭐ <strong>Unlimited FREE leads</strong> (no credit deductions)</li>
                        <li>✓ Enhanced visibility in public directory</li>
                        <li>✓ Priority matching for new leads</li>
                        <li>✓ Featured placement in search results</li>
                        <li>✓ Premium badge on your profile</li>
                    </ul>
                </div>
                
                <p>You can now access unlimited leads without using credits. Start browsing available leads in your dashboard!</p>
                
                <p style="margin-top: 30px;">Best regards,<br>The ProConnectSA Team</p>
            </div>
            """
            text_content = f"""
🎉 Premium Listing Activated!

Hello {deposit.account.user.get_full_name() or deposit.account.user.email},

Great news! Your premium listing has been approved and is now active.

Premium Details:
- Plan: {plan_type.title()} Premium
- Status: ACTIVE
- Expires: {expires_text}
- Payment Reference: {deposit.reference_number}

What You Get Now:
⭐ Unlimited FREE leads (no credit deductions)
✓ Enhanced visibility in public directory
✓ Priority matching for new leads
✓ Featured placement in search results
✓ Premium badge on your profile

You can now access unlimited leads without using credits. Start browsing available leads in your dashboard!

Best regards,
The ProConnectSA Team
            """
            
            sendgrid_service.send_email(
                deposit.account.user.email,
                email_subject,
                html_content,
                text_content
            )
            logger.info(f"Premium activation email sent to {deposit.account.user.email}")
        except Exception as e:
            logger.warning(f"Failed to send premium activation email: {str(e)}")
        
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

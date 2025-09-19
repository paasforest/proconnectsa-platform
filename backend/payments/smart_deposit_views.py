"""
Smart Deposit API Views

API endpoints for handling deposits with edge case management
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .smart_deposit_handler import SmartDepositHandler
from .models import DepositRequest
from backend.users.models import ProviderProfile
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_smart_deposit(request):
    """
    Process deposit with intelligent edge case handling
    
    Body:
        - customer_code: str (required)
        - amount: float (required)
        - reference_number: str (optional)
        - bank_reference: str (optional)
    
    Returns:
        - success: bool
        - message: str
        - credits_activated: int
        - new_balance: int
        - requires_admin: bool
        - admin_alert_id: str (if requires_admin)
    """
    try:
        # Get parameters
        customer_code = request.data.get('customer_code')
        amount = request.data.get('amount')
        reference_number = request.data.get('reference_number')
        bank_reference = request.data.get('bank_reference')
        
        # Validate required fields
        if not customer_code or not amount:
            return Response({
                'success': False,
                'error': 'Missing required fields',
                'message': 'customer_code and amount are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate amount
        try:
            amount = float(amount)
        except (ValueError, TypeError):
            return Response({
                'success': False,
                'error': 'Invalid amount',
                'message': 'Amount must be a valid number'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Process deposit
        handler = SmartDepositHandler()
        result = handler.process_deposit(
            customer_code=customer_code,
            amount=amount,
            reference_number=reference_number,
            bank_reference=bank_reference
        )
        
        # Return appropriate response
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            if result.get('requires_admin'):
                return Response(result, status=status.HTTP_202_ACCEPTED)  # Accepted but requires review
            else:
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Error processing smart deposit: {str(e)}")
        return Response({
            'success': False,
            'error': 'System error',
            'message': 'Failed to process deposit'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def handle_admin_decision(request, alert_id):
    """
    Handle admin decision on flagged deposit
    
    Body:
        - decision: str ('approve', 'reject', 'manual_adjustment')
        - admin_notes: str (optional)
    
    Returns:
        - success: bool
        - message: str
        - result: dict (if approved)
    """
    try:
        # Only admins can handle decisions
        if not request.user.is_staff:
            return Response({
                'success': False,
                'error': 'Permission denied',
                'message': 'Only admin users can handle deposit decisions'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get parameters
        decision = request.data.get('decision')
        admin_notes = request.data.get('admin_notes', '')
        
        if decision not in ['approve', 'reject', 'manual_adjustment']:
            return Response({
                'success': False,
                'error': 'Invalid decision',
                'message': 'Decision must be approve, reject, or manual_adjustment'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Handle decision
        handler = SmartDepositHandler()
        result = handler.handle_admin_decision(
            alert_id=alert_id,
            decision=decision,
            admin_notes=admin_notes,
            admin_user=request.user
        )
        
        return Response(result, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error handling admin decision: {str(e)}")
        return Response({
            'success': False,
            'error': 'System error',
            'message': 'Failed to process admin decision'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_deposit_status(request, reference_number):
    """
    Get status of a deposit by reference number
    
    Returns:
        - success: bool
        - deposit_info: dict
        - status: str
        - credits_activated: int
    """
    try:
        # Find deposit by reference
        deposit = get_object_or_404(DepositRequest, reference_number=reference_number)
        
        # Check if user has access to this deposit
        if not request.user.is_staff and deposit.account.user != request.user:
            return Response({
                'success': False,
                'error': 'Access denied',
                'message': 'You can only view your own deposits'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get provider info
        provider = deposit.account.user.provider_profile
        
        return Response({
            'success': True,
            'deposit_info': {
                'reference_number': deposit.reference_number,
                'amount': float(deposit.amount),
                'credits_to_activate': deposit.credits_to_activate,
                'status': deposit.status,
                'created_at': deposit.created_at,
                'processed_at': deposit.processed_at,
                'bank_reference': deposit.bank_reference,
                'admin_notes': deposit.admin_notes
            },
            'provider_info': {
                'customer_code': provider.customer_code,
                'business_name': provider.business_name,
                'email': deposit.account.user.email
            },
            'current_balance': provider.credit_balance
        })
        
    except Exception as e:
        logger.error(f"Error getting deposit status: {str(e)}")
        return Response({
            'success': False,
            'error': 'System error',
            'message': 'Failed to get deposit status'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_deposits(request):
    """
    Get pending deposits for current provider
    
    Returns:
        - success: bool
        - pending_deposits: list
        - total_outstanding: float
    """
    try:
        if not request.user.is_provider:
            return Response({
                'success': False,
                'error': 'Access denied',
                'message': 'Only providers can view pending deposits'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get pending deposits
        pending_deposits = DepositRequest.objects.filter(
            account__user=request.user,
            status='pending'
        ).order_by('-created_at')
        
        deposits_data = []
        total_outstanding = 0
        
        for deposit in pending_deposits:
            deposits_data.append({
                'id': str(deposit.id),
                'reference_number': deposit.reference_number,
                'amount': float(deposit.amount),
                'credits_to_activate': deposit.credits_to_activate,
                'created_at': deposit.created_at,
                'admin_notes': deposit.admin_notes
            })
            total_outstanding += float(deposit.amount)
        
        return Response({
            'success': True,
            'pending_deposits': deposits_data,
            'total_outstanding': total_outstanding,
            'count': len(deposits_data)
        })
        
    except Exception as e:
        logger.error(f"Error getting pending deposits: {str(e)}")
        return Response({
            'success': False,
            'error': 'System error',
            'message': 'Failed to get pending deposits'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_deposit_request(request):
    """
    Create a new deposit request
    
    Body:
        - amount: float (required)
        - credits_to_activate: int (optional, calculated if not provided)
    
    Returns:
        - success: bool
        - deposit_request: dict
        - reference_number: str
        - payment_instructions: dict
    """
    try:
        if not request.user.is_provider:
            return Response({
                'success': False,
                'error': 'Access denied',
                'message': 'Only providers can create deposit requests'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get parameters
        amount = request.data.get('amount')
        credits_to_activate = request.data.get('credits_to_activate')
        
        if not amount:
            return Response({
                'success': False,
                'error': 'Missing amount',
                'message': 'Amount is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            amount = float(amount)
        except (ValueError, TypeError):
            return Response({
                'success': False,
                'error': 'Invalid amount',
                'message': 'Amount must be a valid number'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate amount
        if amount < 50:
            return Response({
                'success': False,
                'error': 'Amount too low',
                'message': 'Minimum deposit amount is R50'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get provider profile
        provider = request.user.provider_profile
        
        # Calculate credits if not provided
        if not credits_to_activate:
            handler = SmartDepositHandler()
            credits_to_activate = handler._calculate_credits_for_amount(amount, provider)
        
        # Generate reference number
        from .models import DepositRequest
        reference_number = f"PC{provider.customer_code[-3:]}{DepositRequest.objects.count() + 1:03d}"
        
        # Create deposit request
        deposit_request = DepositRequest.objects.create(
            account=request.user.payment_account,
            amount=amount,
            credits_to_activate=credits_to_activate,
            reference_number=reference_number,
            customer_code=provider.customer_code
        )
        
        # Generate payment instructions
        from .invoice_service import InvoiceService
        invoice_service = InvoiceService()
        payment_instructions = invoice_service._get_payment_instructions(deposit_request, provider)
        
        return Response({
            'success': True,
            'deposit_request': {
                'id': str(deposit_request.id),
                'reference_number': reference_number,
                'amount': float(amount),
                'credits_to_activate': credits_to_activate,
                'status': deposit_request.status,
                'created_at': deposit_request.created_at
            },
            'payment_instructions': payment_instructions
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error creating deposit request: {str(e)}")
        return Response({
            'success': False,
            'error': 'System error',
            'message': 'Failed to create deposit request'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


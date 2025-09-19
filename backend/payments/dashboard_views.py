"""
Provider Dashboard Payment Views

API views for provider dashboard payment functionality including:
- Credit balance display
- Deposit history
- Transaction history
- Lead purchase integration
- Subscription upgrade handling
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from backend.payments.payment_service import PaymentService
from backend.payments.models import DepositRequest, Transaction
from backend.payments.serializers import DepositRequestSerializer, TransactionSerializer
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_credit_balance(request):
    """Get current credit balance for provider"""
    if not hasattr(request.user, 'provider_profile'):
        return Response(
            {'error': 'Only providers can access credit balance'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    service = PaymentService()
    balance = service.get_credit_balance(request.user)
    
    # Get provider profile for additional info
    provider = request.user.provider_profile
    
    return Response({
        'credit_balance': balance,
        'subscription_tier': provider.subscription_tier,
        'is_subscription_active': provider.is_subscription_active,
        'monthly_lead_limit': provider.get_monthly_lead_limit(),
        'leads_used_this_month': provider.leads_used_this_month,
        'credit_rate': 50.0 if provider.is_subscription_active else 80.0,
        'effective_cost_per_lead': provider.get_effective_cost_per_lead()
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transaction_history(request):
    """Get transaction history for provider"""
    if not hasattr(request.user, 'provider_profile'):
        return Response(
            {'error': 'Only providers can access transaction history'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    service = PaymentService()
    limit = request.GET.get('limit', 50)
    
    try:
        limit = int(limit)
    except (ValueError, TypeError):
        limit = 50
    
    transactions = service.get_transaction_history(request.user, limit)
    
    return Response({
        'transactions': transactions,
        'total_count': len(transactions)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_deposit_history(request):
    """Get deposit history for provider"""
    if not hasattr(request.user, 'provider_profile'):
        return Response(
            {'error': 'Only providers can access deposit history'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    service = PaymentService()
    limit = request.GET.get('limit', 20)
    
    try:
        limit = int(limit)
    except (ValueError, TypeError):
        limit = 20
    
    deposits = service.get_deposit_history(request.user, limit)
    
    return Response({
        'deposits': deposits,
        'total_count': len(deposits)
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_deposit_request(request):
    """Create a new deposit request"""
    if not hasattr(request.user, 'provider_profile'):
        return Response(
            {'error': 'Only providers can create deposit requests'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    amount = request.data.get('amount')
    bank_reference = request.data.get('bank_reference', '')
    proof_of_payment = request.FILES.get('proof_of_payment')
    
    if not amount:
        return Response(
            {'error': 'Amount is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        service = PaymentService()
        result = service.create_deposit_request(
            user=request.user,
            amount=amount,
            bank_reference=bank_reference,
            proof_of_payment=proof_of_payment
        )
        
        # Generate and send invoice automatically
        try:
            from .invoice_service import InvoiceService
            invoice_service = InvoiceService()
            
            # Determine invoice type
            invoice_type = 'subscription_deposit' if request.user.provider_profile.is_subscription_active else 'manual_deposit'
            
            # Get the deposit object for invoice generation
            deposit_id = result.get('deposit_id')
            if deposit_id:
                deposit = DepositRequest.objects.get(id=deposit_id)
                invoice_result = invoice_service.generate_invoice(deposit, invoice_type)
            
                if invoice_result['success']:
                    # Send invoice email immediately
                    email_sent = invoice_service.send_invoice_email(
                        deposit=deposit,
                        invoice_data=invoice_result['invoice_data'],
                        html_content=invoice_result['html_content'],
                        text_content=invoice_result['text_content']
                    )
                    
                    if email_sent:
                        logger.info(f"Invoice {invoice_result['invoice_number']} sent immediately to {request.user.email}")
                        # Add invoice info to response
                        result['invoice_sent'] = True
                        result['invoice_number'] = invoice_result['invoice_number']
                    else:
                        logger.warning(f"Failed to send invoice email to {request.user.email}")
                        result['invoice_sent'] = False
                else:
                    logger.error(f"Failed to generate invoice for deposit {deposit.id}: {invoice_result['error']}")
                    result['invoice_sent'] = False
                
        except Exception as e:
            logger.error(f"Error generating/sending invoice: {str(e)}")
            # Don't fail the deposit creation if invoice generation fails
        
        return Response(result, status=status.HTTP_201_CREATED)
        
    except ValueError as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error creating deposit request: {str(e)}")
        return Response(
            {'error': 'Failed to create deposit request'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_deposit_by_customer_code(request):
    """
    Check if a deposit has been made using customer code
    This allows providers to check if their deposit has been processed by the ML system
    """
    try:
        customer_code = request.data.get('customer_code')
        amount = request.data.get('amount')
        
        if not customer_code or not amount:
            return Response(
                {'error': 'Customer code and amount are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use the auto deposit service to process the deposit
        from .auto_deposit_service import AutoDepositService
        auto_service = AutoDepositService()
        
        result = auto_service.process_deposit_by_customer_code(
            customer_code=customer_code,
            amount=float(amount)
        )
        
        if result['success']:
            return Response({
                **result,
                'message': f'✅ Deposit processed: {result.get("credits_activated", 0)} credits activated!'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                **result,
                'message': 'Deposit not found. It will be processed automatically within 5 minutes by our ML system.'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error checking deposit by customer code: {str(e)}")
        return Response(
            {'error': 'Failed to check deposit'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_deposit_instructions(request):
    """
    Get deposit instructions for the current provider
    """
    try:
        provider = request.user.provider_profile
        customer_code = provider.customer_code
        
        from .auto_deposit_service import AutoDepositService
        auto_service = AutoDepositService()
        
        result = auto_service.get_deposit_instructions(customer_code)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error getting deposit instructions: {str(e)}")
        return Response(
            {'error': 'Failed to get deposit instructions'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trigger_ml_auto_detection(request):
    """
    Manually trigger ML-powered automatic deposit detection
    This is for admin use when they want to process deposits immediately
    """
    try:
        # Check if user is admin
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin access required'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        from .auto_deposit_service import AutoDepositService
        auto_service = AutoDepositService()
        
        result = auto_service.auto_detect_and_process_deposits()
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error triggering ML auto-detection: {str(e)}")
        return Response(
            {'error': 'Failed to trigger ML auto-detection'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_auto_deposit_status(request):
    """
    Get the status of automatic deposit processing for the current provider
    """
    try:
        provider = request.user.provider_profile
        customer_code = provider.customer_code
        
        from .auto_deposit_service import AutoDepositService
        auto_service = AutoDepositService()
        
        result = auto_service.get_auto_deposit_status(customer_code)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error getting auto deposit status: {str(e)}")
        return Response(
            {'error': 'Failed to get auto deposit status'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchase_lead(request, lead_id):
    """Purchase a lead using credits"""
    if not hasattr(request.user, 'provider_profile'):
        return Response(
            {'error': 'Only providers can purchase leads'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from backend.leads.models import Lead, LeadAssignment
        
        # Get the lead
        lead = Lead.objects.get(id=lead_id)
        
        # Check if user already has an assignment for this lead
        assignment = LeadAssignment.objects.filter(
            lead=lead, 
            provider=request.user
        ).first()
        
        if not assignment:
            return Response(
                {'error': 'No assignment found for this lead'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if assignment.status == 'purchased':
            return Response(
                {'error': 'Lead already purchased'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Purchase the lead
        service = PaymentService()
        result = service.purchase_lead(
            user=request.user,
            lead=lead,
            assignment=assignment
        )
        
        return Response(result, status=status.HTTP_200_OK)
        
    except Lead.DoesNotExist:
        return Response(
            {'error': 'Lead not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except ValueError as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error purchasing lead: {str(e)}")
        return Response(
            {'error': 'Failed to purchase lead'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upgrade_subscription(request):
    """Upgrade subscription tier"""
    if not hasattr(request.user, 'provider_profile'):
        return Response(
            {'error': 'Only providers can upgrade subscriptions'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    new_tier = request.data.get('subscription_tier')
    
    if not new_tier:
        return Response(
            {'error': 'Subscription tier is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    valid_tiers = ['basic', 'standard', 'premium', 'enterprise']
    if new_tier not in valid_tiers:
        return Response(
            {'error': f'Invalid subscription tier. Valid options: {valid_tiers}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        service = PaymentService()
        result = service.process_subscription_upgrade(
            user=request.user,
            new_subscription_tier=new_tier
        )
        
        return Response(result, status=status.HTTP_200_OK)
        
    except ValueError as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error upgrading subscription: {str(e)}")
        return Response(
            {'error': 'Failed to upgrade subscription'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_credit_requirements(request):
    """Check if user meets credit requirements for specific actions"""
    if not hasattr(request.user, 'provider_profile'):
        return Response(
            {'error': 'Only providers can check credit requirements'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    action_type = request.GET.get('action_type', 'lead_purchase')
    
    try:
        service = PaymentService()
        can_proceed, message = service.enforce_credit_requirements(
            user=request.user,
            action_type=action_type
        )
        
        return Response({
            'can_proceed': can_proceed,
            'message': message,
            'action_type': action_type
        })
        
    except Exception as e:
        logger.error(f"Error checking credit requirements: {str(e)}")
        return Response(
            {'error': 'Failed to check credit requirements'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_payment_summary(request):
    """Get comprehensive payment summary for provider dashboard"""
    if not hasattr(request.user, 'provider_profile'):
        return Response(
            {'error': 'Only providers can access payment summary'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        service = PaymentService()
        provider = request.user.provider_profile
        
        # Get basic info
        credit_balance = service.get_credit_balance(request.user)
        
        # Get recent transactions
        recent_transactions = service.get_transaction_history(request.user, 10)
        
        # Get recent deposits
        recent_deposits = service.get_deposit_history(request.user, 5)
        
        # Get pending deposits
        account = service.get_or_create_payment_account(request.user)
        pending_deposits = DepositRequest.objects.filter(
            account=account,
            status='pending'
        ).count()
        
        return Response({
            'credit_balance': credit_balance,
            'subscription_tier': provider.subscription_tier,
            'is_subscription_active': provider.is_subscription_active,
            'credit_rate': 50.0 if provider.is_subscription_active else 80.0,
            'monthly_lead_limit': provider.get_monthly_lead_limit(),
            'leads_used_this_month': provider.leads_used_this_month,
            'effective_cost_per_lead': provider.get_effective_cost_per_lead(),
            'pending_deposits': pending_deposits,
            'recent_transactions': recent_transactions,
            'recent_deposits': recent_deposits,
            'customer_code': provider.customer_code
        })
        
    except Exception as e:
        logger.error(f"Error getting payment summary: {str(e)}")
        return Response(
            {'error': 'Failed to get payment summary'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

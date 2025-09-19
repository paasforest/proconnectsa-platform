"""
PayPal-specific views for payment processing
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
import json
import logging

from .paypal_service import PayPalService
from .models import CreditTransaction
from backend.users.models import User

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def paypal_webhook(request):
    """
    Handle PayPal webhook notifications
    """
    try:
        # Get raw request body
        request_body = request.body
        headers = request.headers
        
        # Initialize PayPal service
        paypal_service = PayPalService()
        
        # Verify webhook (in production, verify signature)
        if not paypal_service.verify_webhook(request_body, headers):
            logger.warning("Invalid PayPal webhook signature")
            return JsonResponse({"error": "Invalid webhook"}, status=400)
        
        # Parse webhook data
        webhook_data = json.loads(request_body)
        
        # Process webhook
        result = paypal_service.process_webhook(webhook_data)
        
        if result.get('success'):
            return JsonResponse({"status": "success"})
        else:
            logger.error(f"Webhook processing failed: {result.get('error')}")
            return JsonResponse({"error": "Processing failed"}, status=500)
            
    except Exception as e:
        logger.error(f"PayPal webhook error: {str(e)}")
        return JsonResponse({"error": "Internal server error"}, status=500)


@api_view(['POST'])
def create_paypal_payment(request):
    """
    Create a PayPal payment for credit purchase
    """
    try:
        # Get request data
        credits = request.data.get('credits')
        return_url = request.data.get('return_url')
        cancel_url = request.data.get('cancel_url')
        
        if not all([credits, return_url, cancel_url]):
            return Response({
                'error': 'Missing required fields: credits, return_url, cancel_url'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate credits
        try:
            credits = int(credits)
            if credits < 1 or credits > 1000:
                return Response({
                    'error': 'Credits must be between 1 and 1000'
                }, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({
                'error': 'Invalid credits value'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate amount (R5 per credit)
        amount = credits * 5.0
        
        # Initialize PayPal service
        paypal_service = PayPalService()
        
        # Create payment
        result = paypal_service.create_credit_payment(
            provider=request.user,
            amount=amount,
            credits=credits,
            return_url=return_url,
            cancel_url=cancel_url
        )
        
        if result.get('success'):
            return Response({
                'success': True,
                'payment_id': result.get('payment_id'),
                'approval_url': result.get('approval_url'),
                'amount': result.get('amount'),
                'credits': result.get('credits')
            })
        else:
            return Response({
                'error': result.get('error', 'Payment creation failed')
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error creating PayPal payment: {str(e)}")
        return Response({
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def execute_paypal_payment(request):
    """
    Execute a PayPal payment after user approval
    """
    try:
        # Get request data
        payment_id = request.data.get('payment_id')
        payer_id = request.data.get('payer_id')
        credits = request.data.get('credits')
        
        if not all([payment_id, payer_id, credits]):
            return Response({
                'error': 'Missing required fields: payment_id, payer_id, credits'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate credits
        try:
            credits = int(credits)
        except ValueError:
            return Response({
                'error': 'Invalid credits value'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Initialize PayPal service
        paypal_service = PayPalService()
        
        # Execute payment
        result = paypal_service.execute_payment(
            payment_id=payment_id,
            payer_id=payer_id,
            provider=request.user,
            credits=credits
        )
        
        if result.get('success'):
            return Response({
                'success': True,
                'transaction_id': result.get('transaction_id'),
                'credits_added': result.get('credits_added'),
                'new_balance': result.get('new_balance'),
                'message': 'Payment completed successfully'
            })
        else:
            return Response({
                'error': result.get('error', 'Payment execution failed')
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error executing PayPal payment: {str(e)}")
        return Response({
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def create_paypal_subscription_payment(request):
    """
    Create a PayPal payment for subscription
    """
    try:
        # Get request data
        subscription_tier = request.data.get('subscription_tier')
        months = request.data.get('months', 1)
        return_url = request.data.get('return_url')
        cancel_url = request.data.get('cancel_url')
        
        if not all([subscription_tier, return_url, cancel_url]):
            return Response({
                'error': 'Missing required fields: subscription_tier, return_url, cancel_url'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate subscription tier
        valid_tiers = ['basic', 'premium', 'enterprise']
        if subscription_tier not in valid_tiers:
            return Response({
                'error': f'Invalid subscription tier. Must be one of: {", ".join(valid_tiers)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate months
        try:
            months = int(months)
            if months < 1 or months > 24:
                return Response({
                    'error': 'Months must be between 1 and 24'
                }, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({
                'error': 'Invalid months value'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Initialize PayPal service
        paypal_service = PayPalService()
        
        # Create payment
        result = paypal_service.create_subscription_payment(
            provider=request.user,
            subscription_tier=subscription_tier,
            months=months,
            return_url=return_url,
            cancel_url=cancel_url
        )
        
        if result.get('success'):
            return Response({
                'success': True,
                'payment_id': result.get('payment_id'),
                'approval_url': result.get('approval_url'),
                'amount': result.get('amount'),
                'subscription_tier': result.get('subscription_tier'),
                'months': result.get('months')
            })
        else:
            return Response({
                'error': result.get('error', 'Payment creation failed')
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error creating PayPal subscription payment: {str(e)}")
        return Response({
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)









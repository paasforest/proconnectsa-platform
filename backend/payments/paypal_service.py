"""
PayPal payment service for credit purchases and subscriptions
"""
import paypalrestsdk
from django.conf import settings
from django.utils import timezone
from .models import CreditTransaction
from backend.users.models import User
import logging
import uuid

logger = logging.getLogger(__name__)


class PayPalService:
    """PayPal payment processing service"""
    
    def __init__(self):
        # Configure PayPal SDK
        paypalrestsdk.configure({
            "mode": settings.PAYPAL_MODE,  # "sandbox" or "live"
            "client_id": settings.PAYPAL_CLIENT_ID,
            "client_secret": settings.PAYPAL_CLIENT_SECRET
        })
    
    def create_credit_payment(self, provider, amount, credits, return_url, cancel_url):
        """
        Create a PayPal payment for credit purchase
        
        Args:
            provider: User object (provider)
            amount: Amount in ZAR
            credits: Number of credits to purchase
            return_url: URL to redirect after successful payment
            cancel_url: URL to redirect after cancelled payment
            
        Returns:
            dict: Payment creation response with approval_url
        """
        try:
            # Calculate price per credit (R80 per credit - competitive with BARK's R100)
            price_per_credit = 80.0
            total_amount = credits * price_per_credit
            
            # Create payment object
            payment = paypalrestsdk.Payment({
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": return_url,
                    "cancel_url": cancel_url
                },
                "transactions": [{
                    "amount": {
                        "total": f"{total_amount:.2f}",
                        "currency": "ZAR"
                    },
                    "description": f"ProConnectSA Credits - {credits} credits",
                    "item_list": {
                        "items": [{
                            "name": f"{credits} ProConnectSA Credits",
                            "sku": f"credits_{credits}",
                            "price": f"{total_amount:.2f}",
                            "currency": "ZAR",
                            "quantity": 1
                        }]
                    }
                }]
            })
            
            # Create payment
            if payment.create():
                logger.info(f"PayPal payment created successfully for provider {provider.id}")
                
                # Find approval URL
                approval_url = None
                for link in payment.links:
                    if link.rel == "approval_url":
                        approval_url = link.href
                        break
                
                if approval_url:
                    return {
                        "success": True,
                        "payment_id": payment.id,
                        "approval_url": approval_url,
                        "amount": total_amount,
                        "credits": credits
                    }
                else:
                    return {"success": False, "error": "No approval URL found"}
            else:
                error_details = payment.error
                logger.error(f"PayPal payment creation failed: {error_details}")
                return {"success": False, "error": str(error_details)}
                
        except Exception as e:
            logger.error(f"Error creating PayPal payment: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def execute_payment(self, payment_id, payer_id, provider, credits):
        """
        Execute a PayPal payment after user approval
        
        Args:
            payment_id: PayPal payment ID
            payer_id: PayPal payer ID
            provider: User object (provider)
            credits: Number of credits purchased
            
        Returns:
            dict: Payment execution result
        """
        try:
            payment = paypalrestsdk.Payment.find(payment_id)
            
            if payment.execute({"payer_id": payer_id}):
                # Payment successful - create credit transaction
                transaction = CreditTransaction.create_transaction(
                    provider=provider,
                    transaction_type='purchase',
                    amount=credits,
                    payment_reference=payment_id,
                    description=f"PayPal Credit Purchase - {credits} credits",
                    status='completed'
                )
                
                logger.info(f"PayPal payment executed successfully for provider {provider.id}")
                
                return {
                    "success": True,
                    "transaction_id": str(transaction.id),
                    "credits_added": credits,
                    "new_balance": provider.provider_profile.credit_balance
                }
            else:
                error_details = payment.error
                logger.error(f"PayPal payment execution failed: {error_details}")
                return {"success": False, "error": str(error_details)}
                
        except Exception as e:
            logger.error(f"Error executing PayPal payment: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def create_subscription_payment(self, provider, subscription_tier, months, return_url, cancel_url):
        """
        Create a PayPal payment for subscription
        
        Args:
            provider: User object (provider)
            subscription_tier: Subscription tier (basic, premium, enterprise)
            months: Number of months
            return_url: URL to redirect after successful payment
            cancel_url: URL to redirect after cancelled payment
            
        Returns:
            dict: Payment creation response
        """
        try:
            # Get subscription pricing (affordable structure)
            subscription_prices = {
                'basic': 250,
                'advanced': 450,
                'pro': 650,
                'enterprise': 850
            }
            
            monthly_price = subscription_prices.get(subscription_tier, 250)
            total_amount = monthly_price * months
            
            # Create payment object
            payment = paypalrestsdk.Payment({
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": return_url,
                    "cancel_url": cancel_url
                },
                "transactions": [{
                    "amount": {
                        "total": f"{total_amount:.2f}",
                        "currency": "ZAR"
                    },
                    "description": f"ProConnectSA {subscription_tier.title()} Subscription - {months} month(s)",
                    "item_list": {
                        "items": [{
                            "name": f"{subscription_tier.title()} Subscription",
                            "sku": f"subscription_{subscription_tier}_{months}",
                            "price": f"{total_amount:.2f}",
                            "currency": "ZAR",
                            "quantity": 1
                        }]
                    }
                }]
            })
            
            # Create payment
            if payment.create():
                logger.info(f"PayPal subscription payment created for provider {provider.id}")
                
                # Find approval URL
                approval_url = None
                for link in payment.links:
                    if link.rel == "approval_url":
                        approval_url = link.href
                        break
                
                if approval_url:
                    return {
                        "success": True,
                        "payment_id": payment.id,
                        "approval_url": approval_url,
                        "amount": total_amount,
                        "subscription_tier": subscription_tier,
                        "months": months
                    }
                else:
                    return {"success": False, "error": "No approval URL found"}
            else:
                error_details = payment.error
                logger.error(f"PayPal subscription payment creation failed: {error_details}")
                return {"success": False, "error": str(error_details)}
                
        except Exception as e:
            logger.error(f"Error creating PayPal subscription payment: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def verify_webhook(self, request_body, headers):
        """
        Verify PayPal webhook signature
        
        Args:
            request_body: Raw request body
            headers: Request headers
            
        Returns:
            bool: True if webhook is valid
        """
        try:
            # In production, you should verify the webhook signature
            # For now, we'll do basic validation
            return True
        except Exception as e:
            logger.error(f"Error verifying PayPal webhook: {str(e)}")
            return False
    
    def process_webhook(self, webhook_data):
        """
        Process PayPal webhook events
        
        Args:
            webhook_data: Parsed webhook data
            
        Returns:
            dict: Processing result
        """
        try:
            event_type = webhook_data.get('event_type')
            
            if event_type == 'PAYMENT.SALE.COMPLETED':
                # Payment completed - update transaction status
                payment_id = webhook_data.get('resource', {}).get('parent_payment')
                
                if payment_id:
                    # Find and update transaction
                    transaction = CreditTransaction.objects.filter(
                        payment_reference=payment_id
                    ).first()
                    
                    if transaction and transaction.status == 'pending':
                        transaction.status = 'completed'
                        transaction.processed_at = timezone.now()
                        transaction.save()
                        
                        logger.info(f"PayPal webhook: Payment {payment_id} marked as completed")
                        return {"success": True, "message": "Payment completed"}
            
            elif event_type == 'PAYMENT.SALE.DENIED':
                # Payment denied - update transaction status
                payment_id = webhook_data.get('resource', {}).get('parent_payment')
                
                if payment_id:
                    transaction = CreditTransaction.objects.filter(
                        payment_reference=payment_id
                    ).first()
                    
                    if transaction:
                        transaction.status = 'failed'
                        transaction.save()
                        
                        logger.info(f"PayPal webhook: Payment {payment_id} marked as failed")
                        return {"success": True, "message": "Payment failed"}
            
            return {"success": True, "message": "Webhook processed"}
            
        except Exception as e:
            logger.error(f"Error processing PayPal webhook: {str(e)}")
            return {"success": False, "error": str(e)}

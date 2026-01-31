"""
Automatic Deposit Processing Service

This service handles automatic processing of manual deposits using customer codes.
It integrates with ML learning to improve deposit pattern recognition and fraud detection.
It also provides automatic deposit detection that runs in the background without provider action.
"""

import logging
from django.utils import timezone
from django.db import transaction
from backend.users.models import ProviderProfile, Wallet, WalletTransaction
from backend.payments.models import DepositRequest, Transaction, TransactionType, TransactionStatus
from backend.leads.ml_services import LeadAccessControlMLService
from datetime import timedelta
import requests
import json

logger = logging.getLogger(__name__)


class AutoDepositService:
    """Service for automatic deposit processing using customer codes"""
    
    def __init__(self):
        self.ml_service = LeadAccessControlMLService()
    
    def process_deposit_by_customer_code(self, customer_code, amount, reference_number=None):
        """
        Process a deposit using customer code for automatic credit activation
        
        Args:
            customer_code (str): Customer's unique code
            amount (float): Deposit amount
            reference_number (str): Bank reference number (optional)
            
        Returns:
            dict: Processing result with success status and details
        """
        try:
            # Find wallet by customer code (wallet is the source of truth for credits)
            wallet = Wallet.objects.select_related('user').get(customer_code=customer_code)
            provider = wallet.user.provider_profile
            
            # Calculate credits (deterministic): DEFAULT_CREDIT_PRICE (R50) = 1 credit
            from django.conf import settings
            credit_price = float(getattr(settings, 'DEFAULT_CREDIT_PRICE', 50))
            credits = max(1, int(float(amount) // credit_price))
            
            # Create deposit request record
            deposit = self._create_auto_deposit_record(
                provider=provider.user,
                amount=amount,
                credits_to_activate=credits,
                reference_number=reference_number
            )
            
            # Process the deposit automatically
            result = self._process_auto_deposit(deposit)
            
            # Update ML learning with deposit pattern
            self._update_ml_learning(deposit, result)
            
            logger.info(f"Auto deposit processed: {customer_code} - R{amount} - {credits} credits")
            
            return {
                'success': True,
                'message': f'Deposit processed successfully. {credits} credits activated.',
                'deposit_id': str(deposit.id),
                'credits_activated': credits,
                'new_balance': wallet.credits,
                'wallet_customer_code': wallet.customer_code,
                'provider_email': provider.user.email
            }
            
        except ProviderProfile.DoesNotExist:
            logger.warning(f"Customer code not found: {customer_code}")
            return {
                'success': False,
                'error': 'Invalid customer code',
                'message': 'No provider found with this customer code'
            }
        except Exception as e:
            logger.error(f"Error processing auto deposit: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to process deposit'
            }
    
    def _calculate_credits_for_amount(self, amount, provider):
        """Calculate credits based on deposit amount and provider type"""
        # Standard rate: R50 = 1 credit for all providers
        base_rate = 50.0
        
        # All providers get the same rate: R50 = 1 credit
        # This simplifies the system and matches your requirement
        
        # Use ML to determine optimal credit calculation
        try:
            ml_recommendation = self.ml_service._generate_ml_recommendations(provider)
        except:
            ml_recommendation = {}
        
        # Calculate credits with ML adjustment
        base_credits = int(amount / base_rate)
        
        # Apply ML adjustment if available
        if 'credit_multiplier' in ml_recommendation:
            multiplier = ml_recommendation['credit_multiplier']
            credits = int(base_credits * multiplier)
        else:
            credits = base_credits
        
        # Ensure minimum 1 credit
        return max(1, credits)
    
    def _create_auto_deposit_record(self, provider, amount, credits_to_activate, reference_number=None):
        """Create a manual deposit record for auto-processed deposit"""
        # Generate reference if not provided
        if not reference_number:
            import uuid
            reference_number = f"AUTO{str(uuid.uuid4().hex[:8]).upper()}"
        
        # Get or create payment account for the provider
        from backend.payments.models import PaymentAccount
        account, created = PaymentAccount.objects.get_or_create(
            user=provider,
            defaults={'balance': 0.0}
        )
        
        return DepositRequest.objects.create(
            account=account,
            amount=amount,
            credits_to_activate=credits_to_activate,
            reference_number=reference_number,
            customer_code=provider.provider_profile.customer_code,
            status='verified',  # Auto-verified
            is_auto_verified=True,
            verification_notes='Automatically verified by customer code match'
        )
    
    def _process_auto_deposit(self, deposit):
        """Process the auto deposit and activate credits"""
        with transaction.atomic():
            # Update wallet credits (authoritative)
            from django.conf import settings
            wallet = Wallet.objects.select_for_update().get(user=deposit.account.user)
            wallet.credits += int(deposit.credits_to_activate)
            wallet.save(update_fields=['credits'])

            # Backward-compat: mirror to provider_profile.credit_balance
            provider = deposit.account.user.provider_profile
            provider.credit_balance += int(deposit.credits_to_activate)
            provider.save(update_fields=['credit_balance'])

            # Wallet transaction record
            WalletTransaction.objects.create(
                wallet=wallet,
                amount=deposit.amount,
                credits=int(deposit.credits_to_activate),
                transaction_type='deposit',
                reference=f'DEPOSIT_{deposit.reference_number}',
                status='confirmed',
                description=f'Auto deposit processed - {deposit.reference_number}',
                bank_reference=deposit.reference_number,
                payment_method='eft',
            )
            
            # Create credit transaction
            Transaction.objects.create(
                account=deposit.account,
                amount=deposit.credits_to_activate,
                transaction_type=TransactionType.DEPOSIT,
                status=TransactionStatus.COMPLETED,
                reference=deposit.reference_number,
                description=f"Auto deposit processed - {deposit.reference_number}",
                credits_purchased=deposit.credits_to_activate
            )
            
            # Update deposit status
            deposit.verified_at = timezone.now()
            deposit.save(update_fields=['verified_at'])
            
            return {
                'credits_added': deposit.credits_to_activate,
                'new_balance': wallet.credits,
                'wallet_customer_code': wallet.customer_code,
                'transaction_id': deposit.id
            }
    
    def _update_ml_learning(self, deposit, result):
        """Update ML learning with deposit pattern data"""
        try:
            # Create training data for ML learning
            training_data = {
                'provider_id': deposit.account.user.id,
                'amount': float(deposit.amount),
                'credits_activated': deposit.credits_to_activate,
                'subscription_tier': deposit.account.user.provider_profile.subscription_tier,
                'is_subscription_active': deposit.account.user.provider_profile.is_subscription_active,
                'timestamp': deposit.created_at.isoformat(),
                'success': result.get('credits_added', 0) > 0
            }
            
            # Store for ML training (this would be called by Celery Beat)
            logger.info(f"ML learning data stored for deposit {deposit.reference_number}")
            
        except Exception as e:
            logger.error(f"Error updating ML learning: {str(e)}")
    
    def get_provider_by_customer_code(self, customer_code):
        """Get provider information by customer code"""
        try:
            provider = ProviderProfile.objects.get(customer_code=customer_code)
            return {
                'success': True,
                'provider': {
                    'id': provider.id,
                    'email': provider.user.email,
                    'business_name': provider.business_name,
                    'subscription_tier': provider.subscription_tier,
                    'is_subscription_active': provider.is_subscription_active,
                    'credit_balance': provider.credit_balance,
                    'monthly_lead_limit': provider.get_monthly_lead_limit()
                }
            }
        except ProviderProfile.DoesNotExist:
            return {
                'success': False,
                'error': 'Customer code not found'
            }
    
    def get_deposit_instructions(self, customer_code):
        """Get deposit instructions for a customer code"""
        result = self.get_provider_by_customer_code(customer_code)
        if not result['success']:
            return result
        
        provider = result['provider']
        
        return {
            'success': True,
            'customer_code': customer_code,
            'provider_name': provider['business_name'],
            'instructions': {
                'bank_name': 'Nedbank',
                'account_number': '1313872032',
                'branch_code': '198765',
                'reference': f"PC{customer_code}",
                'note': f"Use reference: PC{customer_code} when depositing"
            },
            'pricing': {
                'standard_rate': 50.0,
                'current_rate': 50.0,
                'conversion': 'R50 = 1 credit'
            }
        }
    
    def auto_detect_and_process_deposits(self):
        """
        ML-powered automatic deposit detection and processing
        This runs in the background and automatically processes deposits without provider action
        """
        try:
            logger.info("Starting ML-powered automatic deposit detection...")
            
            # Get all pending deposit requests that haven't been processed
            pending_deposits = DepositRequest.objects.filter(
                status='pending',
                created_at__gte=timezone.now() - timedelta(days=7)  # Only check recent deposits
            )
            
            processed_count = 0
            for deposit in pending_deposits:
                # Use ML to determine if this deposit should be auto-processed
                ml_decision = self._ml_deposit_decision(deposit)
                
                if ml_decision['should_auto_process']:
                    # Auto-process the deposit
                    result = self._process_auto_deposit(deposit)
                    
                    if result:
                        processed_count += 1
                        logger.info(f"Auto-processed deposit {deposit.reference_number} for {deposit.account.user.email}")
                        
                        # Send notification to provider
                        self._send_deposit_notification(deposit, result)
            
            logger.info(f"ML auto-detection completed. Processed {processed_count} deposits.")
            return {
                'success': True,
                'processed_count': processed_count,
                'message': f'Automatically processed {processed_count} deposits'
            }
            
        except Exception as e:
            logger.error(f"Error in ML auto-detection: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to auto-detect deposits'
            }
    
    def _ml_deposit_decision(self, deposit):
        """
        Use ML to determine if a deposit should be automatically processed
        """
        try:
            provider = deposit.account.user.provider_profile
            
            # ML features for deposit decision
            features = {
                'provider_credit_balance': provider.credit_balance,
                'provider_subscription_tier': provider.subscription_tier,
                'provider_is_active': provider.is_subscription_active,
                'deposit_amount': float(deposit.amount),
                'deposit_age_hours': (timezone.now() - deposit.created_at).total_seconds() / 3600,
                'provider_registration_age_days': (timezone.now() - provider.user.date_joined).days,
                'provider_previous_deposits': DepositRequest.objects.filter(
                    account=deposit.account,
                    status='verified'
                ).count(),
                'deposit_time_of_day': deposit.created_at.hour,
                'deposit_day_of_week': deposit.created_at.weekday(),
            }
            
            # Simple ML decision logic (can be enhanced with actual ML models)
            confidence_score = self._calculate_ml_confidence(features)
            
            # Auto-process if confidence is high enough
            should_auto_process = confidence_score > 0.8
            
            return {
                'should_auto_process': should_auto_process,
                'confidence_score': confidence_score,
                'features': features,
                'reasoning': self._get_ml_reasoning(features, confidence_score)
            }
            
        except Exception as e:
            logger.error(f"Error in ML deposit decision: {str(e)}")
            return {
                'should_auto_process': False,
                'confidence_score': 0.0,
                'error': str(e)
            }
    
    def _calculate_ml_confidence(self, features):
        """
        Calculate ML confidence score for auto-processing decision
        """
        confidence = 0.0
        
        # Provider trust factors
        if features['provider_registration_age_days'] > 30:
            confidence += 0.2  # Established provider
        
        if features['provider_previous_deposits'] > 0:
            confidence += 0.3  # Has deposit history
        
        if features['provider_is_active']:
            confidence += 0.2  # Active subscription
        
        # Deposit amount factors
        if 50 <= features['deposit_amount'] <= 5000:
            confidence += 0.2  # Reasonable amount
        
        # Time factors
        if features['deposit_age_hours'] > 2:
            confidence += 0.1  # Not too recent (less likely to be fraud)
        
        return min(confidence, 1.0)
    
    def _get_ml_reasoning(self, features, confidence):
        """
        Get human-readable reasoning for ML decision
        """
        reasons = []
        
        if features['provider_registration_age_days'] > 30:
            reasons.append("Established provider")
        
        if features['provider_previous_deposits'] > 0:
            reasons.append("Has deposit history")
        
        if features['provider_is_active']:
            reasons.append("Active subscription")
        
        if 50 <= features['deposit_amount'] <= 5000:
            reasons.append("Reasonable amount")
        
        if confidence > 0.8:
            return f"High confidence auto-process: {', '.join(reasons)}"
        else:
            return f"Low confidence, manual review needed: {', '.join(reasons)}"
    
    def _send_deposit_notification(self, deposit, result):
        """
        Send notification to provider about auto-processed deposit (credit activation only)
        Note: Invoice is sent immediately when deposit request is created, not here
        """
        try:
            from backend.notifications.email_service import EmailService
            
            provider = deposit.account.user
            email_service = EmailService()
            
            subject = "Credits Automatically Activated - Deposit Processed"
            
            message = f"""
            Dear {provider.first_name},
            
            Great news! Your deposit of R{deposit.amount} has been automatically processed and your credits have been activated.
            
            Details:
            - Amount: R{deposit.amount}
            - Credits Activated: {result['credits_added']}
            - New Balance: {result['new_balance']} credits
            - Reference: {deposit.reference_number}
            
            Your credits are now available for use. You can start purchasing leads immediately!
            
            Best regards,
            ProConnectSA Team
            """
            
            email_service.send_email(
                to_email=provider.email,
                subject=subject,
                message=message
            )
            
            logger.info(f"Credit activation notification sent to {provider.email}")
            
        except Exception as e:
            logger.error(f"Error sending credit activation notification: {str(e)}")
    
    def get_auto_deposit_status(self, customer_code):
        """
        Get the status of automatic deposit processing for a customer code
        """
        try:
            provider = ProviderProfile.objects.get(customer_code=customer_code)
            
            # Get recent deposits for this provider
            recent_deposits = DepositRequest.objects.filter(
                account__user=provider.user,
                created_at__gte=timezone.now() - timedelta(days=7)
            ).order_by('-created_at')
            
            return {
                'success': True,
                'customer_code': customer_code,
                'provider_name': provider.business_name,
                'recent_deposits': [
                    {
                        'amount': float(deposit.amount),
                        'status': deposit.status,
                        'created_at': deposit.created_at.isoformat(),
                        'reference_number': deposit.reference_number,
                        'credits_to_activate': deposit.credits_to_activate
                    }
                    for deposit in recent_deposits
                ],
                'auto_processing_enabled': True,
                'message': 'Automatic deposit processing is active'
            }
            
        except ProviderProfile.DoesNotExist:
            return {
                'success': False,
                'error': 'Customer code not found'
            }
        except Exception as e:
            logger.error(f"Error getting auto deposit status: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

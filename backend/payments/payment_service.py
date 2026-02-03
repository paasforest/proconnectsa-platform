"""
Comprehensive Payment Service

This service handles all payment-related operations including:
- Credit balance management
- Lead purchase integration
- Deposit processing
- Subscription upgrades
- Credit enforcement across all packages
"""

import logging
from django.utils import timezone
from django.db import transaction
from django.contrib.auth import get_user_model
from backend.users.models import ProviderProfile
from backend.payments.models import PaymentAccount, Transaction, DepositRequest, TransactionType, TransactionStatus
from backend.leads.models import Lead, LeadAssignment

User = get_user_model()
logger = logging.getLogger(__name__)


class PaymentService:
    """Comprehensive payment service for all payment operations"""
    
    def __init__(self):
        self.credit_rates = {
            'standard': 50.0,  # R50 = 1 credit for all users
        }
    
    def get_or_create_payment_account(self, user):
        """Get or create payment account for user"""
        account, created = PaymentAccount.objects.get_or_create(user=user)
        if created:
            logger.info(f"Created payment account for {user.email}")
        return account
    
    def get_credit_balance(self, user):
        """Get current credit balance for user"""
        if not user.is_provider:
            return 0
        
        provider = user.provider_profile
        return provider.credit_balance
    
    def can_afford_lead(self, user, lead=None):
        """Check if user can afford to purchase a lead"""
        if not hasattr(user, 'provider_profile'):
            return False, "Only providers can purchase leads"
        
        # If lead is provided, calculate actual credit cost
        if lead:
            from backend.leads.ml_services import DynamicPricingMLService
            pricing_service = DynamicPricingMLService()
            pricing_result = pricing_service.calculate_dynamic_lead_price(lead, user)
            credit_cost = pricing_result['price']
            
            credit_balance = self.get_credit_balance(user)
            if credit_balance < credit_cost:
                return False, f"Insufficient credits. Need {credit_cost}, have {credit_balance}"
        else:
            # Generic check - just ensure they have some credits
            credit_balance = self.get_credit_balance(user)
            if credit_balance < 1:
                return False, "Insufficient credits. Please top up your account."
        
        return True, "Sufficient credits available"
    
    def purchase_lead(self, user, lead, assignment=None):
        """Purchase a lead using credits"""
        if not hasattr(user, 'provider_profile'):
            raise ValueError("Only providers can purchase leads")
        
        provider = user.provider_profile

        # Premium listing: FREE leads while active (no credit deductions)
        is_premium_active = False
        try:
            is_premium_active = bool(getattr(provider, "is_premium_listing_active"))
        except Exception:
            is_premium_active = False

        # Use simple fixed pricing for credits (1-3 credits max)
        credit_cost = 0 if is_premium_active else (assignment.credit_cost if assignment else 1)
        
        # Ensure reasonable pricing (1-3 credits = R50-R150) when not premium
        if not is_premium_active:
            credit_cost = max(1, min(credit_cost, 3))
        
        # Check if user can afford the lead
        if not is_premium_active and provider.credit_balance < credit_cost:
            raise ValueError(f"Insufficient credits. Need {credit_cost}, have {provider.credit_balance}")
        
        with transaction.atomic():
            previous_balance = provider.credit_balance

            if not is_premium_active:
                # Deduct credits from both provider profile and wallet
                provider.credit_balance -= credit_cost
                provider.save(update_fields=['credit_balance'])
                
                # Also update wallet credits for consistency
                from backend.users.models import Wallet
                wallet, _created = Wallet.objects.get_or_create(user=user)
                wallet.credits -= credit_cost
                wallet.save(update_fields=['credits'])
            
            # Create transaction record
            account = self.get_or_create_payment_account(user)
            Transaction.objects.create(
                account=account,
                amount=-credit_cost,  # Negative for deduction
                transaction_type=TransactionType.LEAD_PURCHASE,
                status=TransactionStatus.COMPLETED,
                description=(
                    f"Lead purchase (Premium - FREE) - {lead.title} (0 credits)"
                    if is_premium_active
                    else f"Lead purchase - {lead.title} ({credit_cost} credits)"
                ),
                reference=str(lead.id)
            )
            
            # Update assignment if provided
            if assignment:
                assignment.status = 'purchased'
                assignment.purchased_at = timezone.now()
                assignment.credit_cost = credit_cost
                assignment.save(update_fields=['status', 'purchased_at', 'credit_cost'])
            
            logger.info(f"Lead {lead.id} purchased by {user.email} for {credit_cost} credits")
            
            # Send WebSocket balance update
            from backend.notifications.consumers import NotificationConsumer
            NotificationConsumer.send_balance_update(
                user_id=user.id,
                new_balance=provider.credit_balance,
                previous_balance=previous_balance
            )
            
            return {
                'success': True,
                'credits_used': credit_cost,
                'remaining_credits': provider.credit_balance,
                'lead_id': str(lead.id)
            }
    
    def create_deposit_request(self, user, amount, bank_reference="", proof_of_payment=None):
        """Create a deposit request for manual processing"""
        if not hasattr(user, 'provider_profile'):
            raise ValueError("Only providers can create deposit requests")
        
        # Validate amount
        try:
            amount = float(amount)
            if amount < 50:  # Minimum deposit amount
                raise ValueError("Minimum deposit amount is R50")
        except (ValueError, TypeError):
            raise ValueError("Invalid amount format")
        
        with transaction.atomic():
            # Get or create payment account
            account = self.get_or_create_payment_account(user)
            
            # Get provider profile
            provider = user.provider_profile
            
            # Generate reference number if not provided
            if not bank_reference:
                import uuid
                bank_reference = f"PC{str(uuid.uuid4().hex[:8]).upper()}"
            
            # Calculate credits - R50 = 1 credit for all users
            rate = self.credit_rates['standard']
            credits = int(amount / rate)
            credits = max(1, credits)  # Ensure minimum 1 credit
            
            # Create deposit request
            deposit = DepositRequest.objects.create(
                account=account,
                amount=amount,
                bank_reference=bank_reference,
                proof_of_payment=proof_of_payment,
                customer_code=provider.customer_code,
                reference_number=bank_reference,
                credits_to_activate=credits
            )
            
            logger.info(f"Deposit request created for {user.email}: R{amount} for {credits} credits")
            
            return {
                'success': True,
                'deposit_id': str(deposit.id),
                'reference_number': bank_reference,
                'amount': amount,
                'credits_to_activate': credits,
                'customer_code': provider.customer_code
            }
    
    def process_subscription_upgrade(self, user, new_subscription_tier):
        """Process subscription upgrade and trigger deposit system"""
        if not hasattr(user, 'provider_profile'):
            raise ValueError("Only providers can upgrade subscriptions")
        
        provider = user.provider_profile
        
        # Calculate upgrade cost based on tier
        upgrade_costs = {
            'pay_as_you_go': 0,      # Free tier (default)
            'basic': 299,            # R299/month
            'advanced': 599,         # R599/month
            'pro': 999,              # R999/month
            'enterprise': 1000,      # R1,000/month
        }
        
        current_cost = upgrade_costs.get(provider.subscription_tier, 0)
        new_cost = upgrade_costs.get(new_subscription_tier, 0)
        
        if new_cost <= current_cost:
            # Downgrade or same tier - no payment required
            provider.subscription_tier = new_subscription_tier
            provider.save(update_fields=['subscription_tier'])
            
            return {
                'success': True,
                'message': f'Subscription updated to {new_subscription_tier}',
                'requires_payment': False
            }
        
        # Upgrade requires payment
        upgrade_amount = new_cost - current_cost
        
        # Create deposit request for upgrade
        deposit_result = self.create_deposit_request(
            user=user,
            amount=upgrade_amount,
            bank_reference=f"UPGRADE{new_subscription_tier.upper()}"
        )
        
        # Store pending upgrade in deposit request notes
        # Note: We'll handle this differently since pending_subscription_tier doesn't exist
        # For now, we'll just create the deposit request
        
        return {
            'success': True,
            'message': f'Upgrade to {new_subscription_tier} requires payment of R{upgrade_amount}',
            'requires_payment': True,
            'amount': upgrade_amount,
            'deposit_id': deposit_result['deposit_id'],
            'reference_number': deposit_result['reference_number']
        }
    
    def complete_subscription_upgrade(self, user, deposit_id):
        """Complete subscription upgrade after deposit is processed"""
        if not hasattr(user, 'provider_profile'):
            raise ValueError("Only providers can complete subscription upgrades")
        
        provider = user.provider_profile
        
        # Check if deposit is completed
        try:
            deposit = DepositRequest.objects.get(id=deposit_id, account__user=user)
            if deposit.status != TransactionStatus.COMPLETED:
                raise ValueError("Deposit not yet completed")
        except DepositRequest.DoesNotExist:
            raise ValueError("Deposit not found")
        
        # Complete the upgrade (for now, just upgrade to standard)
        provider.subscription_tier = 'standard'
        provider.save(update_fields=['subscription_tier'])
        
        logger.info(f"Subscription upgraded to {provider.subscription_tier} for {user.email}")
        
        return {
            'success': True,
            'message': f'Subscription upgraded to {provider.subscription_tier}',
            'new_tier': provider.subscription_tier
        }
    
    def get_transaction_history(self, user, limit=50):
        """Get transaction history for user"""
        if not hasattr(user, 'provider_profile'):
            return []
        
        account = self.get_or_create_payment_account(user)
        transactions = Transaction.objects.filter(account=account).order_by('-created_at')[:limit]
        
        return [
            {
                'id': str(t.id),
                'amount': float(t.amount),
                'type': t.transaction_type,
                'status': t.status,
                'description': t.description,
                'reference': t.reference,
                'created_at': t.created_at.isoformat()
            }
            for t in transactions
        ]
    
    def get_deposit_history(self, user, limit=20):
        """Get deposit history for user"""
        if not hasattr(user, 'provider_profile'):
            return []
        
        account = self.get_or_create_payment_account(user)
        deposits = DepositRequest.objects.filter(account=account).order_by('-created_at')[:limit]
        
        return [
            {
                'id': str(d.id),
                'amount': float(d.amount),
                'status': d.status,
                'bank_reference': d.bank_reference,
                'credits_to_activate': d.credits_to_activate,
                'created_at': d.created_at.isoformat(),
                'processed_at': d.processed_at.isoformat() if d.processed_at else None
            }
            for d in deposits
        ]
    
    def enforce_credit_requirements(self, user, action_type):
        """Enforce credit requirements for different actions"""
        if not hasattr(user, 'provider_profile'):
            return False, "Only providers can perform this action"
        
        provider = user.provider_profile
        credit_balance = provider.credit_balance
        
        # Define credit requirements for different actions
        requirements = {
            'lead_purchase': 1,
            'subscription_upgrade': 0,  # Handled separately
            'service_management': 0,    # Free
        }
        
        required_credits = requirements.get(action_type, 0)
        
        if credit_balance < required_credits:
            return False, f"Insufficient credits. Required: {required_credits}, Available: {credit_balance}"
        
        return True, "Requirements met"

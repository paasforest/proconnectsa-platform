"""
Smart Deposit Handler

Handles edge cases in deposit processing:
- Wrong amounts (over/under payment)
- Wrong reference numbers
- Partial payments
- Admin intervention scenarios
"""

import re
import logging
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from .models import DepositRequest, Transaction, TransactionType, TransactionStatus
from .auto_deposit_service import AutoDepositService
from backend.users.models import ProviderProfile
from backend.notifications.email_service import send_deposit_notification

logger = logging.getLogger(__name__)


class SmartDepositHandler:
    """Intelligent deposit processing with edge case handling"""
    
    def __init__(self):
        self.auto_deposit_service = AutoDepositService()
        
        # Configuration
        self.AMOUNT_TOLERANCE = 0.1  # 10% tolerance for amount matching
        self.MIN_DEPOSIT = 50.0
        self.MAX_DEPOSIT = 10000.0
        self.MAX_OVERPAYMENT = 0.2  # 20% max overpayment before admin review
        self.MAX_UNDERPAYMENT = 0.2  # 20% max underpayment before admin review
    
    def process_deposit(self, customer_code, amount, reference_number=None, bank_reference=None):
        """
        Process deposit with intelligent edge case handling
        
        Args:
            customer_code (str): Customer's unique code
            amount (float): Deposit amount
            reference_number (str): Our reference number (PC123456)
            bank_reference (str): Bank's reference number
            
        Returns:
            dict: Processing result with detailed information
        """
        try:
            # 1. Validate inputs
            validation_result = self._validate_inputs(customer_code, amount, reference_number)
            if not validation_result['valid']:
                return validation_result
            
            # 2. Find provider
            try:
                provider = ProviderProfile.objects.get(customer_code=customer_code)
            except ProviderProfile.DoesNotExist:
                return {
                    'success': False,
                    'error': 'Invalid customer code',
                    'message': 'No provider found with this customer code',
                    'requires_admin': False
                }
            
            # 3. Find matching deposit requests
            matching_requests = self._find_matching_requests(provider, amount, reference_number)
            
            # 4. Determine processing strategy
            strategy = self._determine_strategy(matching_requests, amount, reference_number)
            
            # 5. Process based on strategy
            return self._execute_strategy(strategy, provider, amount, reference_number, bank_reference)
            
        except Exception as e:
            logger.error(f"Error processing deposit: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'System error processing deposit',
                'requires_admin': True
            }
    
    def _validate_inputs(self, customer_code, amount, reference_number):
        """Validate input parameters"""
        
        # Validate amount
        if amount < self.MIN_DEPOSIT:
            return {
                'valid': False,
                'error': 'Amount too low',
                'message': f'Minimum deposit amount is R{self.MIN_DEPOSIT}',
                'requires_admin': False
            }
        
        if amount > self.MAX_DEPOSIT:
            return {
                'valid': False,
                'error': 'Amount too high',
                'message': f'Maximum deposit amount is R{self.MAX_DEPOSIT}',
                'requires_admin': True
            }
        
        # Validate reference format if provided
        if reference_number and not re.match(r'^PC\d{6}$', reference_number):
            return {
                'valid': False,
                'error': 'Invalid reference format',
                'message': 'Reference must be PC followed by 6 digits (e.g., PC123456)',
                'requires_admin': False
            }
        
        return {'valid': True}
    
    def _find_matching_requests(self, provider, amount, reference_number):
        """Find matching deposit requests"""
        
        # Get pending deposits for this provider
        pending_deposits = DepositRequest.objects.filter(
            account__user__provider_profile=provider,
            status=TransactionStatus.PENDING
        ).order_by('-created_at')
        
        matches = []
        
        # 1. Exact reference match
        if reference_number:
            exact_match = pending_deposits.filter(reference_number=reference_number).first()
            if exact_match:
                amount_diff = amount - float(exact_match.amount)
                matches.append({
                    'type': 'exact_reference',
                    'deposit_request': exact_match,
                    'amount_difference': amount_diff,
                    'confidence': 1.0,
                    'priority': 1
                })
        
        # 2. Amount-based matches (within tolerance)
        for deposit in pending_deposits:
            if deposit.reference_number == reference_number:
                continue  # Already handled above
            
            amount_diff_percent = abs(amount - float(deposit.amount)) / float(deposit.amount)
            if amount_diff_percent <= self.AMOUNT_TOLERANCE:
                matches.append({
                    'type': 'amount_match',
                    'deposit_request': deposit,
                    'amount_difference': amount - float(deposit.amount),
                    'confidence': 0.8,
                    'priority': 2
                })
        
        # Sort by priority and confidence
        matches.sort(key=lambda x: (x['priority'], -x['confidence']))
        
        return matches
    
    def _determine_strategy(self, matches, amount, reference_number):
        """Determine processing strategy based on matches"""
        
        if not matches:
            return {
                'type': 'new_deposit',
                'reason': 'No matching requests found',
                'confidence': 0.0
            }
        
        best_match = matches[0]
        amount_diff = best_match['amount_difference']
        amount_diff_percent = abs(amount_diff) / float(best_match['deposit_request'].amount)
        
        if best_match['type'] == 'exact_reference':
            if abs(amount_diff) < 1.0:  # Within R1
                return {
                    'type': 'exact_match',
                    'deposit_request': best_match['deposit_request'],
                    'reason': 'Exact reference and amount match',
                    'confidence': 1.0
                }
            elif amount_diff > 0:  # Overpaid
                if amount_diff_percent <= self.MAX_OVERPAYMENT:
                    return {
                        'type': 'overpayment',
                        'deposit_request': best_match['deposit_request'],
                        'overpayment_amount': amount_diff,
                        'reason': f'Overpaid by R{amount_diff:.2f}',
                        'confidence': 0.9
                    }
                else:
                    return {
                        'type': 'admin_review_overpayment',
                        'deposit_request': best_match['deposit_request'],
                        'overpayment_amount': amount_diff,
                        'reason': f'Large overpayment: R{amount_diff:.2f}',
                        'confidence': 0.7
                    }
            else:  # Underpaid
                if amount_diff_percent <= self.MAX_UNDERPAYMENT:
                    return {
                        'type': 'underpayment',
                        'deposit_request': best_match['deposit_request'],
                        'underpayment_amount': abs(amount_diff),
                        'reason': f'Underpaid by R{abs(amount_diff):.2f}',
                        'confidence': 0.8
                    }
                else:
                    return {
                        'type': 'admin_review_underpayment',
                        'deposit_request': best_match['deposit_request'],
                        'underpayment_amount': abs(amount_diff),
                        'reason': f'Large underpayment: R{abs(amount_diff):.2f}',
                        'confidence': 0.6
                    }
        
        else:  # Amount match only
            return {
                'type': 'amount_match',
                'deposit_request': best_match['deposit_request'],
                'amount_difference': amount_diff,
                'reason': 'Amount matches within tolerance',
                'confidence': 0.8
            }
    
    def _execute_strategy(self, strategy, provider, amount, reference_number, bank_reference):
        """Execute the determined processing strategy"""
        
        strategy_type = strategy['type']
        
        if strategy_type == 'exact_match':
            return self._process_exact_match(strategy['deposit_request'], amount, bank_reference)
        
        elif strategy_type == 'overpayment':
            return self._process_overpayment(strategy, amount, bank_reference)
        
        elif strategy_type == 'underpayment':
            return self._process_underpayment(strategy, amount, bank_reference)
        
        elif strategy_type == 'amount_match':
            return self._process_amount_match(strategy, amount, bank_reference)
        
        elif strategy_type in ['admin_review_overpayment', 'admin_review_underpayment']:
            return self._flag_for_admin_review(strategy, provider, amount, reference_number, bank_reference)
        
        else:  # new_deposit
            return self._process_new_deposit(provider, amount, reference_number, bank_reference)
    
    def _process_exact_match(self, deposit_request, amount, bank_reference):
        """Process exact match scenario"""
        
        with transaction.atomic():
            # Activate credits
            provider = deposit_request.account.user.provider_profile
            provider.credit_balance += deposit_request.credits_to_activate
            provider.save(update_fields=['credit_balance'])
            
            # Create transaction
            Transaction.objects.create(
                account=deposit_request.account,
                amount=deposit_request.credits_to_activate,
                transaction_type=TransactionType.CREDIT_PURCHASE,
                status=TransactionStatus.COMPLETED,
                reference=bank_reference or deposit_request.reference_number,
                description=f"Deposit processed - {deposit_request.reference_number}",
                balance_after=provider.credit_balance
            )
            
            # Update deposit request
            deposit_request.status = TransactionStatus.COMPLETED
            deposit_request.processed_at = timezone.now()
            deposit_request.bank_reference = bank_reference
            deposit_request.save()
            
            # Send notification
            send_deposit_notification(
                provider.user.email,
                deposit_request.reference_number,
                deposit_request.credits_to_activate,
                provider.credit_balance
            )
            
            return {
                'success': True,
                'message': f'Deposit processed successfully. {deposit_request.credits_to_activate} credits activated.',
                'credits_activated': deposit_request.credits_to_activate,
                'new_balance': provider.credit_balance,
                'requires_admin': False
            }
    
    def _process_overpayment(self, strategy, amount, bank_reference):
        """Process overpayment scenario"""
        
        deposit_request = strategy['deposit_request']
        overpayment = strategy['overpayment_amount']
        
        with transaction.atomic():
            # Calculate extra credits for overpayment
            extra_credits = self._calculate_credits_for_amount(overpayment, deposit_request.account.user.provider_profile)
            
            # Activate original credits
            provider = deposit_request.account.user.provider_profile
            provider.credit_balance += deposit_request.credits_to_activate
            provider.save(update_fields=['credit_balance'])
            
            # Activate extra credits
            provider.credit_balance += extra_credits
            provider.save(update_fields=['credit_balance'])
            
            # Create transaction for original amount
            Transaction.objects.create(
                account=deposit_request.account,
                amount=deposit_request.credits_to_activate,
                transaction_type=TransactionType.CREDIT_PURCHASE,
                status=TransactionStatus.COMPLETED,
                reference=bank_reference or deposit_request.reference_number,
                description=f"Deposit processed - {deposit_request.reference_number}",
                balance_after=provider.credit_balance
            )
            
            # Create transaction for overpayment
            Transaction.objects.create(
                account=deposit_request.account,
                amount=extra_credits,
                transaction_type=TransactionType.CREDIT_PURCHASE,
                status=TransactionStatus.COMPLETED,
                reference=bank_reference or deposit_request.reference_number,
                description=f"Overpayment converted to credits - {deposit_request.reference_number}",
                balance_after=provider.credit_balance
            )
            
            # Update deposit request
            deposit_request.status = TransactionStatus.COMPLETED
            deposit_request.processed_at = timezone.now()
            deposit_request.bank_reference = bank_reference
            deposit_request.save()
            
            total_credits = deposit_request.credits_to_activate + extra_credits
            
            return {
                'success': True,
                'message': f'Deposit processed with overpayment. {total_credits} credits activated '
                          f'({deposit_request.credits_to_activate} original + {extra_credits} from overpayment).',
                'credits_activated': total_credits,
                'new_balance': provider.credit_balance,
                'overpayment_credits': extra_credits,
                'requires_admin': False
            }
    
    def _process_underpayment(self, strategy, amount, bank_reference):
        """Process underpayment scenario"""
        
        deposit_request = strategy['deposit_request']
        underpayment = strategy['underpayment_amount']
        
        with transaction.atomic():
            # Calculate credits for actual amount
            actual_credits = self._calculate_credits_for_amount(amount, deposit_request.account.user.provider_profile)
            
            # Activate credits for actual amount
            provider = deposit_request.account.user.provider_profile
            provider.credit_balance += actual_credits
            provider.save(update_fields=['credit_balance'])
            
            # Create transaction
            Transaction.objects.create(
                account=deposit_request.account,
                amount=actual_credits,
                transaction_type=TransactionType.CREDIT_PURCHASE,
                status=TransactionStatus.COMPLETED,
                reference=bank_reference or deposit_request.reference_number,
                description=f"Partial deposit processed - {deposit_request.reference_number}",
                balance_after=provider.credit_balance
            )
            
            # Update deposit request to partial status
            deposit_request.status = TransactionStatus.PENDING  # Keep as pending for remainder
            deposit_request.amount = Decimal(str(amount))  # Update to actual amount
            deposit_request.credits_to_activate = actual_credits
            deposit_request.bank_reference = bank_reference
            deposit_request.admin_notes = f"Partial payment. R{underpayment:.2f} still outstanding."
            deposit_request.save()
            
            return {
                'success': True,
                'message': f'Partial payment processed. {actual_credits} credits activated. '
                          f'R{underpayment:.2f} still outstanding.',
                'credits_activated': actual_credits,
                'new_balance': provider.credit_balance,
                'outstanding_amount': underpayment,
                'requires_top_up': True,
                'requires_admin': False
            }
    
    def _process_amount_match(self, strategy, amount, bank_reference):
        """Process amount match scenario"""
        
        deposit_request = strategy['deposit_request']
        
        with transaction.atomic():
            # Update deposit request with actual amount
            deposit_request.amount = Decimal(str(amount))
            deposit_request.credits_to_activate = self._calculate_credits_for_amount(amount, deposit_request.account.user.provider_profile)
            deposit_request.bank_reference = bank_reference
            deposit_request.save()
            
            # Process as normal
            return self._process_exact_match(deposit_request, amount, bank_reference)
    
    def _process_new_deposit(self, provider, amount, reference_number, bank_reference):
        """Process new deposit (no matching request)"""
        
        # Use existing auto-deposit service
        return self.auto_deposit_service.process_deposit_by_customer_code(
            customer_code=provider.customer_code,
            amount=amount,
            reference_number=reference_number
        )
    
    def _flag_for_admin_review(self, strategy, provider, amount, reference_number, bank_reference):
        """Flag deposit for admin review"""
        
        # Create admin alert
        from backend.admin.models import AdminAlert
        
        alert = AdminAlert.objects.create(
            alert_type='deposit_review',
            priority='medium',
            title=f'Deposit Review Required: {strategy["reason"]}',
            description=f'Customer: {provider.customer_code}\n'
                       f'Amount: R{amount}\n'
                       f'Reference: {reference_number}\n'
                       f'Bank Reference: {bank_reference}\n'
                       f'Reason: {strategy["reason"]}',
            deposit_data={
                'customer_code': provider.customer_code,
                'amount': amount,
                'reference_number': reference_number,
                'bank_reference': bank_reference,
                'strategy': strategy
            },
            requires_action=True
        )
        
        return {
            'success': False,
            'message': 'Deposit flagged for admin review due to unusual amount or reference.',
            'admin_alert_id': alert.id,
            'requires_admin': True,
            'reason': strategy['reason']
        }
    
    def _calculate_credits_for_amount(self, amount, provider):
        """Calculate credits for given amount"""
        
        # New pricing: R50 per credit for all users
        rate_per_credit = 50.0
        
        credits = int(float(amount) / rate_per_credit)
        return max(1, credits)
    
    def handle_admin_decision(self, alert_id, decision, admin_notes, admin_user):
        """Handle admin decision on flagged deposit"""
        
        try:
            from backend.admin.models import AdminAlert
            alert = AdminAlert.objects.get(id=alert_id)
            deposit_data = alert.deposit_data
            
            if decision == 'approve':
                # Process deposit as normal
                result = self.process_deposit(
                    customer_code=deposit_data['customer_code'],
                    amount=deposit_data['amount'],
                    reference_number=deposit_data['reference_number'],
                    bank_reference=deposit_data['bank_reference']
                )
                
                # Mark alert as resolved
                alert.status = 'resolved'
                alert.resolved_by = admin_user
                alert.resolution_notes = admin_notes
                alert.save()
                
                return result
            
            elif decision == 'reject':
                # Reject deposit
                alert.status = 'rejected'
                alert.resolved_by = admin_user
                alert.resolution_notes = admin_notes
                alert.save()
                
                return {
                    'success': False,
                    'message': 'Deposit rejected by admin',
                    'reason': admin_notes
                }
            
            elif decision == 'manual_adjustment':
                # Allow admin to manually adjust
                # This would require additional implementation
                return {
                    'success': False,
                    'message': 'Manual adjustment not yet implemented',
                    'requires_development': True
                }
            
        except Exception as e:
            logger.error(f"Error handling admin decision: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Error processing admin decision'
            }

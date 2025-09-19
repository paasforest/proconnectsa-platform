from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()

class PaymentMethod(models.TextChoices):
    MANUAL_DEPOSIT = 'manual_deposit', 'Manual Bank Deposit'
    PAYFAST = 'payfast', 'PayFast'
    CREDIT_CARD = 'credit_card', 'Credit Card'

class TransactionType(models.TextChoices):
    DEPOSIT = 'deposit', 'Deposit'
    LEAD_PURCHASE = 'lead_purchase', 'Lead Purchase'
    SUBSCRIPTION = 'subscription', 'Subscription'
    REFUND = 'refund', 'Refund'

class TransactionStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    COMPLETED = 'completed', 'Completed'
    FAILED = 'failed', 'Failed'
    CANCELLED = 'cancelled', 'Cancelled'

class PaymentAccount(models.Model):
    """Provider's payment account with balance tracking"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='payment_account')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payment_accounts'
    
    def __str__(self):
        return f"{self.user.email} - R{self.balance}"
    
    def can_afford(self, amount):
        """Check if account has sufficient balance"""
        return self.balance >= amount
    
    def deduct(self, amount, description="Payment"):
        """Deduct amount from balance and create transaction record"""
        if not self.can_afford(amount):
            raise ValueError("Insufficient balance")
        
        self.balance -= amount
        self.save()
        
        # Create transaction record
        Transaction.objects.create(
            account=self,
            amount=-amount,  # Negative for deduction
            transaction_type=TransactionType.LEAD_PURCHASE,
            status=TransactionStatus.COMPLETED,
            description=description
        )
        
        return True
    
    def credit(self, amount, description="Deposit"):
        """Credit amount to balance and create transaction record"""
        self.balance += amount
        self.save()
        
        # Create transaction record
        Transaction.objects.create(
            account=self,
            amount=amount,  # Positive for credit
            transaction_type=TransactionType.DEPOSIT,
            status=TransactionStatus.COMPLETED,
            description=description
        )
        
        return True

class Transaction(models.Model):
    """Individual transaction record"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    account = models.ForeignKey(PaymentAccount, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TransactionType.choices)
    status = models.CharField(max_length=20, choices=TransactionStatus.choices, default=TransactionStatus.PENDING)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.MANUAL_DEPOSIT)
    description = models.TextField(blank=True)
    reference = models.CharField(max_length=100, blank=True)  # Bank reference or payment ID
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # ML Enhancement fields
    lead_id = models.CharField(max_length=100, blank=True, null=True)  # Associated lead
    credits_purchased = models.IntegerField(default=0)  # Credits purchased in this transaction
    credits_spent = models.IntegerField(default=0)  # Credits spent in this transaction
    pricing_method = models.CharField(max_length=50, default='rule_based', 
                                    choices=[('rule_based', 'Rule Based'), ('ml', 'ML Based'), ('hybrid', 'Hybrid')])
    
    # Outcome tracking for ML training
    job_quoted = models.BooleanField(default=False)
    job_won = models.BooleanField(default=False)
    job_completed = models.BooleanField(default=False)
    job_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    outcome_recorded_at = models.DateTimeField(null=True, blank=True)
    
    # ML prediction tracking
    predicted_conversion_probability = models.FloatField(null=True, blank=True)
    predicted_job_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    ml_confidence_score = models.FloatField(null=True, blank=True)
    
    class Meta:
        db_table = 'transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['lead_id']),
            models.Index(fields=['pricing_method']),
            models.Index(fields=['job_completed']),
        ]
    
    def __str__(self):
        return f"{self.account.user.email} - {self.transaction_type} - R{self.amount}"

class DepositRequest(models.Model):
    """Manual deposit requests from providers"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    account = models.ForeignKey(PaymentAccount, on_delete=models.CASCADE, related_name='deposit_requests')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=TransactionStatus.choices, default=TransactionStatus.PENDING)
    bank_reference = models.CharField(max_length=100, blank=True)  # Bank transfer reference
    proof_of_payment = models.FileField(upload_to='payment_proofs/', blank=True, null=True)
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_deposits')
    
    # Enhanced fields for automated processing
    customer_code = models.CharField(max_length=10, blank=True)  # Provider's customer code
    reference_number = models.CharField(max_length=100, blank=True)  # PC{reference} format
    credits_to_activate = models.IntegerField(default=0)  # Credits to be activated
    is_auto_verified = models.BooleanField(default=False)  # Auto-verified by system
    verification_notes = models.TextField(blank=True)  # System verification notes
    
    class Meta:
        db_table = 'deposit_requests'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.account.user.email} - R{self.amount} - {self.status}"
    
    def calculate_credits(self):
        """Calculate credits based on amount and provider type"""
        provider = self.account.user.provider_profile
        
        # New pricing: R50 per credit for all users
        rate_per_credit = 50.0  # Updated rate for all users
        
        # Calculate credits
        credits = int(float(self.amount) / rate_per_credit)
        return max(1, credits)  # Ensure minimum 1 credit
    
    def approve(self, admin_user, notes=""):
        """Approve and process the deposit"""
        if self.status != TransactionStatus.PENDING:
            raise ValueError("Only pending deposits can be approved")
        
        # Calculate credits if not already set
        if not self.credits_to_activate:
            self.credits_to_activate = self.calculate_credits()
        
        # Credit the account with credits
        provider = self.account.user.provider_profile
        provider.credit_balance += self.credits_to_activate
        provider.save(update_fields=['credit_balance'])
        
        # Create transaction record
        Transaction.objects.create(
            account=self.account,
            amount=self.amount,
            transaction_type=TransactionType.DEPOSIT,
            status=TransactionStatus.COMPLETED,
            description=f"Manual deposit - {self.credits_to_activate} credits - Ref: {self.bank_reference}",
            reference=self.bank_reference
        )
        
        # Update deposit request
        self.status = TransactionStatus.COMPLETED
        self.processed_at = timezone.now()
        self.processed_by = admin_user
        self.admin_notes = notes
        self.save()
        
        return True
    
    def reject(self, admin_user, notes=""):
        """Reject the deposit request"""
        if self.status != TransactionStatus.PENDING:
            raise ValueError("Only pending deposits can be rejected")
        
        self.status = TransactionStatus.FAILED
        self.processed_at = timezone.now()
        self.processed_by = admin_user
        self.admin_notes = notes
        self.save()
        
        return True

class BankAccount(models.Model):
    """Bank account details for manual deposits"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bank_name = models.CharField(max_length=100)
    account_holder = models.CharField(max_length=200)
    account_number = models.CharField(max_length=20)
    branch_code = models.CharField(max_length=10)
    account_type = models.CharField(max_length=20, default='Business')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'bank_accounts'
    
    def __str__(self):
        return f"{self.bank_name} - {self.account_number}"
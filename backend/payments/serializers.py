"""
Payment Serializers

Serializers for payment-related models and API responses
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import PaymentAccount, Transaction, DepositRequest, BankAccount
from backend.users.models import ProviderProfile

User = get_user_model()


class PaymentAccountSerializer(serializers.ModelSerializer):
    """Serializer for PaymentAccount model"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = PaymentAccount
        fields = ['id', 'user_email', 'balance', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model"""
    user_email = serializers.CharField(source='account.user.email', read_only=True)
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'user_email', 'amount', 'transaction_type', 'transaction_type_display',
            'status', 'status_display', 'payment_method', 'payment_method_display',
            'description', 'reference', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DepositRequestSerializer(serializers.ModelSerializer):
    """Serializer for DepositRequest model"""
    user_email = serializers.CharField(source='account.user.email', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    processed_by_email = serializers.CharField(source='processed_by.email', read_only=True)
    
    class Meta:
        model = DepositRequest
        fields = [
            'id', 'user_email', 'amount', 'status', 'status_display',
            'bank_reference', 'proof_of_payment', 'admin_notes',
            'customer_code', 'reference_number', 'credits_to_activate',
            'is_auto_verified', 'verification_notes',
            'created_at', 'updated_at', 'processed_at', 'processed_by_email'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'processed_at', 'processed_by_email'
        ]


class BankAccountSerializer(serializers.ModelSerializer):
    """Serializer for BankAccount model"""
    
    class Meta:
        model = BankAccount
        fields = [
            'id', 'bank_name', 'account_holder', 'account_number',
            'branch_code', 'account_type', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CreditBalanceSerializer(serializers.Serializer):
    """Serializer for credit balance response"""
    credit_balance = serializers.IntegerField()
    subscription_tier = serializers.CharField()
    is_subscription_active = serializers.BooleanField()
    monthly_lead_limit = serializers.IntegerField()
    leads_used_this_month = serializers.IntegerField()
    credit_rate = serializers.FloatField()
    customer_code = serializers.CharField()


class TransactionHistorySerializer(serializers.Serializer):
    """Serializer for transaction history response"""
    transactions = TransactionSerializer(many=True)
    total_count = serializers.IntegerField()


class DepositHistorySerializer(serializers.Serializer):
    """Serializer for deposit history response"""
    deposits = DepositRequestSerializer(many=True)
    total_count = serializers.IntegerField()


class PaymentSummarySerializer(serializers.Serializer):
    """Serializer for payment summary response"""
    credit_balance = serializers.IntegerField()
    subscription_tier = serializers.CharField()
    is_subscription_active = serializers.BooleanField()
    credit_rate = serializers.FloatField()
    monthly_lead_limit = serializers.IntegerField()
    leads_used_this_month = serializers.IntegerField()
    pending_deposits = serializers.IntegerField()
    recent_transactions = TransactionSerializer(many=True)
    recent_deposits = DepositRequestSerializer(many=True)
    customer_code = serializers.CharField()


class LeadPurchaseSerializer(serializers.Serializer):
    """Serializer for lead purchase response"""
    success = serializers.BooleanField()
    credits_used = serializers.IntegerField()
    remaining_credits = serializers.IntegerField()
    lead_id = serializers.CharField()


class SubscriptionUpgradeSerializer(serializers.Serializer):
    """Serializer for subscription upgrade response"""
    success = serializers.BooleanField()
    message = serializers.CharField()
    requires_payment = serializers.BooleanField()
    amount = serializers.FloatField(required=False)
    deposit_id = serializers.CharField(required=False)
    reference_number = serializers.CharField(required=False)


class CreditRequirementsSerializer(serializers.Serializer):
    """Serializer for credit requirements check response"""
    can_proceed = serializers.BooleanField()
    message = serializers.CharField()
    action_type = serializers.CharField()


class DepositRequestCreateSerializer(serializers.Serializer):
    """Serializer for creating deposit requests"""
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    bank_reference = serializers.CharField(max_length=100, required=False, allow_blank=True)
    proof_of_payment = serializers.FileField(required=False)
    
    def validate_amount(self, value):
        """Validate deposit amount"""
        if value < 50:
            raise serializers.ValidationError("Minimum deposit amount is R50")
        return value


class SubscriptionUpgradeRequestSerializer(serializers.Serializer):
    """Serializer for subscription upgrade requests"""
    subscription_tier = serializers.ChoiceField(choices=[
        ('basic', 'Basic'),
        ('standard', 'Standard'),
        ('premium', 'Premium'),
        ('enterprise', 'Enterprise')
    ])
    
    def validate_subscription_tier(self, value):
        """Validate subscription tier"""
        valid_tiers = ['basic', 'standard', 'premium', 'enterprise']
        if value not in valid_tiers:
            raise serializers.ValidationError(f"Invalid subscription tier. Valid options: {valid_tiers}")
        return value
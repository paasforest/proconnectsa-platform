from django.contrib import admin
from .models import Transaction, DepositRequest, PaymentAccount, BankAccount


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """Admin configuration for Transaction model"""
    list_display = [
        'account', 'transaction_type', 'amount', 'status', 'payment_method',
        'created_at', 'updated_at'
    ]
    list_filter = [
        'transaction_type', 'status', 'payment_method', 'created_at'
    ]
    search_fields = [
        'account__user__username', 'account__user__email', 'reference',
        'description'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        ('Transaction Information', {
            'fields': (
                'account', 'transaction_type', 'status', 'payment_method',
                'amount', 'reference'
            )
        }),
        ('Details', {
            'fields': (
                'description',
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(DepositRequest)
class DepositRequestAdmin(admin.ModelAdmin):
    """Admin configuration for DepositRequest model"""
    list_display = [
        'bank_reference', 'account', 'amount', 'credits_to_activate', 
        'status', 'created_at', 'processed_at'
    ]
    list_filter = ['status', 'created_at', 'processed_at', 'is_auto_verified']
    search_fields = ['bank_reference', 'customer_code', 'reference_number', 'account__user__email']
    
    readonly_fields = ['id', 'created_at', 'updated_at', 'processed_at']
    actions = ['approve_deposits', 'reject_deposits']
    
    fieldsets = (
        ('Deposit Information', {
            'fields': (
                'account', 'amount', 'bank_reference', 'credits_to_activate', 'status'
            )
        }),
        ('Verification', {
            'fields': (
                'proof_of_payment', 'customer_code', 'reference_number',
                'is_auto_verified', 'verification_notes'
            )
        }),
        ('Processing', {
            'fields': (
                'processed_by', 'admin_notes', 'processed_at'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def approve_deposits(self, request, queryset):
        """Bulk approve selected deposits"""
        count = 0
        for deposit in queryset.filter(status='pending'):
            try:
                deposit.approve(admin_user=request.user, notes="Bulk approval")
                count += 1
            except ValueError:
                pass
        self.message_user(request, f"Approved {count} deposits")
    approve_deposits.short_description = "Approve selected deposits"
    
    def reject_deposits(self, request, queryset):
        """Bulk reject selected deposits"""
        count = 0
        for deposit in queryset.filter(status='pending'):
            try:
                deposit.reject(admin_user=request.user, notes="Bulk rejection")
                count += 1
            except ValueError:
                pass
        self.message_user(request, f"Rejected {count} deposits")
    reject_deposits.short_description = "Reject selected deposits"


@admin.register(PaymentAccount)
class PaymentAccountAdmin(admin.ModelAdmin):
    """Admin configuration for PaymentAccount model"""
    list_display = ['user', 'balance', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    """Admin configuration for BankAccount model"""
    list_display = ['bank_name', 'account_holder', 'account_number', 'is_active', 'created_at']
    list_filter = ['bank_name', 'is_active', 'created_at']
    search_fields = ['bank_name', 'account_holder', 'account_number']
    readonly_fields = ['id', 'created_at']


from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, ProviderProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for User model"""
    list_display = [
        'username', 'email', 'first_name', 'last_name', 
        'user_type', 'is_phone_verified', 'is_email_verified', 
        'is_active', 'created_at'
    ]
    list_filter = [
        'user_type', 'is_phone_verified', 'is_email_verified', 
        'is_active', 'is_staff', 'created_at'
    ]
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {
            'fields': ('first_name', 'last_name', 'email', 'phone', 'user_type')
        }),
        ('Location', {
            'fields': ('city', 'suburb', 'latitude', 'longitude')
        }),
        ('Verification', {
            'fields': ('is_phone_verified', 'is_email_verified')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined', 'last_active', 'created_at')
        }),
    )
    
    readonly_fields = ['created_at', 'last_active']


@admin.register(ProviderProfile)
class ProviderProfileAdmin(admin.ModelAdmin):
    """Admin configuration for ProviderProfile model"""
    list_display = [
        'business_name', 'user', 'verification_status', 
        'subscription_tier', 'credit_balance', 'average_rating', 
        'created_at'
    ]
    list_filter = [
        'verification_status', 'subscription_tier', 
        'created_at'
    ]
    search_fields = [
        'business_name', 'user__username', 'user__email',
        'business_registration', 'license_number'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        ('Business Information', {
            'fields': (
                'user', 'business_name', 'business_registration',
                'license_number', 'vat_number'
            )
        }),
        ('Contact & Location', {
            'fields': (
                'business_phone', 'business_email', 'business_address',
                'service_areas', 'max_travel_distance'
            )
        }),
        ('Pricing', {
            'fields': (
                'hourly_rate_min', 'hourly_rate_max', 'minimum_job_value'
            )
        }),
        ('Subscription & Credits', {
            'fields': (
                'subscription_tier', 'subscription_start_date', 
                'subscription_end_date', 'credit_balance',
                'monthly_lead_limit', 'leads_used_this_month'
            )
        }),
        ('Verification & Quality', {
            'fields': (
                'verification_status', 'verification_documents',
                'insurance_valid_until', 'average_rating', 'total_reviews',
                'response_time_hours', 'job_completion_rate'
            )
        }),
        ('Profile Information', {
            'fields': (
                'bio', 'years_experience', 'profile_image', 'portfolio_images'
            )
        }),
        ('Settings', {
            'fields': (
                'receives_lead_notifications', 'notification_methods'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'average_rating', 'total_reviews']
    
    def is_subscription_active(self, obj):
        return obj.is_subscription_active
    is_subscription_active.boolean = True
    is_subscription_active.short_description = 'Subscription Active'

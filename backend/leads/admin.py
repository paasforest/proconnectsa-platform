from django.contrib import admin
from django.utils import timezone
from .models import ServiceCategory, Lead, LeadAssignment


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    """Admin configuration for ServiceCategory model"""
    list_display = ['name', 'parent', 'is_active', 'created_at']
    list_filter = ['is_active', 'parent', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    
    fieldsets = (
        ('Category Information', {
            'fields': ('name', 'slug', 'description', 'parent', 'icon')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at']


class LeadAssignmentInline(admin.TabularInline):
    """Inline admin for LeadAssignment"""
    model = LeadAssignment
    extra = 0
    readonly_fields = ['assigned_at', 'viewed_at', 'contacted_at', 'quote_provided_at']
    fields = [
        'provider', 'status', 'assigned_at', 'viewed_at', 
        'contacted_at', 'quote_provided_at', 'quote_amount'
    ]


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    """Admin configuration for Lead model"""
    list_display = [
        'title', 'client', 'service_category', 'location_suburb',
        'budget_range', 'urgency', 'status', 'verification_score',
        'created_at'
    ]
    list_filter = [
        'status', 'service_category', 'budget_range', 'urgency',
        'verification_score', 'is_sms_verified', 'created_at'
    ]
    search_fields = [
        'title', 'description', 'client__username', 'client__email',
        'location_suburb', 'location_city'
    ]
    ordering = ['-created_at']
    inlines = [LeadAssignmentInline]
    
    fieldsets = (
        ('Lead Information', {
            'fields': (
                'client', 'service_category', 'title', 'description'
            )
        }),
        ('Location', {
            'fields': (
                'location_address', 'location_suburb', 'location_city',
                'latitude', 'longitude'
            )
        }),
        ('Requirements', {
            'fields': (
                'budget_range', 'urgency', 'preferred_contact_time',
                'additional_requirements'
            )
        }),
        ('Verification', {
            'fields': (
                'verification_score', 'verification_notes',
                'is_sms_verified', 'sms_verification_code',
                'sms_verification_attempts'
            )
        }),
        ('Status & Workflow', {
            'fields': (
                'status', 'assigned_providers_count', 'total_provider_contacts'
            )
        }),
        ('Marketing', {
            'fields': (
                'source', 'utm_source', 'utm_medium', 'utm_campaign'
            ),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'verified_at', 'expires_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = [
        'created_at', 'updated_at', 'assigned_providers_count',
        'total_provider_contacts', 'verification_score'
    ]
    
    actions = ['mark_as_verified', 'mark_as_expired', 'resend_sms_verification']
    
    def mark_as_verified(self, request, queryset):
        """Mark selected leads as verified
        
        Uses individual saves to ensure post_save signals fire,
        which triggers lead routing and provider notifications.
        """
        count = 0
        for lead in queryset:
            # Only update if not already verified to avoid unnecessary saves
            if lead.status != 'verified':
                lead.status = 'verified'
                # Set verified_at timestamp if not already set
                if not lead.verified_at:
                    lead.verified_at = timezone.now()
                lead.save()  # ✅ Triggers post_save signals properly
                count += 1
        
        if count > 0:
            self.message_user(
                request, 
                f'{count} lead{"s" if count != 1 else ""} marked as verified. '
                f'Provider notifications sent.'
            )
        else:
            self.message_user(request, 'No leads needed verification update.')
    mark_as_verified.short_description = 'Mark selected leads as verified'
    
    def mark_as_expired(self, request, queryset):
        """Mark selected leads as expired"""
        updated = queryset.update(status='expired')
        self.message_user(request, f'{updated} leads marked as expired.')
    mark_as_expired.short_description = 'Mark selected leads as expired'
    
    def resend_sms_verification(self, request, queryset):
        """Resend SMS verification for selected leads"""
        from .services import LeadVerificationService
        service = LeadVerificationService()
        
        count = 0
        for lead in queryset:
            if lead.status == 'verifying':
                service.initiate_sms_verification(lead)
                count += 1
        
        self.message_user(request, f'SMS verification resent for {count} leads.')
    resend_sms_verification.short_description = 'Resend SMS verification'


@admin.register(LeadAssignment)
class LeadAssignmentAdmin(admin.ModelAdmin):
    """Admin configuration for LeadAssignment model"""
    list_display = [
        'lead', 'provider', 'status', 'assigned_at', 
        'viewed_at', 'contacted_at', 'quote_amount'
    ]
    list_filter = [
        'status', 'credit_refunded', 'assigned_at', 'viewed_at'
    ]
    search_fields = [
        'lead__title', 'provider__username', 'provider__email',
        'provider_notes'
    ]
    ordering = ['-assigned_at']
    
    fieldsets = (
        ('Assignment Information', {
            'fields': (
                'lead', 'provider', 'assigned_at', 'status'
            )
        }),
        ('Provider Actions', {
            'fields': (
                'viewed_at', 'contacted_at', 'quote_provided_at',
                'provider_notes', 'quote_amount', 'estimated_duration'
            )
        }),
        ('Outcome', {
            'fields': (
                'won_job', 'client_feedback', 'provider_rating'
            )
        }),
        ('Credit Management', {
            'fields': (
                'credit_cost', 'credit_refunded', 'refund_reason'
            )
        }),
        ('Timestamps', {
            'fields': ('updated_at',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['assigned_at', 'viewed_at', 'contacted_at', 'quote_provided_at', 'updated_at']
    
    actions = ['mark_as_viewed', 'mark_as_contacted', 'refund_credits']
    
    def mark_as_viewed(self, request, queryset):
        """Mark selected assignments as viewed"""
        count = 0
        for assignment in queryset:
            if not assignment.viewed_at:
                assignment.mark_as_viewed()
                count += 1
        self.message_user(request, f'{count} assignments marked as viewed.')
    mark_as_viewed.short_description = 'Mark selected assignments as viewed'
    
    def mark_as_contacted(self, request, queryset):
        """Mark selected assignments as contacted"""
        count = 0
        for assignment in queryset:
            if not assignment.contacted_at:
                assignment.mark_as_contacted()
                count += 1
        self.message_user(request, f'{count} assignments marked as contacted.')
    mark_as_contacted.short_description = 'Mark selected assignments as contacted'
    
    def refund_credits(self, request, queryset):
        """Refund credits for selected assignments"""
        count = 0
        for assignment in queryset:
            if not assignment.credit_refunded:
                assignment.credit_refunded = True
                assignment.refund_reason = 'Admin refund'
                assignment.save()
                count += 1
        self.message_user(request, f'Credits refunded for {count} assignments.')
    refund_credits.short_description = 'Refund credits for selected assignments'


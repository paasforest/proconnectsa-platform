from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.urls import reverse
from django.utils import timezone
from .models import BusinessRegistration, BusinessDirector, BusinessRegistrationNote


class BusinessDirectorInline(admin.TabularInline):
    """Inline admin for business directors"""
    model = BusinessDirector
    extra = 0
    fields = ['name', 'nationality', 'id_type', 'id_number', 'email', 'phone', 'shareholding']
    readonly_fields = []


class BusinessRegistrationNoteInline(admin.TabularInline):
    """Inline admin for registration notes"""
    model = BusinessRegistrationNote
    extra = 1
    fields = ['note', 'author']
    readonly_fields = ['created_at']


@admin.register(BusinessRegistration)
class BusinessRegistrationAdmin(admin.ModelAdmin):
    """Admin configuration for Business Registration"""
    
    list_display = [
        'registration_id', 'business_name', 'full_name', 'email', 'phone',
        'business_type', 'payment_amount', 'payment_status', 'status_badge', 
        'submitted_at', 'days_since_submission'
    ]
    
    list_filter = [
        'status', 'business_type', 'registration_urgency', 'payment_received',
        'website_required', 'nationality', 'province', 'submitted_at'
    ]
    
    search_fields = [
        'registration_id', 'business_name', 'first_name', 'last_name', 
        'email', 'phone', 'payment_reference'
    ]
    
    ordering = ['-submitted_at']
    inlines = [BusinessDirectorInline, BusinessRegistrationNoteInline]
    
    fieldsets = (
        ('Registration Details', {
            'fields': ('registration_id', 'status', 'assigned_to', 'submitted_at', 'updated_at')
        }),
        ('Personal Information', {
            'fields': (
                'first_name', 'last_name', 'nationality', 'id_type', 'id_number', 
                'id_document', 'email', 'phone'
            )
        }),
        ('Business Information', {
            'fields': (
                'business_name', 'business_name_alternative', 'business_type', 
                'business_category', 'business_description'
            )
        }),
        ('Business Address', {
            'fields': (
                'street_address', 'suburb', 'city', 'province', 'postal_code'
            )
        }),
        ('Website Requirements', {
            'fields': (
                'website_required', 'website_type', 'website_features', 'domain_preference'
            ),
            'classes': ('collapse',)
        }),
        ('Registration Timeline', {
            'fields': ('registration_urgency', 'preferred_start_date')
        }),
        ('Payment Information', {
            'fields': (
                'payment_method', 'payment_reference', 'payment_amount', 
                'payment_received', 'payment_date'
            )
        }),
        ('Terms & Consent', {
            'fields': ('terms_accepted', 'privacy_accepted', 'marketing_consent'),
            'classes': ('collapse',)
        }),
        ('Internal Notes', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = [
        'registration_id', 'submitted_at', 'updated_at', 'days_since_submission',
        'payment_reference'
    ]
    
    actions = ['mark_payment_received', 'start_cipc_process', 'start_website_development', 'mark_completed']
    
    def payment_status(self, obj):
        """Display payment status with color coding"""
        if obj.payment_received:
            return format_html(
                '<span style="color: green; font-weight: bold;">✅ Paid</span>'
            )
        else:
            return format_html(
                '<span style="color: red; font-weight: bold;">❌ Pending</span>'
            )
    payment_status.short_description = 'Payment'
    
    def status_badge(self, obj):
        """Display status with color coding"""
        colors = {
            'pending_payment': '#ff6b6b',
            'payment_received': '#4ecdc4',
            'documents_review': '#45b7d1',
            'cipc_submission': '#f9ca24',
            'website_development': '#6c5ce7',
            'completed': '#00b894',
            'cancelled': '#636e72'
        }
        color = colors.get(obj.status, '#636e72')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def full_name(self, obj):
        """Display full name"""
        return f"{obj.first_name} {obj.last_name}"
    full_name.short_description = 'Owner Name'
    
    def days_since_submission(self, obj):
        """Calculate days since submission"""
        days = obj.days_since_submission
        if days == 0:
            return "Today"
        elif days == 1:
            return "1 day ago"
        else:
            return f"{days} days ago"
    days_since_submission.short_description = 'Age'
    
    # Custom actions
    def mark_payment_received(self, request, queryset):
        """Mark selected registrations as payment received"""
        updated = queryset.update(
            payment_received=True, 
            payment_date=timezone.now(),
            status='payment_received'
        )
        self.message_user(request, f'{updated} registrations marked as paid.')
    mark_payment_received.short_description = 'Mark payment received'
    
    def start_cipc_process(self, request, queryset):
        """Start CIPC process for selected registrations"""
        updated = queryset.filter(payment_received=True).update(status='cipc_submission')
        self.message_user(request, f'CIPC process started for {updated} registrations.')
    start_cipc_process.short_description = 'Start CIPC process'
    
    def start_website_development(self, request, queryset):
        """Start website development for selected registrations"""
        updated = queryset.filter(website_required=True).update(status='website_development')
        self.message_user(request, f'Website development started for {updated} registrations.')
    start_website_development.short_description = 'Start website development'
    
    def mark_completed(self, request, queryset):
        """Mark selected registrations as completed"""
        updated = queryset.update(status='completed')
        self.message_user(request, f'{updated} registrations marked as completed.')
    mark_completed.short_description = 'Mark as completed'


@admin.register(BusinessDirector)
class BusinessDirectorAdmin(admin.ModelAdmin):
    """Admin configuration for Business Directors"""
    
    list_display = [
        'name', 'business_name', 'nationality', 'id_type', 'id_number', 
        'email', 'shareholding', 'created_at'
    ]
    
    list_filter = ['nationality', 'id_type', 'created_at']
    search_fields = ['name', 'email', 'id_number', 'business_registration__business_name']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Director Information', {
            'fields': ('business_registration', 'name', 'nationality', 'id_type', 'id_number')
        }),
        ('Contact Details', {
            'fields': ('email', 'phone', 'address')
        }),
        ('Shareholding', {
            'fields': ('shareholding',)
        }),
        ('Documents', {
            'fields': ('id_document',)
        }),
    )
    
    readonly_fields = ['created_at']
    
    def business_name(self, obj):
        """Display associated business name"""
        return obj.business_registration.business_name
    business_name.short_description = 'Business'


@admin.register(BusinessRegistrationNote)
class BusinessRegistrationNoteAdmin(admin.ModelAdmin):
    """Admin configuration for Registration Notes"""
    
    list_display = ['business_name', 'author', 'note_preview', 'created_at']
    list_filter = ['author', 'created_at']
    search_fields = ['note', 'business_registration__business_name', 'author__email']
    ordering = ['-created_at']
    
    def business_name(self, obj):
        """Display associated business name"""
        return obj.business_registration.business_name
    business_name.short_description = 'Business'
    
    def note_preview(self, obj):
        """Display note preview"""
        return obj.note[:100] + "..." if len(obj.note) > 100 else obj.note
    note_preview.short_description = 'Note'

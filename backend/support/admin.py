"""
Support Ticket Admin

This module defines admin interfaces for support ticket management.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import SupportTicket, TicketResponse, TicketTemplate, SupportMetrics


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    """Admin configuration for SupportTicket model"""
    
    list_display = [
        'ticket_number', 'title', 'user_email', 'category', 'priority', 'status',
        'assigned_to_name', 'created_at', 'age_days', 'response_count'
    ]
    list_filter = [
        'category', 'priority', 'status', 'user_type', 'assigned_to',
        'created_at', 'resolved_at'
    ]
    search_fields = [
        'ticket_number', 'title', 'description', 'user__email', 'user__first_name', 'user__last_name'
    ]
    readonly_fields = [
        'id', 'ticket_number', 'created_at', 'updated_at', 'resolved_at',
        'age_days', 'is_open', 'is_resolved', 'priority_weight'
    ]
    raw_id_fields = ['user', 'assigned_to', 'resolved_by']
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'ticket_number', 'title', 'description', 'category', 'priority', 'status'
            )
        }),
        ('User Information', {
            'fields': (
                'user', 'user_type', 'assigned_to', 'resolved_by'
            )
        }),
        ('Resolution', {
            'fields': (
                'resolution_notes', 'resolved_at'
            )
        }),
        ('Additional Information', {
            'fields': (
                'tags', 'attachments'
            )
        }),
        ('Satisfaction', {
            'fields': (
                'satisfaction_rating', 'satisfaction_feedback'
            )
        }),
        ('Timestamps', {
            'fields': (
                'created_at', 'updated_at', 'age_days', 'is_open', 'is_resolved'
            ),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['assign_to_me', 'mark_resolved', 'mark_closed', 'send_satisfaction_survey']
    
    def user_email(self, obj):
        """Display user email"""
        return obj.user.email
    user_email.short_description = 'User Email'
    user_email.admin_order_field = 'user__email'
    
    def assigned_to_name(self, obj):
        """Display assigned to name"""
        if obj.assigned_to:
            return obj.assigned_to.get_full_name() or obj.assigned_to.email
        return '-'
    assigned_to_name.short_description = 'Assigned To'
    assigned_to_name.admin_order_field = 'assigned_to__first_name'
    
    def response_count(self, obj):
        """Display response count with link"""
        count = obj.responses.count()
        if count > 0:
            url = reverse('admin:support_ticketresponse_changelist')
            return format_html('<a href="{}?ticket__id={}">{} responses</a>', url, obj.id, count)
        return '0 responses'
    response_count.short_description = 'Responses'
    
    def age_days(self, obj):
        """Display ticket age in days with color coding"""
        days = obj.age_days
        if days > 7:
            color = 'red'
        elif days > 3:
            color = 'orange'
        else:
            color = 'green'
        
        return format_html(
            '<span style="color: {};">{} days</span>',
            color, days
        )
    age_days.short_description = 'Age'
    age_days.admin_order_field = 'created_at'
    
    def priority_display(self, obj):
        """Display priority with color coding"""
        colors = {
            'critical': 'red',
            'urgent': 'orange',
            'high': 'yellow',
            'medium': 'blue',
            'low': 'green'
        }
        color = colors.get(obj.priority, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_priority_display()
        )
    priority_display.short_description = 'Priority'
    priority_display.admin_order_field = 'priority'
    
    def status_display(self, obj):
        """Display status with color coding"""
        colors = {
            'open': 'red',
            'in_progress': 'orange',
            'pending_customer': 'yellow',
            'pending_internal': 'purple',
            'resolved': 'green',
            'closed': 'gray',
            'cancelled': 'gray'
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_display.short_description = 'Status'
    status_display.admin_order_field = 'status'
    
    def assign_to_me(self, request, queryset):
        """Assign selected tickets to current user"""
        updated = queryset.update(assigned_to=request.user, status='in_progress')
        self.message_user(request, f'{updated} tickets assigned to you.')
    assign_to_me.short_description = 'Assign to me'
    
    def mark_resolved(self, request, queryset):
        """Mark selected tickets as resolved"""
        from django.utils import timezone
        updated = queryset.update(
            status='resolved',
            resolved_by=request.user,
            resolved_at=timezone.now()
        )
        self.message_user(request, f'{updated} tickets marked as resolved.')
    mark_resolved.short_description = 'Mark as resolved'
    
    def mark_closed(self, request, queryset):
        """Mark selected tickets as closed"""
        from django.utils import timezone
        updated = queryset.update(
            status='closed',
            resolved_by=request.user,
            closed_at=timezone.now()
        )
        self.message_user(request, f'{updated} tickets marked as closed.')
    mark_closed.short_description = 'Mark as closed'
    
    def send_satisfaction_survey(self, request, queryset):
        """Send satisfaction survey to resolved tickets"""
        # This would integrate with email service
        count = queryset.filter(status='resolved', satisfaction_rating__isnull=True).count()
        self.message_user(request, f'Satisfaction survey would be sent to {count} tickets.')
    send_satisfaction_survey.short_description = 'Send satisfaction survey'


@admin.register(TicketResponse)
class TicketResponseAdmin(admin.ModelAdmin):
    """Admin configuration for TicketResponse model"""
    
    list_display = [
        'ticket_number', 'author_name', 'response_type', 'is_internal',
        'created_at', 'message_preview'
    ]
    list_filter = [
        'response_type', 'is_internal', 'created_at', 'ticket__category'
    ]
    search_fields = [
        'message', 'ticket__ticket_number', 'author__email', 'author__first_name', 'author__last_name'
    ]
    readonly_fields = ['id', 'created_at']
    raw_id_fields = ['ticket', 'author']
    
    fieldsets = (
        ('Response Information', {
            'fields': (
                'ticket', 'author', 'response_type', 'is_internal'
            )
        }),
        ('Message', {
            'fields': (
                'message', 'attachments'
            )
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    def ticket_number(self, obj):
        """Display ticket number with link"""
        url = reverse('admin:support_supportticket_change', args=[obj.ticket.id])
        return format_html('<a href="{}">{}</a>', url, obj.ticket.ticket_number)
    ticket_number.short_description = 'Ticket'
    ticket_number.admin_order_field = 'ticket__ticket_number'
    
    def author_name(self, obj):
        """Display author name"""
        return obj.author.get_full_name() or obj.author.email
    author_name.short_description = 'Author'
    author_name.admin_order_field = 'author__first_name'
    
    def message_preview(self, obj):
        """Display message preview"""
        preview = obj.message[:100]
        if len(obj.message) > 100:
            preview += '...'
        return preview
    message_preview.short_description = 'Message Preview'


@admin.register(TicketTemplate)
class TicketTemplateAdmin(admin.ModelAdmin):
    """Admin configuration for TicketTemplate model"""
    
    list_display = [
        'name', 'category', 'is_active', 'created_by_name', 'created_at'
    ]
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['name', 'subject_template', 'message_template']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Template Information', {
            'fields': (
                'name', 'category', 'is_active'
            )
        }),
        ('Template Content', {
            'fields': (
                'subject_template', 'message_template'
            )
        }),
        ('Metadata', {
            'fields': (
                'created_by', 'created_at', 'updated_at'
            ),
            'classes': ('collapse',)
        }),
    )
    
    def created_by_name(self, obj):
        """Display created by name"""
        return obj.created_by.get_full_name() or obj.created_by.email
    created_by_name.short_description = 'Created By'
    created_by_name.admin_order_field = 'created_by__first_name'


@admin.register(SupportMetrics)
class SupportMetricsAdmin(admin.ModelAdmin):
    """Admin configuration for SupportMetrics model"""
    
    list_display = [
        'date', 'total_tickets', 'open_tickets', 'resolved_tickets',
        'avg_resolution_time', 'avg_satisfaction_rating'
    ]
    list_filter = ['date']
    search_fields = ['date']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Date', {
            'fields': ('date',)
        }),
        ('Ticket Counts', {
            'fields': (
                'total_tickets', 'open_tickets', 'resolved_tickets'
            )
        }),
        ('Performance Metrics', {
            'fields': (
                'avg_resolution_time', 'avg_satisfaction_rating'
            )
        }),
        ('Timestamps', {
            'fields': (
                'created_at', 'updated_at'
            ),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        """Disable manual creation of metrics"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Disable manual editing of metrics"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Disable deletion of metrics"""
        return False

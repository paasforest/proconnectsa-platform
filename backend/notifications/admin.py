from django.contrib import admin
from .models import Notification, NotificationSettings, PushSubscription


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin configuration for Notification model"""
    list_display = [
        'user', 'notification_type', 'priority', 'title',
        'is_read', 'is_email_sent', 'is_sms_sent', 'created_at'
    ]
    list_filter = [
        'notification_type', 'priority', 'is_read',
        'is_email_sent', 'is_sms_sent', 'created_at'
    ]
    search_fields = [
        'title', 'message', 'user__username', 'user__email'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        ('Notification Information', {
            'fields': (
                'user', 'notification_type', 'priority',
                'title', 'message'
            )
        }),
        ('References', {
            'fields': (
                'lead', 'provider'
            )
        }),
        ('Delivery Status', {
            'fields': (
                'is_read', 'is_email_sent', 'is_sms_sent'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'read_at', 'expires_at'),
            'classes': ('collapse',)
        }),
        ('Additional Data', {
            'fields': ('data',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'read_at']
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        """Mark selected notifications as read"""
        count = 0
        for notification in queryset:
            if not notification.is_read:
                notification.mark_as_read()
                count += 1
        self.message_user(request, f'{count} notifications marked as read.')
    mark_as_read.short_description = 'Mark selected notifications as read'
    
    def mark_as_unread(self, request, queryset):
        """Mark selected notifications as unread"""
        updated = queryset.update(is_read=False, read_at=None)
        self.message_user(request, f'{updated} notifications marked as unread.')
    mark_as_unread.short_description = 'Mark selected notifications as unread'


@admin.register(NotificationSettings)
class NotificationSettingsAdmin(admin.ModelAdmin):
    """Admin configuration for NotificationSettings model"""
    list_display = ['user', 'push_enabled', 'email_enabled', 'sms_enabled']
    list_filter = ['push_enabled', 'email_enabled', 'sms_enabled']
    search_fields = ['user__username', 'user__email']


@admin.register(PushSubscription)
class PushSubscriptionAdmin(admin.ModelAdmin):
    """Admin configuration for PushSubscription model"""
    list_display = ['user', 'device_type', 'is_active', 'created_at', 'last_used_at']
    list_filter = ['device_type', 'is_active', 'created_at']
    search_fields = ['user__username', 'user__email', 'token']
    readonly_fields = ['created_at', 'updated_at', 'last_used_at']


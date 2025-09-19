"""
Notification serializers
"""
from rest_framework import serializers
from .models import Notification, NotificationSettings


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications"""
    
    # Add computed fields
    time_ago = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'title',
            'message',
            'notification_type',
            'priority',
            'is_read',
            'is_email_sent',
            'is_sms_sent',
            'created_at',
            'read_at',
            'expires_at',
            'data',
            'time_ago',
            'is_expired'
        ]
        read_only_fields = ['id', 'created_at', 'time_ago', 'is_expired']
    
    def get_time_ago(self, obj):
        """Get human-readable time ago"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            return "Just now"
    
    def get_is_expired(self, obj):
        """Check if notification is expired"""
        return obj.is_expired()


class NotificationSettingsSerializer(serializers.ModelSerializer):
    """Serializer for notification settings"""
    
    class Meta:
        model = NotificationSettings
        fields = [
            'email_notifications',
            'email_lead_assigned',
            'email_quote_received',
            'email_quote_response',
            'email_credit_purchase',
            'email_deposit_verified',
            'email_system',
            'sms_notifications',
            'sms_lead_assigned',
            'sms_quote_received',
            'sms_urgent_only',
            'dashboard_notifications',
            'show_popup',
            'sound_enabled',
            'digest_frequency'
        ]
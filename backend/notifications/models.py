"""
Notification models for ProConnectSA
"""
import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from backend.leads.models import Lead

User = get_user_model()

# Notification types
NOTIFICATION_TYPES = [
    ('lead_assigned', 'Lead Assigned'),
    ('quote_received', 'Quote Received'),
    ('quote_response', 'Quote Response'),
    ('credit_purchase', 'Credit Purchase'),
    ('deposit_verified', 'Deposit Verified'),
    ('lead_verified', 'Lead Verified'),
    ('system', 'System Notification'),
    ('system_update', 'System Update'),
    ('reminder', 'Reminder'),
]

PRIORITY_CHOICES = [
    ('low', 'Low'),
    ('medium', 'Medium'),
    ('high', 'High'),
    ('urgent', 'Urgent'),
]


class Notification(models.Model):
    """In-app notifications for users"""
    id = models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    # Optional foreign keys
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    provider = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='provider_notifications')
    
    # Status flags
    is_read = models.BooleanField(default=False)
    is_email_sent = models.BooleanField(default=False)
    is_sms_sent = models.BooleanField(default=False)
    is_push_sent = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Additional data (JSON)
    data = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read', '-created_at']),
            models.Index(fields=['user', 'notification_type']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    def is_expired(self):
        """Check if notification is expired"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False
    
    @classmethod
    def create_for_user(
        cls,
        user,
        notification_type,
        title,
        message,
        priority='medium',
        lead=None,
        provider=None,
        data=None,
        expires_at=None,
    ):
        """Create a notification for a user"""
        return cls.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            priority=priority,
            lead=lead,
            provider=provider,
            data=data or {},
            expires_at=expires_at,
        )


class PushSubscription(models.Model):
    """FCM push notification subscriptions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='push_subscriptions')
    token = models.TextField(unique=True)  # FCM registration token
    endpoint = models.URLField(null=True, blank=True)  # Web push endpoint (if using Web Push API)
    keys = models.JSONField(default=dict, blank=True)  # Web push keys (p256dh, auth)
    
    # Device info
    user_agent = models.TextField(null=True, blank=True)
    device_type = models.CharField(max_length=50, null=True, blank=True)  # 'android', 'ios', 'web'
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = [['user', 'token']]
        indexes = [
            models.Index(fields=['user', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.device_type or 'Unknown'}"


class NotificationSettings(models.Model):
    """User preferences for notifications"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_settings')
    
    # Push notification preferences
    push_enabled = models.BooleanField(default=True)
    push_new_leads = models.BooleanField(default=True)
    push_lead_assigned = models.BooleanField(default=True)
    push_credits = models.BooleanField(default=True)
    push_system = models.BooleanField(default=True)
    
    # Email preferences
    email_enabled = models.BooleanField(default=True)
    email_new_leads = models.BooleanField(default=True)
    email_lead_assigned = models.BooleanField(default=True)
    email_credits = models.BooleanField(default=True)
    email_system = models.BooleanField(default=True)
    
    # SMS preferences
    sms_enabled = models.BooleanField(default=False)
    sms_urgent_only = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Notification settings for {self.user.username}"
    
    def should_send_email(self, notification_type):
        """Check if email should be sent for this notification type"""
        if not self.email_enabled:
            return False
        
        if notification_type == 'lead_verified' or notification_type == 'lead_assigned':
            return self.email_new_leads or self.email_lead_assigned
        elif notification_type == 'credit_purchase':
            return self.email_credits
        elif notification_type in ['system', 'system_update']:
            return self.email_system
        
        return True  # Default to True for other types
    
    def should_send_sms(self, notification_type, priority):
        """Check if SMS should be sent for this notification"""
        if not self.sms_enabled:
            return False
        
        # Only send SMS for urgent notifications if sms_urgent_only is True
        if self.sms_urgent_only and priority != 'urgent':
            return False
        
        return True

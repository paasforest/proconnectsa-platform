"""
Notification models for dashboard notifications
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class Notification(models.Model):
    """Dashboard notification model"""
    
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
    
    PRIORITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    priority = models.CharField(max_length=20, choices=PRIORITY_LEVELS, default='medium')
    
    # Related objects (optional)
    lead = models.ForeignKey('leads.Lead', on_delete=models.CASCADE, null=True, blank=True)
    provider = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='provider_notifications')
    
    # Status and metadata
    is_read = models.BooleanField(default=False)
    is_email_sent = models.BooleanField(default=False)
    is_sms_sent = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Additional data
    data = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.email}"
    
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
        *,
        user,
        notification_type,
        title,
        message,
        priority='medium',
        lead=None,
        provider=None,
        expires_at=None,
        data=None,
        **extra_context,
    ):
        """Convenience factory used by signals/services.

        Any unknown keyword args are merged into the JSON `data` field to avoid
        tight coupling between callers and model schema (e.g. lead_assignment).
        """
        def _make_jsonable(value):
            if value is None or isinstance(value, (str, int, float, bool)):
                return value
            if isinstance(value, (list, tuple)):
                return [_make_jsonable(v) for v in value]
            if isinstance(value, dict):
                return {k: _make_jsonable(v) for k, v in value.items()}
            # Django model instance or other complex object
            obj_id = getattr(value, 'id', None)
            return str(obj_id) if obj_id is not None else str(value)

        payload = _make_jsonable(data or {}).copy()
        if extra_context:
            for k, v in extra_context.items():
                payload[k] = _make_jsonable(v)

        return cls.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            priority=priority,
            lead=lead,
            provider=provider,
            expires_at=expires_at,
            data=payload,
        )


class NotificationTemplate(models.Model):
    """Template for different notification types"""
    
    name = models.CharField(max_length=100, unique=True)
    notification_type = models.CharField(max_length=50, choices=Notification.NOTIFICATION_TYPES)
    title_template = models.CharField(max_length=200)
    message_template = models.TextField()
    email_template = models.TextField(blank=True)
    sms_template = models.TextField(blank=True)
    priority = models.CharField(max_length=20, choices=Notification.PRIORITY_LEVELS, default='medium')
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.notification_type})"
    
    def render_notification(self, context):
        """Render notification with context variables"""
        try:
            title = self.title_template.format(**context)
            message = self.message_template.format(**context)
            return title, message
        except KeyError as e:
            # Fallback to template name if context is missing
            return self.name, self.message_template


class NotificationSettings(models.Model):
    """User notification preferences"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_settings')
    
    # Email preferences
    email_notifications = models.BooleanField(default=True)
    email_lead_assigned = models.BooleanField(default=True)
    email_quote_received = models.BooleanField(default=True)
    email_quote_response = models.BooleanField(default=True)
    email_credit_purchase = models.BooleanField(default=True)
    email_deposit_verified = models.BooleanField(default=True)
    email_system = models.BooleanField(default=True)
    
    # SMS preferences
    sms_notifications = models.BooleanField(default=False)
    sms_lead_assigned = models.BooleanField(default=False)
    sms_quote_received = models.BooleanField(default=False)
    sms_urgent_only = models.BooleanField(default=True)
    
    # Dashboard preferences
    dashboard_notifications = models.BooleanField(default=True)
    show_popup = models.BooleanField(default=True)
    sound_enabled = models.BooleanField(default=True)
    
    # Frequency settings
    digest_frequency = models.CharField(
        max_length=20,
        choices=[
            ('immediate', 'Immediate'),
            ('hourly', 'Hourly'),
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
        ],
        default='immediate'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Notification Settings - {self.user.email}"
    
    def should_send_email(self, notification_type):
        """Check if email should be sent for notification type"""
        if not self.email_notifications:
            return False
        
        type_mapping = {
            'lead_assigned': self.email_lead_assigned,
            'quote_received': self.email_quote_received,
            'quote_response': self.email_quote_response,
            'credit_purchase': self.email_credit_purchase,
            'deposit_verified': self.email_deposit_verified,
            'system': self.email_system,
        }
        
        return type_mapping.get(notification_type, True)
    
    def should_send_sms(self, notification_type, priority='medium'):
        """Check if SMS should be sent for notification type"""
        if not self.sms_notifications:
            return False
        
        if self.sms_urgent_only and priority not in ['high', 'urgent']:
            return False
        
        type_mapping = {
            'lead_assigned': self.sms_lead_assigned,
            'quote_received': self.sms_quote_received,
        }
        
        return type_mapping.get(notification_type, False)
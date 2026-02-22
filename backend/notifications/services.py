"""
Notification service for creating and managing dashboard notifications
"""
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction
from .models import Notification, NotificationSettings
from .email_service import (
    send_lead_notification_email,
    send_quote_received_email,
    send_quote_response_notification,
    send_credit_purchase_confirmation,
    send_manual_deposit_instructions
)
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class NotificationService:
    """Service for managing notifications"""
    
    def __init__(self):
        self.email_service = None
    
    def create_notification(
        self,
        user,
        title,
        message,
        notification_type,
        priority='medium',
        lead=None,
        provider=None,
        data=None,
        send_email=True,
        send_sms=False  # SMS disabled by default (expensive!)
    ):
        """Create a new notification"""
        try:
            with transaction.atomic():
                # Create notification
                notification = Notification.objects.create(
                    user=user,
                    title=title,
                    message=message,
                    notification_type=notification_type,
                    priority=priority,
                    lead=lead,
                    provider=provider,
                    data=data or {}
                )
                
                # Get user notification settings
                settings, created = NotificationSettings.objects.get_or_create(
                    user=user,
                    defaults={
                        'email_notifications': True,
                        'sms_notifications': False,
                        'dashboard_notifications': True
                    }
                )
                
                # Send email if enabled
                if send_email and settings.should_send_email(notification_type):
                    self._send_notification_email(notification)
                    notification.is_email_sent = True
                
                # Send SMS if enabled (CHECK COST SETTINGS!)
                from decouple import config
                sms_globally_enabled = config('SMS_ENABLED', default=False, cast=bool)
                
                if send_sms and sms_globally_enabled and settings.should_send_sms(notification_type, priority):
                    self._send_notification_sms(notification)
                    notification.is_sms_sent = True
                elif send_sms and not sms_globally_enabled:
                    logger.info(f"SMS disabled globally to save costs - skipping SMS for {user.email}")
                
                notification.save()
                
                logger.info(f"Notification created for user {user.email}: {title}")
                return notification
                
        except Exception as e:
            logger.error(f"Error creating notification: {str(e)}")
            return None
    
    def _send_notification_email(self, notification):
        """Send email for notification"""
        try:
            if notification.notification_type == 'lead_assigned' and notification.lead:
                send_lead_notification_email(notification.user, notification.lead)
            elif notification.notification_type == 'quote_received' and notification.lead and notification.provider:
                send_quote_received_email(notification.user, notification.lead, notification.provider)
            elif notification.notification_type == 'quote_response' and notification.lead and notification.provider:
                quote_details = notification.data.get('quote_details', '')
                send_quote_response_notification(notification.user, notification.lead, notification.provider, quote_details)
            elif notification.notification_type == 'credit_purchase':
                amount = notification.data.get('amount', 0)
                credits = notification.data.get('credits', 0)
                send_credit_purchase_confirmation(notification.user, amount, credits)
            elif notification.notification_type == 'deposit_verified':
                deposit = notification.data.get('deposit')
                if deposit:
                    send_manual_deposit_instructions(notification.user, deposit)
        except Exception as e:
            logger.error(f"Error sending notification email: {str(e)}")
    
    def _send_notification_sms(self, notification):
        """Send SMS for notification using Panacea Mobile SMS API"""
        try:
            from .sms_service import SMSService
            
            sms_service = SMSService()
            phone_number = notification.user.phone if hasattr(notification.user, 'phone') else None
            
            if phone_number:
                # Format message for SMS
                message = f"ProConnectSA Alert: {notification.title}"
                if notification.message:
                    message += f" - {notification.message[:100]}..."  # Limit message length
                
                result = sms_service.send_sms(phone_number, message)
                if result['success']:
                    logger.info(f"SMS notification sent successfully to {phone_number}")
                else:
                    logger.error(f"Failed to send SMS notification: {result.get('error', 'Unknown error')}")
            else:
                logger.warning(f"No phone number available for user {notification.user.id}")
                
        except Exception as e:
            logger.error(f"Error sending notification SMS: {str(e)}")
    
    def get_user_notifications(self, user, limit=20, unread_only=False):
        """Get notifications for a user"""
        queryset = Notification.objects.filter(user=user)
        
        if unread_only:
            queryset = queryset.filter(is_read=False)
        
        return queryset.order_by('-created_at')[:limit]
    
    def mark_notification_read(self, notification_id, user):
        """Mark a notification as read"""
        try:
            notification = Notification.objects.get(id=notification_id, user=user)
            notification.mark_as_read()
            return True
        except Notification.DoesNotExist:
            return False
    
    def mark_all_notifications_read(self, user):
        """Mark all notifications as read for a user"""
        try:
            Notification.objects.filter(user=user, is_read=False).update(
                is_read=True,
                read_at=timezone.now()
            )
            return True
        except Exception as e:
            logger.error(f"Error marking all notifications as read: {str(e)}")
            return False
    
    def get_notification_count(self, user, unread_only=True):
        """Get notification count for a user"""
        queryset = Notification.objects.filter(user=user)
        
        if unread_only:
            queryset = queryset.filter(is_read=False)
        
        return queryset.count()
    
    def create_lead_assigned_notification(self, provider, lead):
        """Create notification when lead is assigned to provider"""
        title = f"New Lead: {lead.title}"
        message = f"You have been assigned a new {lead.service_category.name} lead in {lead.location_city}"
        
        return self.create_notification(
            user=provider,
            title=title,
            message=message,
            notification_type='lead_assigned',
            priority='high',
            lead=lead,
            data={
                'lead_id': str(lead.id),
                'service_category': lead.service_category.name,
                'location': f"{lead.location_suburb}, {lead.location_city}",
                'budget_range': lead.get_budget_range_display(),
                'urgency': lead.get_urgency_display()
            }
        )
    
    def create_quote_received_notification(self, client, lead, provider):
        """Create notification when client receives a quote"""
        title = f"New Quote: {lead.title}"
        message = f"You received a quote from {provider.first_name} {provider.last_name}"
        
        return self.create_notification(
            user=client,
            title=title,
            message=message,
            notification_type='quote_received',
            priority='medium',
            lead=lead,
            provider=provider,
            data={
                'lead_id': str(lead.id),
                'provider_name': f"{provider.first_name} {provider.last_name}",
                'service_category': lead.service_category.name
            }
        )
    
    def create_quote_response_notification(self, client, lead, provider, quote_details):
        """Create notification when provider responds to quote"""
        title = f"Provider Response: {lead.title}"
        message = f"{provider.first_name} {provider.last_name} responded to your quote request"
        
        return self.create_notification(
            user=client,
            title=title,
            message=message,
            notification_type='quote_response',
            priority='medium',
            lead=lead,
            provider=provider,
            data={
                'lead_id': str(lead.id),
                'provider_name': f"{provider.first_name} {provider.last_name}",
                'quote_details': quote_details
            }
        )
    
    def create_credit_purchase_notification(self, provider, amount, credits):
        """Create notification for credit purchase"""
        title = f"Credits Purchased: {credits} credits"
        message = f"Successfully purchased {credits} credits for R{amount:.2f}"
        
        return self.create_notification(
            user=provider,
            title=title,
            message=message,
            notification_type='credit_purchase',
            priority='low',
            data={
                'amount': amount,
                'credits': credits
            }
        )
    
    def create_deposit_verified_notification(self, provider, deposit):
        """Create notification for deposit verification"""
        title = f"Deposit Verified: {deposit.reference_number}"
        message = f"Your deposit of R{deposit.amount:.2f} has been verified and {deposit.credits_to_activate} credits activated"
        
        return self.create_notification(
            user=provider,
            title=title,
            message=message,
            notification_type='deposit_verified',
            priority='medium',
            data={
                'deposit_id': str(deposit.id),
                'amount': deposit.amount,
                'credits': deposit.credits_to_activate,
                'reference_number': deposit.reference_number
            }
        )


# Convenience functions
def create_lead_assigned_notification(provider, lead):
    """Create lead assigned notification"""
    service = NotificationService()
    return service.create_lead_assigned_notification(provider, lead)


def create_quote_received_notification(client, lead, provider):
    """Create quote received notification"""
    service = NotificationService()
    return service.create_quote_received_notification(client, lead, provider)


def create_quote_response_notification(client, lead, provider, quote_details):
    """Create quote response notification"""
    service = NotificationService()
    return service.create_quote_response_notification(client, lead, provider, quote_details)


def create_credit_purchase_notification(provider, amount, credits):
    """Create credit purchase notification"""
    service = NotificationService()
    return service.create_credit_purchase_notification(provider, amount, credits)


def create_deposit_verified_notification(provider, deposit):
    """Create deposit verified notification"""
    service = NotificationService()
    return service.create_deposit_verified_notification(provider, deposit)






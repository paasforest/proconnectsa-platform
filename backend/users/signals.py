from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import User, ProviderProfile, Wallet
from backend.payments.models import PaymentAccount
from backend.notifications.models import Notification


@receiver(post_save, sender=User)
def create_welcome_notification(sender, instance, created, **kwargs):
    """Create welcome notification, payment account, and wallet for new users"""
    if created:
        # Create payment account for new user
        PaymentAccount.objects.get_or_create(
            user=instance,
            defaults={'balance': 0.00}
        )
        
        # Create wallet for new user (for credits system)
        Wallet.objects.get_or_create(
            user=instance,
            defaults={
                'balance': 0.00,
                'credits': 0
            }
        )
        
        Notification.create_for_user(
            user=instance,
            notification_type='system_update',
            title='Welcome to ProConnectSA!',
            message=f'Welcome {instance.first_name}! Your account has been created successfully. You can now start purchasing leads.',
            priority='medium'
        )


@receiver(post_save, sender=ProviderProfile)
def create_provider_welcome_notification(sender, instance, created, **kwargs):
    """Create welcome notification and send pro welcome email for new provider profiles"""
    if created:
        Notification.create_for_user(
            user=instance.user,
            notification_type='system_update',
            title='Provider Profile Created',
            message=f'Your provider profile for {instance.business_name} has been created. Please complete verification to start receiving leads.',
            priority='high'
        )
        # Pro welcome email: how leads work, how to respond, how to upgrade
        try:
            from backend.utils.resend_service import send_pro_welcome_email
            if send_pro_welcome_email(instance.user):
                instance.pro_welcome_email_sent_at = timezone.now()
                instance.save(update_fields=['pro_welcome_email_sent_at'])
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to send pro welcome email: {e}", exc_info=True)


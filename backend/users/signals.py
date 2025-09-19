from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, ProviderProfile
from backend.notifications.models import Notification


@receiver(post_save, sender=User)
def create_welcome_notification(sender, instance, created, **kwargs):
    """Create welcome notification for new users"""
    if created:
        Notification.create_for_user(
            user=instance,
            notification_type='system_update',
            title='Welcome to ProCompare!',
            message=f'Welcome {instance.first_name}! Your account has been created successfully.',
            priority='medium'
        )


@receiver(post_save, sender=ProviderProfile)
def create_provider_welcome_notification(sender, instance, created, **kwargs):
    """Create welcome notification for new provider profiles"""
    if created:
        Notification.create_for_user(
            user=instance.user,
            notification_type='system_update',
            title='Provider Profile Created',
            message=f'Your provider profile for {instance.business_name} has been created. Please complete verification to start receiving leads.',
            priority='high'
        )


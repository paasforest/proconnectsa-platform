from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Lead, LeadAssignment
from backend.notifications.models import Notification


@receiver(post_save, sender=Lead)
def create_lead_notification(sender, instance, created, **kwargs):
    """Create notification when lead is created"""
    if created:
        # Notify admins about new lead
        from backend.users.models import User
        admin_users = User.objects.filter(user_type='admin')
        
        for admin in admin_users:
            Notification.create_for_user(
                user=admin,
                notification_type='system_update',
                title='New Lead Created',
                message=f'New {instance.service_category.name} lead created in {instance.location_suburb}',
                lead=instance,
                priority='medium'
            )


@receiver(post_save, sender=LeadAssignment)
def create_assignment_notification(sender, instance, created, **kwargs):
    """Create notification when lead is assigned"""
    if created:
        Notification.create_for_user(
            user=instance.provider,
            notification_type='lead_assigned',
            title='New Lead Assigned',
            message=f'You have been assigned a new {instance.lead.service_category.name} lead in {instance.lead.location_suburb}',
            lead=instance.lead,
            lead_assignment=instance,
            priority='high'
        )


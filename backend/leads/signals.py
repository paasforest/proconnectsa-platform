from django.db.models.signals import post_save
import logging

logger = logging.getLogger(__name__)
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


@receiver(post_save, sender=Lead)
def auto_assign_lead_to_providers(sender, instance, created, **kwargs):
    """Automatically assign verified leads to matching providers using ML service"""
    if created and instance.status == 'verified':
        logger.info(f"🤖 AUTO-ASSIGNING LEAD: {instance.id} - {instance.title}")
        
        # Validate that the lead has a service category before attempting assignment
        if not instance.service_category:
            logger.error(f"❌ AUTO-ASSIGNMENT FAILED: Lead {instance.id} has no service category")
            return
        
        if not instance.service_category.is_active:
            logger.warning(f"⚠️  AUTO-ASSIGNMENT SKIPPED: Lead {instance.id} has inactive service category: {instance.service_category.name}")
            return
        
        try:
            from .services import LeadAssignmentService
            assignment_service = LeadAssignmentService()
            assignments = assignment_service.assign_lead_to_providers(instance.id)
            
            if assignments:
                logger.info(f"✅ AUTO-ASSIGNED: {len(assignments)} providers for lead {instance.id}")
                for assignment in assignments:
                    logger.info(f"   - {assignment.provider.first_name} {assignment.provider.last_name} ({assignment.provider.email})")
            else:
                logger.warning(f"⚠️  NO MATCHING PROVIDERS: Lead {instance.id} not assigned")
                
        except Exception as e:
            logger.error(f"❌ AUTO-ASSIGNMENT FAILED: Lead {instance.id} - {str(e)}")

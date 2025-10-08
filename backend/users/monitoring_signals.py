"""
Real-time monitoring signals to alert admin of new registrations and problems
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
import logging

from backend.users.models import User, ProviderProfile
from backend.payments.models import DepositRequest

logger = logging.getLogger(__name__)

ADMIN_EMAIL = 'admin@proconnectsa.co.za'  # Change this to your email


@receiver(post_save, sender=User)
def notify_admin_new_registration(sender, instance, created, **kwargs):
    """Send email alert when new user registers"""
    if created:
        logger.info(f"🆕 NEW USER REGISTERED: {instance.email} ({instance.user_type})")
        
        # Send email to admin
        try:
            subject = f"🆕 New {instance.user_type.title()} Registration"
            message = f"""
New user registered on ProConnectSA:

Email: {instance.email}
Name: {instance.first_name} {instance.last_name}
Type: {instance.user_type}
Phone: {instance.phone}
Registered: {instance.date_joined.strftime('%Y-%m-%d %H:%M:%S')}

Check full details: https://api.proconnectsa.co.za/admin/users/user/{instance.id}/

---
ProConnectSA Monitoring System
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [ADMIN_EMAIL],
                fail_silently=True,
            )
            logger.info(f"✅ Admin notified of new registration: {instance.email}")
        except Exception as e:
            logger.error(f"❌ Failed to send admin notification: {str(e)}")


@receiver(post_save, sender=DepositRequest)
def notify_admin_new_deposit(sender, instance, created, **kwargs):
    """Send email alert when new deposit is made"""
    if created:
        logger.info(f"💰 NEW DEPOSIT: {instance.account.user.email} - R{instance.amount}")
        
        try:
            subject = f"💰 New Deposit: R{instance.amount}"
            message = f"""
New deposit request on ProConnectSA:

Provider: {instance.account.user.email} ({instance.account.user.first_name} {instance.account.user.last_name})
Amount: R{instance.amount}
Credits: {instance.credits_to_activate}
Reference: {instance.reference_number}
Bank Reference: {instance.bank_reference}
Status: {instance.status}
Created: {instance.created_at.strftime('%Y-%m-%d %H:%M:%S')}

Check and approve: https://api.proconnectsa.co.za/admin/payments/depositrequest/{instance.id}/

---
ProConnectSA Monitoring System
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [ADMIN_EMAIL],
                fail_silently=True,
            )
            logger.info(f"✅ Admin notified of new deposit: R{instance.amount}")
        except Exception as e:
            logger.error(f"❌ Failed to send deposit notification: {str(e)}")


# Monitor login failures
class LoginFailureMonitor:
    """Track login failures and alert admin"""
    
    @staticmethod
    def record_failure(email, reason='Invalid credentials'):
        """Record a login failure"""
        logger.warning(f"🚫 LOGIN FAILED: {email} - {reason}")
        
        # Count recent failures for this email
        # TODO: Implement Redis counter for better performance
        
        # Alert admin if multiple failures
        # if failure_count >= 3:
        #     send_mail(...)


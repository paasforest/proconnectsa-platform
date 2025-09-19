import logging
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


class EmailService:
    """
    Email service for sending notifications and verification emails.
    Uses Django's built-in email functionality.
    """
    
    def __init__(self):
        self.from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@proconnectsa.co.za')
        self.support_email = getattr(settings, 'SUPPORT_EMAIL', 'support@proconnectsa.co.za')
    
    def send_email(self, to_email, subject, message, html_message=None):
        """
        Send email to a recipient.
        
        Args:
            to_email (str): Recipient email address
            subject (str): Email subject
            message (str): Plain text message
            html_message (str): HTML message (optional)
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            # In development, just log the email
            if settings.DEBUG:
                logger.info(f"Email to {to_email}: {subject} - {message}")
                return True
            
            # Send email
            send_mail(
                subject=subject,
                message=message,
                from_email=self.from_email,
                recipient_list=[to_email],
                html_message=html_message,
                fail_silently=False
            )
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {str(e)}")
            return False
    
    def send_verification_email(self, user):
        """Send email verification to user"""
        subject = "Verify Your ProConnectSA Account"
        
        # Generate verification link (this would be implemented with a proper token system)
        verification_link = f"{settings.FRONTEND_URL}/verify-email/{user.id}/"
        
        context = {
            'user': user,
            'verification_link': verification_link,
        }
        
        html_message = render_to_string('emails/verify_email.html', context)
        plain_message = strip_tags(html_message)
        
        return self.send_email(
            to_email=user.email,
            subject=subject,
            message=plain_message,
            html_message=html_message
        )
    
    def send_lead_notification(self, provider, lead):
        """Send lead assignment notification email to provider"""
        subject = f"New {lead.service_category.name} Lead in {lead.location_suburb}"
        
        context = {
            'provider': provider,
            'lead': lead,
            'dashboard_url': f"{settings.FRONTEND_URL}/provider/dashboard/",
        }
        
        html_message = render_to_string('emails/lead_notification.html', context)
        plain_message = strip_tags(html_message)
        
        return self.send_email(
            to_email=provider.email,
            subject=subject,
            message=plain_message,
            html_message=html_message
        )
    
    def send_welcome_email(self, user):
        """Send welcome email to new user"""
        subject = "Welcome to ProConnectSA!"
        
        context = {
            'user': user,
            'dashboard_url': f"{settings.FRONTEND_URL}/dashboard/",
        }
        
        html_message = render_to_string('emails/welcome.html', context)
        plain_message = strip_tags(html_message)
        
        return self.send_email(
            to_email=user.email,
            subject=subject,
            message=plain_message,
            html_message=html_message
        )
    
    def send_subscription_reminder(self, provider):
        """Send subscription expiry reminder"""
        subject = "Your ProConnectSA Subscription is Expiring Soon"
        
        context = {
            'provider': provider,
            'renewal_url': f"{settings.FRONTEND_URL}/provider/subscription/",
        }
        
        html_message = render_to_string('emails/subscription_reminder.html', context)
        plain_message = strip_tags(html_message)
        
        return self.send_email(
            to_email=provider.email,
            subject=subject,
            message=plain_message,
            html_message=html_message
        )
    
    def send_credit_low_notification(self, provider):
        """Send low credit balance notification"""
        subject = "Your ProConnectSA Credits are Running Low"
        
        context = {
            'provider': provider,
            'top_up_url': f"{settings.FRONTEND_URL}/provider/credits/",
        }
        
        html_message = render_to_string('emails/credit_low.html', context)
        plain_message = strip_tags(html_message)
        
        return self.send_email(
            to_email=provider.email,
            subject=subject,
            message=plain_message,
            html_message=html_message
        )
    
    def send_review_notification(self, provider, review):
        """Send new review notification to provider"""
        subject = f"New {review.rating}-Star Review Received"
        
        context = {
            'provider': provider,
            'review': review,
            'reviews_url': f"{settings.FRONTEND_URL}/provider/reviews/",
        }
        
        html_message = render_to_string('emails/new_review.html', context)
        plain_message = strip_tags(html_message)
        
        return self.send_email(
            to_email=provider.email,
            subject=subject,
            message=plain_message,
            html_message=html_message
        )



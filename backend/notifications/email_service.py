"""
Email service for ProConnectSA notifications
"""
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)

class EmailService:
    """Email service class for sending various types of emails"""
    
    def send_email(self, to_email, subject, html_content, text_content):
        """Send email with HTML and text content"""
        try:
            msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [to_email])
            msg.attach_alternative(html_content, "text/html")
            msg.send()
            logger.info(f"Email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    def send_verification_email(self, email, verification_code, verification_token):
        """Send email verification code"""
        try:
            subject = "🔐 Verify Your ProConnectSA Account"
            
            # HTML content
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify Your Account - ProConnectSA</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .verification-code {{ background: #10b981; color: white; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; letter-spacing: 3px; }}
                    .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Verify Your Account</h1>
                        <p>Welcome to ProConnectSA!</p>
                    </div>
                    <div class="content">
                        <h2>Email Verification Required</h2>
                        <p>Thank you for registering with ProConnectSA! To complete your registration and start using our platform, please verify your email address.</p>
                        
                        <div class="verification-code">
                            {verification_code}
                        </div>
                        
                        <p><strong>How to verify:</strong></p>
                        <ol>
                            <li>Copy the verification code above</li>
                            <li>Go to your ProConnectSA dashboard</li>
                            <li>Enter the code when prompted</li>
                            <li>Or click the verification link below</li>
                        </ol>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{settings.FRONTEND_URL}/verify-email?token={verification_token}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Verify Email Address</a>
                        </div>
                        
                        <p><strong>Important:</strong> This verification code will expire in 24 hours for security reasons.</p>
                        
                        <p>If you didn't create an account with ProConnectSA, please ignore this email.</p>
                        
                        <p>Best regards,<br>The ProConnectSA Team</p>
                    </div>
                    <div class="footer">
                        <p>ProConnectSA - Connecting you with the best service providers</p>
                        <p>Email: support@proconnectsa.co.za | Phone: +27 21 123 4567</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Plain text version
            text_content = f"""
            Verify Your ProConnectSA Account
            
            Welcome to ProConnectSA!
            
            Email Verification Required
            
            Thank you for registering with ProConnectSA! To complete your registration and start using our platform, please verify your email address.
            
            Verification Code: {verification_code}
            
            How to verify:
            1. Copy the verification code above
            2. Go to your ProConnectSA dashboard
            3. Enter the code when prompted
            4. Or visit: {settings.FRONTEND_URL}/verify-email?token={verification_token}
            
            Important: This verification code will expire in 24 hours for security reasons.
            
            If you didn't create an account with ProConnectSA, please ignore this email.
            
            Best regards,
            The ProConnectSA Team
            
            ProConnectSA - Connecting you with the best service providers
            Email: support@proconnectsa.co.za | Phone: +27 21 123 4567
            """
            
            return self.send_email(email, subject, html_content, text_content)
            
        except Exception as e:
            logger.error(f"Error sending verification email: {str(e)}")
            return False

    def send_password_reset_email(self, email, reset_code, reset_token):
        """Send password reset code via email"""
        try:
            subject = "🔑 Reset Your ProConnectSA Password"
            
            # HTML content
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .code-box {{ background: #e9ecef; border: 2px dashed #6c757d; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }}
                    .reset-code {{ font-size: 32px; font-weight: bold; color: #c0392b; letter-spacing: 5px; }}
                    .footer {{ text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }}
                    .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔑 Password Reset</h1>
                        <p>Secure Your Account</p>
                    </div>
                    <div class="content">
                        <h2>Reset Your Password</h2>
                        <p>We received a request to reset your ProConnectSA account password. Use the code below to verify your identity and set a new password:</p>
                        
                        <div class="code-box">
                            <p style="margin: 0; color: #6c757d;">Your password reset code is:</p>
                            <div class="reset-code">{reset_code}</div>
                            <p style="margin: 0; color: #6c757d; font-size: 14px;">This code expires in 30 minutes</p>
                        </div>
                        
                        <div class="warning">
                            <p><strong>⚠️ Security Alert:</strong></p>
                            <ul>
                                <li>This code is valid for 30 minutes only</li>
                                <li>Never share this code with anyone</li>
                                <li>If you didn't request this reset, please ignore this email</li>
                                <li>Your account remains secure until you complete the reset</li>
                            </ul>
                        </div>
                        
                        <p>After entering the code, you'll be able to set a new password for your account.</p>
                        
                        <div class="footer">
                            <p>Need help? Contact us at <a href="mailto:support@proconnectsa.co.za">support@proconnectsa.co.za</a></p>
                            <p>© 2024 ProConnectSA. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Plain text content
            text_content = f"""
            Password Reset - ProConnectSA
            
            We received a request to reset your ProConnectSA account password.
            
            Your password reset code is: {reset_code}
            
            This code expires in 30 minutes.
            
            Security Alert:
            - This code is valid for 30 minutes only
            - Never share this code with anyone
            - If you didn't request this reset, please ignore this email
            - Your account remains secure until you complete the reset
            
            After entering the code, you'll be able to set a new password for your account.
            
            Need help? Contact us at support@proconnectsa.co.za
            
            © 2024 ProConnectSA. All rights reserved.
            """
            
            # Send email
            success = self.send_email(
                to_email=email,
                subject=subject,
                html_content=html_content,
                text_content=text_content
            )
            
            if success:
                logger.info(f"Password reset email sent successfully to {email}")
                return True
            else:
                logger.error(f"Failed to send password reset email to {email}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to send password reset email: {str(e)}")
            return False

def send_welcome_email(user):
    """Send welcome email to new user"""
    try:
        subject = f"Welcome to ProConnectSA, {user.first_name}!"
        
        # HTML content
        html_content = render_to_string('emails/welcome.html', {
            'user': user,
            'site_url': settings.FRONTEND_URL,
        })
        
        # Plain text content
        text_content = f"""
        Welcome to ProConnectSA, {user.first_name}!
        
        Thank you for joining ProConnectSA, South Africa's leading service provider platform.
        
        Your account has been successfully created and you can now:
        - Browse and request services
        - Connect with verified providers
        - Track your service requests
        
        Visit {settings.FRONTEND_URL} to get started.
        
        Best regards,
        The ProConnectSA Team
        """
        
        msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [user.email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        
        logger.info(f"Welcome email sent to {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send welcome email to {user.email}: {str(e)}")
        return False

def send_lead_notification_email(provider, lead):
    """Send lead notification to a provider"""
    try:
        # Use SendGrid service if available, otherwise fall back to Django email
        try:
            from utils.sendgrid_service import sendgrid_service
            return sendgrid_service.send_lead_notification(provider, lead)
        except ImportError:
            logger.warning("SendGrid service not available, using Django email backend")
            # Fallback to Django email backend
            subject = f"New {lead.service_category.name} lead in {lead.location_city}"
            
            # HTML content
            html_content = render_to_string('emails/lead_notification.html', {
                'provider': provider,
                'lead': lead,
                'dashboard_url': f"{settings.FRONTEND_URL}/dashboard/leads/",
                'site_url': settings.FRONTEND_URL,
            })
            
            # Plain text content
            text_content = f"""
            New Lead Available: {lead.title}
            
            Service: {lead.service_category.name}
            Location: {lead.location_city}, {lead.location_suburb}
            Budget: {lead.budget_range}
            Urgency: {lead.urgency}
            
            Description:
            {lead.description}
            
            View and respond to this lead at {settings.FRONTEND_URL}/leads/{lead.id}
            
            Best regards,
            ProConnectSA Team
            """
            
            # Send to provider
            msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [provider.email])
            msg.attach_alternative(html_content, "text/html")
            msg.send()
            
            logger.info(f"Lead notification sent to {provider.email}")
            return True
        
    except Exception as e:
        logger.error(f"Failed to send lead notification: {str(e)}")
        return False

def send_manual_deposit_verification_email(deposit):
    """Send manual deposit verification email"""
    try:
        subject = f"Manual Deposit Verification - {deposit.reference_number}"
        
        # HTML content
        html_content = render_to_string('emails/manual_deposit_verification.html', {
            'deposit': deposit,
            'site_url': settings.FRONTEND_URL,
        })
        
        # Plain text content
        text_content = f"""
        Manual Deposit Verification Required
        
        Reference Number: {deposit.reference_number}
        Amount: R{deposit.amount}
        Credits to Activate: {deposit.credits_to_activate}
        Created: {deposit.created_at}
        Expires: {deposit.expires_at}
        
        Please verify this deposit in the admin panel.
        
        Admin Panel: {settings.FRONTEND_URL}/admin
        """
        
        # Send to admin users
        from django.contrib.auth import get_user_model
        User = get_user_model()
        admin_emails = User.objects.filter(is_staff=True).values_list('email', flat=True)
        
        for email in admin_emails:
            msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [email])
            msg.attach_alternative(html_content, "text/html")
            msg.send()
        
        logger.info(f"Manual deposit verification email sent for {deposit.reference_number}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send manual deposit verification email: {str(e)}")
        return False

def send_deposit_verified_email(deposit):
    """Send deposit verified email to provider"""
    try:
        subject = f"Deposit Verified - {deposit.reference_number}"
        
        # HTML content
        html_content = render_to_string('emails/deposit_verified.html', {
            'deposit': deposit,
            'site_url': settings.FRONTEND_URL,
        })
        
        # Plain text content
        text_content = f"""
        Deposit Verified Successfully
        
        Reference Number: {deposit.reference_number}
        Amount: R{deposit.amount}
        Credits Activated: {deposit.credits_to_activate}
        
        Your deposit has been verified and {deposit.credits_to_activate} credits have been added to your account.
        
        View your account at {settings.FRONTEND_URL}/dashboard
        
        Best regards,
        ProConnectSA Team
        """
        
        msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [deposit.provider.email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        
        logger.info(f"Deposit verified email sent to {deposit.provider.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send deposit verified email: {str(e)}")
        return False


def send_quote_received_email(client, lead, provider, quote_details=None):
    """Send email to client when they receive a quote"""
    try:
        subject = f"📋 New Quote Received for {lead.title}"
        
        # HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .quote-card {{ background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                .provider-info {{ background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 10px 0; }}
                .button {{ display: inline-block; background: #2ecc71; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📋 New Quote Received!</h1>
                    <p>You have a new quote for your service request</p>
                </div>
                <div class="content">
                    <h2>Hi {client.first_name},</h2>
                    <p>Great news! You have received a new quote for your service request.</p>
                    
                    <div class="quote-card">
                        <h3>{lead.title}</h3>
                        <div class="provider-info">
                            <h4>Quote from: {provider.first_name} {provider.last_name}</h4>
                            <p>Service Provider</p>
                        </div>
                        {f'<p><strong>Quote Details:</strong> {quote_details}</p>' if quote_details else ''}
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="{settings.FRONTEND_URL}/dashboard/client/leads" class="button">View All Quotes</a>
                    </div>
                    
                    <p><strong>Next Steps:</strong></p>
                    <ul>
                        <li>Review the quote details carefully</li>
                        <li>Contact the provider if you have questions</li>
                        <li>Compare with other quotes you receive</li>
                        <li>Make your decision when ready</li>
                    </ul>
                    
                    <p>Best regards,<br>The ProConnectSA Team</p>
                </div>
                <div class="footer">
                    <p>ProConnectSA - Connecting you with the best service providers</p>
                    <p>Email: support@proconnectsa.co.za | Phone: +27 21 123 4567</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text content
        text_content = f"""
        New Quote Received for {lead.title}
        
        Hi {client.first_name},
        
        Great news! You have received a new quote for your service request.
        
        Quote from: {provider.first_name} {provider.last_name}
        Service: {lead.title}
        {f'Quote Details: {quote_details}' if quote_details else ''}
        
        Please log in to your dashboard to view the full quote details and contact the provider.
        
        Dashboard: {settings.FRONTEND_URL}/dashboard/client/leads
        
        Best regards,
        The ProConnectSA Team
        """
        
        msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [client.email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        
        logger.info(f"Quote received email sent to {client.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send quote received email: {str(e)}")
        return False


def send_lead_verification_email(client, lead, verification_code):
    """Send lead verification email to client"""
    try:
        subject = f"🔐 Verify Your Service Request: {lead.title}"
        
        # HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .verification-code {{ background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 8px; font-size: 24px; font-weight: bold; margin: 20px 0; }}
                .button {{ display: inline-block; background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Verify Your Service Request</h1>
                    <p>Please verify your phone number to complete your request</p>
                </div>
                <div class="content">
                    <h2>Hi {client.first_name},</h2>
                    <p>Thank you for submitting your service request: <strong>{lead.title}</strong></p>
                    
                    <p>To ensure the security of our platform and provide you with the best service, please verify your phone number using the code below:</p>
                    
                    <div class="verification-code">
                        {verification_code}
                    </div>
                    
                    <p>This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.</p>
                    
                    <div style="text-align: center;">
                        <a href="{settings.FRONTEND_URL}/verify-lead/{lead.id}" class="button">Verify Now</a>
                    </div>
                    
                    <p>Best regards,<br>The ProConnectSA Team</p>
                </div>
                <div class="footer">
                    <p>ProConnectSA - Connecting you with the best service providers</p>
                    <p>Email: support@proconnectsa.co.za | Phone: +27 21 123 4567</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text content
        text_content = f"""
        Verify Your Service Request: {lead.title}
        
        Hi {client.first_name},
        
        Thank you for submitting your service request: {lead.title}
        
        To ensure the security of our platform, please verify your phone number using this code:
        
        Verification Code: {verification_code}
        
        This code will expire in 10 minutes.
        
        Verify now: {settings.FRONTEND_URL}/verify-lead/{lead.id}
        
        Best regards,
        The ProConnectSA Team
        """
        
        msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [client.email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        
        logger.info(f"Lead verification email sent to {client.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send lead verification email: {str(e)}")
        return False


def send_verification_email(email, verification_code, verification_token):
    """Send email verification code"""
    try:
        subject = "🔐 Verify Your ProConnectSA Account"
        
        # HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }}
                .code-box {{ background: #e9ecef; border: 2px dashed #6c757d; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }}
                .verification-code {{ font-size: 32px; font-weight: bold; color: #8e44ad; letter-spacing: 5px; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }}
                .button {{ display: inline-block; background: #8e44ad; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Email Verification</h1>
                    <p>Welcome to ProConnectSA!</p>
                </div>
                <div class="content">
                    <h2>Verify Your Email Address</h2>
                    <p>Thank you for signing up with ProConnectSA! To complete your registration and secure your account, please verify your email address using the code below:</p>
                    
                    <div class="code-box">
                        <p style="margin: 0; color: #6c757d;">Your verification code is:</p>
                        <div class="verification-code">{verification_code}</div>
                        <p style="margin: 0; color: #6c757d; font-size: 14px;">This code expires in 30 minutes</p>
                    </div>
                    
                    <p><strong>Important Security Information:</strong></p>
                    <ul>
                        <li>This code is valid for 30 minutes only</li>
                        <li>Never share this code with anyone</li>
                        <li>ProConnectSA will never ask for your verification code via phone or email</li>
                    </ul>
                    
                    <p>If you didn't create an account with ProConnectSA, please ignore this email.</p>
                    
                    <div class="footer">
                        <p>Need help? Contact us at <a href="mailto:support@proconnectsa.co.za">support@proconnectsa.co.za</a></p>
                        <p>© 2024 ProConnectSA. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text content
        text_content = f"""
        Email Verification - ProConnectSA
        
        Welcome to ProConnectSA!
        
        To complete your registration and secure your account, please verify your email address using the code below:
        
        Verification Code: {verification_code}
        
        This code expires in 30 minutes.
        
        Important Security Information:
        - This code is valid for 30 minutes only
        - Never share this code with anyone
        - ProConnectSA will never ask for your verification code via phone or email
        
        If you didn't create an account with ProConnectSA, please ignore this email.
        
        Need help? Contact us at support@proconnectsa.co.za
        
        © 2024 ProConnectSA. All rights reserved.
        """
        
        # Send email
        email_service = EmailService()
        success = email_service.send_email(
            to_email=email,
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )
        
        if success:
            logger.info(f"Email verification sent successfully to {email}")
            return True
        else:
            logger.error(f"Failed to send email verification to {email}")
            return False
            
    except Exception as e:
        logger.error(f"Failed to send email verification: {str(e)}")
        return False


def send_password_reset_email(email, reset_code, reset_token):
    """Send password reset code via email"""
    try:
        subject = "🔑 Reset Your ProConnectSA Password"
        
        # HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }}
                .code-box {{ background: #e9ecef; border: 2px dashed #6c757d; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }}
                .reset-code {{ font-size: 32px; font-weight: bold; color: #c0392b; letter-spacing: 5px; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }}
                .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔑 Password Reset</h1>
                    <p>Secure Your Account</p>
                </div>
                <div class="content">
                    <h2>Reset Your Password</h2>
                    <p>We received a request to reset your ProConnectSA account password. Use the code below to verify your identity and set a new password:</p>
                    
                    <div class="code-box">
                        <p style="margin: 0; color: #6c757d;">Your password reset code is:</p>
                        <div class="reset-code">{reset_code}</div>
                        <p style="margin: 0; color: #6c757d; font-size: 14px;">This code expires in 30 minutes</p>
                    </div>
                    
                    <div class="warning">
                        <p><strong>⚠️ Security Alert:</strong></p>
                        <ul>
                            <li>This code is valid for 30 minutes only</li>
                            <li>Never share this code with anyone</li>
                            <li>If you didn't request this reset, please ignore this email</li>
                            <li>Your account remains secure until you complete the reset</li>
                        </ul>
                    </div>
                    
                    <p>After entering the code, you'll be able to set a new password for your account.</p>
                    
                    <div class="footer">
                        <p>Need help? Contact us at <a href="mailto:support@proconnectsa.co.za">support@proconnectsa.co.za</a></p>
                        <p>© 2024 ProConnectSA. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text content
        text_content = f"""
        Password Reset - ProConnectSA
        
        We received a request to reset your ProConnectSA account password.
        
        Your password reset code is: {reset_code}
        
        This code expires in 30 minutes.
        
        Security Alert:
        - This code is valid for 30 minutes only
        - Never share this code with anyone
        - If you didn't request this reset, please ignore this email
        - Your account remains secure until you complete the reset
        
        After entering the code, you'll be able to set a new password for your account.
        
        Need help? Contact us at support@proconnectsa.co.za
        
        © 2024 ProConnectSA. All rights reserved.
        """
        
        # Use SendGrid service if available, otherwise fall back to Django email
        try:
            from utils.sendgrid_service import sendgrid_service
            return sendgrid_service.send_password_reset_email(email, reset_code, reset_token)
        except ImportError:
            logger.warning("SendGrid service not available, using Django email backend")
            # Fallback to Django email backend
            email_service = EmailService()
            success = email_service.send_email(
                to_email=email,
                subject=subject,
                html_content=html_content,
                text_content=text_content
            )
            
            if success:
                logger.info(f"Password reset email sent successfully to {email}")
                return True
            else:
                logger.error(f"Failed to send password reset email to {email}")
                return False
            
    except Exception as e:
        logger.error(f"Failed to send password reset email: {str(e)}")
        return False


def send_credit_purchase_confirmation(provider, amount, credits):
    """Send credit purchase confirmation email"""
    try:
        subject = f"💳 Credit Purchase Confirmed - {credits} credits added"
        
        # HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .transaction-card {{ background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                .button {{ display: inline-block; background: #9b59b6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>💳 Credit Purchase Confirmed</h1>
                    <p>Your credits have been successfully added</p>
                </div>
                <div class="content">
                    <h2>Hi {provider.first_name},</h2>
                    <p>Your credit purchase has been processed successfully!</p>
                    
                    <div class="transaction-card">
                        <h3>Transaction Details</h3>
                        <p><strong>Amount Paid:</strong> R{amount:.2f}</p>
                        <p><strong>Credits Added:</strong> {credits}</p>
                        <p><strong>Date:</strong> {timezone.now().strftime('%B %d, %Y at %I:%M %p')}</p>
                        <p><strong>New Balance:</strong> {provider.provider_profile.credit_balance + credits} credits</p>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="{settings.FRONTEND_URL}/dashboard/provider/credits" class="button">View Credit Balance</a>
                    </div>
                    
                    <p>You can now use these credits to purchase high-quality leads and grow your business!</p>
                    
                    <p>Best regards,<br>The ProConnectSA Team</p>
                </div>
                <div class="footer">
                    <p>ProConnectSA - Connecting you with the best service providers</p>
                    <p>Email: support@proconnectsa.co.za | Phone: +27 21 123 4567</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text content
        text_content = f"""
        Credit Purchase Confirmed - {credits} credits added
        
        Hi {provider.first_name},
        
        Your credit purchase has been processed successfully!
        
        Transaction Details:
        - Amount Paid: R{amount:.2f}
        - Credits Added: {credits}
        - Date: {timezone.now().strftime('%B %d, %Y at %I:%M %p')}
        - New Balance: {provider.provider_profile.credit_balance + credits} credits
        
        View your account: {settings.FRONTEND_URL}/dashboard/provider/credits
        
        Best regards,
        The ProConnectSA Team
        """
        
        msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [provider.email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        
        logger.info(f"Credit purchase confirmation email sent to {provider.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send credit purchase confirmation email: {str(e)}")
        return False


def send_quote_response_notification(client, lead, provider, quote_details):
    """Send email to client when provider responds to quote request"""
    try:
        subject = f"💬 Provider Response: {provider.first_name} {provider.last_name} - {lead.title}"
        
        # HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .response-card {{ background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                .provider-info {{ background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }}
                .quote-details {{ background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #28a745; }}
                .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>💬 Provider Response Received!</h1>
                    <p>A service provider has responded to your quote request</p>
                </div>
                <div class="content">
                    <h2>Hi {client.first_name},</h2>
                    <p>Great news! A service provider has responded to your quote request.</p>
                    
                    <div class="response-card">
                        <h3>{lead.title}</h3>
                        <div class="provider-info">
                            <h4>Response from: {provider.first_name} {provider.last_name}</h4>
                            <p>Service Provider</p>
                        </div>
                        <div class="quote-details">
                            <h4>Provider Response:</h4>
                            <p>{quote_details}</p>
                        </div>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="{settings.FRONTEND_URL}/dashboard/client/leads" class="button">View Response</a>
                    </div>
                    
                    <p><strong>Next Steps:</strong></p>
                    <ul>
                        <li>Review the provider's response and quote details</li>
                        <li>Contact the provider directly if you have questions</li>
                        <li>Compare with other responses you receive</li>
                        <li>Make your decision when ready</li>
                    </ul>
                    
                    <p>Best regards,<br>The ProConnectSA Team</p>
                </div>
                <div class="footer">
                    <p>ProConnectSA - Connecting you with the best service providers</p>
                    <p>Email: support@proconnectsa.co.za | Phone: +27 21 123 4567</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text content
        text_content = f"""
        Provider Response: {provider.first_name} {provider.last_name} - {lead.title}
        
        Hi {client.first_name},
        
        Great news! A service provider has responded to your quote request.
        
        Service: {lead.title}
        Provider: {provider.first_name} {provider.last_name}
        Response: {quote_details}
        
        Please log in to your dashboard to view the full response and contact the provider.
        
        Dashboard: {settings.FRONTEND_URL}/dashboard/client/leads
        
        Best regards,
        The ProConnectSA Team
        """
        
        msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [client.email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        
        logger.info(f"Quote response notification sent to {client.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send quote response notification: {str(e)}")
        return False


def send_deposit_notification(provider, deposit, credits_added):
    """Send deposit notification email"""
    try:
        subject = f"💰 Deposit Processed - {credits_added} credits added"
        
        # HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .deposit-card {{ background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                .button {{ display: inline-block; background: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>💰 Deposit Processed Successfully!</h1>
                    <p>{credits_added} credits have been added to your account</p>
                </div>
                <div class="content">
                    <h2>Hi {provider.first_name},</h2>
                    <p>Your deposit has been processed and your credits have been activated!</p>
                    
                    <div class="deposit-card">
                        <h3>Transaction Details</h3>
                        <p><strong>Amount Deposited:</strong> R{deposit.amount:.2f}</p>
                        <p><strong>Credits Added:</strong> {credits_added}</p>
                        <p><strong>Reference:</strong> {deposit.reference_number}</p>
                        <p><strong>Date Processed:</strong> {timezone.now().strftime('%B %d, %Y at %I:%M %p')}</p>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="{settings.FRONTEND_URL}/dashboard" class="button">View Dashboard</a>
                    </div>
                    
                    <p>You can now use these credits to purchase high-quality leads and grow your business!</p>
                    
                    <p>Best regards,<br>The ProConnectSA Team</p>
                </div>
                <div class="footer">
                    <p>ProConnectSA - Connecting you with the best service providers</p>
                    <p>Email: support@proconnectsa.co.za | Phone: +27 21 123 4567</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text content
        text_content = f"""
        Deposit Processed - {credits_added} credits added
        
        Hi {provider.first_name},
        
        Your deposit has been processed and your credits have been activated!
        
        Transaction Details:
        - Amount Deposited: R{deposit.amount:.2f}
        - Credits Added: {credits_added}
        - Reference: {deposit.reference_number}
        - Date Processed: {timezone.now().strftime('%B %d, %Y at %I:%M %p')}
        
        View your dashboard: {settings.FRONTEND_URL}/dashboard
        
        You can now use these credits to purchase high-quality leads and grow your business!
        
        Best regards,
        The ProConnectSA Team
        """
        
        msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [provider.email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        
        logger.info(f"Deposit notification email sent to {provider.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send deposit notification email: {str(e)}")
        return False


def send_manual_deposit_instructions(provider, deposit):
    """Send manual deposit instructions email"""
    try:
        subject = f"💰 Manual Deposit Instructions - Reference: {deposit.reference_number}"
        
        # HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #e67e22 0%, #d35400 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .deposit-card {{ background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                .reference-code {{ background: #2c3e50; color: white; padding: 15px; text-align: center; border-radius: 8px; font-size: 18px; font-weight: bold; margin: 20px 0; }}
                .steps {{ background: #ecf0f1; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                .button {{ display: inline-block; background: #e67e22; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>💰 Manual Deposit Instructions</h1>
                    <p>Complete your deposit to activate {deposit.credits_to_activate} credits</p>
                </div>
                <div class="content">
                    <h2>Hi {provider.first_name},</h2>
                    <p>Thank you for choosing manual deposit. Please follow the instructions below to complete your payment.</p>
                    
                    <div class="deposit-card">
                        <h3>Deposit Details</h3>
                        <p><strong>Amount to Deposit:</strong> R{deposit.amount:.2f}</p>
                        <p><strong>Credits to Activate:</strong> {deposit.credits_to_activate}</p>
                        <p><strong>Reference Number:</strong></p>
                        <div class="reference-code">{deposit.reference_number}</div>
                    </div>
                    
                    <div class="steps">
                        <h3>How to Complete Your Deposit:</h3>
                        <ol>
                            <li>Go to any ATM or bank branch</li>
                            <li>Make a cash deposit of R{deposit.amount:.2f}</li>
                            <li>Use the reference number: <strong>{deposit.reference_number}</strong></li>
                            <li>Take a photo of the deposit slip</li>
                            <li>Upload the deposit slip using the button below</li>
                        </ol>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="{settings.FRONTEND_URL}/dashboard/provider/credits" class="button">Upload Deposit Slip</a>
                    </div>
                    
                    <p><strong>Important:</strong> Your credits will be activated within 24 hours after we verify your deposit.</p>
                    
                    <p>Best regards,<br>The ProConnectSA Team</p>
                </div>
                <div class="footer">
                    <p>ProConnectSA - Connecting you with the best service providers</p>
                    <p>Email: support@proconnectsa.co.za | Phone: +27 21 123 4567</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text content
        text_content = f"""
        Manual Deposit Instructions - Reference: {deposit.reference_number}
        
        Hi {provider.first_name},
        
        Thank you for choosing manual deposit. Please follow the instructions below to complete your payment.
        
        Deposit Details:
        - Amount to Deposit: R{deposit.amount:.2f}
        - Credits to Activate: {deposit.credits_to_activate}
        - Reference Number: {deposit.reference_number}
        
        How to Complete Your Deposit:
        1. Go to any ATM or bank branch
        2. Make a cash deposit of R{deposit.amount:.2f}
        3. Use the reference number: {deposit.reference_number}
        4. Take a photo of the deposit slip
        5. Upload the deposit slip at: {settings.FRONTEND_URL}/dashboard/provider/credits
        
        Important: Your credits will be activated within 24 hours after we verify your deposit.
        
        Best regards,
        The ProConnectSA Team
        """
        
        msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [provider.email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        
        logger.info(f"Manual deposit instructions email sent to {provider.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send manual deposit instructions email: {str(e)}")
        return False
    
    def send_business_registration_confirmation(self, email, registration_data):
        """Send business registration confirmation email to customer"""
        try:
            subject = f"🎉 Business Registration Confirmed - {registration_data['registration_id']}"
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .info-box {{ background: #e7f5ff; border: 1px solid #74c0fc; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                    .payment-box {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                    .bank-details {{ background: white; border: 1px solid #dee2e6; padding: 15px; border-radius: 6px; margin: 10px 0; }}
                    .reference {{ font-size: 24px; font-weight: bold; color: #059669; text-align: center; padding: 10px; background: #d1fae5; border-radius: 6px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Registration Confirmed!</h1>
                        <p>Your business registration has been submitted successfully</p>
                    </div>
                    <div class="content">
                        <h2>Hello {registration_data['owner_name']},</h2>
                        <p>Thank you for choosing ProConnectSA for your business registration. We've received your application for <strong>{registration_data['business_name']}</strong>.</p>
                        
                        <div class="info-box">
                            <h3>📋 Registration Details</h3>
                            <p><strong>Registration ID:</strong> {registration_data['registration_id']}</p>
                            <p><strong>Business Name:</strong> {registration_data['business_name']}</p>
                            <p><strong>Amount:</strong> R{registration_data['payment_amount']}</p>
                            <p><strong>Includes:</strong> FREE Professional Website (R3,500 value)</p>
                        </div>
                        
                        <div class="payment-box">
                            <h3>💳 Complete Your Payment</h3>
                            <p>To proceed with your registration, please transfer the payment to our Nedbank account:</p>
                            
                            <div class="bank-details">
                                <p><strong>Bank:</strong> {registration_data['bank_details']['bank']}</p>
                                <p><strong>Account Name:</strong> {registration_data['bank_details']['account_name']}</p>
                                <p><strong>Account Number:</strong> {registration_data['bank_details']['account_number']}</p>
                                <p><strong>Branch Code:</strong> {registration_data['bank_details']['branch_code']}</p>
                            </div>
                            
                            <div class="reference">
                                Payment Reference: {registration_data['payment_reference']}
                            </div>
                        </div>
                        
                        <div class="info-box">
                            <h3>📅 What Happens Next?</h3>
                            <ul>
                                <li>We'll verify your payment within 2-4 hours during business hours</li>
                                <li>Our team will contact you within 24 hours to confirm details</li>
                                <li>CIPC registration process begins immediately after payment</li>
                                <li>Your FREE website development starts within 2 business days</li>
                            </ul>
                        </div>
                        
                        <p>Questions? Contact us at <strong>support@proconnectsa.co.za</strong> or <strong>0800 123 456</strong></p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            text_content = f"""
            Business Registration Confirmed - {registration_data['registration_id']}
            
            Hello {registration_data['owner_name']},
            
            Thank you for choosing ProConnectSA. We've received your application for {registration_data['business_name']}.
            
            Registration Details:
            - Registration ID: {registration_data['registration_id']}
            - Business Name: {registration_data['business_name']}
            - Amount: R{registration_data['payment_amount']}
            - Includes: FREE Professional Website (R3,500 value)
            
            Payment Details:
            Bank: {registration_data['bank_details']['bank']}
            Account Name: {registration_data['bank_details']['account_name']}
            Account Number: {registration_data['bank_details']['account_number']}
            Branch Code: {registration_data['bank_details']['branch_code']}
            Payment Reference: {registration_data['payment_reference']}
            
            Questions? Contact us at support@proconnectsa.co.za or 0800 123 456
            
            Thank you for choosing ProConnectSA!
            """
            
            return self.send_email(email, subject, html_content, text_content)
            
        except Exception as e:
            logger.error(f"Failed to send business registration confirmation: {e}")
            return False
    
    def send_business_registration_notification(self, admin_email, registration_data):
        """Send business registration notification to admin"""
        try:
            subject = f"🔔 New Business Registration - {registration_data['business_name']}"
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <body>
                <h2>🔔 New Business Registration</h2>
                <p><strong>Registration ID:</strong> {registration_data['registration_id']}</p>
                <p><strong>Business Name:</strong> {registration_data['business_name']}</p>
                <p><strong>Owner:</strong> {registration_data['owner_name']}</p>
                <p><strong>Email:</strong> {registration_data['email']}</p>
                <p><strong>Phone:</strong> {registration_data['phone']}</p>
                <p><strong>Payment Amount:</strong> R{registration_data['payment_amount']}</p>
                <p><strong>Payment Reference:</strong> {registration_data['phone']}</p>
                <p><strong>Urgency:</strong> {registration_data['urgency']}</p>
                
                <h3>⚡ Action Required</h3>
                <p>Please review this registration in the admin panel and verify payment.</p>
            </body>
            </html>
            """
            
            text_content = f"""
            New Business Registration - {registration_data['registration_id']}
            
            Business Name: {registration_data['business_name']}
            Owner: {registration_data['owner_name']}
            Email: {registration_data['email']}
            Phone: {registration_data['phone']}
            Payment Amount: R{registration_data['payment_amount']}
            Payment Reference: {registration_data['phone']}
            
            Please review in admin panel and verify payment.
            """
            
            return self.send_email(admin_email, subject, html_content, text_content)
            
        except Exception as e:
            logger.error(f"Failed to send business registration notification: {e}")
            return False

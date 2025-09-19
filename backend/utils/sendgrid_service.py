"""
SendGrid Email Service for ProConnectSA
Enhanced email delivery with SendGrid API
"""
import logging
import os
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from decouple import config

logger = logging.getLogger(__name__)


class SendGridEmailService:
    """
    Enhanced email service using SendGrid API for reliable email delivery
    """
    
    def __init__(self):
        self.api_key = config('SENDGRID_API_KEY', default='')
        self.from_email = config('DEFAULT_FROM_EMAIL', default='noreply@proconnectsa.co.za')
        self.support_email = config('SUPPORT_EMAIL', default='support@proconnectsa.co.za')
        
        if not self.api_key:
            logger.warning("SendGrid API key not configured. Emails will not be sent.")
            self.client = None
        else:
            self.client = SendGridAPIClient(api_key=self.api_key)
    
    def send_email(self, to_email, subject, html_content, text_content=None):
        """
        Send email using SendGrid API
        
        Args:
            to_email (str): Recipient email address
            subject (str): Email subject
            html_content (str): HTML email content
            text_content (str): Plain text content (optional)
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        if not self.client:
            logger.error("SendGrid client not initialized. Check API key configuration.")
            return False
            
        try:
            # Create email message
            from_email = Email(self.from_email)
            to_email = To(to_email)
            
            # Create mail object
            mail = Mail(
                from_email=from_email,
                to_emails=to_email,
                subject=subject,
                html_content=html_content
            )
            
            # Add plain text version if provided
            if text_content:
                mail.add_content(Content("text/plain", text_content))
            
            # Send email
            response = self.client.send(mail)
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"Email sent successfully to {to_email} via SendGrid")
                return True
            else:
                logger.error(f"SendGrid API error: {response.status_code} - {response.body}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending email via SendGrid: {str(e)}")
            return False
    
    def send_welcome_email(self, user):
        """Send welcome email to new user"""
        try:
            subject = f"🎉 Welcome to ProConnectSA, {user.first_name}!"
            
            # Render HTML template
            html_content = render_to_string('emails/welcome.html', {
                'user': user,
                'dashboard_url': f"{settings.FRONTEND_URL}/dashboard/",
                'site_url': settings.FRONTEND_URL,
            })
            
            # Create plain text version
            text_content = f"""
Welcome to ProConnectSA, {user.first_name}!

Thank you for joining ProConnectSA, South Africa's leading service provider platform.

Your account has been successfully created and you can now:
- Browse and request services from verified professionals
- Connect with quality service providers in your area
- Track your service requests and communications

Visit {settings.FRONTEND_URL}/dashboard to get started.

Best regards,
The ProConnectSA Team

---
ProConnectSA - Connecting you with the best service providers
Email: support@proconnectsa.co.za | Phone: +27 21 123 4567
            """
            
            return self.send_email(user.email, subject, html_content, text_content)
            
        except Exception as e:
            logger.error(f"Error sending welcome email: {str(e)}")
            return False
    
    def send_lead_notification(self, provider, lead):
        """Send lead notification to provider"""
        try:
            subject = f"🔔 New {lead.service_category.name} Lead in {lead.location_suburb}"
            
            # Render HTML template
            html_content = render_to_string('emails/lead_notification.html', {
                'provider': provider,
                'lead': lead,
                'dashboard_url': f"{settings.FRONTEND_URL}/dashboard/leads/",
                'site_url': settings.FRONTEND_URL,
            })
            
            # Create plain text version
            text_content = f"""
New Lead Available: {lead.title}

Hello {provider.first_name},

A new lead matching your services is now available in your area.

Service: {lead.service_category.name}
Location: {lead.location_suburb}, {lead.location_city}
Budget: {lead.budget_range}
Urgency: {lead.urgency}

Description:
{lead.description}

This lead is available for preview in your dashboard. You can unlock it to get full client contact details.

View Lead: {settings.FRONTEND_URL}/dashboard/leads/

Cost: 1-3 credits (R50-R150) to unlock full contact details

Best regards,
The ProConnectSA Team
            """
            
            return self.send_email(provider.email, subject, html_content, text_content)
            
        except Exception as e:
            logger.error(f"Error sending lead notification: {str(e)}")
            return False
    
    def send_verification_email(self, user, verification_code):
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
                <title>Verify Your Email - ProConnectSA</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .code-box {{ background: #e5e7eb; border: 2px dashed #6b7280; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }}
                    .verification-code {{ font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 5px; }}
                    .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
                    .button {{ display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }}
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
                            <p style="margin: 0; color: #6b7280;">Your verification code is:</p>
                            <div class="verification-code">{verification_code}</div>
                            <p style="margin: 0; color: #6b7280; font-size: 14px;">This code expires in 30 minutes</p>
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
            
            # Plain text version
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
            
            return self.send_email(user.email, subject, html_content, text_content)
            
        except Exception as e:
            logger.error(f"Error sending verification email: {str(e)}")
            return False
    
    def send_quote_notification(self, client, lead, provider, quote_details):
        """Send quote notification to client"""
        try:
            subject = f"📋 New Quote Received for {lead.title}"
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Quote Received - ProConnectSA</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .quote-card {{ background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                    .provider-info {{ background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 10px 0; }}
                    .button {{ display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                    .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
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
                                <p>Verified Service Provider</p>
                            </div>
                            <p><strong>Quote Details:</strong> {quote_details}</p>
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
            
            text_content = f"""
New Quote Received for {lead.title}

Hi {client.first_name},

Great news! You have received a new quote for your service request.

Quote from: {provider.first_name} {provider.last_name}
Service: {lead.title}
Quote Details: {quote_details}

Please log in to your dashboard to view the full quote details and contact the provider.

Dashboard: {settings.FRONTEND_URL}/dashboard/client/leads

Best regards,
The ProConnectSA Team
            """
            
            return self.send_email(client.email, subject, html_content, text_content)
            
        except Exception as e:
            logger.error(f"Error sending quote notification: {str(e)}")
            return False
    
    def test_email_delivery(self, test_email):
        """Test SendGrid email delivery"""
        try:
            subject = "🧪 ProConnectSA Email Test"
            
            html_content = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Email Test - ProConnectSA</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px; }
                    .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin-top: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🧪 Email System Test</h1>
                        <p>ProConnectSA</p>
                    </div>
                    <div class="content">
                        <h2>Email Delivery Test Successful!</h2>
                        <p>This is a test email to verify that your SendGrid integration is working correctly.</p>
                        <p><strong>✅ SendGrid Configuration:</strong> Working</p>
                        <p><strong>✅ Email Templates:</strong> Rendering correctly</p>
                        <p><strong>✅ Email Delivery:</strong> Successful</p>
                        <p>Your ProConnectSA email system is ready for production!</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            text_content = """
Email Delivery Test Successful!

This is a test email to verify that your SendGrid integration is working correctly.

✅ SendGrid Configuration: Working
✅ Email Templates: Rendering correctly  
✅ Email Delivery: Successful

Your ProConnectSA email system is ready for production!
            """
            
            return self.send_email(test_email, subject, html_content, text_content)
            
        except Exception as e:
            logger.error(f"Error sending test email: {str(e)}")
            return False


# Initialize the service
sendgrid_service = SendGridEmailService()





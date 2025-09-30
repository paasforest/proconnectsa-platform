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
            
            # HTML content
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Lead Available - ProConnectSA</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .lead-card {{ background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                    .lead-details {{ background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 10px 0; }}
                    .urgency-high {{ color: #dc2626; font-weight: bold; }}
                    .urgency-medium {{ color: #f59e0b; font-weight: bold; }}
                    .urgency-low {{ color: #10b981; font-weight: bold; }}
                    .button {{ display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                    .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
                    .cost-info {{ background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 15px 0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔔 New Lead Available!</h1>
                        <p>Hello {provider.first_name}, a new lead matches your services</p>
                    </div>
                    <div class="content">
                        <h2>Lead Details</h2>
                        
                        <div class="lead-card">
                            <h3>{lead.title}</h3>
                            <div class="lead-details">
                                <p><strong>Service:</strong> {lead.service_category.name}</p>
                                <p><strong>Location:</strong> {lead.location_suburb}, {lead.location_city}</p>
                                <p><strong>Budget:</strong> {lead.budget_range}</p>
                                <p><strong>Urgency:</strong> <span class="urgency-{lead.urgency.lower()}">{lead.urgency}</span></p>
                            </div>
                            
                            <h4>Description:</h4>
                            <p>{lead.description}</p>
                        </div>
                        
                        <div class="cost-info">
                            <p><strong>💰 Cost to Unlock:</strong> 1-3 credits (R50-R150) to get full client contact details</p>
                            <p><strong>⏰ Time Sensitive:</strong> Other providers are also being notified</p>
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="{settings.FRONTEND_URL}/dashboard/leads/" class="button">View Lead in Dashboard</a>
                        </div>
                        
                        <p><strong>Next Steps:</strong></p>
                        <ol>
                            <li>Log in to your ProConnectSA dashboard</li>
                            <li>Review the lead details</li>
                            <li>Unlock the lead to get client contact information</li>
                            <li>Contact the client to provide your quote</li>
                        </ol>
                        
                        <p>This lead is available for preview in your dashboard. You can unlock it to get full client contact details and start the quoting process.</p>
                        
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

Next Steps:
1. Log in to your ProConnectSA dashboard
2. Review the lead details
3. Unlock the lead to get client contact information
4. Contact the client to provide your quote

Best regards,
The ProConnectSA Team

ProConnectSA - Connecting you with the best service providers
Email: support@proconnectsa.co.za | Phone: +27 21 123 4567
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
    
    def send_password_reset_email(self, email, reset_code, reset_token):
        """Send password reset code via email"""
        try:
            subject = "🔑 Reset Your ProConnectSA Password"
            
            # HTML content
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset - ProConnectSA</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .code-box {{ background: #e9ecef; border: 2px dashed #6c757d; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }}
                    .reset-code {{ font-size: 32px; font-weight: bold; color: #c0392b; letter-spacing: 5px; }}
                    .footer {{ text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }}
                    .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }}
                    .button {{ display: inline-block; background: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔑 Password Reset Request</h1>
                        <p>ProConnectSA Account Security</p>
                    </div>
                    <div class="content">
                        <h2>Reset Your Password</h2>
                        <p>We received a request to reset your password for your ProConnectSA account. Use the verification code below to complete the password reset process:</p>
                        
                        <div class="code-box">
                            <p style="margin: 0; color: #6c757d;">Your verification code is:</p>
                            <div class="reset-code">{reset_code}</div>
                            <p style="margin: 0; color: #6c757d; font-size: 14px;">This code expires in 30 minutes</p>
                        </div>
                        
                        <div class="warning">
                            <p><strong>⚠️ Security Notice:</strong></p>
                            <ul>
                                <li>This code is valid for 30 minutes only</li>
                                <li>Never share this code with anyone</li>
                                <li>ProConnectSA will never ask for your password reset code via phone</li>
                                <li>If you didn't request this reset, please ignore this email</li>
                            </ul>
                        </div>
                        
                        <p><strong>Next Steps:</strong></p>
                        <ol>
                            <li>Return to the ProConnectSA login page</li>
                            <li>Click "Forgot your password?" again</li>
                            <li>Enter the verification code above</li>
                            <li>Create your new password</li>
                        </ol>
                        
                        <div style="text-align: center;">
                            <a href="{settings.FRONTEND_URL}/register" class="button">Reset Password Now</a>
                        </div>
                        
                        <p>If you're having trouble with the reset process, please contact our support team.</p>
                        
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
Password Reset Request - ProConnectSA

We received a request to reset your password for your ProConnectSA account.

Your verification code is: {reset_code}

This code expires in 30 minutes.

Security Notice:
- This code is valid for 30 minutes only
- Never share this code with anyone
- ProConnectSA will never ask for your password reset code via phone
- If you didn't request this reset, please ignore this email

Next Steps:
1. Return to the ProConnectSA login page
2. Click "Forgot your password?" again
3. Enter the verification code above
4. Create your new password

Reset Password: {settings.FRONTEND_URL}/register

If you're having trouble with the reset process, please contact our support team.

Need help? Contact us at support@proconnectsa.co.za

© 2024 ProConnectSA. All rights reserved.
            """
            
            return self.send_email(email, subject, html_content, text_content)
            
        except Exception as e:
            logger.error(f"Error sending password reset email: {str(e)}")
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
    
    def send_lead_status_update(self, user, lead, status, message=""):
        """Send lead status update notification"""
        try:
            subject = f"📋 Lead Update: {lead.title}"
            
            # HTML content
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Lead Status Update - ProConnectSA</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .status-badge {{ display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }}
                    .status-claimed {{ background: #dbeafe; color: #1e40af; }}
                    .status-completed {{ background: #dcfce7; color: #166534; }}
                    .status-cancelled {{ background: #fee2e2; color: #dc2626; }}
                    .lead-details {{ background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                    .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📋 Lead Status Update</h1>
                        <p>Your lead has been updated</p>
                    </div>
                    <div class="content">
                        <h2>Lead: {lead.title}</h2>
                        
                        <div class="status-badge status-{status.lower()}">
                            Status: {status.title()}
                        </div>
                        
                        <div class="lead-details">
                            <p><strong>Service:</strong> {lead.service_category.name}</p>
                            <p><strong>Location:</strong> {lead.location_suburb}, {lead.location_city}</p>
                            <p><strong>Budget:</strong> {lead.budget_range}</p>
                            <p><strong>Urgency:</strong> {lead.urgency}</p>
                        </div>
                        
                        {f'<p><strong>Message:</strong> {message}</p>' if message else ''}
                        
                        <p>You can view the full details in your dashboard.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{settings.FRONTEND_URL}/dashboard/leads/" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View in Dashboard</a>
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
            
            # Plain text version
            text_content = f"""
            Lead Status Update: {lead.title}
            
            Your lead has been updated to: {status.title()}
            
            Service: {lead.service_category.name}
            Location: {lead.location_suburb}, {lead.location_city}
            Budget: {lead.budget_range}
            Urgency: {lead.urgency}
            
            {f'Message: {message}' if message else ''}
            
            View in Dashboard: {settings.FRONTEND_URL}/dashboard/leads/
            
            Best regards,
            The ProConnectSA Team
            
            ProConnectSA - Connecting you with the best service providers
            Email: support@proconnectsa.co.za | Phone: +27 21 123 4567
            """
            
            return self.send_email(user.email, subject, html_content, text_content)
            
        except Exception as e:
            logger.error(f"Error sending lead status update: {str(e)}")
            return False
    
    def send_payment_confirmation(self, user, transaction):
        """Send payment confirmation email"""
        try:
            subject = f"💳 Payment Confirmation - {transaction.transaction_type.title()}"
            
            # HTML content
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Payment Confirmation - ProConnectSA</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .transaction-details {{ background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                    .amount {{ font-size: 24px; font-weight: bold; color: #10b981; }}
                    .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>💳 Payment Confirmed</h1>
                        <p>Your transaction has been processed successfully</p>
                    </div>
                    <div class="content">
                        <h2>Transaction Details</h2>
                        
                        <div class="transaction-details">
                            <p><strong>Transaction Type:</strong> {transaction.transaction_type.title()}</p>
                            <p><strong>Amount:</strong> <span class="amount">R{transaction.amount:.2f}</span></p>
                            <p><strong>Credits Added:</strong> {transaction.credit_amount}</p>
                            <p><strong>Date:</strong> {transaction.created_at.strftime('%d %B %Y, %H:%M')}</p>
                            <p><strong>Reference:</strong> {transaction.reference}</p>
                        </div>
                        
                        <p>Your wallet has been updated and you can now use your credits to unlock leads.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{settings.FRONTEND_URL}/dashboard/wallet/" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View Wallet</a>
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
            
            # Plain text version
            text_content = f"""
            Payment Confirmation - {transaction.transaction_type.title()}
            
            Your transaction has been processed successfully.
            
            Transaction Details:
            - Type: {transaction.transaction_type.title()}
            - Amount: R{transaction.amount:.2f}
            - Credits Added: {transaction.credit_amount}
            - Date: {transaction.created_at.strftime('%d %B %Y, %H:%M')}
            - Reference: {transaction.reference}
            
            Your wallet has been updated and you can now use your credits to unlock leads.
            
            View Wallet: {settings.FRONTEND_URL}/dashboard/wallet/
            
            Best regards,
            The ProConnectSA Team
            
            ProConnectSA - Connecting you with the best service providers
            Email: support@proconnectsa.co.za | Phone: +27 21 123 4567
            """
            
            return self.send_email(user.email, subject, html_content, text_content)
            
        except Exception as e:
            logger.error(f"Error sending payment confirmation: {str(e)}")
            return False


# Initialize the service
sendgrid_service = SendGridEmailService()





"""
Resend Email Service for ProConnectSA (primary email provider).
Replaces SendGrid for all transactional emails.
"""
import logging
from django.conf import settings
from decouple import config

logger = logging.getLogger(__name__)

# Resend API key - set RESEND_API_KEY in env
_resend = None


def _get_resend():
    """Lazy init Resend client."""
    global _resend
    if _resend is None:
        try:
            import resend
            api_key = config('RESEND_API_KEY', default='')
            if not api_key:
                logger.warning("Resend API key not configured. Set RESEND_API_KEY in env.")
                return None
            resend.api_key = api_key
            _resend = resend
        except ImportError:
            logger.warning("resend package not installed. pip install resend")
            return None
    return _resend


def _from_email():
    # Use verified Resend domain (mail.proconnectsa.co.za) for best deliverability
    return config('DEFAULT_FROM_EMAIL', default='noreply@mail.proconnectsa.co.za')


def send_email(to_email, subject, html_content, text_content=None):
    """
    Send email via Resend API.
    Returns True if sent, False otherwise.
    """
    resend_lib = _get_resend()
    if not resend_lib:
        return False
    try:
        params = {
            "from": _from_email(),
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }
        if text_content:
            params["text"] = text_content
        resend_lib.Emails.send(params)
        logger.info(f"Email sent successfully to {to_email} via Resend")
        return True
    except Exception as e:
        logger.error(f"Resend send failed to {to_email}: {e}")
        return False


def _logo_url():
    """Absolute URL for small icon (fallback)."""
    base = (getattr(settings, 'FRONTEND_URL', '') or '').rstrip('/')
    return f"{base}/icon-192.png" if base else ""


def _header_logo_url():
    """Absolute URL for ProConnectSA header logo (blue logo image = entire header, no green)."""
    base = (getattr(settings, 'FRONTEND_URL', '') or '').rstrip('/')
    return f"{base}/logo-email.png" if base else ""


def send_lead_notification(provider, lead):
    """Send lead notification to provider (pro). Subject: New Lead in [City] – [Category]. Button: View full details (credits checked on app)."""
    try:
        city = getattr(lead, 'location_city', None) or getattr(lead, 'location_suburb', '') or 'your area'
        category = getattr(lead.service_category, 'name', '') if lead.service_category else 'Service'
        subject = f"New Lead in {city} – {category}"
        lead_url = f"{settings.FRONTEND_URL}/provider/leads/{lead.id}/"
        first_name = getattr(provider, 'first_name', '') or 'there'
        client_first_name = getattr(getattr(lead, 'client', None), 'first_name', '') or 'a client'
        header_logo_url = _header_logo_url()

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
                .header-img {{ display: block; max-width: 220px; height: auto; margin: 0 auto 20px auto; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }}
                .lead-card {{ background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                .lead-details {{ background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 10px 0; }}
                .urgency-high {{ color: #dc2626; font-weight: bold; }}
                .urgency-medium {{ color: #f59e0b; font-weight: bold; }}
                .urgency-low {{ color: #10b981; font-weight: bold; }}
                .button {{ display: inline-block; background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
                .cost-info {{ background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 15px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                {f'<img src="{header_logo_url}" alt="ProConnectSA" class="header-img" />' if header_logo_url else ''}
                <div class="content">
                    <h1 style="margin: 0 0 8px 0; color: #111;">New Lead Available</h1>
                    <p style="margin: 0 0 20px 0; color: #374151;">Hello {first_name}, lead from {client_first_name}</p>
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
                        <a href="{lead_url}" class="button">View full details</a>
                    </div>
                    <p><strong>Next Steps:</strong></p>
                    <ol>
                        <li>Log in to your ProConnectSA dashboard</li>
                        <li>Review the lead details</li>
                        <li>Unlock the lead to get client contact information</li>
                        <li>Contact the client to provide your quote</li>
                    </ol>
                    <p>Best regards,<br>The ProConnectSA Team</p>
                </div>
                <div class="footer">
                    <p>ProConnectSA - Connecting you with the best service providers</p>
                    <p>Email: support@proconnectsa.co.za | Phone: 077 438 8845</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
New Lead in {city} – {category}: {lead.title}

Hello {first_name}, lead from {client_first_name}.

Service: {lead.service_category.name}
Location: {lead.location_suburb}, {lead.location_city}
Budget: {lead.budget_range}
Urgency: {lead.urgency}

Description:
{lead.description}

View full details: {lead_url}

Cost: 1-3 credits (R50-R150) to unlock full contact details.

Best regards,
The ProConnectSA Team
        """
        return send_email(provider.email, subject, html_content, text_content)
    except Exception as e:
        logger.error(f"Error sending lead notification: {e}")
        return False


def send_lead_received_client_email(lead):
    """
    Send 'We've received your request' to the lead client when the lead is verified.
    Option B: only when pros are actually notified (same time as routing).
    """
    try:
        client = getattr(lead, 'client', None)
        if not client or not getattr(client, 'email', None):
            logger.warning(f"Cannot send lead-received email: lead {getattr(lead, 'id', '?')} has no client or client email")
            return False
        to_email = client.email
        first_name = getattr(client, 'first_name', '') or 'there'
        header_logo_url = _header_logo_url()
        subject = "We've received your request"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Request Received - ProConnectSA</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header-img {{ display: block; max-width: 220px; height: auto; margin: 0 auto 20px auto; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                {f'<img src="{header_logo_url}" alt="ProConnectSA" class="header-img" />' if header_logo_url else ''}
                <div class="content">
                    <h1 style="margin: 0 0 8px 0; color: #111;">We've received your request</h1>
                    <p style="margin: 0 0 20px 0; color: #374151;">Hello {first_name},</p>
                    <p style="margin: 0 0 20px 0;">We've received your request. Pros in your area have been notified. You'll be contacted by interested providers.</p>
                    <p>Best regards,<br>The ProConnectSA Team</p>
                </div>
                <div class="footer">
                    <p>ProConnectSA - support@proconnectsa.co.za | 077 438 8845</p>
                </div>
            </div>
        </body>
        </html>
        """
        text_content = f"""
We've received your request

Hello {first_name},

We've received your request. Pros in your area have been notified. You'll be contacted by interested providers.

Best regards,
The ProConnectSA Team
        """
        ok = send_email(to_email, subject, html_content, text_content)
        if ok:
            logger.info(f"Lead-received email sent to client {to_email} for lead {getattr(lead, 'id', '?')}")
        return ok
    except Exception as e:
        logger.error(f"Error sending lead-received client email: {e}", exc_info=True)
        return False


def send_pro_welcome_email(user):
    """
    Send pro welcome email when provider profile is created.
    Content: how leads work, how to respond, how to upgrade.
    """
    try:
        first_name = getattr(user, 'first_name', '') or 'there'
        header_logo_url = _header_logo_url()
        dashboard_url = f"{getattr(settings, 'FRONTEND_URL', '') or ''}/dashboard".rstrip('/')
        credits_url = f"{getattr(settings, 'FRONTEND_URL', '') or ''}/credits".rstrip('/')
        subject = "Welcome to ProConnectSA — Start Receiving Leads"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Provider Welcome - ProConnectSA</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header-img {{ display: block; max-width: 220px; height: auto; margin: 0 auto 20px auto; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }}
                .card {{ background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 15px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
                .button {{ display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                {f'<img src="{header_logo_url}" alt="ProConnectSA" class="header-img" />' if header_logo_url else ''}
                <div class="content">
                    <h1 style="margin: 0 0 8px 0; color: #111;">Welcome to ProConnectSA</h1>
                    <p style="margin: 0 0 20px 0; color: #374151;">Hello {first_name}, your provider profile is set up. Here's how to get started.</p>
                    <h2 style="color: #111;">How leads work</h2>
                    <div class="card">
                        <p>When clients request services in your area and category, we notify you by email. You'll see a short preview (service, location, budget). Use credits to unlock full contact details and reach out to the client.</p>
                    </div>
                    <h2 style="color: #111;">How to respond</h2>
                    <div class="card">
                        <p>Log in to your dashboard, open the lead, and unlock it with credits to get the client's contact info. Then contact the client directly to provide your quote.</p>
                    </div>
                    <h2 style="color: #111;">Credits and upgrades</h2>
                    <div class="card">
                        <p>Top up your wallet with credits to unlock leads. You can also upgrade to a Premium listing for more visibility and benefits.</p>
                    </div>
                    <div style="text-align: center;">
                        <a href="{dashboard_url}" class="button">Go to Dashboard</a>
                        <a href="{credits_url}" class="button" style="margin-left: 10px;">Buy Credits</a>
                    </div>
                    <p>Best regards,<br>The ProConnectSA Team</p>
                </div>
                <div class="footer">
                    <p>ProConnectSA - support@proconnectsa.co.za | 077 438 8845</p>
                </div>
            </div>
        </body>
        </html>
        """
        text_content = f"""
Welcome to ProConnectSA — Start Receiving Leads

Hello {first_name},

Your provider profile is set up. Here's how to get started.

How leads work:
When clients request services in your area, we notify you by email. Use credits to unlock full contact details and reach out to the client.

How to respond:
Log in to your dashboard, open the lead, unlock it with credits, then contact the client to provide your quote.

Credits and upgrades:
Top up your wallet to unlock leads. Upgrade to Premium for more visibility.

Dashboard: {dashboard_url}
Buy Credits: {credits_url}

Best regards,
The ProConnectSA Team
        """
        ok = send_email(user.email, subject, html_content, text_content)
        if ok:
            logger.info(f"Pro welcome email sent to {user.email}")
        return ok
    except Exception as e:
        logger.error(f"Error sending pro welcome email: {e}", exc_info=True)
        return False


def send_password_reset_email(email, reset_code, reset_token):
    """Send password reset code via email."""
    try:
        subject = "🔑 Reset Your ProConnectSA Password"
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
                    <p>We received a request to reset your password. Use the code below:</p>
                    <div class="code-box">
                        <p style="margin: 0; color: #6c757d;">Your verification code is:</p>
                        <div class="reset-code">{reset_code}</div>
                        <p style="margin: 0; color: #6c757d; font-size: 14px;">This code expires in 30 minutes</p>
                    </div>
                    <p>If you didn't request this reset, please ignore this email.</p>
                    <div style="text-align: center;">
                        <a href="{settings.FRONTEND_URL}/register" class="button">Reset Password Now</a>
                    </div>
                    <div class="footer">
                        <p>Need help? Contact us at support@proconnectsa.co.za</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        text_content = f"""
Password Reset Request - ProConnectSA

Your verification code is: {reset_code}
This code expires in 30 minutes.

Reset Password: {settings.FRONTEND_URL}/register

If you didn't request this reset, please ignore this email.
        """
        return send_email(email, subject, html_content, text_content)
    except Exception as e:
        logger.error(f"Error sending password reset email: {e}")
        return False


def send_payment_confirmation(user, transaction):
    """Send payment confirmation email."""
    try:
        header_logo_url = _header_logo_url()
        subject = f"💳 Payment Confirmation - {transaction.transaction_type.title()}"
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
                .header-img {{ display: block; max-width: 220px; height: auto; margin: 0 auto 20px auto; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }}
                .transaction-details {{ background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                .amount {{ font-size: 24px; font-weight: bold; color: #1e40af; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                {f'<img src="{header_logo_url}" alt="ProConnectSA" class="header-img" />' if header_logo_url else ''}
                <div class="content">
                    <h1 style="margin: 0 0 8px 0; color: #111;">💳 Payment Confirmed</h1>
                    <p style="margin: 0 0 20px 0; color: #374151;">Your transaction has been processed successfully</p>
                    <h2>Transaction Details</h2>
                    <div class="transaction-details">
                        <p><strong>Transaction Type:</strong> {transaction.transaction_type.title()}</p>
                        <p><strong>Amount:</strong> <span class="amount">R{transaction.amount:.2f}</span></p>
                        <p><strong>Credits Added:</strong> {transaction.credit_amount}</p>
                        <p><strong>Date:</strong> {transaction.created_at.strftime('%d %B %Y, %H:%M')}</p>
                        <p><strong>Reference:</strong> {transaction.reference}</p>
                    </div>
                    <p>Your wallet has been updated. View Wallet: {settings.FRONTEND_URL}/dashboard/wallet/</p>
                    <p>Best regards,<br>The ProConnectSA Team</p>
                </div>
                <div class="footer">
                    <p>ProConnectSA - support@proconnectsa.co.za | 077 438 8845</p>
                </div>
            </div>
        </body>
        </html>
        """
        text_content = f"""
Payment Confirmation - {transaction.transaction_type.title()}

Transaction Details:
- Type: {transaction.transaction_type.title()}
- Amount: R{transaction.amount:.2f}
- Credits Added: {transaction.credit_amount}
- Date: {transaction.created_at.strftime('%d %B %Y, %H:%M')}
- Reference: {transaction.reference}

View Wallet: {settings.FRONTEND_URL}/dashboard/wallet/

Best regards,
The ProConnectSA Team
        """
        return send_email(user.email, subject, html_content, text_content)
    except Exception as e:
        logger.error(f"Error sending payment confirmation: {e}")
        return False


def send_lead_status_update(user, lead, status, message=""):
    """Send lead status update notification."""
    try:
        header_logo_url = _header_logo_url()
        subject = f"📋 Lead Update: {lead.title}"
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
                .header-img {{ display: block; max-width: 220px; height: auto; margin: 0 auto 20px auto; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }}
                .status-badge {{ display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }}
                .lead-details {{ background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                {f'<img src="{header_logo_url}" alt="ProConnectSA" class="header-img" />' if header_logo_url else ''}
                <div class="content">
                    <h1 style="margin: 0 0 8px 0; color: #111;">📋 Lead Status Update</h1>
                    <p style="margin: 0 0 20px 0; color: #374151;">Your lead has been updated</p>
                    <h2>Lead: {lead.title}</h2>
                    <div class="status-badge">Status: {status.title()}</div>
                    <div class="lead-details">
                        <p><strong>Service:</strong> {lead.service_category.name}</p>
                        <p><strong>Location:</strong> {lead.location_suburb}, {lead.location_city}</p>
                        <p><strong>Budget:</strong> {lead.budget_range}</p>
                        <p><strong>Urgency:</strong> {lead.urgency}</p>
                    </div>
                    {f'<p><strong>Message:</strong> {message}</p>' if message else ''}
                    <p><a href="{settings.FRONTEND_URL}/dashboard/leads/" style="display: inline-block; background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View in Dashboard</a></p>
                    <p>Best regards,<br>The ProConnectSA Team</p>
                </div>
                <div class="footer">
                    <p>ProConnectSA - support@proconnectsa.co.za | 077 438 8845</p>
                </div>
            </div>
        </body>
        </html>
        """
        text_content = f"""
Lead Status Update: {lead.title}
Status: {status.title()}

Service: {lead.service_category.name}
Location: {lead.location_suburb}, {lead.location_city}
{f'Message: {message}' if message else ''}

View in Dashboard: {settings.FRONTEND_URL}/dashboard/leads/

Best regards,
The ProConnectSA Team
        """
        return send_email(user.email, subject, html_content, text_content)
    except Exception as e:
        logger.error(f"Error sending lead status update: {e}")
        return False


def test_email_delivery(test_email):
    """Send a test email to verify Resend is working."""
    header_logo_url = _header_logo_url()
    subject = "🧪 ProConnectSA Email Test (Resend)"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Test - ProConnectSA</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            {f'<img src="{header_logo_url}" alt="ProConnectSA" style="display: block; max-width: 220px; height: auto; margin: 0 auto 20px auto;" />' if header_logo_url else ''}
            <div style="padding: 24px; background: #f9fafb; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
                <h1 style="margin: 0 0 8px 0; color: #111;">🧪 Email System Test</h1>
                <p style="margin: 0 0 16px 0; color: #374151;">ProConnectSA</p>
                <h2 style="margin: 0 0 16px 0; color: #111;">Email Delivery Test Successful!</h2>
                <p>✅ Resend configuration: Working</p>
                <p>Your ProConnectSA email system is ready.</p>
            </div>
        </div>
    </body>
    </html>
    """
    text_content = "ProConnectSA email test (Resend) - delivery successful."
    return send_email(test_email, subject, html_content, text_content)

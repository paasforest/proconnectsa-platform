"""
Invoice Generation Service

This service generates professional invoices for manual deposits with:
- Customer codes and reference numbers
- Company banking details
- Deposit amounts and credit calculations
- Professional formatting for both pay-as-you-go and subscription deposits
"""

import os
from django.conf import settings
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.utils import timezone
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class InvoiceService:
    """Service for generating and sending invoices for manual deposits"""
    
    def __init__(self):
        self.company_info = self._get_company_info()
    
    def _get_company_info(self):
        """Get company information from settings"""
        return {
            'name': getattr(settings, 'COMPANY_NAME', 'ProCompare (Pty) Ltd'),
            'registration': getattr(settings, 'COMPANY_REGISTRATION', '2023/123456/07'),
            'vat_number': getattr(settings, 'COMPANY_VAT_NUMBER', '4123456789'),
            'address': getattr(settings, 'COMPANY_ADDRESS', '123 Business Street, Cape Town, 8001, South Africa'),
            'phone': getattr(settings, 'COMPANY_PHONE', '+27 21 123 4567'),
            'email': getattr(settings, 'COMPANY_EMAIL', 'billing@procompare.co.za'),
            'website': getattr(settings, 'COMPANY_WEBSITE', 'https://procompare.co.za'),
            'bank_details': getattr(settings, 'COMPANY_BANK_DETAILS', {
                'bank_name': 'Nedbank',
                'branch_code': '198765',
                'account_number': '1313872032',
                'account_holder': 'ProCompare (Pty) Ltd',
                'swift_code': 'SBZAJJXXX'
            })
        }
    
    def generate_invoice(self, deposit, invoice_type='manual_deposit'):
        """
        Generate invoice for a manual deposit
        
        Args:
            deposit: ManualDeposit instance
            invoice_type: Type of invoice ('manual_deposit', 'subscription_deposit')
            
        Returns:
            dict: Invoice data with HTML and PDF content
        """
        try:
            # Get provider information
            provider = deposit.account.user
            provider_profile = provider.provider_profile
            
            # Calculate pricing information
            pricing_info = self._calculate_pricing_info(deposit, provider_profile)
            
            # Generate invoice number
            invoice_number = self._generate_invoice_number(deposit)
            
            # Prepare invoice data
            invoice_data = {
                'invoice_number': invoice_number,
                'invoice_date': timezone.now().strftime('%d %B %Y'),
                'due_date': (timezone.now() + timezone.timedelta(days=7)).strftime('%d %B %Y'),
                'company': self.company_info,
                'customer': {
                    'name': provider_profile.business_name,
                    'email': provider.email,
                    'customer_code': provider_profile.customer_code,
                    'phone': provider_profile.business_phone,
                    'address': provider_profile.business_address,
                },
                'deposit': {
                    'reference_number': deposit.reference_number,
                    'amount': float(deposit.amount),
                    'credits_to_activate': deposit.credits_to_activate,
                    'status': deposit.status,
                    'created_at': deposit.created_at.strftime('%d %B %Y at %H:%M'),
                },
                'pricing': pricing_info,
                'payment_instructions': self._get_payment_instructions(deposit, provider_profile),
                'invoice_type': invoice_type,
            }
            
            # Generate HTML content
            html_content = self._generate_html_invoice(invoice_data)
            
            # Generate plain text content
            text_content = self._generate_text_invoice(invoice_data)
            
            return {
                'success': True,
                'invoice_data': invoice_data,
                'html_content': html_content,
                'text_content': text_content,
                'invoice_number': invoice_number
            }
            
        except Exception as e:
            logger.error(f"Error generating invoice: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _calculate_pricing_info(self, deposit, provider_profile):
        """Calculate pricing information for the invoice"""
        amount = float(deposit.amount)
        credits = deposit.credits_to_activate
        
        # New pricing: R50 per credit for all users
        rate_per_credit = 50.0  # Updated rate for all users
        rate_type = "Standard Rate"
        
        # Calculate VAT (15% in South Africa)
        vat_rate = 0.15
        vat_amount = amount * vat_rate
        subtotal = amount - vat_amount
        
        return {
            'rate_per_credit': rate_per_credit,
            'rate_type': rate_type,
            'credits': credits,
            'subtotal': subtotal,
            'vat_rate': vat_rate * 100,
            'vat_amount': vat_amount,
            'total': amount,
            'currency': 'ZAR'
        }
    
    def _generate_invoice_number(self, deposit):
        """Generate unique invoice number"""
        date_str = timezone.now().strftime('%Y%m%d')
        deposit_id = str(deposit.id)[:8].upper()
        return f"INV-{date_str}-{deposit_id}"
    
    def _get_payment_instructions(self, deposit, provider_profile):
        """Get payment instructions for the invoice"""
        return {
            'bank_name': self.company_info['bank_details']['bank_name'],
            'account_holder': self.company_info['bank_details']['account_holder'],
            'account_number': self.company_info['bank_details']['account_number'],
            'branch_code': self.company_info['bank_details']['branch_code'],
            'swift_code': self.company_info['bank_details']['swift_code'],
            'reference': f"PC{deposit.reference_number}",
            'customer_code': provider_profile.customer_code,
            'amount': f"R{float(deposit.amount):.2f}",
            'note': f"Please use reference: PC{deposit.reference_number} when making payment"
        }
    
    def _generate_html_invoice(self, invoice_data):
        """Generate HTML invoice content"""
        html_template = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ invoice_number }}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .company-info { float: left; }
        .invoice-info { float: right; text-align: right; }
        .clear { clear: both; }
        .customer-section { margin: 20px 0; }
        .invoice-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .pricing-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .pricing-table th, .pricing-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .pricing-table th { background: #f3f4f6; font-weight: bold; }
        .total-row { font-weight: bold; background: #f9fafb; }
        .payment-instructions { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .bank-details { background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 10px 0; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
        .highlight { color: #2563eb; font-weight: bold; }
        .reference-box { background: #fef3c7; padding: 10px; border-radius: 4px; margin: 10px 0; text-align: center; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <h1>{{ company.name }}</h1>
            <p>{{ company.address }}</p>
            <p>Tel: {{ company.phone }} | Email: {{ company.email }}</p>
            <p>Registration: {{ company.registration }} | VAT: {{ company.vat_number }}</p>
        </div>
        <div class="invoice-info">
            <h2>INVOICE</h2>
            <p><strong>Invoice #:</strong> {{ invoice_number }}</p>
            <p><strong>Date:</strong> {{ invoice_date }}</p>
            <p><strong>Due Date:</strong> {{ due_date }}</p>
        </div>
        <div class="clear"></div>
    </div>

    <div class="customer-section">
        <h3>Bill To:</h3>
        <p><strong>{{ customer.name }}</strong></p>
        <p>Email: {{ customer.email }}</p>
        <p>Customer Code: <span class="highlight">{{ customer.customer_code }}</span></p>
        {% if customer.phone %}<p>Phone: {{ customer.phone }}</p>{% endif %}
        <p>Address: {{ customer.address }}</p>
    </div>

    <div class="invoice-details">
        <h3>Deposit Details:</h3>
        <p><strong>Reference Number:</strong> <span class="highlight">{{ deposit.reference_number }}</span></p>
        <p><strong>Deposit Date:</strong> {{ deposit.created_at }}</p>
        <p><strong>Status:</strong> {{ deposit.status|title }}</p>
        <p><strong>Credits to Activate:</strong> {{ deposit.credits_to_activate }}</p>
    </div>

    <table class="pricing-table">
        <thead>
            <tr>
                <th>Description</th>
                <th>Rate</th>
                <th>Quantity</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Credit Purchase ({{ pricing.rate_type }})</td>
                <td>R{{ pricing.rate_per_credit }} per credit</td>
                <td>{{ pricing.credits }} credits</td>
                <td>R{{ pricing.subtotal|floatformat:2 }}</td>
            </tr>
            <tr>
                <td>VAT ({{ pricing.vat_rate }}%)</td>
                <td></td>
                <td></td>
                <td>R{{ pricing.vat_amount|floatformat:2 }}</td>
            </tr>
            <tr class="total-row">
                <td><strong>Total Amount</strong></td>
                <td></td>
                <td></td>
                <td><strong>R{{ pricing.total|floatformat:2 }}</strong></td>
            </tr>
        </tbody>
    </table>

    <div class="payment-instructions">
        <h3>Payment Instructions:</h3>
        <div class="reference-box">
            <p>IMPORTANT: Use this reference when making payment</p>
            <p style="font-size: 18px; color: #dc2626;">PC{{ deposit.reference_number }}</p>
        </div>
        
        <div class="bank-details">
            <h4>Banking Details:</h4>
            <p><strong>Bank:</strong> {{ payment_instructions.bank_name }}</p>
            <p><strong>Account Holder:</strong> {{ payment_instructions.account_holder }}</p>
            <p><strong>Account Number:</strong> {{ payment_instructions.account_number }}</p>
            <p><strong>Branch Code:</strong> {{ payment_instructions.branch_code }}</p>
            <p><strong>Swift Code:</strong> {{ payment_instructions.swift_code }}</p>
            <p><strong>Reference:</strong> <span class="highlight">{{ payment_instructions.reference }}</span></p>
            <p><strong>Amount:</strong> <span class="highlight">{{ payment_instructions.amount }}</span></p>
        </div>
        
        <p><strong>Note:</strong> {{ payment_instructions.note }}</p>
        <p><strong>Customer Code:</strong> {{ payment_instructions.customer_code }}</p>
    </div>

    <div class="footer">
        <p>Thank you for your business! Once payment is received and verified, your credits will be activated automatically.</p>
        <p>For any queries, please contact us at {{ company.email }} or {{ company.phone }}</p>
        <p>This invoice was generated on {{ invoice_date }} for {{ customer.name }} ({{ customer.customer_code }})</p>
    </div>
</body>
</html>
        """
        
        from django.template import Template, Context
        template = Template(html_template)
        context = Context(invoice_data)
        return template.render(context)
    
    def _generate_text_invoice(self, invoice_data):
        """Generate plain text invoice content"""
        text_template = """
INVOICE - {{ invoice_number }}
{{ company.name }}
{{ company.address }}
Tel: {{ company.phone }} | Email: {{ company.email }}
Registration: {{ company.registration }} | VAT: {{ company.vat_number }}

Invoice Date: {{ invoice_date }}
Due Date: {{ due_date }}

BILL TO:
{{ customer.name }}
Email: {{ customer.email }}
Customer Code: {{ customer.customer_code }}
{% if customer.phone %}Phone: {{ customer.phone }}{% endif %}
Address: {{ customer.address }}

DEPOSIT DETAILS:
Reference Number: {{ deposit.reference_number }}
Deposit Date: {{ deposit.created_at }}
Status: {{ deposit.status|title }}
Credits to Activate: {{ deposit.credits_to_activate }}

PRICING:
Description: Credit Purchase ({{ pricing.rate_type }})
Rate: R{{ pricing.rate_per_credit }} per credit
Quantity: {{ pricing.credits }} credits
Subtotal: R{{ pricing.subtotal|floatformat:2 }}
VAT ({{ pricing.vat_rate }}%): R{{ pricing.vat_amount|floatformat:2 }}
TOTAL: R{{ pricing.total|floatformat:2 }}

PAYMENT INSTRUCTIONS:
IMPORTANT: Use this reference when making payment: PC{{ deposit.reference_number }}

Banking Details:
Bank: {{ payment_instructions.bank_name }}
Account Holder: {{ payment_instructions.account_holder }}
Account Number: {{ payment_instructions.account_number }}
Branch Code: {{ payment_instructions.branch_code }}
Swift Code: {{ payment_instructions.swift_code }}
Reference: {{ payment_instructions.reference }}
Amount: {{ payment_instructions.amount }}

Note: {{ payment_instructions.note }}
Customer Code: {{ payment_instructions.customer_code }}

Thank you for your business! Once payment is received and verified, your credits will be activated automatically.

For any queries, please contact us at {{ company.email }} or {{ company.phone }}

This invoice was generated on {{ invoice_date }} for {{ customer.name }} ({{ customer.customer_code }})
        """
        
        from django.template import Template, Context
        template = Template(text_template)
        context = Context(invoice_data)
        return template.render(context)
    
    def send_invoice_email(self, deposit, invoice_data, html_content, text_content):
        """Send invoice via email"""
        try:
            provider = deposit.account.user
            provider_profile = provider.provider_profile
            
            subject = f"Invoice {invoice_data['invoice_number']} - ProCompare Credit Purchase"
            
            # Send email
            send_mail(
                subject=subject,
                message=text_content,
                from_email=settings.COMPANY_EMAIL,
                recipient_list=[provider.email],
                html_message=html_content,
                fail_silently=False
            )
            
            logger.info(f"Invoice email sent to {provider.email} for deposit {deposit.reference_number}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending invoice email: {str(e)}")
            return False









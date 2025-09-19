import logging
from django.conf import settings

logger = logging.getLogger(__name__)


class SMSService:
    """
    SMS service for sending verification codes and notifications.
    Integrates with Panacea Mobile SMS API for South African numbers.
    """
    
    def __init__(self):
        self.api_key = getattr(settings, 'PANACEA_SMS_API_KEY', '')
        self.api_url = getattr(settings, 'PANACEA_SMS_API_URL', 'https://api.panaceamobile.com/sms/send')
        self.sender_id = getattr(settings, 'SMS_SENDER_ID', 'ProCompare')
    
    def send_sms(self, phone_number, message):
        """
        Send SMS to a phone number.
        
        Args:
            phone_number (str): Phone number in format +27XXXXXXXXX
            message (str): SMS message content
            
        Returns:
            bool: True if SMS sent successfully, False otherwise
        """
        try:
            # Validate phone number format
            if not self._validate_phone_number(phone_number):
                logger.error(f"Invalid phone number format: {phone_number}")
                return False
            
            # In development, just log the SMS
            if settings.DEBUG:
                logger.info(f"SMS to {phone_number}: {message}")
                return True
            
            # Production SMS sending logic would go here
            # This would integrate with Panacea Mobile API
            return self._send_via_api(phone_number, message)
            
        except Exception as e:
            logger.error(f"Error sending SMS to {phone_number}: {str(e)}")
            return False
    
    def _validate_phone_number(self, phone_number):
        """Validate South African phone number format"""
        import re
        sa_pattern = r'^\+27[0-9]{9}$'
        return bool(re.match(sa_pattern, phone_number))
    
    def _send_via_api(self, phone_number, message):
        """
        Send SMS via Panacea Mobile API.
        This is a placeholder for the actual API integration.
        """
        try:
            import requests
            
            payload = {
                'api_key': self.api_key,
                'to': phone_number,
                'message': message,
                'sender_id': self.sender_id
            }
            
            response = requests.post(self.api_url, data=payload, timeout=30)
            response.raise_for_status()
            
            logger.info(f"SMS sent successfully to {phone_number}")
            return True
            
        except Exception as e:
            logger.error(f"API error sending SMS to {phone_number}: {str(e)}")
            return False
    
    def send_verification_code(self, phone_number, code):
        """Send verification code SMS"""
        message = f"Your ProCompare verification code is: {code}. This code expires in 10 minutes."
        return self.send_sms(phone_number, message)
    
    def send_lead_notification(self, phone_number, lead_title, location):
        """Send lead assignment notification"""
        message = f"New {lead_title} lead in {location}. Check your dashboard for details."
        return self.send_sms(phone_number, message)
    
    def send_reminder(self, phone_number, message):
        """Send reminder SMS"""
        return self.send_sms(phone_number, message)



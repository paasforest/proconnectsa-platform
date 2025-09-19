"""
SMS service for ProConnectSA notifications
Ready for Pace SMS API integration
"""
import requests
import logging
from django.conf import settings
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

class SMSService:
    """SMS service using Panacea Mobile SMS API"""
    
    def __init__(self):
        self.username = getattr(settings, 'PANACEA_SMS_USERNAME', '')
        self.password = getattr(settings, 'PANACEA_SMS_PASSWORD', '')
        self.sender_id = getattr(settings, 'SMS_SENDER_ID', 'ProConnectSA')
        self.base_url = getattr(settings, 'PANACEA_SMS_API_URL', 'https://api.panaceamobile.com/json?action=message_send')
        
        # Production-ready configuration
        self.timeout = getattr(settings, 'SMS_TIMEOUT', 30)
        self.retry_attempts = getattr(settings, 'SMS_RETRY_ATTEMPTS', 3)
        
        # COST-SAVING: SMS disabled by default (expensive!)
        from decouple import config
        sms_enabled = config('SMS_ENABLED', default=False, cast=bool)
        self.mock_mode = config('SMS_MOCK_MODE', default=True, cast=bool) or not self.username or not sms_enabled
        
    def send_sms(self, phone_number: str, message: str) -> Dict:
        """
        Send SMS using Pace SMS API or mock mode
        
        Args:
            phone_number: South African phone number (+27XXXXXXXXX)
            message: SMS message content
            
        Returns:
            Dict with success status and response data
        """
        try:
            # Validate phone number format
            if not self._validate_phone_number(phone_number):
                return {
                    'success': False,
                    'error': 'Invalid phone number format. Must be +27XXXXXXXXX'
                }
            
            # Mock mode for development
            if self.mock_mode:
                logger.info(f"[MOCK SMS] To: {phone_number}")
                logger.info(f"[MOCK SMS] Message: {message}")
                logger.info(f"[MOCK SMS] Sender: {self.sender_id}")
                return {
                    'success': True,
                    'message_id': f'mock_{phone_number}_{hash(message)}',
                    'response': {'mock': True, 'message': 'SMS sent in mock mode'},
                    'mock': True
                }
            
            # Production SMS sending
            if not self.username:
                logger.warning("No SMS username configured, using mock mode")
                return {
                    'success': True,
                    'message_id': f'mock_no_username_{phone_number}_{hash(message)}',
                    'response': {'mock': True, 'message': 'No username configured'},
                    'mock': True
                }
            
            # Prepare API request for Panacea Mobile (using form-encoded data)
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            
            data = {
                'username': self.username,
                'password': self.password,
                'to': phone_number,
                'text': message,  # Changed from 'message' to 'text'
                'sender_id': self.sender_id
            }
            
            # Make API request
            response = requests.post(
                self.base_url,
                headers=headers,
                data=data,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                # Check if response contains "Access Denied" or HTML error page
                if 'Access Denied' in response.text or '<html>' in response.text.lower():
                    logger.warning(f"SMS API access denied - likely IP whitelist or permission issue")
                    logger.warning(f"Falling back to mock mode for development")
                    # Fall back to mock mode
                    logger.info(f"[FALLBACK MOCK SMS] To: {phone_number}")
                    logger.info(f"[FALLBACK MOCK SMS] Message: {message}")
                    logger.info(f"[FALLBACK MOCK SMS] Sender: {self.sender_id}")
                    return {
                        'success': True,
                        'message_id': f'fallback_mock_{phone_number}_{hash(message)}',
                        'response': {'fallback_mock': True, 'message': 'API access denied, using fallback mock'},
                        'fallback_mock': True
                    }
                
                try:
                    result = response.json()
                    logger.info(f"SMS sent successfully to {phone_number}")
                    return {
                        'success': True,
                        'message_id': result.get('message_id'),
                        'response': result
                    }
                except ValueError as json_error:
                    # Handle non-JSON response
                    logger.warning(f"SMS API returned non-JSON response: {response.text}")
                    return {
                        'success': True,  # Assume success if status is 200
                        'message_id': None,
                        'response': response.text
                    }
            else:
                logger.error(f"SMS API error: {response.status_code} - {response.text}")
                return {
                    'success': False,
                    'error': f'API error: {response.status_code}',
                    'response': response.text
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"SMS request failed: {str(e)}")
            logger.warning(f"Network issue with Panacea API, falling back to mock mode")
            # Fall back to mock mode for network issues
            logger.info(f"[NETWORK FALLBACK MOCK SMS] To: {phone_number}")
            logger.info(f"[NETWORK FALLBACK MOCK SMS] Message: {message}")
            logger.info(f"[NETWORK FALLBACK MOCK SMS] Sender: {self.sender_id}")
            return {
                'success': True,
                'message_id': f'network_fallback_mock_{phone_number}_{hash(message)}',
                'response': {'network_fallback_mock': True, 'message': 'Network issue, using fallback mock'},
                'network_fallback_mock': True,
                'error': f'Network issue: {str(e)}'
            }
        except Exception as e:
            logger.error(f"SMS service error: {str(e)}")
            return {
                'success': False,
                'error': f'Service error: {str(e)}'
            }
    
    def send_bulk_sms(self, phone_numbers: List[str], message: str) -> Dict:
        """
        Send bulk SMS to multiple numbers
        
        Args:
            phone_numbers: List of South African phone numbers
            message: SMS message content
            
        Returns:
            Dict with success status and results
        """
        results = []
        successful = 0
        failed = 0
        
        for phone_number in phone_numbers:
            result = self.send_sms(phone_number, message)
            results.append({
                'phone_number': phone_number,
                'success': result['success'],
                'error': result.get('error')
            })
            
            if result['success']:
                successful += 1
            else:
                failed += 1
        
        return {
            'success': failed == 0,
            'total': len(phone_numbers),
            'successful': successful,
            'failed': failed,
            'results': results
        }
    
    def send_lead_verification_sms(self, phone_number: str, verification_code: str) -> Dict:
        """
        Send lead verification SMS
        
        Args:
            phone_number: Client's phone number
            verification_code: 6-digit verification code
            
        Returns:
            Dict with success status
        """
        message = f"""
        ProConnectSA Verification Code: {verification_code}
        
        Please enter this code to verify your lead request.
        
        This code expires in 10 minutes.
        
        ProConnectSA Team
        """
        
        return self.send_sms(phone_number, message.strip())
    
    def send_provider_notification_sms(self, phone_number: str, lead_title: str, location: str) -> Dict:
        """
        Send new lead notification SMS to provider
        Note: This SMS should NOT contain sensitive lead details like phone numbers or contact info.
        Providers must pay to access full lead details.
        
        Args:
            phone_number: Provider's phone number
            lead_title: Title of the new lead (generic, no sensitive info)
            location: General location (city/suburb only, no addresses)
            
        Returns:
            Dict with success status
        """
        message = f"""
        🎯 New Lead Available!
        
        {lead_title}
        📍 {location}
        
        💳 Login to your ProConnectSA dashboard to view details and purchase access.
        
        Don't miss out on this opportunity!
        
        ProConnectSA Team
        """
        
        return self.send_sms(phone_number, message.strip())
    
    def send_deposit_reminder_sms(self, phone_number: str, reference_number: str, amount: float) -> Dict:
        """
        Send manual deposit reminder SMS
        
        Args:
            phone_number: Provider's phone number
            reference_number: Deposit reference number
            amount: Deposit amount
            
        Returns:
            Dict with success status
        """
        message = f"""
        Manual Deposit Reminder
        
        Reference: {reference_number}
        Amount: R{amount}
        
        Please upload your deposit slip to complete the process.
        
        ProConnectSA Team
        """
        
        return self.send_sms(phone_number, message.strip())
    
    def _validate_phone_number(self, phone_number: str) -> bool:
        """
        Validate South African phone number format
        
        Args:
            phone_number: Phone number to validate
            
        Returns:
            True if valid, False otherwise
        """
        import re
        pattern = r'^\+27[0-9]{9}$'
        return bool(re.match(pattern, phone_number))
    
    def get_balance(self) -> Dict:
        """
        Get SMS account balance from Pace SMS API
        
        Returns:
            Dict with balance information
        """
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(
                f"{self.base_url}/account/balance",
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info("SMS balance retrieved successfully")
                return {
                    'success': True,
                    'balance': result.get('balance', 0),
                    'currency': result.get('currency', 'ZAR'),
                    'response': result
                }
            else:
                logger.error(f"SMS balance API error: {response.status_code} - {response.text}")
                return {
                    'success': False,
                    'error': f'API error: {response.status_code}',
                    'response': response.text
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"SMS balance request failed: {str(e)}")
            return {
                'success': False,
                'error': f'Request failed: {str(e)}'
            }
        except Exception as e:
            logger.error(f"SMS balance service error: {str(e)}")
            return {
                'success': False,
                'error': f'Service error: {str(e)}'
            }

# Global SMS service instance
sms_service = SMSService()

# Convenience functions
def send_sms(phone_number: str, message: str) -> Dict:
    """Send SMS using the global SMS service"""
    return sms_service.send_sms(phone_number, message)

def send_lead_verification_sms(phone_number: str, verification_code: str) -> Dict:
    """Send lead verification SMS"""
    return sms_service.send_lead_verification_sms(phone_number, verification_code)

def send_provider_notification_sms(phone_number: str, lead_title: str, location: str) -> Dict:
    """Send provider notification SMS"""
    return sms_service.send_provider_notification_sms(phone_number, lead_title, location)

def send_deposit_reminder_sms(phone_number: str, reference_number: str, amount: float) -> Dict:
    """Send deposit reminder SMS"""
    return sms_service.send_deposit_reminder_sms(phone_number, reference_number, amount)

def get_sms_balance() -> Dict:
    """Get SMS account balance"""
    return sms_service.get_balance()





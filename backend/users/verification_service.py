"""
Comprehensive verification service for ProCompare
Handles email and SMS verification for accounts, password resets, and security
"""
import random
import string
import logging
from datetime import datetime, timedelta
from django.conf import settings
from django.core.cache import cache
from django.contrib.auth import get_user_model
from django.utils import timezone
from typing import Dict, Optional, Tuple
from backend.notifications.sms_service import SMSService
from backend.notifications.email_service import EmailService

logger = logging.getLogger(__name__)
User = get_user_model()

class VerificationService:
    """Handles all verification processes for users"""
    
    def __init__(self):
        self.sms_service = SMSService()
        self.email_service = EmailService()
        
    def generate_verification_code(self, length: int = 6) -> str:
        """Generate a random verification code"""
        return ''.join(random.choices(string.digits, k=length))
    
    def generate_verification_token(self, length: int = 32) -> str:
        """Generate a random verification token"""
        return ''.join(random.choices(string.ascii_letters + string.digits, k=length))
    
    def _get_cache_key(self, prefix: str, identifier: str) -> str:
        """Generate cache key for verification data"""
        return f"verification:{prefix}:{identifier}"
    
    def _store_verification_data(self, key: str, data: Dict, expiry_minutes: int = 15) -> None:
        """Store verification data in cache with expiry"""
        cache.set(key, data, timeout=expiry_minutes * 60)
    
    def _get_verification_data(self, key: str) -> Optional[Dict]:
        """Retrieve verification data from cache"""
        return cache.get(key)
    
    def _clear_verification_data(self, key: str) -> None:
        """Clear verification data from cache"""
        cache.delete(key)
    
    # EMAIL VERIFICATION METHODS
    
    def initiate_email_verification(self, user: User) -> Dict:
        """Initiate email verification for a user"""
        try:
            verification_code = self.generate_verification_code()
            verification_token = self.generate_verification_token()
            
            # Store verification data
            verification_data = {
                'user_id': str(user.id),
                'email': user.email,
                'code': verification_code,
                'token': verification_token,
                'created_at': timezone.now().isoformat(),
                'attempts': 0,
                'type': 'email_verification'
            }
            
            cache_key = self._get_cache_key('email_verify', user.email)
            self._store_verification_data(cache_key, verification_data, expiry_minutes=30)
            
            # Send verification email
            email_sent = self.email_service.send_verification_email(
                user.email, 
                verification_code, 
                verification_token
            )
            
            if email_sent:
                logger.info(f"Email verification initiated for user {user.id}")
                return {
                    'success': True,
                    'message': 'Verification email sent successfully',
                    'verification_token': verification_token,
                    'expires_in_minutes': 30
                }
            else:
                return {
                    'success': False,
                    'error': 'Failed to send verification email'
                }
                
        except Exception as e:
            logger.error(f"Error initiating email verification: {str(e)}")
            return {
                'success': False,
                'error': 'Failed to initiate email verification'
            }
    
    def verify_email_code(self, email: str, code: str, token: str = None) -> Dict:
        """Verify email verification code"""
        try:
            cache_key = self._get_cache_key('email_verify', email)
            verification_data = self._get_verification_data(cache_key)
            
            if not verification_data:
                return {
                    'success': False,
                    'error': 'Verification code expired or invalid'
                }
            
            # Check attempts
            if verification_data['attempts'] >= 3:
                self._clear_verification_data(cache_key)
                return {
                    'success': False,
                    'error': 'Too many failed attempts. Please request a new code.'
                }
            
            # Verify code
            if verification_data['code'] != code:
                verification_data['attempts'] += 1
                self._store_verification_data(cache_key, verification_data, expiry_minutes=30)
                return {
                    'success': False,
                    'error': 'Invalid verification code',
                    'attempts_remaining': 3 - verification_data['attempts']
                }
            
            # Verify token if provided
            if token and verification_data['token'] != token:
                return {
                    'success': False,
                    'error': 'Invalid verification token'
                }
            
            # Mark email as verified
            user = User.objects.get(id=verification_data['user_id'])
            user.is_email_verified = True
            user.save()
            
            # Clear verification data
            self._clear_verification_data(cache_key)
            
            logger.info(f"Email verified successfully for user {user.id}")
            return {
                'success': True,
                'message': 'Email verified successfully',
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'is_email_verified': True
                }
            }
            
        except User.DoesNotExist:
            return {
                'success': False,
                'error': 'User not found'
            }
        except Exception as e:
            logger.error(f"Error verifying email code: {str(e)}")
            return {
                'success': False,
                'error': 'Failed to verify email code'
            }
    
    # SMS VERIFICATION METHODS
    
    def initiate_sms_verification(self, user: User) -> Dict:
        """Initiate SMS verification for a user"""
        try:
            if not user.phone:
                return {
                    'success': False,
                    'error': 'No phone number associated with account'
                }
            
            verification_code = self.generate_verification_code()
            verification_token = self.generate_verification_token()
            
            # Store verification data
            verification_data = {
                'user_id': str(user.id),
                'phone': user.phone,
                'code': verification_code,
                'token': verification_token,
                'created_at': timezone.now().isoformat(),
                'attempts': 0,
                'type': 'sms_verification'
            }
            
            cache_key = self._get_cache_key('sms_verify', user.phone)
            self._store_verification_data(cache_key, verification_data, expiry_minutes=15)
            
            # Send verification SMS
            sms_result = self.sms_service.send_lead_verification_sms(
                user.phone, 
                verification_code
            )
            
            if sms_result['success']:
                logger.info(f"SMS verification initiated for user {user.id}")
                return {
                    'success': True,
                    'message': 'Verification SMS sent successfully',
                    'verification_token': verification_token,
                    'expires_in_minutes': 15
                }
            else:
                return {
                    'success': False,
                    'error': f"Failed to send verification SMS: {sms_result.get('error', 'Unknown error')}"
                }
                
        except Exception as e:
            logger.error(f"Error initiating SMS verification: {str(e)}")
            return {
                'success': False,
                'error': 'Failed to initiate SMS verification'
            }
    
    def verify_sms_code(self, phone: str, code: str, token: str = None) -> Dict:
        """Verify SMS verification code"""
        try:
            cache_key = self._get_cache_key('sms_verify', phone)
            verification_data = self._get_verification_data(cache_key)
            
            if not verification_data:
                return {
                    'success': False,
                    'error': 'Verification code expired or invalid'
                }
            
            # Check attempts
            if verification_data['attempts'] >= 3:
                self._clear_verification_data(cache_key)
                return {
                    'success': False,
                    'error': 'Too many failed attempts. Please request a new code.'
                }
            
            # Verify code
            if verification_data['code'] != code:
                verification_data['attempts'] += 1
                self._store_verification_data(cache_key, verification_data, expiry_minutes=15)
                return {
                    'success': False,
                    'error': 'Invalid verification code',
                    'attempts_remaining': 3 - verification_data['attempts']
                }
            
            # Verify token if provided
            if token and verification_data['token'] != token:
                return {
                    'success': False,
                    'error': 'Invalid verification token'
                }
            
            # Mark phone as verified
            user = User.objects.get(id=verification_data['user_id'])
            user.is_phone_verified = True
            user.save()
            
            # Clear verification data
            self._clear_verification_data(cache_key)
            
            logger.info(f"SMS verified successfully for user {user.id}")
            return {
                'success': True,
                'message': 'Phone number verified successfully',
                'user': {
                    'id': str(user.id),
                    'phone': user.phone,
                    'is_phone_verified': True
                }
            }
            
        except User.DoesNotExist:
            return {
                'success': False,
                'error': 'User not found'
            }
        except Exception as e:
            logger.error(f"Error verifying SMS code: {str(e)}")
            return {
                'success': False,
                'error': 'Failed to verify SMS code'
            }
    
    # PASSWORD RESET METHODS
    
    def initiate_password_reset(self, email: str, method: str = 'email') -> Dict:
        """Initiate password reset via email or SMS"""
        try:
            # Find user by email
            try:
                user = User.objects.get(email=email, is_active=True)
            except User.DoesNotExist:
                # Don't reveal if email exists for security
                return {
                    'success': True,
                    'message': 'If an account with this email exists, reset instructions have been sent.'
                }
            
            reset_code = self.generate_verification_code()
            reset_token = self.generate_verification_token()
            
            # Store reset data
            reset_data = {
                'user_id': str(user.id),
                'email': user.email,
                'phone': user.phone,
                'code': reset_code,
                'token': reset_token,
                'created_at': timezone.now().isoformat(),
                'attempts': 0,
                'type': 'password_reset'
            }
            
            cache_key = self._get_cache_key('password_reset', user.email)
            self._store_verification_data(cache_key, reset_data, expiry_minutes=30)
            
            if method == 'sms' and user.phone:
                # Send SMS reset code
                sms_result = self.sms_service.send_sms(
                    user.phone,
                    f"ProConnectSA Password Reset Code: {reset_code}. Valid for 30 minutes. Do not share this code."
                )
                
                if sms_result['success']:
                    logger.info(f"Password reset SMS sent to user {user.id}")
                    return {
                        'success': True,
                        'message': 'Password reset code sent via SMS',
                        'reset_token': reset_token,
                        'expires_in_minutes': 30
                    }
                else:
                    # Fallback to email
                    method = 'email'
            
            if method == 'email':
                # Send email reset code
                email_sent = self.email_service.send_password_reset_email(
                    user.email,
                    reset_code,
                    reset_token
                )
                
                if email_sent:
                    logger.info(f"Password reset email sent to user {user.id}")
                    return {
                        'success': True,
                        'message': 'Password reset code sent via email',
                        'reset_token': reset_token,
                        'expires_in_minutes': 30
                    }
            
            return {
                'success': False,
                'error': 'Failed to send password reset code'
            }
                
        except Exception as e:
            logger.error(f"Error initiating password reset: {str(e)}")
            return {
                'success': False,
                'error': 'Failed to initiate password reset'
            }
    
    def verify_password_reset_code(self, email: str, code: str, token: str) -> Dict:
        """Verify password reset code"""
        try:
            cache_key = self._get_cache_key('password_reset', email)
            reset_data = self._get_verification_data(cache_key)
            
            if not reset_data:
                return {
                    'success': False,
                    'error': 'Reset code expired or invalid'
                }
            
            # Check attempts
            if reset_data['attempts'] >= 3:
                self._clear_verification_data(cache_key)
                return {
                    'success': False,
                    'error': 'Too many failed attempts. Please request a new code.'
                }
            
            # Verify code and token
            if reset_data['code'] != code or reset_data['token'] != token:
                reset_data['attempts'] += 1
                self._store_verification_data(cache_key, reset_data, expiry_minutes=30)
                return {
                    'success': False,
                    'error': 'Invalid reset code or token',
                    'attempts_remaining': 3 - reset_data['attempts']
                }
            
            # Mark as verified for password reset
            reset_data['verified'] = True
            self._store_verification_data(cache_key, reset_data, expiry_minutes=30)
            
            logger.info(f"Password reset code verified for user {reset_data['user_id']}")
            return {
                'success': True,
                'message': 'Reset code verified successfully',
                'reset_token': token
            }
            
        except Exception as e:
            logger.error(f"Error verifying password reset code: {str(e)}")
            return {
                'success': False,
                'error': 'Failed to verify reset code'
            }
    
    def reset_password(self, email: str, new_password: str, token: str) -> Dict:
        """Reset user password after verification"""
        try:
            cache_key = self._get_cache_key('password_reset', email)
            reset_data = self._get_verification_data(cache_key)
            
            if not reset_data or not reset_data.get('verified'):
                return {
                    'success': False,
                    'error': 'Password reset not verified or expired'
                }
            
            # Get user and reset password
            user = User.objects.get(id=reset_data['user_id'])
            user.set_password(new_password)
            user.save()
            
            # Clear reset data
            self._clear_verification_data(cache_key)
            
            logger.info(f"Password reset successfully for user {user.id}")
            return {
                'success': True,
                'message': 'Password reset successfully'
            }
            
        except User.DoesNotExist:
            return {
                'success': False,
                'error': 'User not found'
            }
        except Exception as e:
            logger.error(f"Error resetting password: {str(e)}")
            return {
                'success': False,
                'error': 'Failed to reset password'
            }
    
    # TWO-FACTOR AUTHENTICATION
    
    def initiate_two_factor_auth(self, user: User) -> Dict:
        """Initiate two-factor authentication via SMS"""
        try:
            if not user.phone or not user.is_phone_verified:
                return {
                    'success': False,
                    'error': 'Phone number not verified for two-factor authentication'
                }
            
            auth_code = self.generate_verification_code()
            auth_token = self.generate_verification_token()
            
            # Store 2FA data
            auth_data = {
                'user_id': str(user.id),
                'phone': user.phone,
                'code': auth_code,
                'token': auth_token,
                'created_at': timezone.now().isoformat(),
                'attempts': 0,
                'type': 'two_factor_auth'
            }
            
            cache_key = self._get_cache_key('2fa', user.phone)
            self._store_verification_data(cache_key, auth_data, expiry_minutes=10)
            
            # Send 2FA SMS
            sms_result = self.sms_service.send_sms(
                user.phone,
                f"ProConnectSA 2FA Code: {auth_code}. Valid for 10 minutes. Do not share this code."
            )
            
            if sms_result['success']:
                logger.info(f"2FA SMS sent to user {user.id}")
                return {
                    'success': True,
                    'message': 'Two-factor authentication code sent',
                    'auth_token': auth_token,
                    'expires_in_minutes': 10
                }
            else:
                return {
                    'success': False,
                    'error': f"Failed to send 2FA code: {sms_result.get('error', 'Unknown error')}"
                }
                
        except Exception as e:
            logger.error(f"Error initiating 2FA: {str(e)}")
            return {
                'success': False,
                'error': 'Failed to initiate two-factor authentication'
            }
    
    def verify_two_factor_auth(self, phone: str, code: str, token: str) -> Dict:
        """Verify two-factor authentication code"""
        try:
            cache_key = self._get_cache_key('2fa', phone)
            auth_data = self._get_verification_data(cache_key)
            
            if not auth_data:
                return {
                    'success': False,
                    'error': '2FA code expired or invalid'
                }
            
            # Check attempts
            if auth_data['attempts'] >= 3:
                self._clear_verification_data(cache_key)
                return {
                    'success': False,
                    'error': 'Too many failed attempts. Please request a new code.'
                }
            
            # Verify code and token
            if auth_data['code'] != code or auth_data['token'] != token:
                auth_data['attempts'] += 1
                self._store_verification_data(cache_key, auth_data, expiry_minutes=10)
                return {
                    'success': False,
                    'error': 'Invalid 2FA code or token',
                    'attempts_remaining': 3 - auth_data['attempts']
                }
            
            # Clear auth data
            self._clear_verification_data(cache_key)
            
            logger.info(f"2FA verified successfully for user {auth_data['user_id']}")
            return {
                'success': True,
                'message': 'Two-factor authentication verified successfully',
                'user_id': auth_data['user_id']
            }
            
        except Exception as e:
            logger.error(f"Error verifying 2FA: {str(e)}")
            return {
                'success': False,
                'error': 'Failed to verify two-factor authentication'
            }
    
    # UTILITY METHODS
    
    def get_user_verification_status(self, user: User) -> Dict:
        """Get current verification status for a user"""
        return {
            'user_id': str(user.id),
            'email': user.email,
            'phone': user.phone,
            'is_email_verified': user.is_email_verified,
            'is_phone_verified': user.is_phone_verified,
            'verification_complete': user.is_email_verified and user.is_phone_verified
        }
    
    def resend_verification(self, user: User, method: str) -> Dict:
        """Resend verification code via email or SMS"""
        if method == 'email':
            return self.initiate_email_verification(user)
        elif method == 'sms':
            return self.initiate_sms_verification(user)
        else:
            return {
                'success': False,
                'error': 'Invalid verification method'
            }





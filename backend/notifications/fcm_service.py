"""
Firebase Cloud Messaging (FCM) Service for Push Notifications
"""
import logging
import json
from typing import Dict, List, Optional, Any
from django.conf import settings
from django.contrib.auth import get_user_model
from backend.notifications.models import Notification

logger = logging.getLogger(__name__)
User = get_user_model()

try:
    import firebase_admin
    from firebase_admin import credentials, messaging
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    logger.warning("firebase-admin not installed. Push notifications will be disabled.")


class FCMService:
    """Service for sending push notifications via Firebase Cloud Messaging"""
    
    _initialized = False
    
    @classmethod
    def initialize(cls):
        """Initialize Firebase Admin SDK"""
        if not FIREBASE_AVAILABLE:
            logger.warning("Firebase Admin SDK not available. Push notifications disabled.")
            return False
        
        if cls._initialized:
            return True
        
        if not getattr(settings, 'FCM_ENABLED', True):
            logger.info("FCM is disabled in settings")
            return False
        
        try:
            # Check if already initialized
            firebase_admin.get_app()
            cls._initialized = True
            logger.info("Firebase already initialized")
            return True
        except ValueError:
            # Not initialized yet, initialize it
            pass
        
        try:
            cred_path = getattr(settings, 'FIREBASE_CREDENTIALS_PATH', None)
            
            if cred_path:
                import os
                if os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                    cls._initialized = True
                    logger.info(f"Firebase initialized with credentials from {cred_path}")
                    return True
                else:
                    logger.error(f"Firebase credentials file not found: {cred_path}")
                    return False
            else:
                # Try to use default credentials (for Google Cloud environments)
                try:
                    firebase_admin.initialize_app()
                    cls._initialized = True
                    logger.info("Firebase initialized with default credentials")
                    return True
                except Exception as e:
                    logger.error(f"Failed to initialize Firebase: {e}")
                    return False
        except Exception as e:
            logger.error(f"Error initializing Firebase: {e}", exc_info=True)
            return False
    
    @classmethod
    def send_push_notification(
        cls,
        user: User,
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None,
        notification_type: str = 'system',
        lead_id: Optional[str] = None,
    ) -> bool:
        """
        Send a push notification to a user
        
        Args:
            user: User to send notification to
            title: Notification title
            body: Notification body
            data: Additional data payload
            notification_type: Type of notification
            lead_id: Optional lead ID for deep linking
        
        Returns:
            bool: True if sent successfully, False otherwise
        """
        if not cls.initialize():
            logger.warning("FCM not initialized, skipping push notification")
            return False
        
        # Get user's FCM tokens
        from backend.notifications.models import PushSubscription
        subscriptions = PushSubscription.objects.filter(
            user=user,
            is_active=True
        )
        
        if not subscriptions.exists():
            logger.debug(f"No active FCM subscriptions for user {user.id}")
            return False
        
        # Prepare notification
        notification = messaging.Notification(
            title=title,
            body=body,
        )
        
        # Prepare data payload
        message_data = {
            'type': notification_type,
            'title': title,
            'body': body,
        }
        
        if lead_id:
            message_data['lead_id'] = str(lead_id)
        
        if data:
            message_data.update({k: str(v) for k, v in data.items()})
        
        # Prepare message
        message = messaging.MulticastMessage(
            notification=notification,
            data=message_data,
            android=messaging.AndroidConfig(
                priority='high',
                notification=messaging.AndroidNotification(
                    sound='default',
                    channel_id='proconnectsa_notifications',
                ),
            ),
            apns=messaging.APNSConfig(
                payload=messaging.APNSPayload(
                    aps=messaging.Aps(
                        sound='default',
                        badge=1,
                    ),
                ),
            ),
            webpush=messaging.WebpushConfig(
                notification=messaging.WebpushNotification(
                    icon='/icon-192.png',
                    badge='/icon-192.png',
                ),
                fcm_options=messaging.WebpushFCMOptions(
                    link='/dashboard',
                ),
            ),
        )
        
        # Get tokens
        tokens = [sub.token for sub in subscriptions]
        
        if not tokens:
            return False
        
        try:
            # Send to all user's devices
            response = messaging.send_multicast(
                message=message,
                tokens=tokens,
            )
            
            # Handle failures
            if response.failure_count > 0:
                for idx, response_item in enumerate(response.responses):
                    if not response_item.success:
                        # Remove invalid tokens
                        if response_item.exception.code == 'registration-token-not-registered':
                            subscriptions[idx].is_active = False
                            subscriptions[idx].save()
                            logger.info(f"Removed invalid FCM token for user {user.id}")
            
            success_count = response.success_count
            logger.info(f"Sent push notification to {success_count}/{len(tokens)} devices for user {user.id}")
            
            # Also create in-app notification
            Notification.create_for_user(
                user=user,
                notification_type=notification_type,
                title=title,
                message=body,
                data=message_data,
            )
            
            return success_count > 0
            
        except Exception as e:
            logger.error(f"Error sending push notification to user {user.id}: {e}", exc_info=True)
            return False
    
    @classmethod
    def send_to_multiple_users(
        cls,
        users: List[User],
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None,
        notification_type: str = 'system',
    ) -> int:
        """
        Send push notification to multiple users
        
        Returns:
            int: Number of successful sends
        """
        success_count = 0
        for user in users:
            if cls.send_push_notification(user, title, body, data, notification_type):
                success_count += 1
        return success_count
    
    @classmethod
    def send_lead_notification(
        cls,
        user: User,
        lead,
        title: Optional[str] = None,
        body: Optional[str] = None,
    ) -> bool:
        """
        Send a notification about a new lead
        
        Args:
            user: Provider user to notify
            lead: Lead object
            title: Custom title (optional)
            body: Custom body (optional)
        """
        if not title:
            title = f"New {lead.service_category.name if hasattr(lead, 'service_category') else 'Lead'} Lead"
        
        if not body:
            location = f"{lead.location_suburb}, {lead.location_city}" if hasattr(lead, 'location_suburb') else lead.location_city
            budget = getattr(lead, 'budget_range', 'Budget available')
            body = f"{location} • {budget}"
        
        data = {
            'lead_id': str(lead.id),
            'action': 'view_lead',
        }
        
        return cls.send_push_notification(
            user=user,
            title=title,
            body=body,
            data=data,
            notification_type='lead_assigned',
            lead_id=str(lead.id),
        )

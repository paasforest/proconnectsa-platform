import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import logging

logger = logging.getLogger(__name__)

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = None
        self.user_group_name = None
        self.general_group_name = 'notifications'
        
        # Join general room group
        await self.channel_layer.group_add(
            self.general_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room groups
        await self.channel_layer.group_discard(
            self.general_group_name,
            self.channel_name
        )
        
        # Leave user-specific group if connected
        if self.user_group_name:
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            
            if message_type == 'auth':
                token = text_data_json.get('token')
                if token:
                    self.user = await self.authenticate_user(token)
                    if self.user:
                        # Join user-specific group for targeted notifications
                        self.user_group_name = f'user_{self.user.id}'
                        await self.channel_layer.group_add(
                            self.user_group_name,
                            self.channel_name
                        )
                        
                        # Send pending notifications
                        pending_notifications = await self.get_pending_notifications()
                        
                        await self.send(text_data=json.dumps({
                            'type': 'auth_success',
                            'message': 'Authentication successful',
                            'user_id': str(self.user.id),
                            'pending_notifications': pending_notifications
                        }))
                    else:
                        await self.send(text_data=json.dumps({
                            'type': 'auth_error',
                            'message': 'Invalid token'
                        }))
                        await self.close()
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))

    async def notification_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': event['notification']
        }))
    
    async def lead_alert(self, event):
        """Handle real-time lead alerts"""
        await self.send(text_data=json.dumps({
            'type': 'lead_alert',
            'lead': event['lead'],
            'compatibility_score': event.get('compatibility_score'),
            'estimated_value': event.get('estimated_value'),
            'urgency': event.get('urgency', 'medium'),
            'expires_in': event.get('expires_in', 3600)  # 1 hour default
        }))
    
    async def lead_update(self, event):
        """Handle lead status updates"""
        await self.send(text_data=json.dumps({
            'type': 'lead_update',
            'lead_id': event['lead_id'],
            'status': event['status'],
            'message': event.get('message', '')
        }))
    
    async def lead_created(self, event):
        """Handle new lead creation"""
        await self.send(text_data=json.dumps({
            'type': 'lead_created',
            'lead': event['lead']
        }))
    
    async def lead_claimed(self, event):
        """Handle lead claim updates"""
        await self.send(text_data=json.dumps({
            'type': 'lead_claimed',
            'lead_id': event['lead_id'],
            'current_claims': event['current_claims'],
            'total_claims': event.get('total_claims', 3),
            'is_available': event.get('is_available', True),
            'status': event.get('status', 'claimed')
        }))
    
    async def balance_updated(self, event):
        """Handle balance updates"""
        await self.send(text_data=json.dumps({
            'type': 'balance_updated',
            'new_balance': event['new_balance'],
            'previous_balance': event.get('previous_balance', 0),
            'change_amount': event.get('change_amount', 0)
        }))

    @database_sync_to_async
    def authenticate_user(self, token):
        try:
            from rest_framework.authtoken.models import Token
            token_obj = Token.objects.get(key=token)
            return token_obj.user
        except Token.DoesNotExist:
            return None
    
    @database_sync_to_async
    def get_pending_notifications(self):
        """Get unread notifications for the user"""
        if not self.user:
            return []
        
        try:
            from .models import Notification
            notifications = Notification.objects.filter(
                user=self.user,
                is_read=False
            ).order_by('-created_at')[:10]
            
            return [{
                'id': str(notification.id),
                'title': notification.title,
                'message': notification.message,
                'type': notification.notification_type,
                'created_at': notification.created_at.isoformat(),
                'data': notification.data or {}
            } for notification in notifications]
        except:
            return []

    @staticmethod
    def send_lead_alert_to_providers(provider_ids, lead_data, compatibility_scores=None):
        """Send real-time lead alert to specific providers"""
        channel_layer = get_channel_layer()
        
        for provider_id in provider_ids:
            compatibility_score = None
            if compatibility_scores and provider_id in compatibility_scores:
                compatibility_score = compatibility_scores[provider_id]
            
            async_to_sync(channel_layer.group_send)(
                f'user_{provider_id}',
                {
                    'type': 'lead_alert',
                    'lead': lead_data,
                    'compatibility_score': compatibility_score,
                    'estimated_value': lead_data.get('budget_range', 'unknown'),
                    'urgency': lead_data.get('urgency', 'medium'),
                    'expires_in': 3600
                }
            )
    
    @staticmethod 
    def send_lead_update(provider_ids, lead_id, status, message=""):
        """Send lead status update to providers"""
        channel_layer = get_channel_layer()
        
        for provider_id in provider_ids:
            async_to_sync(channel_layer.group_send)(
                f'user_{provider_id}',
                {
                    'type': 'lead_update',
                    'lead_id': lead_id,
                    'status': status,
                    'message': message
                }
            )

    @classmethod
    async def send_notification_to_user(cls, user_id, notification_data):
        """Send notification to specific user"""
        channel_layer = get_channel_layer()
        await channel_layer.group_send(
            f'user_{user_id}',
            {
                'type': 'notification_message',
                'notification': notification_data
            }
        )
    
    @staticmethod
    def send_lead_created_to_all(lead_data):
        """Send new lead notification to all connected providers"""
        try:
            channel_layer = get_channel_layer()
            
            async_to_sync(channel_layer.group_send)(
                'notifications',
                {
                    'type': 'lead_created',
                    'lead': lead_data
                }
            )
            logger.info(f"Sent lead_created event to all providers for lead {lead_data.get('id')}")
        except Exception as e:
            logger.error(f"Error sending lead_created event: {str(e)}")
    
    @staticmethod
    def send_lead_claimed_update(lead_id, current_claims, total_claims=3, is_available=True, status='claimed'):
        """Send lead claim update to all connected providers"""
        try:
            channel_layer = get_channel_layer()
            
            async_to_sync(channel_layer.group_send)(
                'notifications',
                {
                    'type': 'lead_claimed',
                    'lead_id': str(lead_id),
                    'current_claims': current_claims,
                    'total_claims': total_claims,
                    'is_available': is_available,
                    'status': status
                }
            )
            logger.info(f"Sent lead_claimed event for lead {lead_id}: {current_claims}/{total_claims} claims")
        except Exception as e:
            logger.error(f"Error sending lead_claimed event: {str(e)}")
    
    @staticmethod
    def send_balance_update(user_id, new_balance, previous_balance=0):
        """Send balance update to specific user"""
        try:
            channel_layer = get_channel_layer()
            change_amount = new_balance - previous_balance
            
            async_to_sync(channel_layer.group_send)(
                f'user_{user_id}',
                {
                    'type': 'balance_updated',
                    'new_balance': new_balance,
                    'previous_balance': previous_balance,
                    'change_amount': change_amount
                }
            )
            logger.info(f"Sent balance_update event to user {user_id}: {previous_balance} -> {new_balance}")
        except Exception as e:
            logger.error(f"Error sending balance_update event: {str(e)}")



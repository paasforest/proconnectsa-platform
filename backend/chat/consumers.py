import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)
User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Handle WebSocket connection for chat"""
        self.user = None
        self.room_name = "support_chat"
        self.room_group_name = f"chat_{self.room_name}"

        # Get token from query parameters
        query_string = self.scope.get('query_string', b'').decode()
        token = None
        
        for param in query_string.split('&'):
            if param.startswith('token='):
                token = param.split('=')[1]
                break
        
        # Authenticate user
        if token:
            self.user = await self.authenticate_user(token)
            if self.user:
                # Join chat room
                await self.channel_layer.group_add(
                    self.room_group_name,
                    self.channel_name
                )
                await self.accept()
                
                # Send welcome message
                await self.send(text_data=json.dumps({
                    'type': 'chat_message',
                    'message': {
                        'id': 'welcome',
                        'content': 'Welcome to ProCompare Support! How can I help you today?',
                        'sender': 'support',
                        'timestamp': self.get_timestamp()
                    }
                }))
                return
        
        # Reject connection if not authenticated
        await self.close()

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            
            if message_type == 'chat_message':
                message_content = text_data_json.get('message', {}).get('content', '')
                
                if message_content.strip():
                    # Broadcast message to all users in the chat room
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'chat_message',
                            'message': {
                                'id': text_data_json.get('message', {}).get('id', ''),
                                'content': message_content,
                                'sender': text_data_json.get('message', {}).get('sender', 'user'),
                                'timestamp': text_data_json.get('message', {}).get('timestamp', self.get_timestamp())
                            }
                        }
                    )
                    
                    # Simulate support response for demo
                    await self.simulate_support_response(message_content)
            
            elif message_type == 'typing':
                # Handle typing indicators
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'typing',
                        'isTyping': text_data_json.get('isTyping', False)
                    }
                )
                
        except json.JSONDecodeError:
            logger.error("Invalid JSON received in chat")
        except Exception as e:
            logger.error(f"Error in chat receive: {str(e)}")

    async def chat_message(self, event):
        """Send chat message to WebSocket"""
        message = event['message']
        
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message
        }))

    async def typing(self, event):
        """Send typing indicator to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'isTyping': event['isTyping']
        }))

    async def simulate_support_response(self, user_message):
        """Simulate support response for demo purposes"""
        import asyncio
        
        # Wait 2 seconds before responding
        await asyncio.sleep(2)
        
        # Generate appropriate response based on message content
        response = self.generate_support_response(user_message)
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': {
                    'id': f"support_{int(asyncio.get_event_loop().time() * 1000)}",
                    'content': response,
                    'sender': 'support',
                    'timestamp': self.get_timestamp()
                }
            }
        )

    def generate_support_response(self, user_message):
        """Generate contextual support response"""
        message_lower = user_message.lower()
        
        if any(word in message_lower for word in ['help', 'problem', 'issue', 'error']):
            return "I understand you're having an issue. Let me help you with that. Can you provide more details about what's not working?"
        elif any(word in message_lower for word in ['billing', 'payment', 'credit', 'money']):
            return "I can help you with billing questions. Let me check your account and get back to you with the details."
        elif any(word in message_lower for word in ['account', 'login', 'password', 'access']):
            return "I can assist you with account-related issues. Please provide your email address so I can look up your account."
        elif any(word in message_lower for word in ['lead', 'service', 'provider', 'client']):
            return "I can help you with lead and service questions. What specific information do you need about our platform?"
        else:
            return "Thank you for your message. Our support team will review your inquiry and respond with detailed assistance shortly."

    @database_sync_to_async
    def authenticate_user(self, token):
        """Authenticate user with token"""
        try:
            from rest_framework.authtoken.models import Token
            token_obj = Token.objects.get(key=token)
            return token_obj.user
        except Token.DoesNotExist:
            return None

    def get_timestamp(self):
        """Get current timestamp in ISO format"""
        from django.utils import timezone
        return timezone.now().isoformat()








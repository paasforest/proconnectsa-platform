# Django Backend - WebSocket for Real-time Updates
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class LeadUpdatesConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get token from query parameters
        query_string = self.scope.get('query_string', b'').decode()
        token = None
        
        # Parse token from query string
        for param in query_string.split('&'):
            if param.startswith('token='):
                token = param.split('=')[1]
                break
        
        # Authenticate user with token
        if token:
            user = await self.authenticate_user(token)
            if user and user != self.get_anonymous_user():
                self.user = user
                # Join lead updates group
                self.group_name = "lead_updates"
                await self.channel_layer.group_add(
                    self.group_name,
                    self.channel_name
                )
                await self.accept()
                return
        
        # Reject connection if not authenticated
        await self.close()
    
    def get_anonymous_user(self):
        """Get AnonymousUser instance"""
        from django.contrib.auth.models import AnonymousUser
        return AnonymousUser()
    
    @database_sync_to_async
    def authenticate_user(self, token):
        """Authenticate user with token"""
        try:
            from rest_framework.authtoken.models import Token
            token_obj = Token.objects.get(key=token)
            return token_obj.user
        except Token.DoesNotExist:
            return None
    
    async def disconnect(self, close_code):
        # Leave lead updates group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
    
    async def lead_claimed(self, event):
        """Send lead claim update to client"""
        await self.send(text_data=json.dumps({
            'type': 'lead_claimed',
            'lead_id': event['lead_id'],
            'current_claims': event['current_claims'],
            'remaining_slots': event['remaining_slots'],
            'is_available': event['is_available'],
            'status': event['status']
        }))
    
    async def lead_created(self, event):
        """Send new lead notification to client"""
        await self.send(text_data=json.dumps({
            'type': 'lead_created',
            'lead': event['lead_data']
        }))


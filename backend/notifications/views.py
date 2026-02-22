"""
Notification API views
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Notification, NotificationSettings, PushSubscription
from .serializers import NotificationSerializer, NotificationSettingsSerializer
from .services import NotificationService
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class NotificationListView(generics.ListAPIView):
    """List notifications for authenticated user"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Notification.objects.filter(user=user)
        
        # Filter by read status
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        # Filter by notification type
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        return queryset.order_by('-created_at')


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a notification"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    def update(self, request, *args, **kwargs):
        """Mark notification as read"""
        notification = self.get_object()
        if not notification.is_read:
            notification.mark_as_read()
            return Response({'message': 'Notification marked as read'})
        return Response({'message': 'Notification already read'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def notification_count(request):
    """Get notification count for user"""
    try:
        service = NotificationService()
        unread_count = service.get_notification_count(request.user, unread_only=True)
        total_count = service.get_notification_count(request.user, unread_only=False)
        
        return Response({
            'unread_count': unread_count,
            'total_count': total_count
        })
    except Exception as e:
        logger.error(f"Error getting notification count: {str(e)}")
        return Response(
            {'error': 'Failed to get notification count'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_read(request):
    """Mark all notifications as read for user"""
    try:
        service = NotificationService()
        success = service.mark_all_notifications_read(request.user)
        
        if success:
            return Response({'message': 'All notifications marked as read'})
        else:
            return Response(
                {'error': 'Failed to mark notifications as read'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    except Exception as e:
        logger.error(f"Error marking all notifications as read: {str(e)}")
        return Response(
            {'error': 'Failed to mark notifications as read'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Mark a specific notification as read"""
    try:
        service = NotificationService()
        success = service.mark_notification_read(notification_id, request.user)
        
        if success:
            return Response({'message': 'Notification marked as read'})
        else:
            return Response(
                {'error': 'Notification not found or already read'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    except Exception as e:
        logger.error(f"Error marking notification as read: {str(e)}")
        return Response(
            {'error': 'Failed to mark notification as read'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recent_notifications(request):
    """Get recent notifications for user"""
    try:
        service = NotificationService()
        limit = int(request.query_params.get('limit', 10))
        notifications = service.get_user_notifications(request.user, limit=limit, unread_only=False)
        
        serializer = NotificationSerializer(notifications, many=True)
        return Response({
            'notifications': serializer.data,
            'count': len(notifications)
        })
    except Exception as e:
        logger.error(f"Error getting recent notifications: {str(e)}")
        return Response(
            {'error': 'Failed to get recent notifications'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class NotificationSettingsView(generics.RetrieveUpdateAPIView):
    """Get or update notification settings for user"""
    serializer_class = NotificationSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        settings, created = NotificationSettings.objects.get_or_create(user=self.request.user)
        return settings


# =============================================================================
# Push Notification Endpoints
# =============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def subscribe_push(request):
    """
    Subscribe user to push notifications
    
    Expected payload:
    {
        "token": "fcm_registration_token",
        "endpoint": "https://fcm.googleapis.com/...",  # Optional for web push
        "keys": {  # Optional for web push
            "p256dh": "...",
            "auth": "..."
        },
        "device_type": "android|ios|web",
        "user_agent": "Mozilla/5.0..."
    }
    """
    try:
        token = request.data.get('token')
        if not token:
            return Response(
                {'error': 'Token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create subscription
        subscription, created = PushSubscription.objects.update_or_create(
            user=request.user,
            token=token,
            defaults={
                'endpoint': request.data.get('endpoint'),
                'keys': request.data.get('keys', {}),
                'device_type': request.data.get('device_type', 'web'),
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'is_active': True,
                'last_used_at': timezone.now(),
            }
        )
        
        # Ensure notification settings exist
        NotificationSettings.objects.get_or_create(user=request.user)
        
        logger.info(f"Push subscription {'created' if created else 'updated'} for user {request.user.id}")
        
        return Response({
            'success': True,
            'message': 'Successfully subscribed to push notifications',
            'subscription_id': subscription.id,
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error subscribing to push notifications: {e}", exc_info=True)
        return Response(
            {'error': 'Failed to subscribe to push notifications'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unsubscribe_push(request):
    """
    Unsubscribe user from push notifications
    
    Expected payload:
    {
        "token": "fcm_registration_token"  # Optional, if not provided, unsubscribe all
    }
    """
    try:
        token = request.data.get('token')
        
        if token:
            # Unsubscribe specific token
            subscriptions = PushSubscription.objects.filter(
                user=request.user,
                token=token
            )
        else:
            # Unsubscribe all tokens for user
            subscriptions = PushSubscription.objects.filter(user=request.user)
        
        count = subscriptions.update(is_active=False)
        
        logger.info(f"Unsubscribed {count} push subscription(s) for user {request.user.id}")
        
        return Response({
            'success': True,
            'message': f'Successfully unsubscribed {count} device(s)',
        })
        
    except Exception as e:
        logger.error(f"Error unsubscribing from push notifications: {e}", exc_info=True)
        return Response(
            {'error': 'Failed to unsubscribe from push notifications'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def push_subscriptions(request):
    """
    Get user's push subscriptions
    """
    try:
        subscriptions = PushSubscription.objects.filter(
            user=request.user,
            is_active=True
        ).values('id', 'device_type', 'created_at', 'last_used_at')
        
        return Response({
            'subscriptions': list(subscriptions),
            'count': subscriptions.count(),
        })
        
    except Exception as e:
        logger.error(f"Error fetching push subscriptions: {e}", exc_info=True)
        return Response(
            {'error': 'Failed to fetch subscriptions'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

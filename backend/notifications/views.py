"""
Notification API views
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from .models import Notification, NotificationSettings
from .serializers import NotificationSerializer, NotificationSettingsSerializer
from .services import NotificationService
import logging

logger = logging.getLogger(__name__)


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
                {'error': 'Notification not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    except Exception as e:
        logger.error(f"Error marking notification as read: {str(e)}")
        return Response(
            {'error': 'Failed to mark notification as read'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class NotificationSettingsView(generics.RetrieveUpdateAPIView):
    """Get or update user notification settings"""
    serializer_class = NotificationSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        settings, created = NotificationSettings.objects.get_or_create(
            user=self.request.user,
            defaults={
                'email_notifications': True,
                'sms_notifications': False,
                'dashboard_notifications': True,
                'email_lead_assigned': True,
                'email_quote_received': True,
                'email_quote_response': True,
                'email_credit_purchase': True,
                'email_deposit_verified': True,
                'email_system': True,
                'sms_lead_assigned': False,
                'sms_quote_received': False,
                'sms_urgent_only': True,
                'show_popup': True,
                'sound_enabled': True,
                'digest_frequency': 'immediate'
            }
        )
        return settings


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recent_notifications(request):
    """Get recent notifications for dashboard"""
    try:
        limit = int(request.query_params.get('limit', 5))
        service = NotificationService()
        notifications = service.get_user_notifications(request.user, limit=limit)
        
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error getting recent notifications: {str(e)}")
        return Response(
            {'error': 'Failed to get recent notifications'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
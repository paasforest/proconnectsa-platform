from celery import shared_task
from django.contrib.auth import get_user_model
from .models import Notification
from .consumers import NotificationConsumer
import asyncio

User = get_user_model()

@shared_task
def send_notification_task(user_id, notification_type, title, message, data=None):
    """Send notification to user"""
    try:
        user = User.objects.get(id=user_id)
        
        # Create notification in database
        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            data=data or {}
        )
        
        # Send real-time notification via WebSocket
        notification_data = {
            'id': str(notification.id),
            'type': notification_type,
            'title': title,
            'message': message,
            'is_read': notification.is_read,
            'created_at': notification.created_at.isoformat(),
            'data': data or {}
        }
        
        # Send via WebSocket (this would need to be implemented properly)
        # asyncio.run(NotificationConsumer.send_notification_to_user(user_id, notification_data))
        
        return f"Notification sent to user {user_id}"
        
    except User.DoesNotExist:
        return f"User {user_id} not found"
    except Exception as e:
        return f"Error sending notification: {str(e)}"

@shared_task
def send_bulk_notification_task(user_ids, notification_type, title, message, data=None):
    """Send notification to multiple users"""
    results = []
    for user_id in user_ids:
        result = send_notification_task.delay(user_id, notification_type, title, message, data)
        results.append(result)
    return f"Bulk notification sent to {len(user_ids)} users"

@shared_task
def cleanup_old_notifications():
    """Clean up notifications older than 30 days"""
    from django.utils import timezone
    from datetime import timedelta
    
    cutoff_date = timezone.now() - timedelta(days=30)
    deleted_count = Notification.objects.filter(
        created_at__lt=cutoff_date,
        is_read=True
    ).delete()[0]
    
    return f"Cleaned up {deleted_count} old notifications"










from django.urls import path
from . import views

urlpatterns = [
    # Push notification endpoints
    path('push/subscribe/', views.subscribe_push, name='subscribe-push'),
    path('push/unsubscribe/', views.unsubscribe_push, name='unsubscribe-push'),
    path('push/subscriptions/', views.push_subscriptions, name='push-subscriptions'),
    # Notifications
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<uuid:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('count/', views.notification_count, name='notification-count'),
    path('mark-all-read/', views.mark_all_read, name='mark-all-read'),
    path('<uuid:notification_id>/mark-read/', views.mark_notification_read, name='mark-notification-read'),
    path('recent/', views.recent_notifications, name='recent-notifications'),
    
    # Settings
    path('settings/', views.NotificationSettingsView.as_view(), name='notification-settings'),
]


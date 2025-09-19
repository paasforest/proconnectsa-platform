from django.urls import path
from . import views

urlpatterns = [
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


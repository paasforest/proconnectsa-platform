from django.urls import path
from . import admin_monitoring

urlpatterns = [
    path('admin/monitoring/dashboard/', admin_monitoring.admin_monitoring_dashboard, name='admin-monitoring-dashboard'),
    path('admin/monitoring/activity/', admin_monitoring.recent_activity_feed, name='admin-activity-feed'),
    path('admin/monitoring/problems/', admin_monitoring.problem_detection, name='admin-problem-detection'),
]


"""
Support Ticket URLs

This module defines URL patterns for support ticket management.
"""

from django.urls import path
from . import views
from . import auth_views

app_name = 'support'

urlpatterns = [
    # Support Tickets
    path('tickets/', views.SupportTicketListCreateView.as_view(), name='ticket-list-create'),
    path('tickets/<uuid:pk>/', views.SupportTicketDetailView.as_view(), name='ticket-detail'),
    path('tickets/<uuid:ticket_id>/responses/', views.TicketResponseListCreateView.as_view(), name='ticket-responses'),
    
    # Ticket Actions
    path('tickets/<uuid:ticket_id>/assign/', views.assign_ticket, name='assign-ticket'),
    path('tickets/<uuid:ticket_id>/resolve/', views.resolve_ticket, name='resolve-ticket'),
    path('tickets/<uuid:ticket_id>/close/', views.close_ticket, name='close-ticket'),
    path('tickets/<uuid:ticket_id>/rate/', views.rate_ticket, name='rate-ticket'),
    
    # User Tickets
    path('my-tickets/', views.my_tickets, name='my-tickets'),
    
    # Templates
    path('templates/', views.TicketTemplateListCreateView.as_view(), name='template-list-create'),
    
    # Metrics and Dashboard
    path('metrics/', views.SupportMetricsView.as_view(), name='metrics-list'),
    path('dashboard-stats/', views.support_dashboard_stats, name='dashboard-stats'),
    
    # ML Features
    path('ml/recommendations/', views.get_ml_recommendations, name='get-ml-recommendations'),
    path('ml/create-ticket/', views.create_ticket_with_ml, name='create-ticket-with-ml'),
    path('ml/insights/', views.support_ml_insights, name='support-ml-insights'),
    
    # Support Staff Management
    path('staff/register/', auth_views.register_support_staff, name='register-support-staff'),
    path('staff/', auth_views.support_staff_list, name='support-staff-list'),
    path('staff/<int:user_id>/', auth_views.support_staff_detail, name='support-staff-detail'),
    path('staff/<int:user_id>/update/', auth_views.update_support_staff, name='update-support-staff'),
    path('staff/<int:user_id>/deactivate/', auth_views.deactivate_support_staff, name='deactivate-support-staff'),
    path('staff/dashboard/', auth_views.support_staff_dashboard, name='support-staff-dashboard'),
    
    # Support Teams
    path('teams/', auth_views.support_teams, name='support-teams'),
    path('teams/create/', auth_views.create_support_team, name='create-support-team'),
    
    # Analytics
    path('analytics/', auth_views.support_analytics, name='support-analytics'),
]

from django.urls import path, include
from . import views
from . import google_oauth_views
from . import verification_views
from . import wallet_views
from . import my_leads_views
from . import wallet_views_extended
from . import client_views
from . import services_views
from . import public_views
from . import settings_views
from . import support_views
from . import admin_monitoring
from . import admin_views

urlpatterns = [
    # Authentication
    path('register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('login/', views.UserLoginView.as_view(), name='user-login'),
    path('logout/', views.logout_user, name='user-logout'),
    path('refresh-token/', views.refresh_token, name='refresh-token'),
    
    # Profile management
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('password-change/', views.PasswordChangeView.as_view(), name='password-change'),
    path('stats/', views.user_stats_view, name='user-stats'),
    
    # Provider profile
    path('provider-profile/', views.ProviderProfileView.as_view(), name='provider-profile'),
    path('provider-profile/create/', views.ProviderProfileCreateView.as_view(), name='provider-profile-create'),
    
    # Google OAuth endpoints
    path('google/url/', google_oauth_views.google_oauth_url, name='google-oauth-url'),
    path('google/callback/', google_oauth_views.google_oauth_callback, name='google-oauth-callback'),
    
    # Verification endpoints
    path('verify/email/initiate/', verification_views.initiate_email_verification, name='initiate-email-verification'),
    path('verify/email/confirm/', verification_views.verify_email_code, name='verify-email-code'),
    path('verify/sms/initiate/', verification_views.initiate_sms_verification, name='initiate-sms-verification'),
    path('verify/sms/confirm/', verification_views.verify_sms_code, name='verify-sms-code'),
    path('verify/status/', verification_views.verification_status, name='verification-status'),
    path('verify/resend/', verification_views.resend_verification, name='resend-verification'),
    
    # Password reset endpoints
    path('password-reset/request/', verification_views.request_password_reset, name='request-password-reset'),
    path('password-reset/verify/', verification_views.verify_password_reset_code, name='verify-password-reset-code'),
    path('password-reset/confirm/', verification_views.reset_password, name='reset-password'),
    
    # Two-factor authentication endpoints
    path('2fa/initiate/', verification_views.initiate_two_factor_auth, name='initiate-2fa'),
    path('2fa/verify/', verification_views.verify_two_factor_auth, name='verify-2fa'),
    
    # Service management endpoints
    path('services/', views.manage_services, name='manage-services'),
    path('services/areas/add/', views.add_service_area, name='add-service-area'),
    path('services/areas/remove/<str:area>/', views.remove_service_area, name='remove-service-area'),
    path('services/suggestions/', views.get_service_suggestions, name='service-suggestions'),
    
    # Lead management endpoints
    path('leads/', views.LeadViewSet.as_view(), name='leads-list-create'),
    path('leads/<uuid:lead_id>/claim/', views.claim_lead, name='claim-lead'),
    path('leads/dashboard-stats/', views.dashboard_stats, name='dashboard-stats'),
    path('leads/my-claims/', views.my_claimed_leads, name='my-claimed-leads'),
    path('leads/categories/', views.job_categories, name='job-categories'),
    
    # Settings and preferences
    path('settings/', views.SettingsView.as_view(), name='user-settings'),
    path('provider-stats/', views.ProviderStatsView.as_view(), name='provider-stats'),
    
    # Wallet system endpoints
    path('wallet/balance/', wallet_views.wallet_balance, name='wallet_balance'),
    path('wallet/deposit-reference/', wallet_views.generate_deposit_reference, name='deposit_reference'),
    path('leads/<str:lead_id>/unlock/', wallet_views.unlock_lead, name='unlock_lead'),
    
    # Extended Wallet APIs
    path('wallet/', wallet_views_extended.wallet_details, name='wallet_details'),
    path('wallet/transactions/', wallet_views_extended.wallet_transactions, name='wallet_transactions'),
    path('wallet/top-up/', wallet_views_extended.wallet_top_up, name='wallet_top_up'),
    path('wallet/add-credits/', wallet_views_extended.manual_credit_addition, name='manual_credit_addition'),
    path('wallet/reconcile/', wallet_views_extended.trigger_reconciliation, name='trigger_reconciliation'),
    
    # Client Dashboard APIs
    path('client/dashboard/', client_views.client_dashboard_stats, name='client_dashboard_stats'),
    path('client/leads/', client_views.client_leads_list, name='client_leads_list'),
    path('client/leads/<str:lead_id>/resubmit/', client_views.resubmit_similar_lead, name='resubmit_similar_lead'),
    
    # My Leads APIs
    path('my-leads/', my_leads_views.my_leads, name='my_leads'),
    path('my-leads/<str:lead_id>/status/', my_leads_views.update_lead_status, name='update_lead_status'),
    path('my-leads/<str:lead_id>/notes/', my_leads_views.add_lead_note, name='add_lead_note'),
    path('my-leads/stats/', my_leads_views.lead_stats, name='lead_stats'),
    
    # Services APIs
    path('services/', services_views.my_services, name='my_services'),
    path('services/add/', services_views.add_service, name='add_service'),
    path('services/<str:service_id>/', services_views.update_service, name='update_service'),
    path('services/<str:service_id>/delete/', services_views.delete_service, name='delete_service'),
    path('services/stats/', services_views.service_stats, name='service_stats'),
    
    # Settings APIs
    path('settings/', settings_views.profile_details, name='profile_details'),
    path('settings/update/', settings_views.update_profile, name='update_profile'),
    path('settings/change-password/', settings_views.change_password, name='change_password'),
    path('settings/upload-image/', settings_views.upload_profile_image, name='upload_profile_image'),
    path('settings/delete-image/', settings_views.delete_profile_image, name='delete_profile_image'),
    path('provider-profile/documents/', settings_views.list_verification_documents, name='list_verification_documents'),
    path('provider-profile/documents/upload/', settings_views.upload_verification_document, name='upload_verification_document'),
    
    # Premium Listing
    path('request-premium-listing/', settings_views.request_premium_listing, name='request_premium_listing'),
    
    # Support APIs
    path('support/', support_views.support_tickets, name='support_tickets'),
    path('support/create/', support_views.create_ticket, name='create_ticket'),
    path('support/<str:ticket_id>/', support_views.ticket_detail, name='ticket_detail'),
    path('support/<str:ticket_id>/respond/', support_views.add_ticket_response, name='add_ticket_response'),
    path('support/<str:ticket_id>/status/', support_views.update_ticket_status, name='update_ticket_status'),
    path('support/stats/', support_views.support_stats, name='support_stats'),
    
    # Admin Monitoring APIs
    path('monitoring/', admin_monitoring.system_health, name='system_health'),
    
    # Support/Admin User Management APIs
    path('support/users/', admin_views.support_users_list, name='support_users_list'),
    path('support/users/<str:user_id>/', admin_views.support_user_detail, name='support_user_detail'),
    path('support/users/<str:user_id>/update/', admin_views.support_user_update, name='support_user_update'),
    path('support/users/<str:user_id>/provider-profile/', admin_views.support_user_provider_profile, name='support_user_provider_profile'),
    path('support/users/<str:user_id>/verify-provider/', admin_views.verify_provider, name='verify_provider'),
    path('admin/monitoring/dashboard/', admin_monitoring.admin_monitoring_dashboard, name='admin-monitoring-dashboard'),
    path('admin/monitoring/activity/', admin_monitoring.recent_activity_feed, name='admin-activity-feed'),
    path('admin/monitoring/problems/', admin_monitoring.problem_detection, name='admin-problem-detection'),
    
    # Public provider directory (SEO)
    path('public/providers/', public_views.public_providers_list, name='public-providers-list'),
    path('public/providers/<int:provider_id>/', public_views.public_provider_detail, name='public-provider-detail'),
    
    # TEMPORARY: Debug endpoint to list ALL providers (including non-verified) - REMOVE AFTER CLEANUP
    path('public/providers-debug/all/', public_views.list_all_providers_debug, name='list-all-providers-debug'),
    path('public/providers-debug/search/', public_views.search_provider_by_name, name='search-provider-by-name'),
    path('public/users-debug/search/', public_views.search_all_users, name='search-all-users'),
]



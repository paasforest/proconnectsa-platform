from django.urls import path
from . import views
from . import ml_views
# REMOVED: subscription-based access views
from . import bark_views
from . import wallet_api

urlpatterns = [
    # Service categories
    path('categories/', views.ServiceCategoryListView.as_view(), name='service-categories'),
    
    # Leads
    path('', views.LeadListView.as_view(), name='lead-list'),
    path('create/', views.LeadCreateView.as_view(), name='lead-create'),
    path('create-public/', views.create_public_lead, name='lead-create-public'),
    path('<uuid:pk>/', views.LeadDetailView.as_view(), name='lead-detail'),
    path('<uuid:lead_id>/verify-sms/', views.verify_lead_sms, name='lead-verify-sms'),
    path('<uuid:lead_id>/track-view/', views.track_lead_view, name='track-lead-view'),
    path('available/', views.available_leads_view, name='available-leads'),
    path('filtered/', views.get_filtered_leads, name='filtered-leads'),
    
    # Lead assignments
    path('assignments/', views.LeadAssignmentListView.as_view(), name='lead-assignment-list'),
    path('assignments/<uuid:pk>/', views.LeadAssignmentDetailView.as_view(), name='lead-assignment-detail'),
    path('assignments/<uuid:assignment_id>/viewed/', views.mark_assignment_viewed, name='mark-assignment-viewed'),
    path('assignments/<uuid:assignment_id>/contacted/', views.mark_assignment_contacted, name='mark-assignment-contacted'),
    path('assignments/<uuid:assignment_id>/quote/', views.submit_quote, name='submit-quote'),
    
    # Admin functions
    path('<uuid:lead_id>/assign/', views.assign_lead_to_providers, name='assign-lead-to-providers'),
    
    # ML Analytics
    path('ml-readiness/', ml_views.ml_readiness_view, name='ml-readiness'),
    path('hybrid-scoring/', ml_views.hybrid_scoring_view, name='hybrid-scoring'),
    path('ab-test-analytics/', ml_views.ab_test_analytics_view, name='ab-test-analytics'),
    path('ml-metrics/', ml_views.ml_metrics_view, name='ml-metrics'),
    path('retrain-models/', ml_views.retrain_models_view, name='retrain-models'),
    path('ml-insights/', ml_views.model_insights_view, name='ml-insights'),
    path('ml/churn-analysis/', ml_views.churn_risk_analysis_view, name='churn-analysis'),
    path('ml/subscription-recommendations/', ml_views.subscription_recommendations_view, name='subscription-recommendations'),
    path('ml/optimize-matching/', ml_views.optimize_lead_matching_view, name='optimize-matching'),
    
    # ML Business Intelligence Dashboard
    path('ml/business-intelligence/', ml_views.ml_business_intelligence_view, name='ml-business-intelligence'),
    path('ml/model-performance/', ml_views.ml_model_performance_view, name='ml-model-performance'),
    
    # Lead Preview & Purchase System
    path('<uuid:lead_id>/preview/', ml_views.lead_preview_view, name='lead-preview'),
    path('<uuid:lead_id>/purchase/', ml_views.purchase_lead_access_view, name='purchase-lead-access'),
    
    # REMOVED: Old subscription-based access control - using wallet system only
    
    # Bark-style lead flow
    path('bark/available/', bark_views.get_available_leads, name='bark-available-leads'),
    path('bark/<uuid:lead_id>/claim/', bark_views.claim_lead, name='bark-claim-lead'),
    path('bark/<uuid:lead_id>/details/', bark_views.get_lead_details, name='bark-lead-details'),
    path('bark/claimed/', bark_views.get_claimed_leads, name='bark-claimed-leads'),
    path('bark/<uuid:lead_id>/status/', bark_views.get_lead_claim_status, name='bark-lead-status'),
    
    # Wallet-based lead system (ONLY system we use)
    path('wallet/available/', wallet_api.available_leads, name='wallet-available-leads'),
    path('wallet/unlocked/', wallet_api.unlocked_leads, name='wallet-unlocked-leads'),
    
]



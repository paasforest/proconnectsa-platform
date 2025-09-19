from django.urls import path
from . import views_minimal as views
# from . import paypal_views
from . import dashboard_views
from . import financial_audit_views

urlpatterns = [
    # Basic payment views
    path('balance/', views.get_credit_balance, name='credit-balance'),
    path('customer-code/', views.get_customer_code_info, name='get-customer-code-info'),
    
    # Provider Dashboard Payment Views
    path('dashboard/balance/', dashboard_views.get_credit_balance, name='dashboard-credit-balance'),
    path('dashboard/transactions/', dashboard_views.get_transaction_history, name='dashboard-transaction-history'),
    path('dashboard/deposits/', dashboard_views.get_deposit_history, name='dashboard-deposit-history'),
    path('dashboard/deposits/create/', dashboard_views.create_deposit_request, name='dashboard-create-deposit'),
    path('dashboard/deposits/check/', dashboard_views.check_deposit_by_customer_code, name='dashboard-check-deposit'),
    path('dashboard/deposits/instructions/', dashboard_views.get_deposit_instructions, name='dashboard-deposit-instructions'),
    path('dashboard/deposits/auto-status/', dashboard_views.get_auto_deposit_status, name='dashboard-auto-deposit-status'),
    path('admin/trigger-ml-detection/', dashboard_views.trigger_ml_auto_detection, name='admin-trigger-ml-detection'),
    path('dashboard/leads/<uuid:lead_id>/purchase/', dashboard_views.purchase_lead, name='dashboard-purchase-lead'),
    path('dashboard/subscription/upgrade/', dashboard_views.upgrade_subscription, name='dashboard-upgrade-subscription'),
    path('dashboard/requirements/check/', dashboard_views.check_credit_requirements, name='dashboard-check-requirements'),
    path('dashboard/summary/', dashboard_views.get_payment_summary, name='dashboard-payment-summary'),
    
    # Financial audit
    path('audit/', financial_audit_views.financial_audit_data, name='financial_audit'),
    path('audit/export/', financial_audit_views.export_financial_report, name='export_financial_report'),
]


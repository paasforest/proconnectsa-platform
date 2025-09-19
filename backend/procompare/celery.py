import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.procompare.settings')

app = Celery('procompare')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery Beat schedule configuration
app.conf.beat_schedule = {
    # Core ML Training Tasks
    'retrain-models-daily': {
        'task': 'backend.leads.tasks.retrain_models_if_thresholds_met',
        'schedule': crontab(hour=2, minute=30),
    },
    'train-geographical-ml-daily': {
        'task': 'backend.leads.tasks.train_geographical_ml_model',
        'schedule': crontab(hour=2, minute=45),
    },
    'ml-auto-detect-deposits': {
        'task': 'backend.payments.tasks.ml_auto_detect_deposits',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes for faster processing
    },
    'bank-reconciliation-every-5min': {
        'task': 'backend.users.tasks.run_bank_reconciliation',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes for automatic reconciliation
    },
    'full-ml-retrain-weekly': {
        'task': 'backend.leads.tasks.full_ml_model_retrain',
        'schedule': crontab(hour=3, minute=0, day_of_week=0),
    },
    
    # Enhanced ML Learning Tasks
    'train-dynamic-pricing-daily': {
        'task': 'backend.leads.tasks.train_dynamic_pricing_model',
        'schedule': crontab(hour=2, minute=45),
    },
    'train-access-control-daily': {
        'task': 'backend.leads.tasks.train_lead_access_control_model',
        'schedule': crontab(hour=3, minute=15),
    },
    'incremental-learning-every-6h': {
        'task': 'backend.leads.tasks.incremental_ml_learning',
        'schedule': crontab(minute=0, hour='*/6'),  # Every 6 hours
    },
    
    # Data Quality and Monitoring
    'validate-data-quality-daily': {
        'task': 'backend.leads.tasks.validate_ml_data_quality',
        'schedule': crontab(hour=1, minute=30),
    },
    'adaptive-threshold-adjustment-weekly': {
        'task': 'backend.leads.tasks.adaptive_ml_threshold_adjustment',
        'schedule': crontab(hour=4, minute=30, day_of_week=1),
    },
    'monitor-ml-performance': {
        'task': 'backend.leads.tasks.monitor_ml_model_performance',
        'schedule': crontab(hour=4, minute=0),
    },
    'train-ml-models': {
        'task': 'backend.leads.tasks.train_ml_models',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
    },
    
    # System Maintenance
    'reset-monthly-usage': {
        'task': 'backend.leads.tasks.reset_monthly_lead_usage',
        'schedule': crontab(hour=1, minute=0, day_of_month=1),
    },
    'cleanup-prediction-logs': {
        'task': 'backend.leads.tasks.cleanup_old_prediction_logs',
        'schedule': crontab(hour=5, minute=0, day_of_week=1),
    },
    'learn-deposit-patterns': {
        'task': 'backend.leads.tasks.learn_from_deposit_patterns',
        'schedule': crontab(hour=6, minute=0),
    },
    
    # Support ML Tasks
    'train-support-ml-models': {
        'task': 'backend.leads.tasks.train_support_ml_models',
        'schedule': crontab(hour=7, minute=0),
    },
    'analyze-support-sentiment': {
        'task': 'backend.leads.tasks.analyze_support_ticket_sentiment',
        'schedule': crontab(hour=8, minute=0),
    },
    'optimize-support-assignments': {
        'task': 'backend.leads.tasks.optimize_support_ticket_assignments',
        'schedule': crontab(hour=9, minute=0),
    },
    'generate-support-insights': {
        'task': 'backend.leads.tasks.generate_support_ml_insights',
        'schedule': crontab(hour=10, minute=0),
    },
    
    # Advanced ML Tasks for Business Intelligence
    'analyze-churn-risk': {
        'task': 'backend.leads.tasks.analyze_user_churn_risk',
        'schedule': crontab(hour=11, minute=0),  # Daily at 11:00
    },
    'generate-subscription-recommendations': {
        'task': 'backend.leads.tasks.generate_subscription_recommendations',
        'schedule': crontab(hour=12, minute=0),  # Daily at 12:00
    },
    'optimize-lead-distribution': {
        'task': 'backend.leads.tasks.optimize_lead_distribution',
        'schedule': crontab(minute=0, hour='*/4'),  # Every 4 hours
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')


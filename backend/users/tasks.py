from celery import shared_task
from .reconciliation import reconcile_bank_deposits

@shared_task
def run_bank_reconciliation():
    """
    Celery task to run bank reconciliation
    This will be called every 5 minutes via Celery Beat
    """
    try:
        result = reconcile_bank_deposits.delay()
        return f"Bank reconciliation task started: {result.id}"
    except Exception as e:
        return f"Error starting bank reconciliation: {str(e)}"





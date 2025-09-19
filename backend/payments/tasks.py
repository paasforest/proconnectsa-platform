from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import DepositRequest, Transaction, TransactionType, TransactionStatus
from .auto_deposit_service import AutoDepositService

@shared_task
def ml_auto_detect_deposits():
    """
    ML-powered automatic deposit detection and processing
    This runs every 30 minutes to automatically process deposits without provider action
    """
    try:
        auto_service = AutoDepositService()
        result = auto_service.auto_detect_and_process_deposits()
        
        if result['success']:
            return f"ML auto-detection completed: {result['message']}"
        else:
            return f"ML auto-detection failed: {result['error']}"
            
    except Exception as e:
        return f"Error in ML auto-detection: {str(e)}"

@shared_task
def process_manual_deposit_verification(deposit_id):
    """Process manual deposit verification (called by admin)"""
    try:
        deposit = DepositRequest.objects.get(id=deposit_id)
        
        if deposit.status == 'pending':
            # This would be called when admin verifies the deposit
            # The actual verification logic is in the model method
            return f"Manual deposit {deposit.reference_number} processed"
        else:
            return f"Manual deposit {deposit.reference_number} already processed"
            
    except DepositRequest.DoesNotExist:
        return f"Manual deposit {deposit_id} not found"
    except Exception as e:
        return f"Error processing manual deposit: {str(e)}"

@shared_task
def expire_manual_deposits():
    """Expire manual deposits that are older than 7 days"""
    cutoff_date = timezone.now() - timedelta(days=7)
    
    expired_deposits = DepositRequest.objects.filter(
        status='pending',
        created_at__lt=cutoff_date
    )
    
    count = 0
    for deposit in expired_deposits:
        deposit.status = 'expired'
        deposit.save()
        count += 1
    
    return f"Expired {count} manual deposits"

@shared_task
def send_deposit_reminder(deposit_id):
    """Send reminder for pending manual deposit"""
    try:
        deposit = DepositRequest.objects.get(id=deposit_id)
        
        if deposit.status == 'pending':
            # Send reminder notification
            from notifications.tasks import send_notification_task
            
            send_notification_task.delay(
                user_id=deposit.account.user.id,
                notification_type='reminder',
                title='Manual Deposit Reminder',
                message=f'Your manual deposit {deposit.reference_number} is still pending. Please upload your deposit slip.',
                data={'deposit_id': str(deposit.id)}
            )
            
            return f"Reminder sent for deposit {deposit.reference_number}"
        else:
            return f"Deposit {deposit.reference_number} no longer pending"
            
    except DepositRequest.DoesNotExist:
        return f"Manual deposit {deposit_id} not found"
    except Exception as e:
        return f"Error sending reminder: {str(e)}"

@shared_task
def update_provider_metrics(provider_id):
    """Update provider performance metrics"""
    try:
        from backend.users.models import ProviderProfile
        
        provider_profile = ProviderProfile.objects.get(user_id=provider_id)
        
        # Calculate average rating
        from backend.reviews.models import Review
        reviews = Review.objects.filter(provider_id=provider_id, is_public=True)
        
        if reviews.exists():
            avg_rating = sum(review.rating for review in reviews) / reviews.count()
            provider_profile.average_rating = round(avg_rating, 2)
            provider_profile.total_reviews = reviews.count()
        
        # Calculate job completion rate
        from backend.leads.models import LeadAssignment
        total_assignments = LeadAssignment.objects.filter(provider_id=provider_id).count()
        completed_assignments = LeadAssignment.objects.filter(
            provider_id=provider_id,
            status='completed'
        ).count()
        
        if total_assignments > 0:
            completion_rate = (completed_assignments / total_assignments) * 100
            provider_profile.job_completion_rate = round(completion_rate, 2)
        
        provider_profile.save()
        
        return f"Updated metrics for provider {provider_id}"
        
    except Exception as e:
        return f"Error updating provider metrics: {str(e)}"










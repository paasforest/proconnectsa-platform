from celery import shared_task
from django.utils import timezone
from .reconciliation import reconcile_bank_deposits
from .models import ProviderProfile
import logging

logger = logging.getLogger(__name__)

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

@shared_task
def expire_premium_listings():
    """
    Automatically expire premium listings that have passed their expiration date.
    This ensures providers are charged for leads after their premium period ends.
    
    Runs daily to check and expire premium listings.
    """
    try:
        now = timezone.now()
        
        # Find all premium listings that have expired
        # Exclude lifetime premiums (premium_listing_expires_at is None)
        expired_listings = ProviderProfile.objects.filter(
            is_premium_listing=True,
            premium_listing_expires_at__isnull=False,
            premium_listing_expires_at__lte=now
        )
        
        count = expired_listings.count()
        
        if count == 0:
            logger.info("✅ No expired premium listings found")
            return f"No expired premium listings found"
        
        # Expire the listings
        expired_count = 0
        for profile in expired_listings:
            expired_days = (now - profile.premium_listing_expires_at).days
            logger.info(f"Expiring premium listing for {profile.business_name} ({profile.user.email}) - expired {expired_days} days ago")
            
            # Set is_premium_listing to False
            profile.is_premium_listing = False
            profile.save(update_fields=['is_premium_listing'])
            expired_count += 1
        
        logger.info(f"✅ Expired {expired_count} premium listing(s). These providers will now be charged credits for leads.")
        return f"Expired {expired_count} premium listing(s)"
        
    except Exception as e:
        logger.error(f"❌ Error expiring premium listings: {str(e)}")
        return f"Error expiring premium listings: {str(e)}"





"""
Smart Lead Auto-Verification System

Automatically verifies leads based on quality scores, reducing admin workload
and ensuring leads don't get stuck waiting for manual verification.

Only low-quality or suspicious leads require admin review.
"""
import logging
from django.utils import timezone
from django.db.models import Q
from backend.leads.models import Lead
from backend.notifications.models import Notification
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)
User = get_user_model()


def calculate_lead_verification_score(lead):
    """
    Calculate a verification score (0-100) for a lead based on:
    - Data completeness
    - Contact information quality
    - Client history
    - Source reliability
    - Risk factors
    """
    score = 0
    
    # === DATA COMPLETENESS (40 points) ===
    if lead.title and len(lead.title.strip()) > 5:
        score += 10
    if lead.description and len(lead.description.strip()) > 20:
        score += 10
    if lead.location_city:
        score += 5
    if lead.location_suburb:
        score += 5
    if lead.service_category:
        score += 5
    if lead.budget_range:
        score += 5
    
    # === CONTACT INFORMATION QUALITY (25 points) ===
    if lead.client:
        if lead.client.email and '@' in lead.client.email:
            # Valid email format
            if '@gmail.com' in lead.client.email or '@yahoo.com' in lead.client.email or '@outlook.com' in lead.client.email:
                score += 10  # Common email domains = trustworthy
            elif '@' in lead.client.email:
                score += 7  # Other valid emails
        if lead.client.phone:
            # Valid phone (SA format: starts with +27 or 0, 10-11 digits)
            phone_clean = lead.client.phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
            if phone_clean.startswith('+27') and len(phone_clean) == 12:
                score += 10  # Valid SA international format
            elif phone_clean.startswith('0') and len(phone_clean) == 10:
                score += 10  # Valid SA local format
            elif len(phone_clean) >= 10:
                score += 5  # Possibly valid
        if lead.client.first_name and lead.client.last_name:
            score += 5  # Full name provided
    
    # === CLIENT HISTORY (15 points) ===
    if lead.client:
        # Check if returning client
        previous_leads = Lead.objects.filter(client=lead.client).exclude(id=lead.id).count()
        if previous_leads > 0:
            score += 10  # Returning client = trustworthy
            if previous_leads >= 3:
                score += 5  # Frequent client bonus
        
        # Account age (older accounts = more trustworthy)
        days_since_joined = (timezone.now() - lead.client.date_joined).days
        if days_since_joined > 30:
            score += 5  # Account older than 30 days
    
    # === SOURCE RELIABILITY (10 points) ===
    if lead.source == 'website':
        score += 10  # Website form = most reliable
    elif lead.source == 'api':
        score += 7  # API = generally reliable
    elif lead.source == 'referral':
        score += 8  # Referral = good
    elif lead.source:
        score += 5  # Other sources
    
    # === RISK FACTORS (subtract points) ===
    # Suspicious patterns
    if lead.client:
        # Check for spam patterns
        if lead.client.email and 'temp' in lead.client.email.lower():
            score -= 10  # Temporary email
        if lead.client.email and 'test' in lead.client.email.lower():
            score -= 15  # Test email
        if lead.client.phone == '0000000000' or lead.client.phone == '1234567890':
            score -= 10  # Fake phone
    
    # Very short descriptions might be spam
    if lead.description and len(lead.description.strip()) < 10:
        score -= 5
    
    # === URGENCY BONUS (10 points) ===
    # Urgent leads are more likely to be real
    if lead.urgency == 'urgent':
        score += 5
    elif lead.urgency == 'this_week':
        score += 3
    
    # Ensure score is between 0 and 100
    score = max(0, min(100, score))
    
    return score


def auto_verify_lead(lead):
    """
    Automatically verify a lead if it meets quality thresholds.
    Returns True if auto-verified, False if needs manual review.
    """
    # Calculate verification score
    verification_score = calculate_lead_verification_score(lead)
    
    # Update the lead's verification score
    lead.verification_score = verification_score
    lead.save(update_fields=['verification_score'])
    
    # Auto-verify threshold: 70+ score = auto-verify
    AUTO_VERIFY_THRESHOLD = 70
    
    if verification_score >= AUTO_VERIFY_THRESHOLD:
        # Auto-verify this lead
        if lead.status != 'verified':
            lead.status = 'verified'
            lead.verified_at = timezone.now()
            lead.save(update_fields=['status', 'verified_at'])
            
            logger.info(
                f"✅ Auto-verified lead {lead.id}: "
                f"Score {verification_score}/100, Source: {lead.source}"
            )
            return True
    else:
        # Low score - needs admin review
        # Notify admin if score is very low (< 50)
        if verification_score < 50:
            notify_admin_review_needed(lead, verification_score)
        
        logger.info(
            f"⚠️ Lead {lead.id} needs manual review: "
            f"Score {verification_score}/100 (threshold: {AUTO_VERIFY_THRESHOLD})"
        )
        return False


def notify_admin_review_needed(lead, score):
    """
    Notify admin users that a lead needs manual review.
    Only for low-quality or suspicious leads.
    """
    try:
        # Find admin users
        admin_users = User.objects.filter(
            Q(is_staff=True) | Q(is_superuser=True)
        ).distinct()
        
        for admin in admin_users:
            Notification.objects.create(
                user=admin,
                notification_type='system',
                title=f"Lead Review Needed: {lead.title[:50]}",
                message=(
                    f"Lead {lead.id} has a low verification score ({score}/100) "
                    f"and may need manual review. "
                    f"Source: {lead.source}, Client: {lead.client.email if lead.client else 'Unknown'}"
                ),
                priority='medium',
                lead=lead,
                data={
                    'lead_id': str(lead.id),
                    'verification_score': score,
                    'source': lead.source,
                    'action_required': 'review_lead',
                }
            )
        
        logger.info(f"📧 Notified {admin_users.count()} admins about lead {lead.id} needing review")
        
    except Exception as e:
        logger.error(f"Failed to notify admins about lead {lead.id}: {e}")


def auto_verify_pending_leads():
    """
    Background task to auto-verify pending leads that meet quality criteria.
    Can be run periodically via Celery to catch any leads that were missed.
    """
    from django.utils import timezone
    from datetime import timedelta
    
    # Get pending leads from last 24 hours
    cutoff_time = timezone.now() - timedelta(hours=24)
    pending_leads = Lead.objects.filter(
        status='pending',
        created_at__gte=cutoff_time
    )
    
    auto_verified_count = 0
    needs_review_count = 0
    
    for lead in pending_leads:
        if auto_verify_lead(lead):
            auto_verified_count += 1
        else:
            needs_review_count += 1
    
    logger.info(
        f"🤖 Auto-verification batch: "
        f"{auto_verified_count} auto-verified, {needs_review_count} need review"
    )
    
    return {
        'auto_verified': auto_verified_count,
        'needs_review': needs_review_count,
        'total_processed': pending_leads.count()
    }

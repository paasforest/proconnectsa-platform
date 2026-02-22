"""
Lead Routing Service for ProConnectSA
Automatically matches verified leads to eligible providers and notifies them.

Design principles:
- Never raises exceptions (safe for post_save signals)
- Deterministic matching (testable, consistent ordering)
- Does NOT modify the ML pricing module
- Uses Django ORM only
"""

import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


def match_providers(lead):
    """
    Find top matching active providers for a given lead.

    Matching criteria (in order of priority):
    1. Provider must have can_receive_leads == True
       (verification_status == 'verified' + active subscription)
    2. Provider's service_categories (JSON list of slugs) must include
       the lead's service_category slug
    3. Provider's service_areas (JSON list of area strings) must include
       the lead's location_city or location_suburb

    Ordering (deterministic):
    1. Premium listing active providers first
    2. Then by subscription tier (premium > standard > basic)
    3. Then by provider profile id (stable tiebreaker)

    Returns:
        QuerySet of User objects (providers), max 10
        (lead.max_providers slots available, but we notify more to ensure fill rate)
    """
    from backend.users.models import ProviderProfile

    category_slug = lead.service_category.slug
    city = lead.location_city.strip().lower() if lead.location_city else ''
    suburb = lead.location_suburb.strip().lower() if lead.location_suburb else ''

    # Step 1: Get all verified provider profiles
    eligible_profiles = ProviderProfile.objects.filter(
        verification_status='verified',
    ).select_related('user')

    # Step 2: Filter in Python for JSON field matching
    # (Django JSONField __contains works for dicts but not list-of-strings reliably across DBs)
    matched_profiles = []

    for profile in eligible_profiles:
        # Check subscription is active OR premium listing active
        is_active = profile.is_subscription_active or (
            hasattr(profile, 'is_premium_listing_active') and 
            profile.is_premium_listing_active
        )
        if not is_active:
            continue

        # Check service category match
        profile_categories = [c.lower() for c in (profile.service_categories or [])]
        if category_slug.lower() not in profile_categories:
            continue

        # Check location match (city OR suburb)
        profile_areas = [a.lower() for a in (profile.service_areas or [])]
        location_match = any(
            city in area or area in city or
            suburb in area or area in suburb
            for area in profile_areas
        )
        if not location_match:
            continue

        matched_profiles.append(profile)

    # Step 3: Sort deterministically
    # Premium listing first, then subscription tier, then profile id
    TIER_ORDER = {
        'enterprise': 0,
        'pro': 1,
        'advanced': 2,
        'basic': 3,
        'pay_as_you_go': 4
    }

    matched_profiles.sort(key=lambda p: (
        0 if (hasattr(p, 'is_premium_listing_active') and p.is_premium_listing_active) else 1,
        TIER_ORDER.get(p.subscription_tier, 99),
        str(p.id)  # stable UUID tiebreaker
    ))

    # Return top 10 providers (more than max_providers to account for non-openers)
    top_profiles = matched_profiles[:10]

    # Extract User objects
    providers = [profile.user for profile in top_profiles]

    logger.info(
        f"[LeadRouter] Lead {lead.id} ({lead.service_category.slug}, {lead.location_city}): "
        f"matched {len(providers)} providers from {len(matched_profiles)} eligible"
    )

    return providers


def notify_providers(lead, providers):
    """
    Send email notifications to matched providers about a new lead.

    - Sends individual emails (not BCC) so each provider gets a personal notification
    - Records a Notification object for each provider
    - Failures are caught per-provider so one bad email doesn't block others

    Args:
        lead: Lead instance
        providers: list of User instances (providers)
    """
    if not providers:
        logger.info(f"[LeadRouter] No providers to notify for lead {lead.id}")
        return

    lead_url = f"{settings.FRONTEND_URL}/provider/leads/{lead.id}/"

    for provider in providers:
        try:
            _send_lead_email(lead, provider, lead_url)
            _create_notification(lead, provider)
            logger.info(
                f"[LeadRouter] Notified provider {provider.email} "
                f"about lead {lead.id}"
            )
        except Exception as e:
            # Never let one failed notification block the rest
            logger.error(
                f"[LeadRouter] Failed to notify {provider.email} "
                f"for lead {lead.id}: {e}"
            )


def _send_lead_email(lead, provider, lead_url):
    """Send a lead notification email to a single provider."""
    subject = f"New Lead Available: {lead.title} in {lead.location_suburb}"

    first_name = getattr(provider, 'first_name', '') or 'there'

    message = f"""Hi {first_name},

A new lead matching your services is available on ProConnectSA.

JOB DETAILS
-----------
Service:   {lead.service_category.name}
Title:     {lead.title}
Location:  {lead.location_suburb}, {lead.location_city}
Urgency:   {lead.get_urgency_display()}
Budget:    {lead.get_budget_display_range()}

Be one of the first {lead.max_providers} providers to claim this lead.

View & Claim Lead:
{lead_url}

---
You're receiving this because your ProConnectSA profile matches this lead.
To update your service areas or categories, visit your profile settings.
"""

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[provider.email],
        fail_silently=False,
    )


def _create_notification(lead, provider):
    """
    Create an in-app Notification record for the provider.
    Uses the existing Notification model with lead FK and priority support.
    """
    try:
        from backend.notifications.models import Notification
        Notification.objects.create(
            user=provider,
            notification_type='lead_verified',  # Using existing type from model
            title=f"New Lead: {lead.title}",
            message=(
                f"A new {lead.service_category.name} lead is available "
                f"in {lead.location_suburb}, {lead.location_city}. "
                f"Be one of the first {lead.max_providers} providers to claim it."
            ),
            priority='high' if lead.urgency == 'urgent' else 'medium',
            lead=lead,
            provider=provider,
            is_email_sent=True,  # We already sent the email above
            data={
                'lead_id': str(lead.id),
                'category': lead.service_category.slug,
                'category_name': lead.service_category.name,
                'city': lead.location_city,
                'suburb': lead.location_suburb,
                'urgency': lead.urgency,
                'budget_range': lead.budget_range,
                'credit_cost': str(lead.credit_cost) if lead.credit_cost else None,
            }
        )
    except Exception as e:
        logger.warning(f"[LeadRouter] Could not create in-app notification: {e}")


def route_lead(lead):
    """
    Main entry point: match providers and notify them.
    Now includes quality gate to filter out spam/low-quality leads.
    Called from signal. Fully exception-safe.

    Args:
        lead: Lead instance (should be status='verified')
    """
    try:
        # Quality gate: Check if lead passes quality thresholds
        passed, reason = passes_quality_gate(lead)
        if not passed:
            logger.warning(
                f"[LeadRouter] Lead {lead.id} blocked by quality gate: {reason}"
            )
            # Flag it for admin review instead of routing
            _flag_for_review(lead, reason)
            return

        # All quality checks passed - route to providers
        providers = match_providers(lead)
        if providers:
            notify_providers(lead, providers)
        else:
            logger.warning(
                f"[LeadRouter] No matching providers found for lead {lead.id} "
                f"(category={lead.service_category.slug}, city={lead.location_city})"
            )
    except Exception as e:
        # This function is called from a post_save signal.
        # We MUST NOT raise — it would silently break lead creation.
        logger.error(f"[LeadRouter] Routing failed for lead {lead.id}: {e}", exc_info=True)


def passes_quality_gate(lead):
    """
    Rule-based quality checks before routing to providers.
    Uses existing verification_score from auto-verification system.
    Integrates with ML service if available.
    
    Returns:
        (True, None) if passes, (False, reason) if blocked.
    """
    from django.utils import timezone
    from datetime import timedelta
    
    # === LAYER 1: Hard Rules (Must Pass) ===
    
    # 1. Minimum verification score (from auto-verification system)
    # Very low threshold (30) - just to catch obvious spam
    if not hasattr(lead, 'verification_score') or lead.verification_score < 30:
        return False, f"low_verification_score:{getattr(lead, 'verification_score', 0)}"
    
    # 2. Description quality check
    description = (lead.description or '').strip()
    if len(description) < 20:
        return False, "description_too_short"
    
    if _is_gibberish(description):
        return False, "gibberish_description"
    
    # 3. Disposable email detection
    if lead.client and lead.client.email:
        email = lead.client.email.lower()
        disposable_domains = [
            'mailinator.com', 'tempmail.com', 'guerrillamail.com',
            'yopmail.com', '10minutemail.com', 'throwaway.email'
        ]
        if any(email.endswith(d) for d in disposable_domains):
            return False, "disposable_email"
    
    # === LAYER 2: ML Quality Score (If Available) ===
    # Use existing LeadQualityMLService if model is trained
    try:
        from backend.leads.ml_services import LeadQualityMLService
        
        ml_service = LeadQualityMLService()
        
        # Prepare lead data for ML
        lead_data = {
            'title': lead.title or '',
            'description': lead.description or '',
            'location_address': lead.location_address or '',
            'location_suburb': lead.location_suburb or '',
            'location_city': lead.location_city or '',
            'budget_range': lead.budget_range or '',
            'urgency': lead.urgency or 'flexible',
            'hiring_intent': getattr(lead, 'hiring_intent', 'researching'),
            'hiring_timeline': getattr(lead, 'hiring_timeline', 'flexible'),
            'additional_requirements': getattr(lead, 'additional_requirements', ''),
            'research_purpose': getattr(lead, 'research_purpose', ''),
            'verification_score': lead.verification_score,
            'contact_phone': lead.client.phone if lead.client else '',
            'client__email': lead.client.email if lead.client else '',
        }
        
        ml_score = ml_service.predict_lead_quality(lead_data)
        
        # ML threshold: 40/100 (low quality leads blocked)
        if ml_score < 40:
            return False, f"ml_quality_score_too_low:{ml_score:.1f}"
            
    except Exception as e:
        # ML service not available or not trained - skip this layer
        logger.debug(f"[QualityGate] ML check skipped for lead {lead.id}: {e}")
    
    # === LAYER 3: Duplicate Detection ===
    # Same client + same category + within 24 hours = likely duplicate
    if lead.client:
        from backend.leads.models import Lead
        
        recent_duplicate = Lead.objects.filter(
            client=lead.client,
            service_category=lead.service_category,
            created_at__gte=timezone.now() - timedelta(hours=24),
        ).exclude(id=lead.id).exists()
        
        if recent_duplicate:
            return False, "duplicate_lead"
    
    # All checks passed
    return True, None


def _is_gibberish(text):
    """
    Simple gibberish detector.
    Flags text with no spaces, repeated characters, or suspicious patterns.
    """
    if not text:
        return True
    
    words = text.split()
    
    # Too few words
    if len(words) < 3:
        return True
    
    # Average word length unreasonably high (random char strings)
    avg_word_len = sum(len(w) for w in words) / len(words)
    if avg_word_len > 15:
        return True
    
    # Single repeated character pattern like "aaaaaaa" or "111111"
    text_no_spaces = text.replace(' ', '').replace('\n', '')
    if len(text_no_spaces) > 10 and len(set(text_no_spaces)) < 4:
        return True
    
    # Too many repeated words (spam pattern)
    if len(words) > 5:
        word_counts = {}
        for word in words:
            word_counts[word.lower()] = word_counts.get(word.lower(), 0) + 1
        max_repeats = max(word_counts.values())
        if max_repeats > len(words) * 0.5:  # Same word > 50% of text
            return True
    
    return False


def _flag_for_review(lead, reason):
    """
    Flag a suspicious lead for admin review instead of routing it.
    Updates verification_notes and sets status back to 'pending'.
    """
    flag_messages = {
        'low_verification_score': 'Blocked: Verification score too low',
        'gibberish_description': 'Blocked: Description appears to be gibberish',
        'description_too_short': 'Blocked: Description too short',
        'duplicate_lead': 'Blocked: Duplicate lead from same client within 24h',
        'disposable_email': 'Blocked: Client using disposable email address',
        'ml_quality_score_too_low': 'Blocked: ML quality score too low',
    }
    
    # Extract reason key (handle cases like "low_verification_score:25")
    reason_key = reason.split(':')[0]
    note = flag_messages.get(reason_key, f'Blocked: {reason}')
    
    # Add full reason details if available
    if ':' in reason:
        note += f" ({reason})"
    
    # Update lead to flag for review
    from backend.leads.models import Lead
    Lead.objects.filter(id=lead.id).update(
        verification_notes=note,
        status='pending'  # Kick back to pending for admin review
    )
    
    logger.warning(f"[QualityGate] Lead {lead.id} flagged for review → {note}")
    
    # Optionally notify admin (but don't block if this fails)
    try:
        from backend.notifications.models import Notification
        from backend.users.models import User
        
        admin_users = User.objects.filter(
            is_staff=True
        ).distinct()[:5]  # Limit to 5 admins to avoid spam
        
        for admin in admin_users:
            Notification.objects.create(
                user=admin,
                notification_type='system',
                title=f"Lead Flagged for Review: {lead.title[:50]}",
                message=(
                    f"Lead {lead.id} was blocked by quality gate: {note}. "
                    f"Please review and verify manually if needed."
                ),
                priority='medium',
                lead=lead,
                data={
                    'lead_id': str(lead.id),
                    'block_reason': reason,
                    'action_required': 'review_lead',
                }
            )
    except Exception as e:
        logger.warning(f"[QualityGate] Failed to notify admins: {e}")

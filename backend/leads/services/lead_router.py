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
    Called from signal. Fully exception-safe.

    Args:
        lead: Lead instance (should be status='verified')
    """
    try:
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

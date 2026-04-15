"""
Unified provider-facing lead labels and helpers for /api/leads/for-me/.
Maps internal LeadAssignment.status (+ Lead expiry + LeadAccess) to: new | active | done | expired.
"""
from __future__ import annotations

import math
from typing import TYPE_CHECKING, Optional

from django.utils import timezone

if TYPE_CHECKING:
    from backend.users.models import User


def haversine_km(
    lat1: float, lon1: float, lat2: float, lon2: float
) -> float:
    """Great-circle distance in km between two WGS84 points."""
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def distance_km_for_provider(provider: "User", lead) -> Optional[float]:
    """Distance from provider profile to lead if both have coordinates."""
    try:
        profile = provider.provider_profile
    except Exception:
        return None
    lat_p, lon_p = profile.latitude, profile.longitude
    lat_l, lon_l = lead.latitude, lead.longitude
    if lat_p is None or lon_p is None or lat_l is None or lon_l is None:
        return None
    return round(haversine_km(float(lat_p), float(lon_p), float(lat_l), float(lon_l)), 1)


def compute_display_status(assignment, provider: "User") -> str:
    """
    Provider-facing status (4 labels):
    - new: matched, not unlocked yet
    - active: unlocked / in conversation
    - done: won, lost, or closed-out
    - expired: lead past expires_at
    """
    from .models import LeadAccess

    lead = assignment.lead
    if getattr(lead, "status", None) == "expired":
        return "expired"
    try:
        if lead.is_expired:
            return "expired"
    except Exception:
        if lead.expires_at and timezone.now() > lead.expires_at:
            return "expired"

    if assignment.status in ("won", "lost"):
        return "done"
    if assignment.status == "no_response":
        return "done"

    unlocked = LeadAccess.objects.filter(
        provider=provider, lead=lead, is_active=True
    ).exists()

    if assignment.status == "assigned" and not unlocked:
        return "new"

    if assignment.status in ("viewed", "purchased", "contacted", "quoted"):
        return "active"

    # assigned but already unlocked (data lag) or unknown → active
    if assignment.status == "assigned" and unlocked:
        return "active"

    return "active"

"""
POST /api/leads/<assignment_id>/unlock/ — unlock lead contact for a routed assignment.
LeadAssignment.status is set to 'purchased' (model has no 'accessed'; same as existing wallet unlock).
"""
from __future__ import annotations

import logging
import uuid
from decimal import Decimal

from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from backend.users.models import LeadUnlock, Wallet, WalletTransaction
from backend.users.wallet_views import get_full_contact_info, get_lead_credits_cost

from .models import Lead, LeadAccess, LeadAssignment

logger = logging.getLogger(__name__)


def _credits_required_for_unlock(lead, user) -> int:
    """Same ML-based pricing as POST /api/auth/leads/<lead_id>/unlock/ (wallet_views.unlock_lead)."""
    n = get_lead_credits_cost(str(lead.id), user)
    return max(1, int(round(float(n))))


def _lead_is_expired(lead: Lead) -> bool:
    if lead.status == "expired":
        return True
    try:
        return bool(lead.is_expired)
    except Exception:
        if lead.expires_at and timezone.now() > lead.expires_at:
            return True
    return False


def _lead_is_open_for_unlock(lead: Lead) -> bool:
    """Routable lead: verified or assigned, still available, not expired."""
    if _lead_is_expired(lead):
        return False
    if lead.status in ("cancelled", "completed", "expired"):
        return False
    if not lead.is_available:
        return False
    return lead.status in ("verified", "assigned")


def _contact_payload(lead: Lead, wallet: Wallet, credits_charged: int) -> dict:
    info = get_full_contact_info(str(lead.id))
    return {
        "unlocked": True,
        "customer_name": (info.get("name") or "").strip() or "Customer",
        "customer_phone": (info.get("phone") or "").strip(),
        "customer_email": (info.get("email") or "").strip(),
        "job_details": lead.description or "",
        "credits_charged": credits_charged,
        "wallet_balance_remaining": wallet.credits,
    }


def _already_unlocked(user, lead: Lead) -> bool:
    if LeadAccess.objects.filter(provider=user, lead=lead, is_active=True).exists():
        return True
    if LeadUnlock.objects.filter(user=user, lead_id=str(lead.id)).exists():
        return True
    return False


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def unlock_lead_by_assignment(request, assignment_id):
    user = request.user
    if not getattr(user, "is_provider", False):
        return Response(
            {"detail": "Only providers can unlock leads."},
            status=status.HTTP_403_FORBIDDEN,
        )

    assignment = get_object_or_404(
        LeadAssignment.objects.select_related("lead", "lead__client"),
        id=assignment_id,
        provider=user,
    )
    lead = assignment.lead
    credits_needed = _credits_required_for_unlock(lead, user)

    wallet, _ = Wallet.objects.get_or_create(user=user)

    if _already_unlocked(user, lead):
        return Response(_contact_payload(lead, wallet, 0), status=status.HTTP_200_OK)

    if _lead_is_expired(lead):
        return Response({"error": "lead_expired"}, status=status.HTTP_410_GONE)

    if not _lead_is_open_for_unlock(lead):
        return Response(
            {
                "error": "lead_not_available",
                "message": "This lead is no longer available to unlock.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if wallet.credits < credits_needed:
        return Response(
            {
                "error": "insufficient_credits",
                "required": credits_needed,
                "balance": wallet.credits,
            },
            status=status.HTTP_402_PAYMENT_REQUIRED,
        )

    try:
        with transaction.atomic():
            wallet = Wallet.objects.select_for_update().get(pk=wallet.pk)
            if wallet.credits < credits_needed:
                return Response(
                    {
                        "error": "insufficient_credits",
                        "required": credits_needed,
                        "balance": wallet.credits,
                    },
                    status=status.HTTP_402_PAYMENT_REQUIRED,
                )

            if _already_unlocked(user, lead):
                return Response(
                    _contact_payload(lead, wallet, 0), status=status.HTTP_200_OK
                )

            wallet.deduct_credits(credits_needed)
            wallet.refresh_from_db()

            ref = (
                f"UNLOCK_ASG_{assignment_id}_{timezone.now():%Y%m%d%H%M%S}_"
                f"{uuid.uuid4().hex[:10]}"
            )
            unlock_tx = WalletTransaction.objects.create(
                wallet=wallet,
                amount=Decimal(str(credits_needed * 50)),
                credits=credits_needed,
                transaction_type="unlock",
                reference=ref,
                status="confirmed",
                description=f"Unlocked assignment {assignment_id} / lead {lead.id}",
                lead_id=str(lead.id),
                lead_title=(lead.title[:200] if lead.title else ""),
                confirmed_at=timezone.now(),
            )

            info = get_full_contact_info(str(lead.id))
            contact_dict = {
                "phone": info.get("phone") or "",
                "email": info.get("email") or "",
                "full_address": info.get("full_address") or (lead.location_address or ""),
                "name": info.get("name") or "",
            }

            try:
                LeadUnlock.objects.create(
                    user=user,
                    lead_id=str(lead.id),
                    credits_spent=credits_needed,
                    transaction=unlock_tx,
                    full_contact_data=contact_dict,
                )
            except IntegrityError:
                logger.warning(
                    "LeadUnlock duplicate for user=%s lead=%s", user.id, lead.id
                )

            try:
                LeadAccess.objects.get_or_create(
                    lead=lead,
                    provider=user,
                    defaults={
                        "credit_cost": credits_needed,
                        "is_active": True,
                    },
                )
            except IntegrityError:
                LeadAccess.objects.filter(lead=lead, provider=user).update(
                    is_active=True, credit_cost=credits_needed
                )

            assignment.status = "purchased"
            assignment.purchased_at = timezone.now()
            assignment.save()

            logger.info(
                "User %s unlocked assignment %s for %s credits",
                user.id,
                assignment_id,
                credits_needed,
            )

            return Response(
                _contact_payload(lead, wallet, credits_needed),
                status=status.HTTP_200_OK,
            )
    except ValueError as e:
        logger.warning("Wallet deduct failed: %s", e)
        wallet.refresh_from_db()
        return Response(
            {
                "error": "insufficient_credits",
                "required": credits_needed,
                "balance": wallet.credits,
            },
            status=status.HTTP_402_PAYMENT_REQUIRED,
        )

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List, Optional, Set

from django.utils.text import slugify

from backend.leads.models import ServiceCategory


# Keep this mapping in one place so frontend/backends normalize consistently.
# (legacy / human input) -> canonical slug
CATEGORY_SLUG_ALIASES = {
    "cctv": "cctv-installation",
    "electric-fence": "electric-fencing",
    "electric-fences": "electric-fencing",
    "gate": "gate-motors",
    "gates": "gate-motors",
    "solar": "solar-installation",
    "renovation": "renovations",
    "pool": "pool-maintenance",
    "appliance": "appliance-repair",
}


SECURITY_PARENT_SLUG = "security"


def _canonicalize_slug(raw: object) -> str:
    """
    Convert an arbitrary category input (slug, name, etc.) into a best-effort canonical slug.
    This does NOT check DB validity.
    """
    if raw is None:
        return ""
    s = str(raw).strip()
    if not s:
        return ""
    slug = slugify(s)
    return CATEGORY_SLUG_ALIASES.get(slug, slug)


def normalize_service_category_slugs(
    raw_items: Optional[Iterable[object]],
    *,
    only_active: bool = True,
    include_parents: bool = True,
) -> List[str]:
    """
    Normalize provider-facing inputs into valid ServiceCategory slugs.

    - Accepts slugs or human names (we slugify + alias)
    - Filters to categories that exist in DB (and are active by default)
    - Optionally adds parent slugs for any selected child categories
    - Dedupes while preserving stable ordering
    """
    if not raw_items:
        return []

    # 1) Canonicalize raw inputs (slugify + aliases)
    canon_inputs: List[str] = []
    for item in raw_items:
        slug = _canonicalize_slug(item)
        if slug:
            canon_inputs.append(slug)

    if not canon_inputs:
        return []

    # 2) Resolve against DB for validity
    qs = ServiceCategory.objects.all()
    if only_active:
        qs = qs.filter(is_active=True)

    cats = list(qs.filter(slug__in=set(canon_inputs)).select_related("parent").only("slug", "parent__slug"))
    valid_set: Set[str] = {c.slug for c in cats if c.slug}
    parent_map = {c.slug: (c.parent.slug if getattr(c, "parent_id", None) and getattr(c.parent, "slug", None) else None) for c in cats}

    # 3) Keep stable order of the original inputs, but only for valid slugs
    out: List[str] = []
    seen: Set[str] = set()
    for s in canon_inputs:
        if s in valid_set and s not in seen:
            out.append(s)
            seen.add(s)

    # 4) Add parent slugs where applicable
    if include_parents:
        for child_slug in list(out):
            parent_slug = parent_map.get(child_slug)
            if parent_slug and parent_slug not in seen:
                out.append(parent_slug)
                seen.add(parent_slug)

    return out


def enforce_security_subservice_rule(slugs: List[str]) -> Optional[str]:
    """
    Return an error message if the provider selected Security but none of its sub-services.
    """
    if not slugs:
        return None
    if SECURITY_PARENT_SLUG not in slugs:
        return None

    # Any active child of "security" counts as a sub-service selection.
    security_child_slugs = set(
        ServiceCategory.objects.filter(parent__slug=SECURITY_PARENT_SLUG, is_active=True).values_list("slug", flat=True)
    )
    if not security_child_slugs:
        return None

    if not any(s in security_child_slugs for s in slugs):
        return "If you select Security, you must also select at least one security sub-service (e.g. CCTV Installation, Alarm Systems, Access Control, Electric Fencing, Gate Motors)."
    return None


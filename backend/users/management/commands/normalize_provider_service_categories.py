from django.core.management.base import BaseCommand

from backend.users.models import ProviderProfile
from backend.users.service_category_utils import (
    enforce_security_subservice_rule,
    normalize_service_category_slugs,
)


class Command(BaseCommand):
    help = "Normalize ProviderProfile.service_categories to canonical active ServiceCategory slugs (and include parent slugs)."

    def add_arguments(self, parser):
        parser.add_argument("--apply", action="store_true", help="Actually write changes (default: dry-run)")
        parser.add_argument("--limit", type=int, default=0, help="Limit number of providers processed (0 = all)")

    def handle(self, *args, **options):
        apply = bool(options["apply"])
        limit = int(options["limit"] or 0)

        qs = ProviderProfile.objects.select_related("user").all().order_by("id")
        if limit > 0:
            qs = qs[:limit]

        changed = 0
        blocked_security = 0

        for p in qs:
            before = list(p.service_categories or [])
            after = normalize_service_category_slugs(before, only_active=True, include_parents=True)

            # If provider has Security but no sub-service, keep existing categories (don't auto-guess).
            # We report it so admins can fix in UI.
            security_err = enforce_security_subservice_rule(after)
            if security_err:
                blocked_security += 1
                self.stdout.write(
                    self.style.WARNING(
                        f"⚠️  {p.user.email}: Security selected without sub-service. Needs manual fix. Current={before}"
                    )
                )
                continue

            if before != after:
                changed += 1
                msg = f"{p.user.email}: {before} -> {after}"
                if apply:
                    p.service_categories = after
                    p.save(update_fields=["service_categories"])
                    self.stdout.write(self.style.SUCCESS(f"✅ Updated {msg}"))
                else:
                    self.stdout.write(f"[dry-run] {msg}")

        mode = "APPLIED" if apply else "DRY-RUN"
        self.stdout.write(self.style.SUCCESS(f"\nDone ({mode}). Changed={changed}, Security-needs-fix={blocked_security}"))


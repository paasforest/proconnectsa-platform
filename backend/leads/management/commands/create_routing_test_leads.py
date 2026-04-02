"""
Create verified leads (plumbing / electrical by default) to exercise lead_router + assignment.

Each Lead has one service_category only — use two leads to test both trades.

Email / Resend still goes to real addresses from the database; use EMAIL_BACKEND=console
in dev or --dry-run to avoid sending.
"""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from backend.leads.models import Lead, ServiceCategory
from backend.leads.services.lead_router import match_providers

User = get_user_model()

# Quality gate: description length + word count (_is_gibberish needs 3+ words, etc.)
_DESCRIPTION = (
    "We need licensed work completed at our residential property as soon as possible. "
    "The scope includes assessment, materials if required, and a clear quote before starting. "
    "Please contact us during business hours to arrange a site visit this week."
)


class Command(BaseCommand):
    help = "Create verified test leads for routing (plumbing + electrical); optional dry-run of matches only."

    def add_arguments(self, parser):
        parser.add_argument(
            "--slugs",
            nargs="*",
            default=["plumbing", "electrical"],
            help="ServiceCategory slugs (default: plumbing electrical)",
        )
        parser.add_argument("--city", default="Cape Town", help="Lead location_city")
        parser.add_argument("--suburb", default="Cape Town", help="Lead location_suburb")
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Only print who lead_router.match_providers would select (no DB writes, no email)",
        )

    def handle(self, *args, **options):
        slugs = options["slugs"] or ["plumbing", "electrical"]
        city = options["city"]
        suburb = options["suburb"]

        if options["dry_run"]:
            self.stdout.write(self.style.WARNING("DRY RUN — no leads created, no email sent\n"))
            for slug in slugs:
                cat = ServiceCategory.objects.filter(slug=slug, is_active=True).first()
                if not cat:
                    self.stdout.write(self.style.ERROR(f"  No active category slug={slug!r}"))
                    continue
                phantom = Lead(
                    service_category=cat,
                    location_city=city,
                    location_suburb=suburb,
                    title=f"Dry run {slug}",
                    description=_DESCRIPTION,
                )
                pros = match_providers(phantom)
                self.stdout.write(f"\n  [{slug}] lead_router would match {len(pros)} provider(s) (max 10):")
                for u in pros:
                    self.stdout.write(f"    - {u.email}")
            self.stdout.write(
                "\nNote: LeadAssignmentService assigns up to 3 pros; those get email first from "
                "the full pipeline. This dry-run only mirrors lead_router matching.\n"
            )
            return

        test_email = "routing_test_client@proconnectsa.local"
        client, _created = User.objects.get_or_create(
            email=test_email,
            defaults={
                "username": "routing_test_client_pc",
                "first_name": "Routing",
                "last_name": "TestClient",
                "user_type": "client",
                "is_active": True,
                "phone": "+27820000001",
            },
        )
        if client.user_type != "client":
            client.user_type = "client"
            client.save(update_fields=["user_type"])

        created_ids = []
        for slug in slugs:
            cat = ServiceCategory.objects.filter(slug=slug, is_active=True).first()
            if not cat:
                self.stdout.write(self.style.ERROR(f"Skip slug={slug!r}: category missing or inactive"))
                continue

            title = f"ROUTING TEST: {cat.name} in {suburb} ({timezone.now():%Y-%m-%d %H:%M})"
            lead = Lead.objects.create(
                client=client,
                title=title,
                description=_DESCRIPTION,
                service_category=cat,
                location_address=f"1 Test Street, {suburb}",
                location_suburb=suburb,
                location_city=city,
                budget_range="1000_5000",
                urgency="this_week",
                hiring_intent="ready_to_hire",
                hiring_timeline="this_month",
                status="verified",
                verification_score=80,
                verified_at=timezone.now(),
                max_providers=5,
            )
            created_ids.append(str(lead.id))
            pros = match_providers(lead)
            self.stdout.write(
                self.style.SUCCESS(
                    f"Created verified lead {lead.id} ({slug}) — "
                    f"lead_router match count: {len(pros)}"
                )
            )
            for u in pros[:15]:
                self.stdout.write(f"    matched: {u.email}")

        if not created_ids:
            self.stdout.write(self.style.ERROR("No leads created (check categories)."))
            return

        self.stdout.write(
            self.style.WARNING(
                "\nCheck provider inboxes (or Django console email backend). "
                "Assignment path notifies at most 3 pros (ML); router fallback notifies up to 10. "
                f"Lead ID(s): {', '.join(created_ids)}\n"
            )
        )

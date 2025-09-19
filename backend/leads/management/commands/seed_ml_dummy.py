"""
Seed minimal dummy data for ML training in development.

Creates:
- Service categories (if missing)
- One client user and multiple provider users with verified profiles
- A configurable number of leads with varied fields and statuses
- A configurable number of lead assignments with outcomes for conversion model

Safety: By default, only runs when DEBUG is True unless --allow-production is passed.
"""

from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
import random
from datetime import timedelta

from backend.leads.models import ServiceCategory, Lead, LeadAssignment
from backend.users.models import User, ProviderProfile


class Command(BaseCommand):
    help = "Seed minimal dummy data for ML training (development only)"

    def add_arguments(self, parser):
        parser.add_argument("--leads", type=int, default=60, help="Number of leads to create")
        parser.add_argument(
            "--assignments",
            type=int,
            default=40,
            help="Number of lead assignments with outcomes to create",
        )
        parser.add_argument(
            "--allow-production",
            action="store_true",
            help="Allow seeding even when DEBUG is False",
        )

    def handle(self, *args, **options):
        if not settings.DEBUG and not options["--allow-production"]:
            self.stdout.write(self.style.ERROR("Refusing to seed in production without --allow-production"))
            return

        leads_to_create = options["leads"]
        assignments_to_create = options["assignments"]

        self._ensure_categories()
        client = self._ensure_client()
        providers = self._ensure_providers()

        leads = self._create_leads(client=client, providers=providers, count=leads_to_create)
        self._create_assignments(leads=leads, providers=providers, count=assignments_to_create)

        self.stdout.write(self.style.SUCCESS("Seeding complete."))

    def _ensure_categories(self):
        base_categories = [
            ("Plumbing", "plumbing"),
            ("Electrical", "electrical"),
            ("Cleaning", "cleaning"),
            ("Painting", "painting"),
            ("Landscaping", "landscaping"),
            ("Renovation", "renovation"),
        ]
        for name, slug in base_categories:
            ServiceCategory.objects.get_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "description": f"Dummy {name} description",
                    "icon": "wrench",
                    "is_active": True,
                },
            )

    def _ensure_client(self) -> User:
        client, _ = User.objects.get_or_create(
            username="client_ml",
            defaults={
                "email": "client_ml@example.com",
                "user_type": "client",
                "phone": "+27810000001",
                "first_name": "Client",
                "last_name": "ML",
            },
        )
        return client

    def _ensure_providers(self):
        providers = []
        provider_specs = [
            ("plumbing", "+27810000010"),
            ("electrical", "+27810000011"),
            ("cleaning", "+27810000012"),
            ("painting", "+27810000013"),
            ("landscaping", "+27810000014"),
        ]
        for idx, (category_slug, phone) in enumerate(provider_specs, start=1):
            username = f"provider_ml_{idx}"
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": f"{username}@example.com",
                    "user_type": "provider",
                    "phone": phone,
                    "first_name": f"Prov{idx}",
                    "last_name": "ML",
                    "city": "Cape Town",
                    "suburb": "Sea Point",
                    "latitude": -33.918861,
                    "longitude": 18.4233,
                },
            )
            profile, _ = ProviderProfile.objects.get_or_create(
                user=user,
                defaults={
                    "business_name": f"ML Co {idx}",
                    "business_address": "123 Main St, Cape Town",
                    "service_areas": ["Sea Point", "Cape Town"],
                    "service_categories": [category_slug],
                    "subscription_tier": "premium",
                    "subscription_start_date": timezone.now() - timedelta(days=15),
                    "subscription_end_date": timezone.now() + timedelta(days=15),
                    "credit_balance": 50,
                    "verification_status": "verified",
                    "average_rating": Decimal("4.50"),
                    "response_time_hours": 12.0,
                },
            )
            providers.append(user)
        return providers

    def _create_leads(self, client, providers, count: int):
        categories = list(ServiceCategory.objects.filter(is_active=True))
        if not categories:
            return []
        statuses = ["completed", "cancelled", "expired", "verified", "assigned"]
        urgencies = ["urgent", "this_week", "this_month", "flexible"]
        budgets = [
            "under_1000",
            "1000_5000",
            "5000_15000",
            "15000_50000",
            "over_50000",
            "no_budget",
        ]
        intents = ["ready_to_hire", "planning_to_hire", "researching", "comparing_quotes"]
        timelines = ["asap", "this_month", "next_month", "flexible"]

        leads = []
        for i in range(count):
            cat = random.choice(categories)
            lead = Lead.objects.create(
                client=client,
                service_category=cat,
                title=f"Dummy {cat.name} job #{i+1}",
                description="Need help with a test task for ML seeding.",
                location_address="456 Test Rd, Cape Town",
                location_suburb="Sea Point",
                location_city="Cape Town",
                budget_range=random.choice(budgets),
                urgency=random.choice(urgencies),
                hiring_intent=random.choice(intents),
                hiring_timeline=random.choice(timelines),
                additional_requirements="",
                research_purpose="",
                verification_score=random.randint(20, 95),
                status=random.choice(statuses),
                created_at=timezone.now() - timedelta(days=random.randint(0, 60)),
            )
            leads.append(lead)

        return leads

    def _create_assignments(self, leads, providers, count: int):
        if not leads or not providers:
            return
        outcomes = ["won", "lost", "no_response"]
        for i in range(count):
            lead = random.choice(leads)
            provider = random.choice(providers)
            # Avoid duplicates
            if LeadAssignment.objects.filter(lead=lead, provider=provider).exists():
                continue
            status = random.choice(outcomes)
            assignment = LeadAssignment.objects.create(
                lead=lead,
                provider=provider,
                credit_cost=random.randint(1, 3),
                status=status,
                won_job=True if status == "won" else False if status == "lost" else None,
            )
            # Update provider credits and usage minimally
            profile = provider.provider_profile
            if profile.credit_balance > 0:
                profile.credit_balance = max(0, profile.credit_balance - assignment.credit_cost)
            profile.leads_used_this_month += 1
            profile.save(update_fields=["credit_balance", "leads_used_this_month"])











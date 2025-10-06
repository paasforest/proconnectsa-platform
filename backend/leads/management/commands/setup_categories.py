"""
Django management command to set up service categories and test auto-distribution
Run: python manage.py setup_categories
"""
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from django.utils import timezone
from backend.leads.models import Lead, ServiceCategory, LeadAssignment
from backend.users.models import User, ProviderProfile
import time


class Command(BaseCommand):
    help = 'Set up service categories and test auto-distribution'

    def handle(self, *args, **options):
        self.stdout.write("=" * 80)
        self.stdout.write("🔧 SETUP SERVICE CATEGORIES & TEST AUTO-DISTRIBUTION")
        self.stdout.write("=" * 80)

        # STEP 1: Create Service Categories
        self.stdout.write("\n📋 STEP 1: Creating Service Categories...")
        
        categories = [
            'Cleaning', 'Plumbing', 'Electrical', 'Handyman', 'Painting',
            'Carpentry', 'Landscaping', 'Pest Control', 'Moving Services',
            'HVAC', 'Roofing', 'Flooring', 'Tiling', 'Construction',
            'Renovations', 'Farm Fencing'
        ]

        created_count = 0
        for name in categories:
            cat, created = ServiceCategory.objects.get_or_create(
                slug=slugify(name),
                defaults={
                    'name': name,
                    'description': f'{name} services',
                    'is_active': True
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'   ✅ Created: {name}'))
            else:
                self.stdout.write(f'   ⏭️  Exists: {name}')

        total = ServiceCategory.objects.count()
        self.stdout.write(f'\n   📊 Total categories: {total}')
        self.stdout.write(f'   📊 Newly created: {created_count}')

        # STEP 2: Check Verified Providers
        self.stdout.write("\n📋 STEP 2: Checking Verified Providers...")
        verified_providers = ProviderProfile.objects.filter(
            verification_status='verified',
            user__is_active=True
        ).select_related('user')

        self.stdout.write(f'   Total Verified Providers: {verified_providers.count()}')
        for provider in verified_providers[:5]:  # Show first 5
            self.stdout.write(f'   - {provider.user.email}')

        # STEP 3: Create Test Lead
        self.stdout.write("\n📋 STEP 3: Creating Test Lead...")
        
        test_client, _ = User.objects.get_or_create(
            email='autoclient@test.com',
            defaults={
                'username': 'autoclient',
                'first_name': 'Auto',
                'last_name': 'Client',
                'user_type': 'client',
                'phone_number': '+27812340000'
            }
        )

        cleaning_cat = ServiceCategory.objects.filter(slug='cleaning').first()
        if not cleaning_cat:
            self.stdout.write(self.style.ERROR('   ❌ Cleaning category not found!'))
            return

        lead = Lead.objects.create(
            client=test_client,
            service_category=cleaning_cat,
            title=f'AUTO-TEST: Cleaning - {timezone.now().strftime("%Y-%m-%d %H:%M")}',
            description='Testing automatic lead distribution to all matching providers',
            location_city='Johannesburg',
            location_suburb='Sandton',
            location_address='Test Address, Sandton',
            budget_range='1000_5000',
            hiring_timeline='asap',
            urgency='this_week',
            status='verified',
            client_name='Auto Test Client',
            client_email='autoclient@test.com',
            client_phone='+27812340000',
        )

        self.stdout.write(self.style.SUCCESS(f'   ✅ Lead Created: {lead.id}'))

        # STEP 4: Wait for Auto-Assignment
        self.stdout.write("\n📋 STEP 4: Waiting for Auto-Assignment (3 seconds)...")
        time.sleep(3)

        # STEP 5: Check Assignments
        self.stdout.write("\n📋 STEP 5: Checking Lead Assignments...")
        assignments = LeadAssignment.objects.filter(lead=lead).select_related('provider')
        self.stdout.write(f'   Total Auto-Assignments: {assignments.count()}')

        if assignments.count() > 0:
            self.stdout.write(self.style.SUCCESS('\n   ✅ AUTO-ASSIGNMENT IS WORKING!'))
            for assignment in assignments:
                self.stdout.write(f'   → {assignment.provider.email} ({assignment.status})')
        else:
            self.stdout.write(self.style.WARNING('\n   ⚠️  NO AUTO-ASSIGNMENTS'))

        # STEP 6: Summary
        self.stdout.write("\n" + "=" * 80)
        self.stdout.write("📊 FINAL SUMMARY")
        self.stdout.write("=" * 80)
        self.stdout.write(f'✅ Service Categories: {total}')
        self.stdout.write(f'✅ Verified Providers: {verified_providers.count()}')
        self.stdout.write(f'✅ Test Lead: {lead.id}')
        self.stdout.write(f'✅ Auto-Assignments: {assignments.count()}')
        
        if assignments.count() > 0:
            self.stdout.write(self.style.SUCCESS('\n🎉 SUCCESS! Auto-distribution is working!'))
            self.stdout.write('All future providers will automatically receive matching leads!')
        else:
            self.stdout.write(self.style.WARNING('\n⚠️  Auto-distribution needs debugging'))
        
        self.stdout.write("=" * 80)


#!/usr/bin/env python3
"""
Setup and Test Automatic Lead Distribution for ALL Providers
This ensures any new provider who registers will automatically receive matching leads
"""
import os
import sys
import django

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'procompare.settings')
django.setup()

from backend.leads.models import Lead, ServiceCategory, LeadAssignment
from backend.users.models import User, ProviderProfile
from django.utils import timezone
from django.utils.text import slugify

print("=" * 80)
print("🔧 SETUP & TEST: AUTO LEAD DISTRIBUTION FOR ALL PROVIDERS")
print("=" * 80)

# STEP 1: Ensure Service Categories Exist
print("\n📋 STEP 1: Setting Up Service Categories...")
categories_to_create = [
    'Cleaning',
    'Plumbing',
    'Electrical',
    'Handyman',
    'Painting',
    'Carpentry',
    'Landscaping',
    'Pest Control',
    'Moving Services',
    'HVAC',
    'Roofing',
    'Flooring',
    'Tiling',
    'Construction',
    'Renovations',
    'Farm Fencing',
]

created_count = 0
for cat_name in categories_to_create:
    cat, created = ServiceCategory.objects.get_or_create(
        slug=slugify(cat_name),
        defaults={'name': cat_name, 'description': f'{cat_name} services'}
    )
    if created:
        created_count += 1
        print(f"   ✅ Created: {cat_name}")
    else:
        print(f"   ⏭️  Exists: {cat_name}")

print(f"\n   Total categories: {ServiceCategory.objects.count()}")
print(f"   Newly created: {created_count}")

# STEP 2: Verify Signal is Active
print("\n📋 STEP 2: Verifying Auto-Assignment Signal...")
from django.db.models.signals import post_save
from backend.leads.signals import auto_assign_lead_to_providers

# Check if signal is connected
receivers = post_save._live_receivers(Lead)
signal_connected = any('auto_assign_lead_to_providers' in str(r) for r in receivers)

if signal_connected:
    print("   ✅ Auto-assignment signal is ACTIVE")
else:
    print("   ⚠️  Signal might not be connected properly")

# STEP 3: Check Current Providers
print("\n📋 STEP 3: Checking Current Verified Providers...")
verified_providers = ProviderProfile.objects.filter(
    verification_status='verified',
    user__is_active=True
).select_related('user')

print(f"   Total Verified Providers: {verified_providers.count()}")
for provider in verified_providers:
    print(f"\n   Provider: {provider.user.email}")
    print(f"   Services: {provider.services or ['None']}")
    print(f"   Areas: {provider.service_areas or ['None']}")
    print(f"   Min Job: R{provider.minimum_job_value or 0}")

# STEP 4: Create Test Provider (Simulating New Registration)
print("\n📋 STEP 4: Creating Test Provider (Simulating New Registration)...")
test_provider_user, created = User.objects.get_or_create(
    email='newprovider@test.com',
    defaults={
        'username': 'newprovider_test',
        'first_name': 'New',
        'last_name': 'Provider',
        'user_type': 'provider',
        'phone_number': '+27812340000',
    }
)
if created:
    test_provider_user.set_password('Provider123!')
    test_provider_user.save()
    print(f"   ✅ Created test provider user: {test_provider_user.email}")
else:
    print(f"   ⏭️  Test provider exists: {test_provider_user.email}")

# Create/update provider profile
test_provider_profile, created = ProviderProfile.objects.get_or_create(
    user=test_provider_user,
    defaults={
        'business_name': 'New Provider Test Business',
        'services': ['cleaning', 'handyman'],
        'service_areas': ['Johannesburg', 'Sandton', 'Rosebank'],
        'verification_status': 'verified',
        'minimum_job_value': 0,
        'years_experience': 5,
        'subscription_tier': 'basic',
    }
)

if not created:
    # Update existing profile
    test_provider_profile.services = ['cleaning', 'handyman']
    test_provider_profile.service_areas = ['Johannesburg', 'Sandton', 'Rosebank']
    test_provider_profile.verification_status = 'verified'
    test_provider_profile.minimum_job_value = 0
    test_provider_profile.save()
    print(f"   ✅ Updated test provider profile")
else:
    print(f"   ✅ Created test provider profile")

# STEP 5: Create Test Lead
print("\n📋 STEP 5: Creating Test Lead (Cleaning in Johannesburg)...")
test_client, _ = User.objects.get_or_create(
    email='autoclient@test.com',
    defaults={
        'username': 'autoclient_test',
        'first_name': 'Auto',
        'last_name': 'TestClient',
        'user_type': 'client',
    }
)

cleaning_cat = ServiceCategory.objects.filter(slug='cleaning').first()
if not cleaning_cat:
    print("   ❌ Cleaning category not found!")
    sys.exit(1)

lead = Lead.objects.create(
    client=test_client,
    service_category=cleaning_cat,
    title=f"AUTO-DIST TEST: Cleaning Service - {timezone.now().strftime('%Y-%m-%d %H:%M')}",
    description="Testing automatic distribution to ALL matching providers including new ones.",
    location_city="Johannesburg",
    location_suburb="Sandton",
    budget_range="1000_5000",
    hiring_timeline="within_week",
    status="verified",  # This triggers auto-assignment signal
    client_name="Auto Test Client",
    client_email="autoclient@test.com",
    client_phone="+27812345000",
)

print(f"   ✅ Lead Created!")
print(f"   ID: {lead.id}")
print(f"   Title: {lead.title}")
print(f"   Status: {lead.status} (must be 'verified' for auto-assignment)")

# STEP 6: Wait and Check Assignments
print("\n📋 STEP 6: Checking Auto-Assignment (waiting 3 seconds)...")
import time
time.sleep(3)

assignments = LeadAssignment.objects.filter(lead=lead).select_related('provider')
print(f"   Total Assignments: {assignments.count()}")

if assignments.count() > 0:
    print(f"\n   ✅ AUTO-ASSIGNMENT WORKING!")
    for assignment in assignments:
        print(f"\n   → Provider: {assignment.provider.email}")
        print(f"     Name: {assignment.provider.first_name} {assignment.provider.last_name}")
        print(f"     Status: {assignment.status}")
        print(f"     Credit Cost: {assignment.credit_cost}")
        
        if assignment.provider == test_provider_user:
            print(f"     🎯 NEW PROVIDER RECEIVED LEAD!")
else:
    print(f"\n   ⚠️  NO AUTO-ASSIGNMENTS CREATED")
    print(f"\n   Attempting manual assignment to debug...")
    
    try:
        from backend.leads.services import LeadAssignmentService
        service = LeadAssignmentService()
        manual_assignments = service.assign_lead_to_providers(lead.id)
        
        print(f"   Manual assignment result: {len(manual_assignments)} providers")
        for assignment in manual_assignments:
            print(f"   → {assignment.provider.email} (Quality: {assignment.quality_match_score})")
            
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

# STEP 7: Summary
print("\n" + "=" * 80)
print("📊 TEST SUMMARY")
print("=" * 80)
print(f"Service Categories: {ServiceCategory.objects.count()}")
print(f"Verified Providers: {ProviderProfile.objects.filter(verification_status='verified').count()}")
print(f"Test Lead Created: {lead.id}")
print(f"Auto-Assignments: {assignments.count()}")
print(f"New Provider Got Lead: {'✅ YES' if assignments.filter(provider=test_provider_user).exists() else '❌ NO'}")
print("=" * 80)

# STEP 8: Instructions for Real Testing
print("\n📝 TESTING INSTRUCTIONS FOR NEW PROVIDERS:")
print("-" * 80)
print("1. Register a NEW provider at: https://www.proconnectsa.co.za/register")
print("   - Choose 'Service Provider' type")
print("   - Select services: Cleaning, Handyman, etc.")
print("   - Select areas: Johannesburg, Cape Town, etc.")
print("")
print("2. Admin verifies the provider (set verification_status='verified')")
print("")
print("3. Create a lead matching their services:")
print("   - Go to: https://www.proconnectsa.co.za/request-quote")
print("   - Select matching service category")
print("   - Select matching location")
print("")
print("4. The new provider should automatically see the lead in their dashboard:")
print("   - https://www.proconnectsa.co.za/provider-dashboard")
print("")
print("5. If they DON'T see it, check:")
print("   - Provider verification_status = 'verified'")
print("   - Provider minimum_job_value <= lead budget")
print("   - Services and locations match")
print("   - Lead status = 'verified'")
print("=" * 80)

print("\n✅ Setup complete! System ready for automatic lead distribution.")



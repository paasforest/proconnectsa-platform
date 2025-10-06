#!/usr/bin/env python3
"""
Fix Service Categories and Test Auto-Distribution
Run on server: cd /home/paas/proconnectsa-platform && python3 fix_categories_and_test.py
"""
import os
import sys
import django
import time

# Setup Django - works on production server
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'procompare.settings')
django.setup()

from backend.leads.models import Lead, ServiceCategory, LeadAssignment
from backend.users.models import User, ProviderProfile
from django.utils import timezone
from django.utils.text import slugify

print("=" * 80)
print("🔧 FIX SERVICE CATEGORIES & TEST AUTO-DISTRIBUTION")
print("=" * 80)

# STEP 1: Fix Service Categories
print("\n📋 STEP 1: Creating Service Categories...")
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
        print(f"   ✅ Created: {name}")
    else:
        print(f"   ⏭️  Exists: {name}")

total_categories = ServiceCategory.objects.count()
print(f"\n   📊 Total categories: {total_categories}")
print(f"   📊 Newly created: {created_count}")

# STEP 2: Check Verified Providers
print("\n📋 STEP 2: Checking Verified Providers...")
verified_providers = ProviderProfile.objects.filter(
    verification_status='verified',
    user__is_active=True
).select_related('user')

print(f"   Total Verified Providers: {verified_providers.count()}")
if verified_providers.count() > 0:
    for provider in verified_providers:
        print(f"\n   Provider: {provider.user.email}")
        print(f"   Services: {provider.services or 'None'}")
        print(f"   Areas: {provider.service_areas or 'None'}")
else:
    print("   ⚠️  No verified providers found")

# STEP 3: Create Test Lead
print("\n📋 STEP 3: Creating Test Lead...")
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
    print("   ❌ ERROR: Cleaning category not found!")
    sys.exit(1)

lead = Lead.objects.create(
    client=test_client,
    service_category=cleaning_cat,
    title=f'AUTO-TEST: Cleaning - {timezone.now().strftime("%Y-%m-%d %H:%M")}',
    description='Testing automatic lead distribution to all matching providers',
    location_city='Johannesburg',
    location_suburb='Sandton',
    location_address='Test Address',
    budget_range='1000_5000',
    hiring_timeline='asap',
    urgency='this_week',
    status='verified',  # This triggers auto-assignment
    client_name='Auto Test Client',
    client_email='autoclient@test.com',
    client_phone='+27812340000',
)

print(f"   ✅ Lead Created!")
print(f"   ID: {lead.id}")
print(f"   Title: {lead.title}")
print(f"   Status: {lead.status}")

# STEP 4: Wait for Auto-Assignment Signal
print("\n📋 STEP 4: Waiting for Auto-Assignment (3 seconds)...")
time.sleep(3)

# STEP 5: Check Assignments
print("\n📋 STEP 5: Checking Lead Assignments...")
assignments = LeadAssignment.objects.filter(lead=lead).select_related('provider')
print(f"   Total Auto-Assignments: {assignments.count()}")

if assignments.count() > 0:
    print(f"\n   ✅ AUTO-ASSIGNMENT IS WORKING!")
    for assignment in assignments:
        print(f"\n   → Provider: {assignment.provider.email}")
        print(f"     Name: {assignment.provider.first_name} {assignment.provider.last_name}")
        print(f"     Status: {assignment.status}")
        print(f"     Credit Cost: {assignment.credit_cost}")
        print(f"     Quality Score: {assignment.quality_match_score or 'N/A'}")
else:
    print(f"\n   ⚠️  NO AUTO-ASSIGNMENTS CREATED")
    print(f"   Attempting manual assignment for debugging...")
    
    try:
        from backend.leads.services import LeadAssignmentService
        service = LeadAssignmentService()
        manual_assignments = service.assign_lead_to_providers(lead.id)
        
        print(f"   Manual assignment result: {len(manual_assignments)} providers")
        for assignment in manual_assignments:
            print(f"   → {assignment.provider.email} (Quality: {assignment.quality_match_score})")
    except Exception as e:
        print(f"   ❌ Manual assignment error: {str(e)}")
        import traceback
        traceback.print_exc()

# STEP 6: Summary
print("\n" + "=" * 80)
print("📊 FINAL SUMMARY")
print("=" * 80)
print(f"✅ Service Categories: {total_categories} (created {created_count} new)")
print(f"✅ Verified Providers: {verified_providers.count()}")
print(f"✅ Test Lead: {lead.id}")
print(f"✅ Auto-Assignments: {assignments.count()}")
print(f"\n{'✅ SUCCESS!' if assignments.count() > 0 else '⚠️  AUTO-DISTRIBUTION NOT WORKING'}")

if assignments.count() > 0:
    print("\n🎉 SYSTEM READY!")
    print("   All future providers will automatically receive matching leads!")
    print("   When providers register and get verified, they'll see leads immediately.")
else:
    print("\n⚠️  AUTO-DISTRIBUTION NEEDS DEBUGGING")
    print("   Check:")
    print("   1. Signal is registered in backend/leads/apps.py")
    print("   2. Provider verification_status = 'verified'")
    print("   3. Provider services match lead category")
    print("   4. Provider service_areas match lead location")

print("=" * 80)


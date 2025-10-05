#!/usr/bin/env python3
"""
Update yusuf jack's provider profile to include electrical and plumbing services
"""

import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append('/home/paas/work_platform/backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.procompare.settings')
django.setup()

from backend.users.models import User, ProviderProfile
from backend.leads.models import ServiceCategory
from backend.users.services.models import Service

def update_yusuf_services():
    """Update yusuf jack's services to include electrical and plumbing"""
    print("🔧 UPDATING YUSUF JACK'S SERVICE CONFIGURATION")
    print("=" * 60)
    
    # Find yusuf jack user
    try:
        user = User.objects.get(
            first_name__icontains='yusuf',
            last_name__icontains='jack'
        )
        print(f"✅ Found user: {user.first_name} {user.last_name} ({user.email})")
    except User.DoesNotExist:
        print("❌ User 'yusuf jack' not found")
        return
    except User.MultipleObjectsReturned:
        users = User.objects.filter(
            first_name__icontains='yusuf',
            last_name__icontains='jack'
        )
        print("⚠️  Multiple users found:")
        for u in users:
            print(f"   - {u.first_name} {u.last_name} ({u.email})")
        user = users.first()
        print(f"Using first user: {user.email}")
    
    # Get provider profile
    try:
        profile = user.provider_profile
        print(f"✅ Found provider profile: {profile.business_name}")
    except ProviderProfile.DoesNotExist:
        print("❌ Provider profile not found")
        return
    
    # Show current services
    print(f"\n📋 CURRENT SERVICES:")
    current_services = profile.services.filter(is_active=True)
    if current_services.exists():
        for service in current_services:
            print(f"   ✅ {service.name} - {service.category.name}")
    else:
        print("   ⚠️  No active services found")
    
    print(f"\n📋 CURRENT SERVICE CATEGORIES (JSON): {profile.service_categories}")
    
    # Get service categories
    print(f"\n🔧 ADDING NEW SERVICES:")
    
    # Get or create service categories
    cleaning_cat, _ = ServiceCategory.objects.get_or_create(
        slug='cleaning',
        defaults={'name': 'Cleaning Services', 'description': 'House and office cleaning services', 'is_active': True}
    )
    
    electrical_cat, _ = ServiceCategory.objects.get_or_create(
        slug='electrical',
        defaults={'name': 'Electrical', 'description': 'Electrical work and repairs', 'is_active': True}
    )
    
    plumbing_cat, _ = ServiceCategory.objects.get_or_create(
        slug='plumbing',
        defaults={'name': 'Plumbing', 'description': 'Plumbing repairs and installations', 'is_active': True}
    )
    
    # Add services
    services_to_add = [
        ('Electrical Services', electrical_cat, 'Professional electrical installation and repair services'),
        ('Plumbing Services', plumbing_cat, 'Professional plumbing installation and repair services'),
        ('Cleaning Services', cleaning_cat, 'Professional cleaning services for homes and offices'),
    ]
    
    for service_name, category, description in services_to_add:
        service, created = Service.objects.get_or_create(
            provider=profile,
            category=category,
            defaults={
                'name': service_name,
                'description': description,
                'is_active': True
            }
        )
        
        if created:
            print(f"   ✅ Added: {service_name} - {category.name}")
        else:
            print(f"   📋 Exists: {service_name} - {category.name}")
    
    # Update service areas if needed
    if not profile.service_areas or len(profile.service_areas) < 2:
        profile.service_areas = ['Cape Town', 'Johannesburg']
        print(f"   ✅ Updated service areas: {profile.service_areas}")
    
    # Save profile
    profile.save()
    
    # Sync service categories JSON field
    print(f"\n🔄 SYNCING SERVICE CATEGORIES:")
    active_service_categories = set()
    for service in profile.services.filter(is_active=True):
        if service.category.slug:
            active_service_categories.add(service.category.slug)
    
    profile.service_categories = list(active_service_categories)
    profile.save(update_fields=['service_categories'])
    
    print(f"   ✅ Synced JSON field: {list(active_service_categories)}")
    
    # Show final configuration
    print(f"\n🎉 FINAL CONFIGURATION:")
    print(f"   Business: {profile.business_name}")
    print(f"   Service Areas: {profile.service_areas}")
    print(f"   Service Categories (JSON): {profile.service_categories}")
    print(f"   Active Services:")
    for service in profile.services.filter(is_active=True):
        print(f"      - {service.name} ({service.category.name})")
    
    print(f"\n✅ yusuf jack should now receive leads for:")
    print(f"   - Cleaning Services")
    print(f"   - Electrical Services")
    print(f"   - Plumbing Services")
    
    print(f"\n🧪 Test by creating new leads for these services!")

if __name__ == "__main__":
    update_yusuf_services()

#!/usr/bin/env python3
"""
Fix service categories and sync existing provider profiles
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

def fix_service_categories():
    """Fix service categories and sync provider profiles"""
    print("🔧 FIXING SERVICE CATEGORIES AND PROVIDER PROFILES")
    print("=" * 60)
    
    # 1. Create service categories if they don't exist
    print("1. Creating service categories...")
    
    service_categories = [
        {'name': 'Cleaning Services', 'slug': 'cleaning', 'description': 'House and office cleaning services'},
        {'name': 'Plumbing', 'slug': 'plumbing', 'description': 'Plumbing repairs and installations'},
        {'name': 'Electrical', 'slug': 'electrical', 'description': 'Electrical work and repairs'},
        {'name': 'Handyman', 'slug': 'handyman', 'description': 'General handyman services'},
    ]
    
    for cat_data in service_categories:
        category, created = ServiceCategory.objects.get_or_create(
            slug=cat_data['slug'],
            defaults={
                'name': cat_data['name'],
                'description': cat_data['description'],
                'is_active': True
            }
        )
        if created:
            print(f"   ✅ Created: {category.name}")
        else:
            print(f"   📋 Exists: {category.name}")
    
    # 2. Fix provider profiles
    print("\n2. Fixing provider profiles...")
    
    providers = ProviderProfile.objects.all()
    for provider in providers:
        print(f"\n   👤 Provider: {provider.user.email}")
        
        # Get service categories from Service objects
        service_categories_from_objects = set()
        for service in provider.services.filter(is_active=True):
            if service.category.slug:
                service_categories_from_objects.add(service.category.slug)
        
        # Get current JSON field
        current_json_categories = set(provider.service_categories or [])
        
        print(f"      Service Objects: {list(service_categories_from_objects)}")
        print(f"      JSON Field: {list(current_json_categories)}")
        
        # Sync if different
        if service_categories_from_objects != current_json_categories:
            provider.service_categories = list(service_categories_from_objects)
            provider.save(update_fields=['service_categories'])
            print(f"      ✅ Synced: {list(service_categories_from_objects)}")
        else:
            print(f"      ✅ Already synced")
    
    print("\n🎉 Service categories and provider profiles fixed!")
    print("Now providers should receive leads for all their selected services.")

if __name__ == "__main__":
    fix_service_categories()

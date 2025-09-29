#!/usr/bin/env python3
"""
Fix provider service areas to only include their local city
"""
import os
import django
import sys

# Add the backend directory to Python path
sys.path.append('/opt/proconnectsa-backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.procompare.settings')
django.setup()

from backend.users.models import User, ProviderProfile

def fix_provider_locations():
    """Fix provider service areas to only include their local city"""
    print("🔧 Fixing provider service areas...")
    
    # Get all providers
    providers = User.objects.filter(user_type='provider')
    
    for provider in providers:
        try:
            if hasattr(provider, 'provider_profile'):
                profile = provider.provider_profile
                original_areas = profile.service_areas.copy()
                
                # Set service areas to only their city
                if provider.city:
                    profile.service_areas = [provider.city]
                    profile.save()
                    print(f"✅ Updated {provider.email}: {original_areas} → {profile.service_areas}")
                else:
                    print(f"⚠️  No city set for {provider.email}")
            else:
                print(f"⚠️  No provider profile for {provider.email}")
                
        except Exception as e:
            print(f"❌ Error updating {provider.email}: {e}")
    
    print("🎉 Provider location fix completed!")

if __name__ == '__main__':
    fix_provider_locations()

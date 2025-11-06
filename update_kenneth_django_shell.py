#!/usr/bin/env python3
"""
Django shell script to update Kenneth Nakutepa from client to provider
This script should be run on the server using Django shell
"""

# Run this on the server with: ./venv/bin/python manage.py shell < update_kenneth_django_shell.py

print("🔍 Searching for Kenneth Nakutepa...")

# Import Django models
from backend.users.models import User, ProviderProfile
from django.utils.text import slugify

# Search for Kenneth Nakutepa
kenneth_users = User.objects.filter(
    first_name__icontains='kenneth',
    last_name__icontains='nakutepa'
)

if not kenneth_users.exists():
    # Try searching by email
    kenneth_users = User.objects.filter(
        email__icontains='kenneth'
    ) | User.objects.filter(
        email__icontains='nakutepa'
    )

if kenneth_users.exists():
    kenneth = kenneth_users.first()
    print(f"✅ Found Kenneth Nakutepa:")
    print(f"   ID: {kenneth.id}")
    print(f"   Name: {kenneth.first_name} {kenneth.last_name}")
    print(f"   Email: {kenneth.email}")
    print(f"   Current Type: {kenneth.user_type}")
    print(f"   Phone: {kenneth.phone}")
    print(f"   Created: {kenneth.created_at}")
    
    if kenneth.user_type == 'provider':
        print("✅ Kenneth is already a provider!")
    else:
        print(f"\n🔄 Updating user type from '{kenneth.user_type}' to 'provider'...")
        
        # Update user type
        kenneth.user_type = 'provider'
        kenneth.save()
        
        print("✅ User type updated successfully!")
        
        # Check if provider profile exists
        try:
            provider_profile = kenneth.provider_profile
            print("✅ Provider profile already exists")
        except ProviderProfile.DoesNotExist:
            print("🏢 Creating provider profile...")
            
            # Create basic provider profile
            provider_profile = ProviderProfile.objects.create(
                user=kenneth,
                business_name=f"{kenneth.first_name} {kenneth.last_name} Services",
                business_address=f"{kenneth.city or 'Cape Town'}, {kenneth.suburb or ''}",
                service_areas=[kenneth.city or 'Cape Town'],
                service_categories=['cleaning', 'handyman'],  # Default categories
                verification_status='pending',
                subscription_tier='pay_as_you_go'
            )
            
            print("✅ Provider profile created successfully!")
            print(f"   Business Name: {provider_profile.business_name}")
            print(f"   Service Areas: {provider_profile.service_areas}")
            print(f"   Service Categories: {provider_profile.service_categories}")
        
        print(f"\n🎉 Kenneth Nakutepa is now a service provider!")
        print(f"   - User type: {kenneth.user_type}")
        print(f"   - Can access provider dashboard")
        print(f"   - Can receive lead assignments")
        
else:
    print("❌ Kenneth Nakutepa not found")
    print("Available users with 'kenneth' in name:")
    kenneth_like = User.objects.filter(
        first_name__icontains='kenneth'
    ) | User.objects.filter(
        last_name__icontains='kenneth'
    )
    
    for user in kenneth_like:
        print(f"   - {user.first_name} {user.last_name} ({user.email}) - {user.user_type}")
    
    print("\nAvailable users with 'nakutepa' in name:")
    nakutepa_like = User.objects.filter(
        first_name__icontains='nakutepa'
    ) | User.objects.filter(
        last_name__icontains='nakutepa'
    )
    
    for user in nakutepa_like:
        print(f"   - {user.first_name} {user.last_name} ({user.email}) - {user.user_type}")

print("\n✅ Script completed")










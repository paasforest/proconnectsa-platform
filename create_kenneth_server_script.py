#!/usr/bin/env python3
"""
Complete script to create Kenneth Nakutepa as service provider
Run this on the Hetzner server with: ./venv/bin/python manage.py shell < create_kenneth_server_script.py
"""

# Import Django models
from backend.users.models import User, ProviderProfile
from django.contrib.auth.hashers import make_password
from django.utils import timezone

print("🚀 Creating Kenneth Nakutepa as Service Provider")
print("=" * 60)

# Check if Kenneth already exists
kenneth = User.objects.filter(email='Kennethayam80@gmail.com').first()

if kenneth:
    print(f"Found existing Kenneth:")
    print(f"  Name: {kenneth.first_name} {kenneth.last_name}")
    print(f"  Email: {kenneth.email}")
    print(f"  Current Type: {kenneth.user_type}")
    print(f"  ID: {kenneth.id}")
    
    # Update to provider
    kenneth.user_type = 'provider'
    kenneth.city = 'Johannesburg'
    kenneth.suburb = 'Sandton'
    kenneth.is_email_verified = True
    kenneth.is_active = True
    kenneth.save()
    print("✅ Updated existing Kenneth to provider!")
    
else:
    # Create new Kenneth user
    print("Creating new Kenneth user...")
    kenneth = User.objects.create_user(
        username='Kennethayam80@gmail.com',
        email='Kennethayam80@gmail.com',
        password='Kenneth2024!',
        first_name='Kenneth',
        last_name='Nakutepa',
        user_type='provider',
        phone='+27812345678',  # Placeholder - he'll update this
        city='Johannesburg',
        suburb='Sandton',
        is_email_verified=True,
        is_active=True
    )
    print("✅ Created new Kenneth user!")

# Create or update provider profile
try:
    profile = kenneth.provider_profile
    print("Provider profile already exists, updating...")
    
    # Update existing profile
    profile.business_name = "Kenneth Nakutepa Construction & Renovations"
    profile.business_address = "Sandton, Johannesburg, Gauteng"
    profile.business_phone = "+27812345678"
    profile.business_email = "Kennethayam80@gmail.com"
    profile.service_areas = [
        "Johannesburg", "Sandton", "Rosebank", "Melville", 
        "Randburg", "Fourways", "Midrand", "Rivonia"
    ]
    profile.service_categories = [
        "renovations", "construction", "painting", "carpentry",
        "flooring", "tiling", "roofing", "handyman"
    ]
    profile.verification_status = "verified"
    profile.subscription_tier = "basic"
    profile.years_experience = "5-10 years"
    profile.service_description = "Professional construction and renovation services in Johannesburg. Specializing in home renovations, painting, carpentry, flooring, and general construction work. Over 5 years of experience delivering quality workmanship."
    profile.minimum_job_value = 500
    profile.maximum_job_value = 50000
    profile.availability = "Monday to Friday, 8AM to 6PM"
    profile.emergency_services = True
    profile.insurance_covered = True
    profile.warranty_period = "12 months"
    profile.save()
    
    print("✅ Updated existing provider profile!")
    
except ProviderProfile.DoesNotExist:
    # Create new provider profile
    print("Creating new provider profile...")
    profile = ProviderProfile.objects.create(
        user=kenneth,
        business_name="Kenneth Nakutepa Construction & Renovations",
        business_address="Sandton, Johannesburg, Gauteng",
        business_phone="+27812345678",
        business_email="Kennethayam80@gmail.com",
        service_areas=[
            "Johannesburg", "Sandton", "Rosebank", "Melville", 
            "Randburg", "Fourways", "Midrand", "Rivonia"
        ],
        service_categories=[
            "renovations", "construction", "painting", "carpentry",
            "flooring", "tiling", "roofing", "handyman"
        ],
        verification_status="verified",
        subscription_tier="basic",
        years_experience="5-10 years",
        service_description="Professional construction and renovation services in Johannesburg. Specializing in home renovations, painting, carpentry, flooring, and general construction work. Over 5 years of experience delivering quality workmanship.",
        minimum_job_value=500,
        maximum_job_value=50000,
        availability="Monday to Friday, 8AM to 6PM",
        emergency_services=True,
        insurance_covered=True,
        warranty_period="12 months"
    )
    print("✅ Created new provider profile!")

# Final verification
print("\n🎉 Kenneth Nakutepa is now a complete service provider!")
print("=" * 60)
print("📋 Provider Details:")
print(f"   👤 Name: {kenneth.first_name} {kenneth.last_name}")
print(f"   📧 Email: {kenneth.email}")
print(f"   🔑 Password: Kenneth2024!")
print(f"   🏢 Business: {profile.business_name}")
print(f"   🏙️  Service Areas: {', '.join(profile.service_areas)}")
print(f"   🔨 Services: {', '.join(profile.service_categories)}")
print(f"   ✅ Verification: {profile.verification_status}")
print(f"   📱 Subscription: {profile.subscription_tier}")

print(f"\n🔗 Login Details:")
print(f"   🌐 Provider Dashboard: https://proconnectsa.co.za/provider-dashboard")
print(f"   📧 Email: {kenneth.email}")
print(f"   🔑 Password: Kenneth2024!")

print(f"\n📋 Next Steps for Kenneth:")
print(f"   1. Log in to the provider dashboard")
print(f"   2. Update his phone number")
print(f"   3. Add more detailed business information")
print(f"   4. Upload business documents/photos")
print(f"   5. Set his availability schedule")
print(f"   6. He will start receiving lead assignments automatically!")

print(f"\n✅ Kenneth is ready to receive renovation and construction leads in Johannesburg!")

print("\n✅ Script completed successfully!")












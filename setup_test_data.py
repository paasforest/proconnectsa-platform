#!/usr/bin/env python3
"""
Set up test data for the ProConnectSA system
"""
import os
import django
import sys

# Add the backend directory to Python path
sys.path.append('/opt/proconnectsa-backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.procompare.settings')
django.setup()

from backend.users.models import User, ProviderProfile, Wallet
from backend.leads.models import Lead, ServiceCategory, LeadAccess
from django.contrib.auth.hashers import make_password

def setup_test_data():
    """Set up test users and data"""
    print("🔧 Setting up test data...")
    
    # Create test users
    users_data = [
        {
            'email': 'paasforest@gmail.com',
            'first_name': 'Paas',
            'last_name': 'Forest',
            'user_type': 'provider',
            'city': 'Cape Town',
            'suburb': 'Claremont',
            'phone': '0821234567',
            'is_active': True
        },
        {
            'email': 'john@cleanpro.co.za',
            'first_name': 'John',
            'last_name': 'CleanPro',
            'user_type': 'provider',
            'city': 'Cape Town',
            'suburb': 'Green Point',
            'phone': '0839876543',
            'is_active': True
        }
    ]
    
    created_users = []
    for user_data in users_data:
        user, created = User.objects.get_or_create(
            email=user_data['email'],
            defaults={
                'username': user_data['email'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'user_type': user_data['user_type'],
                'city': user_data['city'],
                'suburb': user_data['suburb'],
                'phone': user_data['phone'],
                'is_active': user_data['is_active'],
                'password': make_password('admin123')
            }
        )
        if created:
            print(f"✅ Created user: {user.email}")
        else:
            print(f"ℹ️  User already exists: {user.email}")
        created_users.append(user)
    
    # Create provider profiles
    for user in created_users:
        if user.user_type == 'provider':
            profile, created = ProviderProfile.objects.get_or_create(
                user=user,
                defaults={
                    'business_name': f"{user.first_name} {user.last_name}'s Business",
                    'business_address': f"{user.city}, {user.suburb}",
                    'service_areas': [user.city],  # Only their city
                    'service_categories': ['cleaning'],  # Only cleaning for now
                    'max_travel_distance': 30,
                    'verification_status': 'verified',
                    'subscription_tier': 'pay_as_you_go'
                }
            )
            if created:
                print(f"✅ Created provider profile for: {user.email}")
            else:
                # Update service areas to only their city
                profile.service_areas = [user.city]
                profile.save()
                print(f"✅ Updated provider profile for: {user.email} - Service areas: {profile.service_areas}")
            
            # Create wallet
            wallet, created = Wallet.objects.get_or_create(
                user=user,
                defaults={
                    'credits': 100,  # Give them some credits for testing
                    'balance': 5000.00
                }
            )
            if created:
                print(f"✅ Created wallet for: {user.email} with {wallet.credits} credits")
    
    # Create service categories
    cleaning_category, created = ServiceCategory.objects.get_or_create(
        name='Cleaning Services',
        defaults={
            'slug': 'cleaning',
            'description': 'House and office cleaning services',
            'is_active': True
        }
    )
    if created:
        print(f"✅ Created service category: {cleaning_category.name}")
    
    electrical_category, created = ServiceCategory.objects.get_or_create(
        name='Electrical Services',
        defaults={
            'slug': 'electrical',
            'description': 'Electrical installation and repair services',
            'is_active': True
        }
    )
    if created:
        print(f"✅ Created service category: {electrical_category.name}")
    
    print("🎉 Test data setup completed!")

if __name__ == '__main__':
    setup_test_data()

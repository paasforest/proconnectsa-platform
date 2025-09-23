#!/usr/bin/env python3
import os
import sys
import django

# Add the project directory to Python path
sys.path.append('/home/paas/work_platform')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.procompare.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.core.management import call_command

User = get_user_model()

def create_test_users():
    print("Creating test users...")
    
    # Create test client
    client_email = 'testclient@example.com'
    client_password = 'testpass123'
    
    if User.objects.filter(email=client_email).exists():
        print(f"Client user {client_email} already exists")
    else:
        client_user = User.objects.create_user(
            email=client_email,
            username=client_email,
            password=client_password,
            user_type='client',
            first_name='Test',
            last_name='Client',
            is_active=True,
            is_email_verified=True
        )
        print(f"✅ Created client user: {client_email}")
    
    # Create test provider
    provider_email = 'testprovider@example.com'
    provider_password = 'testpass123'
    
    if User.objects.filter(email=provider_email).exists():
        print(f"Provider user {provider_email} already exists")
    else:
        provider_user = User.objects.create_user(
            email=provider_email,
            username=provider_email,
            password=provider_password,
            user_type='provider',
            first_name='Test',
            last_name='Provider',
            is_active=True,
            is_email_verified=True
        )
        print(f"✅ Created provider user: {provider_email}")
    
    print("\n🎉 Test users created successfully!")
    print(f"Client: {client_email} / {client_password}")
    print(f"Provider: {provider_email} / {provider_password}")
    print("\nYou can now test the login flow!")

if __name__ == '__main__':
    create_test_users()

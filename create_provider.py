#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to Python path
sys.path.append('/home/paas/work_platform')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.procompare.settings')

django.setup()

from backend.users.models import User, ProviderProfile
from backend.leads.models import ServiceCategory
import uuid

# Check if user already exists
try:
    user = User.objects.get(email='paasforest@gmail.com')
    print(f'User already exists: {user.email}')
except User.DoesNotExist:
    # Create the user
    user_id = str(uuid.uuid4())
    user = User.objects.create(
        id=user_id,
        email='paasforest@gmail.com',
        username='paasforest@gmail.com',
        first_name='Motshidisi',
        last_name='Ratsui',
        user_type='provider',
        is_active=True,
        is_email_verified=True,
        phone='+27123456790'  # Different phone number
    )
    print(f'Created user: {user.email}')

# Create or get provider profile
try:
    provider_profile = ProviderProfile.objects.get(user=user)
    print(f'Provider profile already exists: {provider_profile.business_name}')
except ProviderProfile.DoesNotExist:
    provider_profile = ProviderProfile.objects.create(
        user=user,
        business_name='Motshidisi Services',
        business_phone='+27123456790',
        business_address='123 Main Street, Cape Town',
        service_areas=['Cape Town', 'Johannesburg'],
        verification_status='verified',
        subscription_tier='basic',
        credit_balance=100
    )
    print(f'Created provider profile: {provider_profile.business_name}')

# Add service categories to the JSON field
provider_profile.service_categories = ['plumbing', 'electrical']
provider_profile.save()
print(f'Added service categories: plumbing, electrical')

print(f'Created user: {user.email}')
print(f'Created provider profile: {provider_profile.business_name}')
print(f'User ID: {user.id}')
print(f'Provider Profile ID: {provider_profile.id}')

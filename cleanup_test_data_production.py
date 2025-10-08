#!/usr/bin/env python
"""
Clean up ALL test data from production database
KEEPS: Real users like Towela Ndolo, Ronnie, Thando
DELETES: All test accounts, test leads, test data
"""
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.procompare.settings')
django.setup()

from backend.users.models import User, ProviderProfile, Wallet
from backend.leads.models import Lead, LeadAssignment
from backend.payments.models import Transaction, DepositRequest

print('🧹 CLEANING UP TEST DATA FROM PRODUCTION')
print('=' * 60)

# Real users to KEEP (not delete)
REAL_USERS = [
    'asantetowela@gmail.com',  # Towela Ndolo
    'ronnie@gmail.co',         # Ronnie
    'thandomalamba@gmail.com', # Thando
    'yohanechinthomba@gmail.com', # Yohane
    'rod@gmail.com',           # Rod
    'paasforest@gmail.com',    # Paas
    'john@cleanpro.co.za',     # John
]

# 1. Delete test users
print('\n1️⃣ Deleting test users...')
test_users = User.objects.filter(email__icontains='test').exclude(email__in=REAL_USERS)
count = test_users.count()
print(f'   Found {count} test users')
for user in test_users:
    print(f'   ❌ Deleting: {user.email}')
test_users.delete()
print(f'   ✅ Deleted {count} test users')

# 2. Delete test leads
print('\n2️⃣ Deleting test leads...')
test_keywords = ['TEST', 'QA', 'ML', 'AUTO-TEST', 'CLEANING ML', 'AUTO-DISTRIBUTION']
total_deleted = 0

for keyword in test_keywords:
    leads = Lead.objects.filter(title__icontains=keyword)
    count = leads.count()
    if count > 0:
        print(f'   Found {count} leads with "{keyword}"')
        leads.delete()
        total_deleted += count

print(f'   ✅ Deleted {total_deleted} test leads')

# 3. Delete orphaned lead assignments
print('\n3️⃣ Cleaning orphaned assignments...')
# This will auto-delete when leads/users are deleted due to CASCADE

# 4. Check what's left
print('\n4️⃣ Verifying remaining data...')
remaining_users = User.objects.all().count()
remaining_providers = User.objects.filter(user_type='provider').count()
remaining_clients = User.objects.filter(user_type='client').count()
remaining_leads = Lead.objects.all().count()

print(f'   Remaining users: {remaining_users}')
print(f'   - Providers: {remaining_providers}')
print(f'   - Clients: {remaining_clients}')
print(f'   Remaining leads: {remaining_leads}')

# 5. List real users still in system
print('\n5️⃣ Real providers in system:')
real_providers = User.objects.filter(user_type='provider').order_by('email')
for provider in real_providers:
    try:
        profile = ProviderProfile.objects.get(user=provider)
        print(f'   ✅ {provider.email}: {profile.credit_balance} credits')
    except:
        print(f'   ✅ {provider.email}: no profile')

print('\n' + '=' * 60)
print('✅ TEST DATA CLEANUP COMPLETE!')
print('=' * 60)
print(f'Deleted: {count} test users, {total_deleted} test leads')
print(f'Kept: {remaining_providers} real providers, {remaining_clients} real clients')
print('\n🎉 Database is now clean for production marketing!')



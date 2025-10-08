#!/usr/bin/env python3
"""
Quick System Monitoring Script
Run this anytime to see: new registrations, login issues, payment problems, errors
"""
import requests
import json
from datetime import datetime

API_URL = "https://api.proconnectsa.co.za"
# You'll need to create an admin token - for now using direct database access

print("🔍 PROCONNECTSA SYSTEM MONITOR")
print("=" * 70)
print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 70)

# Direct database check since we need admin access
import os
import sys
sys.path.append('/opt/proconnectsa')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.procompare.settings')

import django
django.setup()

from backend.users.models import User, ProviderProfile
from backend.leads.models import Lead
from backend.payments.models import DepositRequest, Transaction
from django.utils import timezone
from datetime import timedelta

# Check last 24 hours
day_ago = timezone.now() - timedelta(hours=24)
hour_ago = timezone.now() - timedelta(hours=1)

# 1. NEW REGISTRATIONS
print("\n📊 NEW REGISTRATIONS (Last 24 Hours)")
print("-" * 70)
new_users_24h = User.objects.filter(date_joined__gte=day_ago).order_by('-date_joined')
print(f"Total: {new_users_24h.count()}")

if new_users_24h.count() > 0:
    for user in new_users_24h:
        time_str = user.date_joined.strftime('%H:%M')
        logged_in = "✅ Logged in" if user.last_login else "⚠️  Never logged in"
        print(f"  {time_str} - {user.email} ({user.user_type}) - {logged_in}")
else:
    print("  No new registrations in last 24 hours")

# 2. LOGIN PROBLEMS
print("\n⚠️  POTENTIAL LOGIN PROBLEMS")
print("-" * 70)
never_logged_in = User.objects.filter(
    date_joined__lt=day_ago,
    last_login__isnull=True
)
print(f"Users who registered >24h ago but NEVER logged in: {never_logged_in.count()}")
if never_logged_in.count() > 0:
    for user in never_logged_in[:5]:
        days = (timezone.now() - user.date_joined).days
        print(f"  ⚠️  {user.email} - Registered {days} days ago, never logged in")
else:
    print("  ✅ No login problems detected")

# 3. PAYMENT ACTIVITY
print("\n💰 PAYMENT ACTIVITY (Last 24 Hours)")
print("-" * 70)
new_deposits = DepositRequest.objects.filter(created_at__gte=day_ago)
print(f"New deposits: {new_deposits.count()}")

if new_deposits.count() > 0:
    for deposit in new_deposits:
        time_str = deposit.created_at.strftime('%H:%M')
        print(f"  {time_str} - {deposit.account.user.email}: R{deposit.amount} - {deposit.status}")

pending_deposits = DepositRequest.objects.filter(status='pending')
if pending_deposits.count() > 0:
    print(f"\n⚠️  PENDING DEPOSITS NEEDING APPROVAL: {pending_deposits.count()}")
    for deposit in pending_deposits:
        hours = (timezone.now() - deposit.created_at).total_seconds() / 3600
        print(f"  ⚠️  {deposit.account.user.email}: R{deposit.amount} - Waiting {hours:.1f} hours")
else:
    print("\n  ✅ No pending deposits")

# 4. LEAD ACTIVITY
print("\n📋 LEAD ACTIVITY (Last 24 Hours)")
print("-" * 70)
new_leads = Lead.objects.filter(created_at__gte=day_ago)
print(f"New leads: {new_leads.count()}")

if new_leads.count() > 0:
    for lead in new_leads:
        time_str = lead.created_at.strftime('%H:%M')
        print(f"  {time_str} - {lead.service_category.name} in {lead.location_city} - {lead.status}")

# 5. PROVIDERS STATUS
print("\n👥 PROVIDER STATUS")
print("-" * 70)
total_providers = ProviderProfile.objects.count()
verified_providers = ProviderProfile.objects.filter(verification_status='verified').count()
providers_with_credits = ProviderProfile.objects.filter(credit_balance__gt=0).count()

print(f"Total Providers: {total_providers}")
print(f"Verified: {verified_providers}")
print(f"With Credits: {providers_with_credits}")

# Show providers with credits
if providers_with_credits > 0:
    print("\nProviders with Credits:")
    for p in ProviderProfile.objects.filter(credit_balance__gt=0):
        print(f"  ✅ {p.user.email}: {p.credit_balance} credits")

# 6. RECENT ACTIVITY (Last Hour)
print("\n⚡ RECENT ACTIVITY (Last Hour)")
print("-" * 70)
recent_users = User.objects.filter(date_joined__gte=hour_ago).count()
recent_deposits = DepositRequest.objects.filter(created_at__gte=hour_ago).count()
recent_leads = Lead.objects.filter(created_at__gte=hour_ago).count()

if recent_users > 0 or recent_deposits > 0 or recent_leads > 0:
    print(f"  New Users: {recent_users}")
    print(f"  New Deposits: {recent_deposits}")
    print(f"  New Leads: {recent_leads}")
else:
    print("  No activity in last hour")

# 7. SYSTEM ERRORS
print("\n🚨 RECENT ERRORS (Check Logs)")
print("-" * 70)
print("  Error Log: /var/log/proconnectsa/error.log")
print("  Access Log: /var/log/proconnectsa/access.log")
print("  Django Log: /opt/proconnectsa/backend/logs/django.log")

print("\n" + "=" * 70)
print("✅ MONITORING COMPLETE")
print("=" * 70)
print("\n💡 To run this again: python /opt/proconnectsa/monitor_system.py")
print("💡 Or check via API: curl https://api.proconnectsa.co.za/api/admin/monitoring/dashboard/")


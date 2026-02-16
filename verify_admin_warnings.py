#!/usr/bin/env python3
"""
Verify Admin Dashboard Warnings
Check if the warnings are accurate and show details
"""
import os
import sys
import django
from datetime import timedelta

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.procompare.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from backend.payments.models import DepositRequest

User = get_user_model()

print("=" * 70)
print("🔍 VERIFYING ADMIN DASHBOARD WARNINGS")
print("=" * 70)
print()

# 1. Check users who never logged in (>24 hours ago)
print("1️⃣  USERS WHO NEVER LOGGED IN (>24 hours ago)")
print("-" * 70)
day_ago = timezone.now() - timedelta(hours=24)
never_logged_in = User.objects.filter(
    date_joined__lt=day_ago,
    last_login__isnull=True
).order_by('-date_joined')

print(f"Total Found: {never_logged_in.count()}")
print()

if never_logged_in.count() > 0:
    print("Details:")
    for i, user in enumerate(never_logged_in[:50], 1):  # Show first 50
        days_ago = (timezone.now() - user.date_joined).days
        print(f"{i:3d}. {user.email}")
        print(f"     Name: {user.first_name} {user.last_name}")
        print(f"     Type: {user.user_type}")
        print(f"     Registered: {user.date_joined.strftime('%Y-%m-%d %H:%M')} ({days_ago} days ago)")
        print(f"     Active: {user.is_active}")
        print(f"     Staff: {user.is_staff}")
        print()
    
    if never_logged_in.count() > 50:
        print(f"... and {never_logged_in.count() - 50} more")
        print()
    
    # Check if any are test/admin accounts
    test_accounts = never_logged_in.filter(
        email__icontains='test'
    ) | never_logged_in.filter(
        email__icontains='admin'
    ) | never_logged_in.filter(
        is_staff=True
    )
    
    if test_accounts.exists():
        print(f"⚠️  Note: {test_accounts.count()} of these appear to be test/admin accounts")
        print()
    
    # Check user types breakdown
    print("Breakdown by User Type:")
    for user_type in ['provider', 'client', 'admin', 'support']:
        count = never_logged_in.filter(user_type=user_type).count()
        if count > 0:
            print(f"   {user_type}: {count}")
    print()
else:
    print("✅ No users found matching this criteria")
    print()

# 2. Check pending deposits >2 hours old
print("2️⃣  PENDING DEPOSITS (>2 hours old)")
print("-" * 70)
two_hours_ago = timezone.now() - timedelta(hours=2)
old_pending_deposits = DepositRequest.objects.filter(
    status='pending',
    created_at__lt=two_hours_ago
).select_related('account__user').order_by('-created_at')

print(f"Total Found: {old_pending_deposits.count()}")
print()

if old_pending_deposits.count() > 0:
    print("Details:")
    for i, deposit in enumerate(old_pending_deposits[:50], 1):  # Show first 50
        hours_ago = (timezone.now() - deposit.created_at).total_seconds() / 3600
        print(f"{i:3d}. {deposit.account.user.email}")
        print(f"     Amount: R{deposit.amount}")
        print(f"     Credits: {deposit.credits_to_activate}")
        print(f"     Reference: {deposit.reference_number}")
        print(f"     Bank Reference: {deposit.bank_reference or 'None'}")
        print(f"     Created: {deposit.created_at.strftime('%Y-%m-%d %H:%M')} ({hours_ago:.1f} hours ago)")
        print(f"     Status: {deposit.status}")
        print()
    
    if old_pending_deposits.count() > 50:
        print(f"... and {old_pending_deposits.count() - 50} more")
        print()
    
    # Check total amount pending
    total_pending = sum(d.amount for d in old_pending_deposits)
    print(f"💰 Total Amount Pending: R{total_pending:.2f}")
    print()
    
    # Check oldest deposit
    oldest = old_pending_deposits.last()
    if oldest:
        oldest_hours = (timezone.now() - oldest.created_at).total_seconds() / 3600
        print(f"⏰ Oldest Pending Deposit:")
        print(f"   User: {oldest.account.user.email}")
        print(f"   Amount: R{oldest.amount}")
        print(f"   Age: {oldest_hours:.1f} hours")
        print()
else:
    print("✅ No pending deposits found matching this criteria")
    print()

# Summary
print("=" * 70)
print("📊 SUMMARY")
print("=" * 70)
print(f"Users never logged in: {never_logged_in.count()}")
print(f"Pending deposits >2h: {old_pending_deposits.count()}")
print()
print("💡 Next Steps:")
if never_logged_in.count() > 0:
    print(f"   - Review {never_logged_in.count()} users who never logged in")
    print("   - Consider sending welcome emails")
    print("   - Check if any are test accounts that can be cleaned up")
if old_pending_deposits.count() > 0:
    print(f"   - Review {old_pending_deposits.count()} pending deposits")
    print("   - Check bank reconciliation is working")
    print("   - Manually approve deposits if needed")
print()

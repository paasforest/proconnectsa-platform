#!/usr/bin/env python3
"""
Dry Run Database Cleanup Script
This script shows what will be deleted WITHOUT actually deleting anything
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Add the backend directory to Python path
sys.path.append('/opt/proconnectsa/backend')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'procompare.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

def dry_run_cleanup():
    """Show what would be deleted without actually deleting"""
    
    print("🔍 DRY RUN - Database Cleanup Analysis")
    print("=" * 50)
    print("⚠️  This is a DRY RUN - NO DATA WILL BE DELETED")
    print("=" * 50)
    
    # Get initial counts
    total_users = User.objects.count()
    print(f"📊 Total users in database: {total_users}")
    
    if total_users == 0:
        print("✅ Database is already empty!")
        return
    
    print("\n👥 ALL USERS IN DATABASE:")
    print("-" * 30)
    for i, user in enumerate(User.objects.all(), 1):
        print(f"{i:2d}. {user.email}")
        print(f"     Type: {user.user_type}")
        print(f"     Name: {user.first_name} {user.last_name}")
        print(f"     Created: {user.date_joined}")
        print(f"     Active: {user.is_active}")
        print()
    
    # Find test users
    print("🔍 ANALYZING FOR TEST DATA...")
    print("-" * 30)
    
    # Test pattern 1: Email contains test keywords
    test_email_users = User.objects.filter(
        models.Q(email__icontains='test') |
        models.Q(email__icontains='example') |
        models.Q(email__icontains='demo') |
        models.Q(email__icontains='sample')
    )
    
    print(f"📧 Users with test emails: {test_email_users.count()}")
    for user in test_email_users:
        print(f"   - {user.email} (created: {user.date_joined})")
    
    # Test pattern 2: Name contains test keywords
    test_name_users = User.objects.filter(
        models.Q(first_name__icontains='test') |
        models.Q(last_name__icontains='test')
    )
    
    print(f"\n👤 Users with test names: {test_name_users.count()}")
    for user in test_name_users:
        print(f"   - {user.first_name} {user.last_name} ({user.email})")
    
    # Test pattern 3: Recent users (last 3 days - likely test data)
    recent_users = User.objects.filter(
        date_joined__gte=datetime.now() - timedelta(days=3)
    )
    
    print(f"\n📅 Users created in last 3 days: {recent_users.count()}")
    for user in recent_users:
        print(f"   - {user.email} (created: {user.date_joined})")
    
    # Combine all test users
    all_test_users = (test_email_users | test_name_users | recent_users).distinct()
    test_count = all_test_users.count()
    
    print(f"\n🧪 TOTAL TEST USERS IDENTIFIED: {test_count}")
    print("=" * 50)
    
    if test_count == 0:
        print("✅ No test users found!")
        print("🎉 Your database appears to contain only production data!")
        return
    
    print("⚠️  USERS THAT WOULD BE DELETED:")
    print("-" * 40)
    for i, user in enumerate(all_test_users, 1):
        print(f"{i:2d}. {user.email}")
        print(f"     Type: {user.user_type}")
        print(f"     Name: {user.first_name} {user.last_name}")
        print(f"     Created: {user.date_joined}")
        print(f"     Reason: ", end="")
        
        reasons = []
        if user in test_email_users:
            reasons.append("test email")
        if user in test_name_users:
            reasons.append("test name")
        if user in recent_users:
            reasons.append("recent creation")
        
        print(", ".join(reasons))
        print()
    
    # Show what related data would be deleted
    print("🗑️  RELATED DATA THAT WOULD BE DELETED:")
    print("-" * 40)
    
    try:
        from leads.models import Lead, LeadAssignment
        from users.models import ProviderProfile, Wallet
        from reviews.models import Review
        from notifications.models import Notification
        from payments.models import CreditTransaction
        
        # Count related data for test users
        leads = Lead.objects.filter(client__in=all_test_users).count()
        lead_assignments = LeadAssignment.objects.filter(provider__in=all_test_users).count()
        provider_profiles = ProviderProfile.objects.filter(user__in=all_test_users).count()
        reviews = Review.objects.filter(
            models.Q(client__in=all_test_users) | models.Q(provider__in=all_test_users)
        ).count()
        notifications = Notification.objects.filter(user__in=all_test_users).count()
        credit_transactions = CreditTransaction.objects.filter(user__in=all_test_users).count()
        wallets = Wallet.objects.filter(user__in=all_test_users).count()
        
        print(f"   📝 Leads created by test users: {leads}")
        print(f"   🤝 Lead assignments: {lead_assignments}")
        print(f"   👷 Provider profiles: {provider_profiles}")
        print(f"   ⭐ Reviews: {reviews}")
        print(f"   🔔 Notifications: {notifications}")
        print(f"   💳 Credit transactions: {credit_transactions}")
        print(f"   💰 Wallets: {wallets}")
        
        total_related = leads + lead_assignments + provider_profiles + reviews + notifications + credit_transactions + wallets
        print(f"\n   📊 TOTAL RELATED RECORDS: {total_related}")
        
    except Exception as e:
        print(f"   ⚠️  Could not count related data: {e}")
    
    # Show remaining users
    remaining_users = User.objects.exclude(id__in=all_test_users)
    remaining_count = remaining_users.count()
    
    print(f"\n✅ USERS THAT WOULD REMAIN: {remaining_count}")
    print("-" * 40)
    if remaining_count > 0:
        for user in remaining_users:
            print(f"   - {user.email} ({user.user_type}) - {user.date_joined}")
    else:
        print("   (No users would remain)")
    
    print(f"\n📋 SUMMARY:")
    print("=" * 50)
    print(f"   Total users in database: {total_users}")
    print(f"   Test users to delete: {test_count}")
    print(f"   Users that would remain: {remaining_count}")
    print(f"   Deletion percentage: {(test_count/total_users)*100:.1f}%")
    
    print(f"\n🤔 DECISION REQUIRED:")
    print("=" * 50)
    if test_count == total_users:
        print("   ⚠️  ALL users would be deleted!")
        print("   💡 This suggests the database contains only test data")
    elif test_count > total_users * 0.8:
        print("   ⚠️  MOST users would be deleted (>80%)")
        print("   💡 This suggests the database is mostly test data")
    elif test_count > 0:
        print("   ✅ Some test users would be deleted")
        print("   💡 This is normal for a development database")
    else:
        print("   ✅ No test users found")
        print("   💡 Database appears clean")

if __name__ == "__main__":
    dry_run_cleanup()




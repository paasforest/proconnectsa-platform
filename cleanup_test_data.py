#!/usr/bin/env python3
"""
Database Cleanup Script for ProConnectSA
This script safely removes test data while preserving production data
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.procompare.settings')
sys.path.append('/opt/proconnectsa/backend')
django.setup()

from django.contrib.auth import get_user_model
from leads.models import Lead, ServiceCategory, LeadAssignment
from users.models import ProviderProfile, Wallet
from reviews.models import Review
from notifications.models import Notification
from payments.models import CreditTransaction

User = get_user_model()

def cleanup_test_data():
    """Clean up test data from the database"""
    
    print("🧹 Starting Database Cleanup...")
    print("=" * 50)
    
    # Backup counts before cleanup
    initial_counts = {
        'users': User.objects.count(),
        'providers': ProviderProfile.objects.count(),
        'leads': Lead.objects.count(),
        'service_categories': ServiceCategory.objects.count(),
        'lead_assignments': LeadAssignment.objects.count(),
        'reviews': Review.objects.count(),
        'notifications': Notification.objects.count(),
        'credit_transactions': CreditTransaction.objects.count(),
        'wallets': Wallet.objects.count()
    }
    
    print("📊 Initial Database Counts:")
    for model, count in initial_counts.items():
        print(f"   {model}: {count}")
    
    print("\n🔍 Identifying Test Data...")
    
    # Identify test users (emails containing 'test', 'example', or created recently for testing)
    test_user_patterns = ['test', 'example', 'demo', 'sample']
    test_users = User.objects.filter(
        models.Q(email__icontains='test') |
        models.Q(email__icontains='example') |
        models.Q(email__icontains='demo') |
        models.Q(email__icontains='sample') |
        models.Q(first_name__icontains='test') |
        models.Q(last_name__icontains='test')
    )
    
    # Also include users created in the last 7 days (likely test data)
    recent_test_users = User.objects.filter(
        date_joined__gte=datetime.now() - timedelta(days=7)
    )
    
    all_test_users = (test_users | recent_test_users).distinct()
    
    print(f"   Found {all_test_users.count()} test users")
    
    # Show test users before deletion
    print("\n👥 Test Users to be removed:")
    for user in all_test_users:
        print(f"   - {user.email} ({user.user_type}) - Created: {user.date_joined}")
    
    # Confirm deletion
    print(f"\n⚠️  WARNING: This will delete {all_test_users.count()} test users and all related data!")
    print("   This includes:")
    print("   - User profiles and provider profiles")
    print("   - All leads created by test users")
    print("   - All lead assignments")
    print("   - All reviews and notifications")
    print("   - All credit transactions")
    print("   - All wallets")
    
    response = input("\n🤔 Are you sure you want to proceed? (yes/no): ")
    if response.lower() != 'yes':
        print("❌ Cleanup cancelled.")
        return
    
    print("\n🗑️  Starting deletion process...")
    
    # Delete in correct order to avoid foreign key constraints
    deleted_counts = {}
    
    # 1. Delete credit transactions
    credit_transactions = CreditTransaction.objects.filter(
        user__in=all_test_users
    )
    deleted_counts['credit_transactions'] = credit_transactions.count()
    credit_transactions.delete()
    print(f"   ✅ Deleted {deleted_counts['credit_transactions']} credit transactions")
    
    # 2. Delete reviews
    reviews = Review.objects.filter(
        models.Q(client__in=all_test_users) | models.Q(provider__in=all_test_users)
    )
    deleted_counts['reviews'] = reviews.count()
    reviews.delete()
    print(f"   ✅ Deleted {deleted_counts['reviews']} reviews")
    
    # 3. Delete notifications
    notifications = Notification.objects.filter(user__in=all_test_users)
    deleted_counts['notifications'] = notifications.count()
    notifications.delete()
    print(f"   ✅ Deleted {deleted_counts['notifications']} notifications")
    
    # 4. Delete lead assignments
    lead_assignments = LeadAssignment.objects.filter(provider__in=all_test_users)
    deleted_counts['lead_assignments'] = lead_assignments.count()
    lead_assignments.delete()
    print(f"   ✅ Deleted {deleted_counts['lead_assignments']} lead assignments")
    
    # 5. Delete leads created by test users
    leads = Lead.objects.filter(client__in=all_test_users)
    deleted_counts['leads'] = leads.count()
    leads.delete()
    print(f"   ✅ Deleted {deleted_counts['leads']} leads")
    
    # 6. Delete provider profiles
    provider_profiles = ProviderProfile.objects.filter(user__in=all_test_users)
    deleted_counts['provider_profiles'] = provider_profiles.count()
    provider_profiles.delete()
    print(f"   ✅ Deleted {deleted_counts['provider_profiles']} provider profiles")
    
    # 7. Delete wallets
    wallets = Wallet.objects.filter(user__in=all_test_users)
    deleted_counts['wallets'] = wallets.count()
    wallets.delete()
    print(f"   ✅ Deleted {deleted_counts['wallets']} wallets")
    
    # 8. Finally, delete users
    deleted_counts['users'] = all_test_users.count()
    all_test_users.delete()
    print(f"   ✅ Deleted {deleted_counts['users']} test users")
    
    # Final counts
    final_counts = {
        'users': User.objects.count(),
        'providers': ProviderProfile.objects.count(),
        'leads': Lead.objects.count(),
        'service_categories': ServiceCategory.objects.count(),
        'lead_assignments': LeadAssignment.objects.count(),
        'reviews': Review.objects.count(),
        'notifications': Notification.objects.count(),
        'credit_transactions': CreditTransaction.objects.count(),
        'wallets': Wallet.objects.count()
    }
    
    print("\n📊 Final Database Counts:")
    for model, count in final_counts.items():
        print(f"   {model}: {count}")
    
    print("\n📈 Cleanup Summary:")
    for model, count in deleted_counts.items():
        print(f"   {model}: -{count}")
    
    print("\n✅ Database cleanup completed successfully!")
    print("🎉 Your database is now clean and ready for production!")

if __name__ == "__main__":
    cleanup_test_data()





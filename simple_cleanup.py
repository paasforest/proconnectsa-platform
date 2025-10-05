#!/usr/bin/env python3
"""
Simple Database Cleanup Script
Run this directly on the server to clean test data
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

def cleanup_test_data():
    """Clean up test data from the database"""
    
    print("🧹 ProConnectSA Database Cleanup")
    print("=" * 40)
    
    # Get initial counts
    total_users = User.objects.count()
    print(f"📊 Total users in database: {total_users}")
    
    if total_users == 0:
        print("✅ Database is already empty!")
        return
    
    # Find test users
    test_users = User.objects.filter(
        models.Q(email__icontains='test') |
        models.Q(email__icontains='example') |
        models.Q(email__icontains='demo') |
        models.Q(email__icontains='sample') |
        models.Q(first_name__icontains='test') |
        models.Q(last_name__icontains='test')
    )
    
    # Also include very recent users (likely test data)
    recent_users = User.objects.filter(
        date_joined__gte=datetime.now() - timedelta(days=3)
    )
    
    all_test_users = (test_users | recent_users).distinct()
    test_count = all_test_users.count()
    
    print(f"🔍 Found {test_count} test users")
    
    if test_count == 0:
        print("✅ No test users found!")
        return
    
    # Show test users
    print("\n👥 Test users to be removed:")
    for user in all_test_users:
        print(f"   - {user.email} ({user.user_type}) - {user.date_joined}")
    
    # Confirm deletion
    print(f"\n⚠️  This will delete {test_count} test users and ALL related data!")
    response = input("🤔 Continue? (yes/no): ")
    
    if response.lower() != 'yes':
        print("❌ Cleanup cancelled.")
        return
    
    # Delete test users (this will cascade to related data)
    print("\n🗑️  Deleting test data...")
    
    try:
        deleted_count, _ = all_test_users.delete()
        print(f"✅ Successfully deleted {deleted_count} test users and related data")
        
        # Show final count
        final_count = User.objects.count()
        print(f"📊 Remaining users: {final_count}")
        
        if final_count == 0:
            print("🎉 Database is now completely clean!")
        else:
            print("✅ Test data cleanup completed!")
            
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        print("💡 You may need to run this with proper database permissions")

if __name__ == "__main__":
    cleanup_test_data()





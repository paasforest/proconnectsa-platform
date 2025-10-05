#!/usr/bin/env python3
"""
Complete Database Cleanup Script
This script removes ALL data from the database since there are no real users
"""

import os
import sys
import sqlite3
from datetime import datetime

def clean_all_data():
    """Clean ALL data from the database"""
    
    print("🧹 COMPLETE DATABASE CLEANUP")
    print("=" * 50)
    print("⚠️  This will remove ALL data from the database")
    print("⚠️  Since you have no real users, this is safe to do")
    print("=" * 50)
    
    db_path = '/opt/proconnectsa/backend/db.sqlite3'
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get initial counts
    print("📊 Current Database Content:")
    print("-" * 30)
    
    tables_to_check = [
        'users_user',
        'leads_lead', 
        'leads_leadassignment',
        'users_providerprofile',
        'reviews_review',
        'notifications_notification',
        'users_wallet',
        'users_wallettransaction',
        'payment_accounts',
        'transactions'
    ]
    
    initial_counts = {}
    for table in tables_to_check:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            initial_counts[table] = count
            print(f"   {table}: {count}")
        except sqlite3.OperationalError:
            print(f"   {table}: Table doesn't exist")
            initial_counts[table] = 0
    
    total_records = sum(initial_counts.values())
    print(f"\n📊 Total records: {total_records}")
    
    if total_records == 0:
        print("✅ Database is already empty!")
        return
    
    # Show all users before deletion
    print("\n👥 All Users in Database:")
    print("-" * 30)
    cursor.execute("SELECT email, first_name, last_name, user_type, date_joined FROM users_user ORDER BY date_joined")
    users = cursor.fetchall()
    
    for i, user in enumerate(users, 1):
        email, first_name, last_name, user_type, date_joined = user
        print(f"{i:2d}. {email}")
        print(f"     Name: {first_name} {last_name}")
        print(f"     Type: {user_type}")
        print(f"     Created: {date_joined}")
        print()
    
    # Confirm deletion
    print(f"⚠️  WARNING: This will delete ALL {total_records} records!")
    print("   This includes:")
    print("   - All users and profiles")
    print("   - All leads and assignments")
    print("   - All notifications and reviews")
    print("   - All wallets and transactions")
    print("   - All other data")
    
    response = input("\n🤔 Are you sure you want to delete EVERYTHING? (yes/no): ")
    if response.lower() != 'yes':
        print("❌ Cleanup cancelled.")
        return
    
    print("\n🗑️  Starting complete cleanup...")
    
    # Disable foreign key constraints temporarily
    cursor.execute("PRAGMA foreign_keys = OFF")
    
    # Delete from all tables (in reverse dependency order)
    tables_to_clean = [
        'users_wallettransaction',
        'payment_accounts', 
        'transactions',
        'reviews_review',
        'notifications_notification',
        'leads_leadassignment',
        'leads_lead',
        'users_providerprofile',
        'users_wallet',
        'users_user'
    ]
    
    deleted_counts = {}
    for table in tables_to_clean:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            if count > 0:
                cursor.execute(f"DELETE FROM {table}")
                deleted_counts[table] = count
                print(f"   ✅ Deleted {count} records from {table}")
        except sqlite3.OperationalError as e:
            print(f"   ⚠️  Could not clean {table}: {e}")
    
    # Re-enable foreign key constraints
    cursor.execute("PRAGMA foreign_keys = ON")
    
    # Commit changes
    conn.commit()
    
    # Verify cleanup
    print("\n📊 Final Database State:")
    print("-" * 30)
    final_counts = {}
    for table in tables_to_check:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            final_counts[table] = count
            print(f"   {table}: {count}")
        except sqlite3.OperationalError:
            print(f"   {table}: Table doesn't exist")
            final_counts[table] = 0
    
    total_remaining = sum(final_counts.values())
    
    print(f"\n📈 Cleanup Summary:")
    print("=" * 50)
    total_deleted = sum(deleted_counts.values())
    print(f"   Records deleted: {total_deleted}")
    print(f"   Records remaining: {total_remaining}")
    print(f"   Cleanup percentage: {(total_deleted/total_records)*100:.1f}%")
    
    if total_remaining == 0:
        print("\n🎉 Database is now completely clean!")
        print("✅ Ready for production use!")
    else:
        print(f"\n⚠️  {total_remaining} records still remain")
        print("💡 You may need to clean additional tables manually")
    
    # Close connection
    conn.close()
    
    print(f"\n✅ Complete database cleanup finished!")
    print("🚀 Your database is now ready for production!")

if __name__ == "__main__":
    clean_all_data()




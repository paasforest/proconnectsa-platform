#!/usr/bin/env python3
"""
Automatic Complete Database Cleanup Script
This script removes ALL data from the database automatically
"""

import os
import sys
import sqlite3
from datetime import datetime

def auto_clean_all_data():
    """Clean ALL data from the database automatically"""
    
    print("🧹 AUTOMATIC COMPLETE DATABASE CLEANUP")
    print("=" * 50)
    print("⚠️  Removing ALL data from the database")
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
    
    print(f"\n🗑️  Starting automatic cleanup of {total_records} records...")
    
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
    auto_clean_all_data()




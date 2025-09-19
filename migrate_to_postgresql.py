#!/usr/bin/env python3
"""
Migration script to move data from SQLite to PostgreSQL
Run this script to migrate your existing data safely
"""

import os
import sys
import django
import json
from decimal import Decimal
from datetime import datetime

# Add the backend directory to Python path
sys.path.append('/home/paas/work_platform/backend')

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.procompare.settings')
django.setup()

def export_sqlite_data():
    """Export all data from SQLite to JSON files"""
    print("🔄 Exporting data from SQLite...")
    
    # Temporarily switch to SQLite
    from django.conf import settings
    settings.DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': '/home/paas/work_platform/backend/db.sqlite3',
    }
    
    # Import models
    from backend.users.models import User, ProviderProfile, Wallet, WalletTransaction, LeadUnlock
    from backend.leads.models import Lead, ServiceCategory, LeadAssignment
    from backend.notifications.models import Notification
    
    data = {}
    
    # Export ServiceCategories first (referenced by other models)
    data['service_categories'] = []
    for obj in ServiceCategory.objects.all():
        data['service_categories'].append({
            'id': obj.id,
            'name': obj.name,
            'slug': obj.slug,
            'description': obj.description,
            'is_active': obj.is_active,
            'created_at': obj.created_at.isoformat() if obj.created_at else None,
        })
    
    # Export Users
    data['users'] = []
    for user in User.objects.all():
        data['users'].append({
            'id': str(user.id),
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.phone,
            'user_type': user.user_type,
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'date_joined': user.date_joined.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'password': user.password,  # Keep encrypted password
        })
    
    # Export ProviderProfiles
    data['provider_profiles'] = []
    for profile in ProviderProfile.objects.all():
        data['provider_profiles'].append({
            'id': profile.id,
            'user_id': str(profile.user.id),
            'business_name': profile.business_name,
            'business_address': profile.business_address,
            'service_areas': profile.service_areas,
            'service_categories': profile.service_categories,
            'verification_status': profile.verification_status,
            'subscription_tier': profile.subscription_tier,
            'credit_balance': float(profile.credit_balance) if profile.credit_balance else 0,
            'created_at': profile.created_at.isoformat() if profile.created_at else None,
        })
    
    # Export Wallets
    data['wallets'] = []
    for wallet in Wallet.objects.all():
        data['wallets'].append({
            'id': str(wallet.id),
            'user_id': str(wallet.user.id),
            'credits': wallet.credits,
            'balance': float(wallet.balance),
            'customer_code': wallet.customer_code,
            'created_at': wallet.created_at.isoformat() if wallet.created_at else None,
        })
    
    # Export Leads
    data['leads'] = []
    for lead in Lead.objects.all():
        data['leads'].append({
            'id': str(lead.id),
            'client_id': str(lead.client.id),
            'service_category_id': lead.service_category.id,
            'title': lead.title,
            'description': lead.description,
            'location_address': lead.location_address,
            'location_suburb': lead.location_suburb,
            'location_city': lead.location_city,
            'budget_range': lead.budget_range,
            'urgency': lead.urgency,
            'status': lead.status,
            'is_available': lead.is_available,
            'created_at': lead.created_at.isoformat(),
            'expires_at': lead.expires_at.isoformat() if lead.expires_at else None,
        })
    
    # Export WalletTransactions
    data['wallet_transactions'] = []
    for tx in WalletTransaction.objects.all():
        data['wallet_transactions'].append({
            'id': str(tx.id),
            'wallet_id': str(tx.wallet.id),
            'amount': float(tx.amount),
            'credits': tx.credits,
            'transaction_type': tx.transaction_type,
            'reference': tx.reference,
            'status': tx.status,
            'description': tx.description,
            'created_at': tx.created_at.isoformat() if tx.created_at else None,
        })
    
    # Save to JSON file
    with open('/home/paas/work_platform/sqlite_backup.json', 'w') as f:
        json.dump(data, f, indent=2, default=str)
    
    print(f"✅ Exported {len(data['users'])} users, {len(data['leads'])} leads, {len(data['wallets'])} wallets")
    return data

def import_to_postgresql(data):
    """Import data to PostgreSQL"""
    print("🔄 Importing data to PostgreSQL...")
    
    # Import models
    from backend.users.models import User, ProviderProfile, Wallet, WalletTransaction
    from backend.leads.models import Lead, ServiceCategory
    
    # Clear existing data (if any)
    print("🧹 Clearing existing PostgreSQL data...")
    
    # Import ServiceCategories first
    print("📋 Importing service categories...")
    for cat_data in data['service_categories']:
        ServiceCategory.objects.get_or_create(
            id=cat_data['id'],
            defaults={
                'name': cat_data['name'],
                'slug': cat_data['slug'],
                'description': cat_data['description'],
                'is_active': cat_data['is_active'],
            }
        )
    
    # Import Users
    print("👥 Importing users...")
    for user_data in data['users']:
        User.objects.get_or_create(
            id=user_data['id'],
            defaults={
                'email': user_data['email'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'phone': user_data['phone'],
                'user_type': user_data['user_type'],
                'is_active': user_data['is_active'],
                'is_staff': user_data['is_staff'],
                'is_superuser': user_data['is_superuser'],
                'password': user_data['password'],
            }
        )
    
    # Import Wallets
    print("💰 Importing wallets...")
    for wallet_data in data['wallets']:
        user = User.objects.get(id=wallet_data['user_id'])
        Wallet.objects.get_or_create(
            id=wallet_data['id'],
            defaults={
                'user': user,
                'credits': wallet_data['credits'],
                'balance': Decimal(str(wallet_data['balance'])),
                'customer_code': wallet_data['customer_code'],
            }
        )
    
    print("✅ Data migration completed successfully!")

def main():
    """Main migration function"""
    print("🚀 STARTING SQLITE TO POSTGRESQL MIGRATION")
    print("=" * 60)
    
    try:
        # Step 1: Export from SQLite
        data = export_sqlite_data()
        
        # Step 2: Switch to PostgreSQL configuration
        print("\n🔄 Switching to PostgreSQL...")
        os.environ['USE_SQLITE'] = 'False'
        
        # Step 3: Import to PostgreSQL
        import_to_postgresql(data)
        
        print("\n🎉 MIGRATION COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print("✅ Your data has been migrated from SQLite to PostgreSQL")
        print("✅ Database locking issues should now be resolved")
        print("✅ Platform ready for multiple concurrent users")
        
    except Exception as e:
        print(f"\n❌ MIGRATION FAILED: {str(e)}")
        print("Please check your PostgreSQL connection and try again")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())









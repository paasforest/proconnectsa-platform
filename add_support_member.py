#!/usr/bin/env python
"""
Helper script to add support team members to ProConnectSA
Usage: python add_support_member.py
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.procompare.settings')
django.setup()

from django.contrib.auth import get_user_model
from backend.notifications.email_service import send_welcome_email

User = get_user_model()

def add_support_member():
    print("🎯 ADD SUPPORT TEAM MEMBER")
    print("=" * 60)
    print("")
    
    # Get user details
    first_name = input("First Name: ").strip()
    last_name = input("Last Name: ").strip()
    email = input("Email: ").strip().lower()
    
    # Check if user already exists
    if User.objects.filter(email=email).exists():
        print(f"\n❌ User with email {email} already exists!")
        return
    
    # Generate username from email
    username = email
    
    # Default password
    password = 'Support123!'
    
    print(f"\n📝 Creating support account:")
    print(f"   Name: {first_name} {last_name}")
    print(f"   Email: {email}")
    print(f"   Password: {password} (temporary)")
    print("")
    
    confirm = input("Create this account? (yes/no): ").strip().lower()
    if confirm != 'yes':
        print("❌ Cancelled")
        return
    
    # Create user
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        user_type='support',
        is_staff=True,
        is_active=True
    )
    
    print(f"\n✅ SUPPORT ACCOUNT CREATED!")
    print(f"   ID: {user.id}")
    print(f"   Name: {user.first_name} {user.last_name}")
    print(f"   Email: {user.email}")
    print(f"   User Type: {user.user_type}")
    print(f"   Is Staff: {user.is_staff}")
    print("")
    
    # Send welcome email
    try:
        send_welcome_email(user)
        print(f"✅ Welcome email sent to {user.email}")
    except Exception as e:
        print(f"⚠️  Could not send welcome email: {str(e)}")
    
    print(f"\n🔐 LOGIN CREDENTIALS:")
    print(f"   URL: https://proconnectsa.co.za/admin")
    print(f"   Email: {email}")
    print(f"   Password: {password}")
    print(f"\n⚠️  IMPORTANT: User must change password on first login!")

if __name__ == '__main__':
    try:
        add_support_member()
    except KeyboardInterrupt:
        print("\n\n❌ Cancelled by user")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

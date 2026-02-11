#!/usr/bin/env python3
"""
Create or reset admin user for ProConnectSA
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.procompare.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

def create_admin_user():
    """Create or update admin user"""
    email = 'admin@proconnectsa.co.za'
    username = 'admin'
    password = 'Admin123!'
    
    try:
        with transaction.atomic():
            # Try to get existing user
            user = User.objects.filter(email=email).first()
            
            if user:
                # Update existing user
                user.username = username
                user.set_password(password)
                user.user_type = 'admin'
                user.is_staff = True
                user.is_superuser = True
                user.is_active = True
                user.save()
                print(f'✅ Updated existing admin user: {email}')
                print(f'   Password: {password}')
            else:
                # Create new user
                user = User.objects.create_user(
                    email=email,
                    username=username,
                    password=password,
                    first_name='Admin',
                    last_name='User',
                    user_type='admin',
                    is_staff=True,
                    is_superuser=True,
                    is_active=True
                )
                print(f'✅ Created new admin user: {email}')
                print(f'   Password: {password}')
            
            # Verify the user
            if user.check_password(password):
                print(f'✅ Password verified successfully!')
            else:
                print(f'❌ Password verification failed!')
                return False
                
            print(f'\n📋 Admin Credentials:')
            print(f'   Email: {email}')
            print(f'   Username: {username}')
            print(f'   Password: {password}')
            print(f'   User Type: {user.user_type}')
            print(f'   Is Staff: {user.is_staff}')
            print(f'   Is Superuser: {user.is_superuser}')
            print(f'   Is Active: {user.is_active}')
            
            return True
            
    except Exception as e:
        print(f'❌ Error creating admin user: {str(e)}')
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print('🔐 Creating Admin User for ProConnectSA')
    print('=' * 50)
    success = create_admin_user()
    if success:
        print('\n✅ Admin user setup complete!')
        print('\n🌐 Login URL: https://proconnectsa.co.za/admin')
        print('📧 Email: admin@proconnectsa.co.za')
        print('🔑 Password: Admin123!')
    else:
        print('\n❌ Failed to create admin user')
        sys.exit(1)

#!/usr/bin/env python3

import os
import sys
import django

# Add the project directory to Python path
sys.path.append('/home/paas/work_platform')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.procompare.settings')
django.setup()

from users.models import User

def create_test_user():
    try:
        # Check if user already exists
        user, created = User.objects.get_or_create(
            email='test@example.com',
            defaults={
                'first_name': 'Test',
                'last_name': 'User',
                'user_type': 'provider',
                'is_active': True,
            }
        )
        
        if created:
            user.set_password('testpass123')
            user.save()
            print(f"✅ Created test user: {user.email}")
        else:
            print(f"ℹ️  Test user already exists: {user.email}")
            
        return user
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        return None

if __name__ == '__main__':
    create_test_user()

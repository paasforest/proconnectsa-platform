#!/usr/bin/env python3
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append('/opt/proconnectsa-backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.procompare.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Set password for test user
try:
    user = User.objects.get(email='testclient@example.com')
    user.set_password('testpassword123')
    user.save()
    print(f'✅ Password set for {user.email}: {user.check_password("testpassword123")}')
except User.DoesNotExist:
    print('❌ User testclient@example.com not found')
except Exception as e:
    print(f'❌ Error: {e}')







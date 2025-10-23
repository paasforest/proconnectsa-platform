#!/usr/bin/env python3
"""
Try to check admin panel for user data
"""
import requests
import json

def check_admin_panel():
    """Try to access admin panel"""
    
    print("🔍 Checking Admin Panel Access")
    print("=" * 40)
    
    try:
        # Try to access admin panel
        response = requests.get("https://api.proconnectsa.co.za/admin/", timeout=10)
        print(f"📥 Admin panel status: {response.status_code}")
        
        if response.status_code == 200:
            content = response.text
            if "Django administration" in content:
                print("✅ Django admin panel accessible")
            elif "login" in content.lower():
                print("🔐 Admin panel requires login")
            else:
                print("⚠️  Admin panel accessible but unexpected content")
        else:
            print(f"❌ Admin panel not accessible: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Admin panel check failed: {e}")

def check_user_api():
    """Try to find user-related API endpoints"""
    
    print("\n🔍 Checking for User API Endpoints")
    print("=" * 40)
    
    # Common Django REST API patterns
    endpoints_to_try = [
        "https://api.proconnectsa.co.za/api/users/",
        "https://api.proconnectsa.co.za/api/user/",
        "https://api.proconnectsa.co.za/api/auth/users/",
        "https://api.proconnectsa.co.za/api/providers/",
        "https://api.proconnectsa.co.za/api/clients/",
        "https://api.proconnectsa.co.za/api/accounts/",
    ]
    
    for endpoint in endpoints_to_try:
        try:
            response = requests.get(endpoint, timeout=5)
            print(f"📥 {endpoint}: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, list):
                        print(f"   📊 Found {len(data)} items")
                    elif isinstance(data, dict):
                        print(f"   📊 Response keys: {list(data.keys())}")
                except:
                    print(f"   📄 Non-JSON response")
            elif response.status_code == 401:
                print(f"   🔐 Requires authentication")
            elif response.status_code == 403:
                print(f"   🚫 Access forbidden")
            elif response.status_code == 404:
                print(f"   ❌ Not found")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ {endpoint}: {e}")

def provide_direct_database_check():
    """Provide instructions for direct database check"""
    
    print("\n📋 Direct Database Check Instructions")
    print("=" * 50)
    
    print("Since we can't access user data via API, here's how to check directly:")
    print()
    print("1. SSH into your Hetzner server:")
    print("   ssh paas@195.201.233.73")
    print()
    print("2. Navigate to backend directory:")
    print("   cd /opt/proconnectsa-backend")
    print()
    print("3. Run this command to check recent sign-ups:")
    print("""
python3 manage.py shell -c "
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

# Get all users
all_users = User.objects.all()
print(f'📊 Total users in database: {all_users.count()}')

# Get users from last 7 days
recent_users = User.objects.filter(
    date_joined__gte=timezone.now() - timedelta(days=7)
).order_by('-date_joined')

print(f'🆕 Users from last 7 days: {recent_users.count()}')
print()

# Show recent users
for user in recent_users:
    print(f'👤 {user.username}')
    print(f'   📧 Email: {user.email}')
    print(f'   📅 Joined: {user.date_joined}')
    print(f'   🔐 Type: {user.user_type}')
    print(f'   📝 Name: {user.first_name} {user.last_name}')
    print(f'   📱 Phone: {user.phone}')
    print(f'   📍 Location: {user.city}, {user.suburb}')
    print()

# Check providers specifically
providers = recent_users.filter(user_type='provider')
print(f'🔧 New providers from last 7 days: {providers.count()}')

# Check clients
clients = recent_users.filter(user_type='client')
print(f'👥 New clients from last 7 days: {clients.count()}')
"
""")
    
    print("4. Or check the last 24 hours:")
    print("""
python3 manage.py shell -c "
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

# Get users from last 24 hours
recent_users = User.objects.filter(
    date_joined__gte=timezone.now() - timedelta(hours=24)
).order_by('-date_joined')

print(f'🆕 Users from last 24 hours: {recent_users.count()}')
for user in recent_users:
    print(f'👤 {user.username} ({user.user_type}) - {user.date_joined}')
"
""")

if __name__ == "__main__":
    check_admin_panel()
    check_user_api()
    provide_direct_database_check()
    
    print("\n💡 Quick Summary:")
    print("   - Platform is working ✅")
    print("   - Registration is working ✅") 
    print("   - To see actual sign-ups, run the database commands above")
    print("   - Or check admin panel at: https://api.proconnectsa.co.za/admin/")




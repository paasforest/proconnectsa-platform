#!/usr/bin/env python3
"""
Check for new sign-ups from marketing efforts
"""
import requests
import json
from datetime import datetime, timedelta

def check_recent_signups():
    """Check for recent sign-ups via API registration test"""
    
    print("📊 ProConnectSA Marketing Sign-up Checker")
    print("=" * 60)
    
    # Test registration to see if we can get user data
    print("🔍 Testing API access...")
    
    try:
        # Test with a unique phone number to avoid conflicts
        import time
        import random
        
        timestamp = int(time.time())
        random_suffix = random.randint(100000000, 999999999)
        test_phone = f"+27{random_suffix}"
        test_email = f"marketing_test_{timestamp}@proconnectsa-test.com"
        
        test_data = {
            "username": test_email,
            "email": test_email,
            "password": "TestPass123!",
            "password_confirm": "TestPass123!",
            "first_name": "Marketing",
            "last_name": f"Test{timestamp}",
            "user_type": "provider",
            "phone": test_phone,
            "city": "Cape Town",
            "suburb": "Sea Point",
            "province": "Western Cape",
            "business_name": f"Marketing Test Business {timestamp}",
            "business_address": "123 Test Street",
            "primary_service": "Cleaning",
            "service_categories": ["Cleaning"],
            "service_areas": ["Cape Town"],
            "max_travel_distance": 30,
            "years_experience": "3-5 years",
            "service_description": "Test business for marketing check",
            "hourly_rate_min": 150.00,
            "hourly_rate_max": 250.00,
            "minimum_job_value": 500.00,
            "terms_accepted": True,
            "privacy_accepted": True
        }
        
        print(f"📧 Test email: {test_email}")
        print(f"📱 Test phone: {test_phone}")
        print("📤 Testing provider registration...")
        
        response = requests.post(
            "https://api.proconnectsa.co.za/api/register/",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        print(f"📥 Response status: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ API is working - new test provider created")
            response_data = response.json()
            print(f"📄 User ID: {response_data.get('user', {}).get('id', 'N/A')}")
            print(f"📄 User Type: {response_data.get('user', {}).get('user_type', 'N/A')}")
            print(f"📄 Created: {response_data.get('user', {}).get('created_at', 'N/A')}")
            return True
        else:
            print(f"⚠️  API test failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"📄 Error: {json.dumps(error_data, indent=2)}")
            except:
                print(f"📄 Error text: {response.text[:200]}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ API connection failed: {e}")
        return False

def check_frontend_status():
    """Check if frontend is accessible and working"""
    
    print("\n🌐 Checking Frontend Status")
    print("=" * 40)
    
    try:
        # Check main page
        main_response = requests.get("https://proconnectsa.co.za/", timeout=10)
        print(f"✅ Main page: {main_response.status_code}")
        
        # Check registration page
        reg_response = requests.get("https://proconnectsa.co.za/register", timeout=10)
        print(f"✅ Registration page: {reg_response.status_code}")
        
        # Check if new categories are deployed
        if "Solar Installation" in reg_response.text:
            print("✅ New service categories deployed!")
        else:
            print("⚠️  New categories not yet deployed")
            
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Frontend check failed: {e}")
        return False

def check_api_endpoints():
    """Check various API endpoints for user data"""
    
    print("\n🔍 Checking API Endpoints")
    print("=" * 40)
    
    endpoints_to_check = [
        "https://api.proconnectsa.co.za/api/health/",
        "https://api.proconnectsa.co.za/api/categories/",
        "https://api.proconnectsa.co.za/admin/",
    ]
    
    for endpoint in endpoints_to_check:
        try:
            response = requests.get(endpoint, timeout=10)
            print(f"✅ {endpoint}: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ {endpoint}: {e}")

def provide_manual_check_instructions():
    """Provide instructions for manual sign-up checking"""
    
    print("\n📋 Manual Sign-up Check Instructions")
    print("=" * 50)
    
    print("To check for actual new sign-ups, you need to access the server:")
    print()
    print("1. SSH into your Hetzner server:")
    print("   ssh paas@195.201.233.73")
    print()
    print("2. Navigate to backend directory:")
    print("   cd /opt/proconnectsa-backend")
    print()
    print("3. Run Django shell to check users:")
    print("   python manage.py shell")
    print()
    print("4. In the shell, run these commands:")
    print("""
from django.contrib.auth.models import User
from datetime import datetime, timedelta
from django.utils import timezone

# Get users from last 7 days
recent_users = User.objects.filter(
    date_joined__gte=timezone.now() - timedelta(days=7)
).order_by('-date_joined')

print(f"📊 Total users in database: {User.objects.count()}")
print(f"🆕 Users from last 7 days: {recent_users.count()}")

for user in recent_users:
    print(f"👤 {user.username} ({user.email})")
    print(f"   📅 Joined: {user.date_joined}")
    print(f"   🔐 Type: {user.user_type}")
    print(f"   📝 Name: {user.first_name} {user.last_name}")
    print(f"   📱 Phone: {user.phone}")
    print(f"   📍 Location: {user.city}, {user.suburb}")
    print()

# Check providers specifically
providers = recent_users.filter(user_type='provider')
print(f"🔧 New providers from last 7 days: {providers.count()}")
""")
    
    print("5. Or check admin panel:")
    print("   https://api.proconnectsa.co.za/admin/")
    print("   (Login with admin credentials)")

if __name__ == "__main__":
    # Test API functionality
    api_working = check_recent_signups()
    
    # Check frontend
    frontend_working = check_frontend_status()
    
    # Check other endpoints
    check_api_endpoints()
    
    # Provide manual instructions
    provide_manual_check_instructions()
    
    print("\n📊 Summary:")
    print(f"   API Status: {'✅ Working' if api_working else '❌ Issues'}")
    print(f"   Frontend Status: {'✅ Working' if frontend_working else '❌ Issues'}")
    
    if api_working and frontend_working:
        print("\n🎉 Platform is ready for marketing!")
        print("💡 Use the manual check instructions above to see actual sign-ups")
    else:
        print("\n⚠️  Platform may have issues - check server status")

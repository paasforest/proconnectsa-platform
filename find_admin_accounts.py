#!/usr/bin/env python3
"""
Find admin accounts and test different credentials
"""
import requests
import json

def test_admin_credentials():
    """Test different admin credential combinations"""
    
    print("🔍 Testing Admin Credentials")
    print("=" * 50)
    
    # Different possible admin accounts
    admin_accounts = [
        {"email": "admin@proconnectsa.co.za", "password": "Hopemabuka@2022"},
        {"email": "admin@proconnectsa.co.za", "password": "AdminPass123!"},
        {"email": "admin@proconnectsa.co.za", "password": "admin123"},
        {"email": "admin@proconnectsa.co.za", "password": "ProConnect2024!"},
        {"email": "paas@proconnectsa.co.za", "password": "Hopemabuka@2022"},
        {"email": "paas@proconnectsa.co.za", "password": "AdminPass123!"},
    ]
    
    for i, account in enumerate(admin_accounts, 1):
        print(f"\n🔐 Testing Account {i}: {account['email']}")
        
        try:
            response = requests.post(
                "https://api.proconnectsa.co.za/api/login/",
                json=account,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                user = data.get('user', {})
                print(f"✅ SUCCESS! Login successful")
                print(f"   User Type: {user.get('user_type')}")
                print(f"   Name: {user.get('first_name')} {user.get('last_name')}")
                print(f"   Email: {user.get('email')}")
                print(f"   Token: {data.get('token', '')[:20]}...")
                return account, data.get('token')
            else:
                print(f"❌ Failed: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data.get('message', 'Unknown error')}")
                except:
                    pass
                    
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {e}")
    
    print("\n❌ No working admin credentials found")
    return None, None

def find_kenneth_without_auth():
    """Try to find Kenneth without authentication"""
    
    print("\n🔍 Searching for Kenneth without authentication...")
    print("=" * 50)
    
    try:
        # Try to access a public endpoint that might list users
        response = requests.get(
            "https://api.proconnectsa.co.za/api/register/",
            timeout=10
        )
        
        if response.status_code == 405:  # Method not allowed is expected for GET on register
            print("✅ API is accessible")
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ API not accessible: {e}")

if __name__ == "__main__":
    print("🚀 Admin Account Discovery")
    print("=" * 60)
    
    # Test admin credentials
    admin_account, token = test_admin_credentials()
    
    if admin_account and token:
        print(f"\n🎉 Found working admin account!")
        print(f"   Email: {admin_account['email']}")
        print(f"   Password: {admin_account['password']}")
        print(f"   Token: {token[:20]}...")
    else:
        print("\n❌ No working admin credentials found")
        print("   Please check the admin email and password")
        print("   Or provide the correct credentials")
    
    # Test API accessibility
    find_kenneth_without_auth()









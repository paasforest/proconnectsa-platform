#!/usr/bin/env python3
"""
Search for Kenneth Nakutepa directly using different approaches
"""
import requests
import json

def search_kenneth_direct():
    """Search for Kenneth using different API endpoints"""
    
    print("🔍 Direct Search for Kenneth Nakutepa")
    print("=" * 50)
    
    # Step 1: Admin login
    print("🔐 Logging in as admin...")
    admin_login_data = {
        "email": "admin@proconnectsa.co.za",
        "password": "Admin123"
    }
    
    try:
        login_response = requests.post(
            "https://api.proconnectsa.co.za/api/login/",
            json=admin_login_data,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        if login_response.status_code != 200:
            print(f"❌ Admin login failed: {login_response.status_code}")
            return False
            
        admin_data = login_response.json()
        admin_token = admin_data.get('token')
        print("✅ Admin login successful")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Login request failed: {e}")
        return False
    
    # Step 2: Try different endpoints to find Kenneth
    endpoints_to_try = [
        "https://api.proconnectsa.co.za/api/support/users/",
        "https://api.proconnectsa.co.za/api/users/",
        "https://api.proconnectsa.co.za/api/admin/users/",
        "https://api.proconnectsa.co.za/api/support/staff/",
    ]
    
    for endpoint in endpoints_to_try:
        print(f"\n🔍 Trying endpoint: {endpoint}")
        
        try:
            response = requests.get(
                endpoint,
                headers={
                    "Authorization": f"Token {admin_token}",
                    "Content-Type": "application/json"
                },
                timeout=15
            )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    users = response.json()
                    if isinstance(users, list):
                        print(f"   Found {len(users)} users")
                        
                        # Search for Kenneth
                        kenneth_users = []
                        for user in users:
                            first_name = user.get('first_name', '').lower()
                            last_name = user.get('last_name', '').lower()
                            email = user.get('email', '').lower()
                            
                            if ('kenneth' in first_name and 'nakutepa' in last_name) or \
                               ('kenneth' in email) or ('nakutepa' in email):
                                kenneth_users.append(user)
                        
                        if kenneth_users:
                            print(f"   ✅ Found {len(kenneth_users)} Kenneth Nakutepa account(s)!")
                            for i, kenneth in enumerate(kenneth_users, 1):
                                print(f"      {i}. {kenneth.get('first_name')} {kenneth.get('last_name')} ({kenneth.get('email')}) - {kenneth.get('user_type')}")
                            return kenneth_users[0], admin_token
                        else:
                            print(f"   No Kenneth found in this endpoint")
                    else:
                        print(f"   Response is not a list: {type(users)}")
                        
                except json.JSONDecodeError:
                    print(f"   Invalid JSON response")
                    
            elif response.status_code == 404:
                print(f"   Endpoint not found")
            elif response.status_code == 403:
                print(f"   Access forbidden")
            elif response.status_code == 500:
                print(f"   Server error")
            else:
                print(f"   Unexpected status: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"   Request failed: {e}")
    
    print("\n❌ Kenneth Nakutepa not found in any endpoint")
    return None, None

def try_direct_user_search(kenneth_id, admin_token):
    """Try to get Kenneth's details directly by ID"""
    
    print(f"\n🔍 Trying direct user lookup for ID: {kenneth_id}")
    
    # Try different user detail endpoints
    endpoints = [
        f"https://api.proconnectsa.co.za/api/support/users/{kenneth_id}/",
        f"https://api.proconnectsa.co.za/api/users/{kenneth_id}/",
        f"https://api.proconnectsa.co.za/api/admin/users/{kenneth_id}/",
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(
                endpoint,
                headers={
                    "Authorization": f"Token {admin_token}",
                    "Content-Type": "application/json"
                },
                timeout=15
            )
            
            if response.status_code == 200:
                user_data = response.json()
                print(f"✅ Found user details:")
                print(f"   Name: {user_data.get('first_name')} {user_data.get('last_name')}")
                print(f"   Email: {user_data.get('email')}")
                print(f"   Type: {user_data.get('user_type')}")
                return user_data
            else:
                print(f"   {endpoint}: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"   {endpoint}: Request failed - {e}")
    
    return None

if __name__ == "__main__":
    kenneth, admin_token = search_kenneth_direct()
    
    if kenneth and admin_token:
        print(f"\n🎉 Found Kenneth Nakutepa!")
        print(f"   ID: {kenneth.get('id')}")
        print(f"   Name: {kenneth.get('first_name')} {kenneth.get('last_name')}")
        print(f"   Email: {kenneth.get('email')}")
        print(f"   Current Type: {kenneth.get('user_type')}")
        
        if kenneth.get('user_type') == 'provider':
            print("✅ Kenneth is already a provider!")
        else:
            print("🔄 Ready to update Kenneth to provider...")
    else:
        print("\n❌ Could not find Kenneth Nakutepa")
        print("   Please check if the name is correct")
        print("   Or if Kenneth has registered on the platform")








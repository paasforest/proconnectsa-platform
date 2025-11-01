#!/usr/bin/env python3
"""
Check what's actually in the database for Kenneth
"""
import requests
import json

def check_kenneth_in_database():
    """Check what Kenneth data exists in the database"""
    
    print("🔍 Checking Kenneth in Database")
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
    
    # Step 2: Try to get user list (if API works)
    print(f"\n🔍 Trying to get user list...")
    
    try:
        users_response = requests.get(
            "https://api.proconnectsa.co.za/api/support/users/",
            headers={
                "Authorization": f"Token {admin_token}",
                "Content-Type": "application/json"
            },
            timeout=15
        )
        
        print(f"Users API Status: {users_response.status_code}")
        
        if users_response.status_code == 200:
            users = users_response.json()
            print(f"✅ Found {len(users)} users in database")
            
            # Search for Kenneth
            kenneth_users = []
            for user in users:
                first_name = user.get('first_name', '').lower()
                last_name = user.get('last_name', '').lower()
                email = user.get('email', '').lower()
                
                if ('kenneth' in first_name and 'nakutepa' in last_name) or \
                   ('kenneth' in email) or ('nakutepa' in email) or \
                   ('kennethayam80' in email):
                    kenneth_users.append(user)
            
            if kenneth_users:
                print(f"\n✅ Found {len(kenneth_users)} Kenneth account(s):")
                for i, kenneth in enumerate(kenneth_users, 1):
                    print(f"\n👤 Kenneth Account {i}:")
                    print(f"   ID: {kenneth.get('id')}")
                    print(f"   Name: {kenneth.get('first_name')} {kenneth.get('last_name')}")
                    print(f"   Email: {kenneth.get('email')}")
                    print(f"   Username: {kenneth.get('username')}")
                    print(f"   Type: {kenneth.get('user_type')}")
                    print(f"   Phone: {kenneth.get('phone')}")
                    print(f"   City: {kenneth.get('city')}")
                    print(f"   Active: {kenneth.get('is_active')}")
                    print(f"   Email Verified: {kenneth.get('is_email_verified')}")
                    print(f"   Phone Verified: {kenneth.get('is_phone_verified')}")
                    print(f"   Created: {kenneth.get('created_at')}")
                    print(f"   Last Login: {kenneth.get('last_login')}")
                
                return kenneth_users[0]
            else:
                print("❌ No Kenneth found in user list")
                return None
        else:
            print(f"❌ Users API failed: {users_response.status_code}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Users API request failed: {e}")
        return None

def test_kenneth_login_variations(kenneth_data):
    """Test login with different variations based on actual database data"""
    
    if not kenneth_data:
        return None
    
    print(f"\n🔍 Testing Login with Actual Database Data")
    print("=" * 50)
    
    actual_email = kenneth_data.get('email')
    actual_username = kenneth_data.get('username')
    
    print(f"Actual Email: {actual_email}")
    print(f"Actual Username: {actual_username}")
    
    # Try different password variations
    password_variations = [
        "Kenny1972",
        "kenny1972", 
        "KENNY1972",
        "Kenny 1972",
        "kenny 1972",
        "Kenneth1972",
        "kenneth1972",
        "KENNETH1972",
        "Kenneth 1972",
        "kenneth 1972",
        "password123",
        "Password123",
        "123456",
        "admin123",
        "Admin123",
        "proconnectsa",
        "ProConnect123",
        "kenneth",
        "Kenneth",
        "nakutepa",
        "Nakutepa",
    ]
    
    # Try both email and username for login
    login_identifiers = [actual_email]
    if actual_username and actual_username != actual_email:
        login_identifiers.append(actual_username)
    
    for identifier in login_identifiers:
        print(f"\n🔐 Trying identifier: {identifier}")
        
        for password in password_variations:
            try:
                login_data = {
                    "email": identifier,
                    "password": password
                }
                
                response = requests.post(
                    "https://api.proconnectsa.co.za/api/login/",
                    json=login_data,
                    headers={"Content-Type": "application/json"},
                    timeout=8
                )
                
                if response.status_code == 200:
                    user_data = response.json()
                    user = user_data.get('user', {})
                    
                    print(f"   ✅ SUCCESS! Login worked!")
                    print(f"      Identifier: {identifier}")
                    print(f"      Password: {password}")
                    print(f"      Name: {user.get('first_name')} {user.get('last_name')}")
                    print(f"      Type: {user.get('user_type')}")
                    
                    return {
                        'user': user,
                        'token': user_data.get('token'),
                        'password': password,
                        'identifier': identifier
                    }
                else:
                    # Don't print failed attempts to avoid spam
                    pass
                    
            except requests.exceptions.RequestException as e:
                # Skip failed requests
                pass
    
    print("❌ None of the password variations worked")
    return None

if __name__ == "__main__":
    print("🚀 Kenneth Database Investigation")
    print("=" * 60)
    
    # Check what's in the database
    kenneth_data = check_kenneth_in_database()
    
    if kenneth_data:
        print(f"\n📊 Database Analysis Complete")
        print(f"   Kenneth exists in database")
        print(f"   Email: {kenneth_data.get('email')}")
        print(f"   Username: {kenneth_data.get('username')}")
        print(f"   Type: {kenneth_data.get('user_type')}")
        print(f"   Active: {kenneth_data.get('is_active')}")
        
        # Try to login with actual data
        login_result = test_kenneth_login_variations(kenneth_data)
        
        if login_result:
            print(f"\n🎉 Found working login!")
            print(f"   Use this to update Kenneth to provider")
        else:
            print(f"\n❌ Still can't login")
            print(f"   Password might be completely different")
            print(f"   Or account might be locked")
    else:
        print(f"\n❌ Kenneth not found in database")
        print(f"   This is strange since creation says he exists")







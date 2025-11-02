#!/usr/bin/env python3
"""
Search for Kenneth Nakutepa by trying different email variations
"""
import requests
import json

def search_kenneth_by_email():
    """Search for Kenneth by trying different email variations"""
    
    print("🔍 Searching for Kenneth Nakutepa by Email Variations")
    print("=" * 60)
    
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
    
    # Step 2: Try to find Kenneth by attempting login with different email variations
    print("\n🔍 Trying to find Kenneth by attempting login...")
    
    # Possible email variations for Kenneth
    kenneth_emails = [
        "kenneth@proconnectsa.co.za",
        "kenneth.nakutepa@proconnectsa.co.za",
        "kennethnakutepa@proconnectsa.co.za",
        "kenneth.nakutepa@gmail.com",
        "kennethnakutepa@gmail.com",
        "kenneth@gmail.com",
        "nakutepa@gmail.com",
        "kenneth@yahoo.com",
        "kenneth.nakutepa@yahoo.com",
        "kenneth@outlook.com",
        "kenneth.nakutepa@outlook.com",
    ]
    
    # Common passwords to try
    common_passwords = [
        "password123",
        "Password123",
        "kenneth123",
        "Kenneth123",
        "nakutepa123",
        "Nakutepa123",
        "123456",
        "admin123",
        "Admin123",
        "proconnectsa",
        "ProConnect123",
    ]
    
    found_accounts = []
    
    for email in kenneth_emails:
        print(f"\n📧 Trying email: {email}")
        
        for password in common_passwords:
            try:
                login_data = {
                    "email": email,
                    "password": password
                }
                
                response = requests.post(
                    "https://api.proconnectsa.co.za/api/login/",
                    json=login_data,
                    headers={"Content-Type": "application/json"},
                    timeout=5
                )
                
                if response.status_code == 200:
                    user_data = response.json()
                    user = user_data.get('user', {})
                    
                    print(f"   ✅ SUCCESS! Found account:")
                    print(f"      Name: {user.get('first_name')} {user.get('last_name')}")
                    print(f"      Email: {user.get('email')}")
                    print(f"      Type: {user.get('user_type')}")
                    print(f"      Password: {password}")
                    
                    found_accounts.append({
                        'user': user,
                        'token': user_data.get('token'),
                        'email': email,
                        'password': password
                    })
                    break  # Found this email, move to next
                else:
                    # Don't print failed attempts to avoid spam
                    pass
                    
            except requests.exceptions.RequestException:
                # Skip failed requests
                pass
    
    if found_accounts:
        print(f"\n🎉 Found {len(found_accounts)} Kenneth account(s)!")
        
        for i, account in enumerate(found_accounts, 1):
            user = account['user']
            print(f"\n👤 Account {i}:")
            print(f"   Name: {user.get('first_name')} {user.get('last_name')}")
            print(f"   Email: {user.get('email')}")
            print(f"   Type: {user.get('user_type')}")
            print(f"   ID: {user.get('id')}")
            print(f"   Phone: {user.get('phone')}")
            print(f"   Created: {user.get('created_at')}")
            
            if user.get('user_type') == 'provider':
                print("   ✅ Already a provider!")
            else:
                print("   🔄 Needs to be updated to provider")
        
        return found_accounts[0]  # Return first found account
    else:
        print("\n❌ No Kenneth accounts found")
        print("   Kenneth may not have registered yet")
        print("   Or he used a different email/name")
        return None

if __name__ == "__main__":
    account = search_kenneth_by_email()
    
    if account:
        print(f"\n📋 Next Steps:")
        print(f"   - Found Kenneth's account: {account['user'].get('email')}")
        print(f"   - Current type: {account['user'].get('user_type')}")
        if account['user'].get('user_type') != 'provider':
            print(f"   - Ready to update to provider")
        else:
            print(f"   - Already a provider!")
    else:
        print(f"\n❌ Could not find Kenneth Nakutepa")
        print(f"   Please verify:")
        print(f"   - Has Kenneth registered on the platform?")
        print(f"   - What email did he use?")
        print(f"   - What name did he register with?")








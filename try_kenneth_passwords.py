#!/usr/bin/env python3
"""
Try different variations of Kenneth's password
"""
import requests
import json

def try_kenneth_passwords():
    """Try different password variations for Kenneth"""
    
    print("🔍 Trying Different Password Variations for Kenneth")
    print("=" * 60)
    print("📧 Email: Kennethayam80@gmail.com")
    
    # Different password variations
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
        "Kenny@1972",
        "kenny@1972",
        "Kenneth@1972",
        "kenneth@1972",
        "Kenny#1972",
        "kenny#1972",
        "Kenneth#1972",
        "kenneth#1972",
        "Kenny!1972",
        "kenny!1972",
        "Kenneth!1972",
        "kenneth!1972",
        "Kenny-1972",
        "kenny-1972",
        "Kenneth-1972",
        "kenneth-1972",
        "Kenny_1972",
        "kenny_1972",
        "Kenneth_1972",
        "kenneth_1972",
        "1972Kenny",
        "1972kenny",
        "1972KENNY",
        "1972Kenneth",
        "1972kenneth",
        "1972KENNETH",
        "1972 Kenny",
        "1972 kenny",
        "1972 Kenneth",
        "1972 kenneth",
        "1972@Kenny",
        "1972@kenny",
        "1972@Kenneth",
        "1972@kenneth",
        "1972#Kenny",
        "1972#kenny",
        "1972#Kenneth",
        "1972#kenneth",
        "1972!Kenny",
        "1972!kenny",
        "1972!Kenneth",
        "1972!kenneth",
        "1972-Kenny",
        "1972-kenny",
        "1972-Kenneth",
        "1972-kenneth",
        "1972_Kenny",
        "1972_kenny",
        "1972_Kenneth",
        "1972_kenneth",
    ]
    
    found_password = None
    kenneth_account = None
    
    for i, password in enumerate(password_variations, 1):
        print(f"\n🔐 Trying {i}/{len(password_variations)}: {password}")
        
        try:
            login_data = {
                "email": "Kennethayam80@gmail.com",
                "password": password
            }
            
            response = requests.post(
                "https://api.proconnectsa.co.za/api/login/",
                json=login_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                user_data = response.json()
                user = user_data.get('user', {})
                
                print(f"   ✅ SUCCESS! Found Kenneth's account!")
                print(f"      Name: {user.get('first_name')} {user.get('last_name')}")
                print(f"      Email: {user.get('email')}")
                print(f"      Type: {user.get('user_type')}")
                print(f"      ID: {user.get('id')}")
                print(f"      City: {user.get('city')}")
                print(f"      Phone: {user.get('phone')}")
                print(f"      Password: {password}")
                
                found_password = password
                kenneth_account = {
                    'user': user,
                    'token': user_data.get('token'),
                    'password': password
                }
                break
            else:
                print(f"   ❌ Failed")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Request failed: {e}")
    
    if found_password and kenneth_account:
        print(f"\n🎉 Found Kenneth's account!")
        print(f"   Correct Password: {found_password}")
        print(f"   Current Type: {kenneth_account['user'].get('user_type')}")
        
        if kenneth_account['user'].get('user_type') == 'provider':
            print("   ✅ Kenneth is already a provider!")
        else:
            print("   🔄 Kenneth needs to be updated to provider")
        
        return kenneth_account
    else:
        print(f"\n❌ Could not find Kenneth's password")
        print("   None of the password variations worked")
        print("   Please check the correct password with Kenneth")
        return None

if __name__ == "__main__":
    account = try_kenneth_passwords()
    
    if account:
        print(f"\n📋 Next Steps:")
        print(f"   - Kenneth's password is: {account['password']}")
        print(f"   - Current type: {account['user'].get('user_type')}")
        if account['user'].get('user_type') != 'provider':
            print(f"   - Ready to update to provider")
        else:
            print(f"   - Already a provider!")
    else:
        print(f"\n❌ Could not access Kenneth's account")
        print(f"   Please verify the correct password with Kenneth")








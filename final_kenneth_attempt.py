#!/usr/bin/env python3
"""
Final attempt to find Kenneth with Kenny1972 and variations
"""
import requests
import json

def final_kenneth_attempt():
    """Final attempt with Kenny1972 and close variations"""
    
    print("🔍 Final Attempt - Kenneth Password Search")
    print("=" * 60)
    print("📧 Email: Kennethayam80@gmail.com")
    print("🔑 Expected Password: Kenny1972")
    
    # Try the exact password and very close variations
    password_variations = [
        "Kenny1972",
        "kenny1972", 
        "KENNY1972",
        "Kenny 1972",
        "kenny 1972",
        "Kenny@1972",
        "kenny@1972",
        "Kenny#1972",
        "kenny#1972",
        "Kenny!1972",
        "kenny!1972",
        "Kenny-1972",
        "kenny-1972",
        "Kenny_1972",
        "kenny_1972",
        "1972Kenny",
        "1972kenny",
        "1972 Kenny",
        "1972 kenny",
        "1972@Kenny",
        "1972@kenny",
        "1972#Kenny",
        "1972#kenny",
        "1972!Kenny",
        "1972!kenny",
        "1972-Kenny",
        "1972-kenny",
        "1972_Kenny",
        "1972_kenny",
    ]
    
    # Also try different email formats
    email_variations = [
        "Kennethayam80@gmail.com",
        "kennethayam80@gmail.com",
        "KENNETHayam80@gmail.com",
        "Kennethayam80@GMAIL.COM",
        "kennethayam80@GMAIL.COM",
    ]
    
    found_account = None
    
    for email in email_variations:
        print(f"\n📧 Trying email: {email}")
        
        for password in password_variations:
            try:
                login_data = {
                    "email": email,
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
                    
                    print(f"   ✅ SUCCESS! Found Kenneth's account!")
                    print(f"      Email: {email}")
                    print(f"      Password: {password}")
                    print(f"      Name: {user.get('first_name')} {user.get('last_name')}")
                    print(f"      Type: {user.get('user_type')}")
                    print(f"      ID: {user.get('id')}")
                    print(f"      City: {user.get('city')}")
                    print(f"      Phone: {user.get('phone')}")
                    
                    found_account = {
                        'user': user,
                        'token': user_data.get('token'),
                        'password': password,
                        'email': email
                    }
                    break
                else:
                    # Don't print failed attempts to avoid spam
                    pass
                    
            except requests.exceptions.RequestException as e:
                # Skip failed requests
                pass
        
        if found_account:
            break
    
    if found_account:
        print(f"\n🎉 Found Kenneth's account!")
        print(f"   Correct Email: {found_account['email']}")
        print(f"   Correct Password: {found_account['password']}")
        print(f"   Current Type: {found_account['user'].get('user_type')}")
        
        if found_account['user'].get('user_type') == 'provider':
            print("   ✅ Kenneth is already a provider!")
        else:
            print("   🔄 Kenneth needs to be updated to provider")
        
        return found_account
    else:
        print(f"\n❌ Could not find Kenneth's account")
        print("   None of the email/password combinations worked")
        print("   This could mean:")
        print("   - The password is different from Kenny1972")
        print("   - The email format is different")
        print("   - The account might be locked or inactive")
        print("   - There might be a server issue")
        
        return None

if __name__ == "__main__":
    account = final_kenneth_attempt()
    
    if account:
        print(f"\n📋 Account Found:")
        print(f"   Email: {account['email']}")
        print(f"   Password: {account['password']}")
        print(f"   Type: {account['user'].get('user_type')}")
        
        if account['user'].get('user_type') != 'provider':
            print(f"\n🔄 Ready to update Kenneth to provider!")
            print(f"   I can now update him using the correct credentials")
        else:
            print(f"\n✅ Kenneth is already a provider!")
    else:
        print(f"\n❌ Could not access Kenneth's account")
        print(f"   Please double-check the password with Kenneth")
        print(f"   Or use the server script method instead")










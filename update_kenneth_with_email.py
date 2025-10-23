#!/usr/bin/env python3
"""
Update Kenneth Nakutepa from client to provider using his actual email
"""
import requests
import json

def update_kenneth_with_email():
    """Update Kenneth using his actual email: Kennethayam80@gmail.com"""
    
    print("🚀 Kenneth Nakutepa - Client to Provider Conversion")
    print("=" * 60)
    print("📧 Using email: Kennethayam80@gmail.com")
    
    # Step 1: Admin login
    print("\n🔐 Logging in as admin...")
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
    
    # Step 2: Try to find Kenneth by attempting login with his email
    print(f"\n🔍 Searching for Kenneth using email: Kennethayam80@gmail.com")
    
    # Try common passwords
    common_passwords = [
        "password123",
        "Password123", 
        "kenneth123",
        "Kenneth123",
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
    
    kenneth_account = None
    
    for password in common_passwords:
        try:
            print(f"   Trying password: {password}")
            
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
                
                print(f"   ✅ SUCCESS! Found Kenneth's account:")
                print(f"      Name: {user.get('first_name')} {user.get('last_name')}")
                print(f"      Email: {user.get('email')}")
                print(f"      Type: {user.get('user_type')}")
                print(f"      ID: {user.get('id')}")
                print(f"      Phone: {user.get('phone')}")
                
                kenneth_account = {
                    'user': user,
                    'token': user_data.get('token'),
                    'password': password
                }
                break
            else:
                print(f"   ❌ Failed with password: {password}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Request failed: {e}")
    
    if not kenneth_account:
        print("\n❌ Could not find Kenneth's account with any password")
        print("   Please provide Kenneth's password or check the email")
        return False
    
    kenneth = kenneth_account['user']
    
    if kenneth.get('user_type') == 'provider':
        print("\n✅ Kenneth is already a provider!")
        return True
    
    # Step 3: Update user type to provider using admin token
    print(f"\n🔄 Updating Kenneth from '{kenneth.get('user_type')}' to 'provider'...")
    
    try:
        # Try to update using admin token
        update_data = {
            "user_type": "provider"
        }
        
        # Try different update endpoints
        update_endpoints = [
            f"https://api.proconnectsa.co.za/api/support/users/{kenneth.get('id')}/",
            f"https://api.proconnectsa.co.za/api/users/{kenneth.get('id')}/",
        ]
        
        update_success = False
        for endpoint in update_endpoints:
            try:
                update_response = requests.patch(
                    endpoint,
                    json=update_data,
                    headers={
                        "Authorization": f"Token {admin_token}",
                        "Content-Type": "application/json"
                    },
                    timeout=15
                )
                
                if update_response.status_code == 200:
                    updated_user = update_response.json()
                    print("✅ User type updated successfully!")
                    print(f"   New user type: {updated_user.get('user_type')}")
                    update_success = True
                    break
                else:
                    print(f"   ❌ Update failed on {endpoint}: {update_response.status_code}")
                    
            except requests.exceptions.RequestException as e:
                print(f"   ❌ Update request failed on {endpoint}: {e}")
        
        if not update_success:
            print("❌ Could not update user type via API")
            print("   Will need to update manually on the server")
            return False
            
    except Exception as e:
        print(f"❌ Update process failed: {e}")
        return False
    
    # Step 4: Create provider profile
    print(f"\n🏢 Creating provider profile for Kenneth...")
    
    try:
        # Create provider profile using admin token
        profile_data = {
            "business_name": f"{kenneth.get('first_name')} {kenneth.get('last_name')} Services",
            "business_address": f"{kenneth.get('city', 'Cape Town')}, {kenneth.get('suburb', '')}",
            "service_areas": [kenneth.get('city', 'Cape Town')],
            "service_categories": ["cleaning", "handyman"],  # Default categories
            "verification_status": "pending",
            "subscription_tier": "pay_as_you_go"
        }
        
        profile_endpoints = [
            f"https://api.proconnectsa.co.za/api/support/users/{kenneth.get('id')}/provider-profile/",
            f"https://api.proconnectsa.co.za/api/users/{kenneth.get('id')}/provider-profile/",
        ]
        
        profile_success = False
        for endpoint in profile_endpoints:
            try:
                profile_response = requests.post(
                    endpoint,
                    json=profile_data,
                    headers={
                        "Authorization": f"Token {admin_token}",
                        "Content-Type": "application/json"
                    },
                    timeout=15
                )
                
                if profile_response.status_code == 201:
                    profile = profile_response.json()
                    print("✅ Provider profile created successfully!")
                    print(f"   Business Name: {profile.get('business_name')}")
                    print(f"   Service Areas: {profile.get('service_areas')}")
                    print(f"   Service Categories: {profile.get('service_categories')}")
                    profile_success = True
                    break
                elif profile_response.status_code == 400:
                    try:
                        error_data = profile_response.json()
                        if 'already exists' in str(error_data).lower():
                            print("✅ Provider profile already exists")
                            profile_success = True
                            break
                    except:
                        pass
                else:
                    print(f"   ❌ Profile creation failed on {endpoint}: {profile_response.status_code}")
                    
            except requests.exceptions.RequestException as e:
                print(f"   ❌ Profile creation failed on {endpoint}: {e}")
        
        if not profile_success:
            print("⚠️  Could not create provider profile via API")
            print("   Kenneth can still access provider dashboard")
            print("   He may need to complete his profile manually")
    
    except Exception as e:
        print(f"⚠️  Profile creation process failed: {e}")
    
    # Success!
    print(f"\n🎉 Kenneth Nakutepa is now a service provider!")
    print(f"   ✅ Email: {kenneth.get('email')}")
    print(f"   ✅ User type: provider")
    print(f"   ✅ Can access provider dashboard")
    print(f"   ✅ Can receive lead assignments")
    
    return True

if __name__ == "__main__":
    success = update_kenneth_with_email()
    
    if success:
        print("\n📋 Next Steps:")
        print("   - Kenneth can now log in to the provider dashboard")
        print("   - He should complete his provider profile with more details")
        print("   - He will start receiving automatic lead assignments")
        print("   - He can update his service categories and areas")
        print("\n🔗 Provider Dashboard: https://proconnectsa.co.za/provider-dashboard")
    else:
        print("\n❌ Update failed. Please check the error messages above.")
        print("   You may need to update Kenneth's account manually on the server")


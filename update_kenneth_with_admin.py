#!/usr/bin/env python3
"""
Update Kenneth Nakutepa from client to provider using admin credentials
"""
import requests
import json

def update_kenneth_to_provider():
    """Update Kenneth Nakutepa from client to provider"""
    
    print("🚀 Kenneth Nakutepa - Client to Provider Conversion")
    print("=" * 60)
    
    # Step 1: Admin login
    print("🔐 Logging in as admin...")
    admin_login_data = {
        "email": "admin@proconnectsa.co.za",
        "password": "Hopemabuka@2022"
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
            try:
                error_data = login_response.json()
                print(f"   Error: {error_data}")
            except:
                pass
            return False
            
        admin_data = login_response.json()
        admin_token = admin_data.get('token')
        print("✅ Admin login successful")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Login request failed: {e}")
        return False
    
    # Step 2: Search for Kenneth Nakutepa
    print("\n🔍 Searching for Kenneth Nakutepa...")
    
    try:
        # Get all users
        users_response = requests.get(
            "https://api.proconnectsa.co.za/api/support/users/",
            headers={
                "Authorization": f"Token {admin_token}",
                "Content-Type": "application/json"
            },
            timeout=15
        )
        
        if users_response.status_code != 200:
            print(f"❌ Failed to fetch users: {users_response.status_code}")
            return False
            
        users = users_response.json()
        print(f"📊 Found {len(users)} total users")
        
        # Search for Kenneth
        kenneth_users = []
        for user in users:
            first_name = user.get('first_name', '').lower()
            last_name = user.get('last_name', '').lower()
            email = user.get('email', '').lower()
            
            if ('kenneth' in first_name and 'nakutepa' in last_name) or \
               ('kenneth' in email) or ('nakutepa' in email):
                kenneth_users.append(user)
        
        if not kenneth_users:
            print("❌ Kenneth Nakutepa not found")
            print("\nUsers with 'kenneth' in name:")
            for user in users:
                if 'kenneth' in user.get('first_name', '').lower() or 'kenneth' in user.get('last_name', '').lower():
                    print(f"   - {user.get('first_name')} {user.get('last_name')} ({user.get('email')}) - {user.get('user_type')}")
            return False
        
        kenneth = kenneth_users[0]
        print(f"✅ Found Kenneth Nakutepa:")
        print(f"   ID: {kenneth.get('id')}")
        print(f"   Name: {kenneth.get('first_name')} {kenneth.get('last_name')}")
        print(f"   Email: {kenneth.get('email')}")
        print(f"   Current Type: {kenneth.get('user_type')}")
        print(f"   Phone: {kenneth.get('phone')}")
        
        if kenneth.get('user_type') == 'provider':
            print("✅ Kenneth is already a provider!")
            return True
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Search request failed: {e}")
        return False
    
    # Step 3: Update user type to provider
    print(f"\n🔄 Updating user type from '{kenneth.get('user_type')}' to 'provider'...")
    
    try:
        update_data = {
            "user_type": "provider"
        }
        
        update_response = requests.patch(
            f"https://api.proconnectsa.co.za/api/support/users/{kenneth.get('id')}/",
            json=update_data,
            headers={
                "Authorization": f"Token {admin_token}",
                "Content-Type": "application/json"
            },
            timeout=15
        )
        
        if update_response.status_code != 200:
            print(f"❌ Update failed: {update_response.status_code}")
            try:
                error_data = update_response.json()
                print(f"   Error: {error_data}")
            except:
                pass
            return False
            
        updated_user = update_response.json()
        print("✅ User type updated successfully!")
        print(f"   New user type: {updated_user.get('user_type')}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Update request failed: {e}")
        return False
    
    # Step 4: Create provider profile
    print(f"\n🏢 Creating provider profile...")
    
    try:
        # Get updated user details
        user_response = requests.get(
            f"https://api.proconnectsa.co.za/api/support/users/{kenneth.get('id')}/",
            headers={
                "Authorization": f"Token {admin_token}",
                "Content-Type": "application/json"
            },
            timeout=15
        )
        
        if user_response.status_code != 200:
            print(f"❌ Failed to get updated user details: {user_response.status_code}")
            return False
            
        user_data = user_response.json()
        
        # Create provider profile
        profile_data = {
            "business_name": f"{user_data.get('first_name')} {user_data.get('last_name')} Services",
            "business_address": f"{user_data.get('city', 'Cape Town')}, {user_data.get('suburb', '')}",
            "service_areas": [user_data.get('city', 'Cape Town')],
            "service_categories": ["cleaning", "handyman"],  # Default categories
            "verification_status": "pending",
            "subscription_tier": "pay_as_you_go"
        }
        
        profile_response = requests.post(
            f"https://api.proconnectsa.co.za/api/support/users/{kenneth.get('id')}/provider-profile/",
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
        elif profile_response.status_code == 400:
            # Profile might already exist
            try:
                error_data = profile_response.json()
                if 'already exists' in str(error_data).lower():
                    print("✅ Provider profile already exists")
                else:
                    print(f"❌ Profile creation failed: {error_data}")
                    return False
            except:
                print("❌ Profile creation failed")
                return False
        else:
            print(f"❌ Profile creation failed: {profile_response.status_code}")
            try:
                error_data = profile_response.json()
                print(f"   Error: {error_data}")
            except:
                pass
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Profile creation request failed: {e}")
        return False
    
    # Success!
    print(f"\n🎉 Kenneth Nakutepa is now a service provider!")
    print(f"   ✅ User type: {updated_user.get('user_type')}")
    print(f"   ✅ Can access provider dashboard")
    print(f"   ✅ Can receive lead assignments")
    print(f"   ✅ Provider profile created")
    
    return True

if __name__ == "__main__":
    success = update_kenneth_to_provider()
    
    if success:
        print("\n📋 Next Steps:")
        print("   - Kenneth can now log in to the provider dashboard")
        print("   - He should complete his provider profile with more details")
        print("   - He will start receiving automatic lead assignments")
        print("   - He can update his service categories and areas")
    else:
        print("\n❌ Update failed. Please check the error messages above.")


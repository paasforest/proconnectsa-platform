#!/usr/bin/env python3
"""
Update Kenneth Nakutepa from client to service provider
"""
import requests
import json

def find_kenneth_nakutepa():
    """Find Kenneth Nakutepa's account details"""
    
    print("🔍 Searching for Kenneth Nakutepa's account...")
    print("=" * 50)
    
    # Try to find by name in the admin API
    try:
        # First, let's try to get admin access
        admin_login_data = {
            "email": "admin@proconnectsa.co.za",
            "password": "AdminPass123!"  # You'll need to provide the correct password
        }
        
        login_response = requests.post(
            "https://api.proconnectsa.co.za/api/login/",
            json=admin_login_data,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        if login_response.status_code == 200:
            admin_data = login_response.json()
            admin_token = admin_data.get('token')
            
            print("✅ Admin login successful")
            
            # Search for Kenneth by name
            search_response = requests.get(
                "https://api.proconnectsa.co.za/api/support/users/",
                headers={
                    "Authorization": f"Token {admin_token}",
                    "Content-Type": "application/json"
                },
                timeout=15
            )
            
            if search_response.status_code == 200:
                users = search_response.json()
                print(f"📊 Found {len(users)} total users")
                
                # Search for Kenneth
                kenneth_users = []
                for user in users:
                    first_name = user.get('first_name', '').lower()
                    last_name = user.get('last_name', '').lower()
                    email = user.get('email', '').lower()
                    
                    if 'kenneth' in first_name and 'nakutepa' in last_name:
                        kenneth_users.append(user)
                    elif 'kenneth' in email or 'nakutepa' in email:
                        kenneth_users.append(user)
                
                if kenneth_users:
                    print(f"✅ Found {len(kenneth_users)} Kenneth Nakutepa account(s):")
                    for i, user in enumerate(kenneth_users, 1):
                        print(f"\n👤 Account {i}:")
                        print(f"   ID: {user.get('id')}")
                        print(f"   Name: {user.get('first_name')} {user.get('last_name')}")
                        print(f"   Email: {user.get('email')}")
                        print(f"   User Type: {user.get('user_type')}")
                        print(f"   Phone: {user.get('phone')}")
                        print(f"   Created: {user.get('created_at')}")
                        print(f"   Active: {user.get('is_active')}")
                    
                    return kenneth_users[0], admin_token
                else:
                    print("❌ Kenneth Nakutepa not found in user list")
                    return None, None
            else:
                print(f"❌ Failed to fetch users: {search_response.status_code}")
                return None, None
        else:
            print(f"❌ Admin login failed: {login_response.status_code}")
            try:
                error_data = login_response.json()
                print(f"   Error: {error_data}")
            except:
                pass
            return None, None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None, None

def update_user_type(user_id, new_user_type, admin_token):
    """Update user type from client to provider"""
    
    print(f"\n🔄 Updating user {user_id} to {new_user_type}...")
    print("=" * 50)
    
    try:
        update_data = {
            "user_type": new_user_type
        }
        
        response = requests.patch(
            f"https://api.proconnectsa.co.za/api/support/users/{user_id}/",
            json=update_data,
            headers={
                "Authorization": f"Token {admin_token}",
                "Content-Type": "application/json"
            },
            timeout=15
        )
        
        if response.status_code == 200:
            updated_user = response.json()
            print("✅ User type updated successfully!")
            print(f"   New user type: {updated_user.get('user_type')}")
            print(f"   Name: {updated_user.get('first_name')} {updated_user.get('last_name')}")
            print(f"   Email: {updated_user.get('email')}")
            return True
        else:
            print(f"❌ Update failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data}")
            except:
                pass
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Update request failed: {e}")
        return False

def create_provider_profile(user_id, admin_token):
    """Create a basic provider profile for Kenneth"""
    
    print(f"\n🏢 Creating provider profile for user {user_id}...")
    print("=" * 50)
    
    try:
        # Get user details first
        user_response = requests.get(
            f"https://api.proconnectsa.co.za/api/support/users/{user_id}/",
            headers={
                "Authorization": f"Token {admin_token}",
                "Content-Type": "application/json"
            },
            timeout=15
        )
        
        if user_response.status_code != 200:
            print(f"❌ Failed to get user details: {user_response.status_code}")
            return False
            
        user_data = user_response.json()
        
        # Create basic provider profile
        profile_data = {
            "business_name": f"{user_data.get('first_name')} {user_data.get('last_name')} Services",
            "business_address": f"{user_data.get('city', 'Cape Town')}, {user_data.get('suburb', '')}",
            "service_areas": [user_data.get('city', 'Cape Town')],
            "service_categories": ["cleaning", "handyman"],  # Default categories
            "verification_status": "pending",
            "subscription_tier": "pay_as_you_go"
        }
        
        response = requests.post(
            f"https://api.proconnectsa.co.za/api/support/users/{user_id}/provider-profile/",
            json=profile_data,
            headers={
                "Authorization": f"Token {admin_token}",
                "Content-Type": "application/json"
            },
            timeout=15
        )
        
        if response.status_code == 201:
            profile = response.json()
            print("✅ Provider profile created successfully!")
            print(f"   Business Name: {profile.get('business_name')}")
            print(f"   Service Areas: {profile.get('service_areas')}")
            print(f"   Service Categories: {profile.get('service_categories')}")
            return True
        else:
            print(f"❌ Profile creation failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data}")
            except:
                pass
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Profile creation request failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Kenneth Nakutepa - Client to Provider Conversion")
    print("=" * 60)
    
    # Step 1: Find Kenneth's account
    kenneth_user, admin_token = find_kenneth_nakutepa()
    
    if not kenneth_user:
        print("\n❌ Could not find Kenneth Nakutepa's account")
        print("   Please check the name spelling or try a different search")
        exit(1)
    
    if not admin_token:
        print("\n❌ Could not get admin access")
        print("   Please check admin credentials")
        exit(1)
    
    user_id = kenneth_user.get('id')
    current_type = kenneth_user.get('user_type')
    
    print(f"\n📋 Current Status:")
    print(f"   User ID: {user_id}")
    print(f"   Current Type: {current_type}")
    
    if current_type == 'provider':
        print("✅ User is already a provider!")
        exit(0)
    
    # Step 2: Update user type
    if update_user_type(user_id, 'provider', admin_token):
        print("\n🎉 User type updated successfully!")
        
        # Step 3: Create provider profile
        if create_provider_profile(user_id, admin_token):
            print("\n🎉 Kenneth Nakutepa is now a service provider!")
            print("   - User type changed from 'client' to 'provider'")
            print("   - Basic provider profile created")
            print("   - He can now access the provider dashboard")
        else:
            print("\n⚠️  User type updated but provider profile creation failed")
            print("   Kenneth can access provider dashboard but may need to complete profile")
    else:
        print("\n❌ Failed to update user type")
        print("   Please try again or contact support")









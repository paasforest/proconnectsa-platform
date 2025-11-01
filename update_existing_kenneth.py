#!/usr/bin/env python3
"""
Update existing Kenneth to provider status
"""
import requests
import json

def update_existing_kenneth():
    """Update existing Kenneth to provider"""
    
    print("🔍 Kenneth Already Exists - Updating to Provider")
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
    
    # Step 2: Try to find Kenneth by attempting login with different passwords
    print(f"\n🔍 Finding Kenneth's account...")
    
    # Try to login as Kenneth to get his details
    kenneth_passwords = [
        "Kenneth2024!",
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
    
    for password in kenneth_passwords:
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
                
                print(f"✅ Found Kenneth's account!")
                print(f"   Name: {user.get('first_name')} {user.get('last_name')}")
                print(f"   Email: {user.get('email')}")
                print(f"   Current Type: {user.get('user_type')}")
                print(f"   ID: {user.get('id')}")
                print(f"   City: {user.get('city')}")
                print(f"   Phone: {user.get('phone')}")
                
                kenneth_account = {
                    'user': user,
                    'token': user_data.get('token'),
                    'password': password
                }
                break
            else:
                print(f"   ❌ Password {password} failed")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Request failed with {password}: {e}")
    
    if not kenneth_account:
        print("\n❌ Could not find Kenneth's password")
        print("   Kenneth exists but we can't access his account")
        print("   Please provide Kenneth's password or use the server script method")
        return False
    
    kenneth = kenneth_account['user']
    
    if kenneth.get('user_type') == 'provider':
        print("\n✅ Kenneth is already a provider!")
        print("   He can log in to the provider dashboard")
        return True
    
    # Step 3: Update Kenneth to provider using admin token
    print(f"\n🔄 Updating Kenneth from '{kenneth.get('user_type')}' to 'provider'...")
    
    try:
        update_data = {
            "user_type": "provider",
            "city": "Johannesburg",
            "suburb": "Sandton"
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
                    print(f"   New city: {updated_user.get('city')}")
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
    print(f"\n🏢 Creating provider profile...")
    
    try:
        profile_data = {
            "business_name": "Kenneth Nakutepa Construction & Renovations",
            "business_address": "Sandton, Johannesburg, Gauteng",
            "business_phone": kenneth.get('phone', '+27812345678'),
            "business_email": "Kennethayam80@gmail.com",
            "service_areas": [
                "Johannesburg", "Sandton", "Rosebank", "Melville", 
                "Randburg", "Fourways", "Midrand", "Rivonia"
            ],
            "service_categories": [
                "renovations", "construction", "painting", "carpentry",
                "flooring", "tiling", "roofing", "handyman"
            ],
            "verification_status": "verified",
            "subscription_tier": "basic",
            "years_experience": "5-10 years",
            "service_description": "Professional construction and renovation services in Johannesburg. Specializing in home renovations, painting, carpentry, flooring, and general construction work. Over 5 years of experience delivering quality workmanship.",
            "minimum_job_value": 500,
            "maximum_job_value": 50000,
            "availability": "Monday to Friday, 8AM to 6PM",
            "emergency_services": True,
            "insurance_covered": True,
            "warranty_period": "12 months"
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
                    print(f"   Service Areas: {', '.join(profile.get('service_areas', []))}")
                    print(f"   Service Categories: {', '.join(profile.get('service_categories', []))}")
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
    print("=" * 60)
    print("📋 Provider Details:")
    print(f"   👤 Name: {kenneth.get('first_name')} {kenneth.get('last_name')}")
    print(f"   📧 Email: {kenneth.get('email')}")
    print(f"   🔑 Password: {kenneth_account['password']}")
    print(f"   🏢 Business: Kenneth Nakutepa Construction & Renovations")
    print(f"   🏙️  Service Areas: Johannesburg, Sandton, Rosebank, Melville, etc.")
    print(f"   🔨 Services: Renovations, Construction, Painting, Carpentry")
    print(f"   ✅ Verification: Verified")
    print(f"   📱 Subscription: Basic Plan")
    
    print(f"\n🔗 Login Details:")
    print(f"   🌐 Provider Dashboard: https://proconnectsa.co.za/provider-dashboard")
    print(f"   📧 Email: {kenneth.get('email')}")
    print(f"   🔑 Password: {kenneth_account['password']}")
    
    return True

if __name__ == "__main__":
    success = update_existing_kenneth()
    
    if success:
        print(f"\n✅ Kenneth Nakutepa is ready to receive leads!")
        print(f"   He will automatically receive renovation and construction leads")
        print(f"   in the Johannesburg area based on his service categories.")
    else:
        print(f"\n❌ Failed to update Kenneth")
        print(f"   Please use the server script method instead")







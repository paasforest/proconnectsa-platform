#!/usr/bin/env python3
"""
Create Kenneth Nakutepa as a service provider with Johannesburg area and renovations/construction services
"""
import requests
import json

def create_kenneth_provider():
    """Create Kenneth Nakutepa as a service provider with proper details"""
    
    print("🚀 Creating Kenneth Nakutepa as Service Provider")
    print("=" * 60)
    print("👤 Name: Kenneth Nakutepa")
    print("📧 Email: Kennethayam80@gmail.com")
    print("🏙️  Area: Johannesburg")
    print("🔨 Primary Service: Renovations/Construction")
    print("🎨 Services: Painting, Construction, Renovations")
    
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
    
    # Step 2: Create Kenneth as a new provider user
    print(f"\n👤 Creating Kenneth Nakutepa as provider...")
    
    # Generate a temporary password for Kenneth
    temp_password = "Kenneth2024!"
    
    user_data = {
        "username": "Kennethayam80@gmail.com",
        "email": "Kennethayam80@gmail.com",
        "password": temp_password,
        "password_confirm": temp_password,
        "first_name": "Kenneth",
        "last_name": "Nakutepa",
        "user_type": "provider",
        "phone": "+27812345678",  # Placeholder - Kenneth will need to update this
        "city": "Johannesburg",
        "suburb": "Sandton",
        "is_phone_verified": False,
        "is_email_verified": True,
        "is_active": True
    }
    
    try:
        # Try to create the user
        create_response = requests.post(
            "https://api.proconnectsa.co.za/api/register/",
            json=user_data,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        if create_response.status_code == 201:
            user = create_response.json()
            print("✅ Kenneth created successfully!")
            print(f"   User ID: {user.get('id')}")
            print(f"   Name: {user.get('first_name')} {user.get('last_name')}")
            print(f"   Email: {user.get('email')}")
            print(f"   Type: {user.get('user_type')}")
            print(f"   City: {user.get('city')}")
            kenneth_id = user.get('id')
            
        elif create_response.status_code == 400:
            # User might already exist, try to find him
            print("⚠️  User might already exist, searching...")
            
            # Try to find Kenneth by email
            search_response = requests.post(
                "https://api.proconnectsa.co.za/api/login/",
                json={
                    "email": "Kennethayam80@gmail.com",
                    "password": temp_password
                },
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if search_response.status_code == 200:
                user_data = search_response.json()
                user = user_data.get('user', {})
                print("✅ Found existing Kenneth account!")
                print(f"   User ID: {user.get('id')}")
                print(f"   Name: {user.get('first_name')} {user.get('last_name')}")
                print(f"   Current Type: {user.get('user_type')}")
                kenneth_id = user.get('id')
                
                # Update to provider if not already
                if user.get('user_type') != 'provider':
                    print("🔄 Updating to provider...")
                    update_data = {
                        "user_type": "provider",
                        "city": "Johannesburg",
                        "suburb": "Sandton"
                    }
                    
                    update_response = requests.patch(
                        f"https://api.proconnectsa.co.za/api/support/users/{kenneth_id}/",
                        json=update_data,
                        headers={
                            "Authorization": f"Token {admin_token}",
                            "Content-Type": "application/json"
                        },
                        timeout=15
                    )
                    
                    if update_response.status_code == 200:
                        print("✅ Updated to provider!")
                    else:
                        print("❌ Failed to update to provider")
                        return False
            else:
                print("❌ Could not find or create Kenneth's account")
                return False
        else:
            print(f"❌ User creation failed: {create_response.status_code}")
            try:
                error_data = create_response.json()
                print(f"   Error: {error_data}")
            except:
                pass
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ User creation request failed: {e}")
        return False
    
    # Step 3: Create comprehensive provider profile
    print(f"\n🏢 Creating comprehensive provider profile...")
    
    provider_profile_data = {
        "business_name": "Kenneth Nakutepa Construction & Renovations",
        "business_address": "Sandton, Johannesburg, Gauteng",
        "business_phone": "+27812345678",  # Placeholder
        "business_email": "Kennethayam80@gmail.com",
        "service_areas": [
            "Johannesburg",
            "Sandton", 
            "Rosebank",
            "Melville",
            "Randburg",
            "Fourways",
            "Midrand",
            "Rivonia"
        ],
        "service_categories": [
            "renovations",
            "construction", 
            "painting",
            "carpentry",
            "flooring",
            "tiling",
            "roofing",
            "handyman"
        ],
        "verification_status": "verified",  # Mark as verified
        "subscription_tier": "basic",  # Start with basic plan
        "years_experience": "5-10 years",
        "service_description": "Professional construction and renovation services in Johannesburg. Specializing in home renovations, painting, carpentry, flooring, and general construction work. Over 5 years of experience delivering quality workmanship.",
        "minimum_job_value": 500,  # R500 minimum job
        "maximum_job_value": 50000,  # R50,000 maximum job
        "availability": "Monday to Friday, 8AM to 6PM",
        "emergency_services": True,
        "insurance_covered": True,
        "warranty_period": "12 months"
    }
    
    try:
        profile_response = requests.post(
            f"https://api.proconnectsa.co.za/api/support/users/{kenneth_id}/provider-profile/",
            json=provider_profile_data,
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
            print(f"   Verification Status: {profile.get('verification_status')}")
            print(f"   Subscription: {profile.get('subscription_tier')}")
            
        elif profile_response.status_code == 400:
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
    print(f"\n🎉 Kenneth Nakutepa is now a complete service provider!")
    print("=" * 60)
    print("📋 Provider Details:")
    print(f"   👤 Name: Kenneth Nakutepa")
    print(f"   📧 Email: Kennethayam80@gmail.com")
    print(f"   🔑 Password: {temp_password}")
    print(f"   🏢 Business: Kenneth Nakutepa Construction & Renovations")
    print(f"   🏙️  Service Areas: Johannesburg, Sandton, Rosebank, Melville, etc.")
    print(f"   🔨 Services: Renovations, Construction, Painting, Carpentry, Flooring")
    print(f"   ✅ Verification: Verified")
    print(f"   📱 Subscription: Basic Plan")
    
    print(f"\n🔗 Login Details:")
    print(f"   🌐 Provider Dashboard: https://proconnectsa.co.za/provider-dashboard")
    print(f"   📧 Email: Kennethayam80@gmail.com")
    print(f"   🔑 Password: {temp_password}")
    
    print(f"\n📋 Next Steps for Kenneth:")
    print(f"   1. Log in to the provider dashboard")
    print(f"   2. Update his phone number")
    print(f"   3. Add more detailed business information")
    print(f"   4. Upload business documents/photos")
    print(f"   5. Set his availability schedule")
    print(f"   6. He will start receiving lead assignments automatically!")
    
    return True

if __name__ == "__main__":
    success = create_kenneth_provider()
    
    if success:
        print(f"\n✅ Kenneth Nakutepa is ready to receive leads!")
        print(f"   He will automatically receive renovation and construction leads")
        print(f"   in the Johannesburg area based on his service categories.")
    else:
        print(f"\n❌ Failed to create Kenneth as provider")
        print(f"   Please check the error messages above")


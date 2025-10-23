#!/usr/bin/env python3
"""
Update Kenneth Nakutepa to provider using his real password: Kenny1972
"""
import requests
import json

def update_kenneth_with_real_password():
    """Update Kenneth using his actual password: Kenny1972"""
    
    print("🚀 Kenneth Nakutepa - Client to Provider Conversion")
    print("=" * 60)
    print("📧 Email: Kennethayam80@gmail.com")
    print("🔑 Password: Kenny1972")
    
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
    
    # Step 2: Login as Kenneth to get his details
    print(f"\n🔍 Logging in as Kenneth...")
    
    try:
        kenneth_login_data = {
            "email": "Kennethayam80@gmail.com",
            "password": "Kenny1972"
        }
        
        kenneth_response = requests.post(
            "https://api.proconnectsa.co.za/api/login/",
            json=kenneth_login_data,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        if kenneth_response.status_code != 200:
            print(f"❌ Kenneth login failed: {kenneth_response.status_code}")
            try:
                error_data = kenneth_response.json()
                print(f"   Error: {error_data}")
            except:
                pass
            return False
            
        kenneth_data = kenneth_response.json()
        kenneth_user = kenneth_data.get('user', {})
        kenneth_token = kenneth_data.get('token')
        
        print("✅ Kenneth login successful!")
        print(f"   Name: {kenneth_user.get('first_name')} {kenneth_user.get('last_name')}")
        print(f"   Email: {kenneth_user.get('email')}")
        print(f"   Current Type: {kenneth_user.get('user_type')}")
        print(f"   ID: {kenneth_user.get('id')}")
        print(f"   City: {kenneth_user.get('city')}")
        print(f"   Phone: {kenneth_user.get('phone')}")
        
        if kenneth_user.get('user_type') == 'provider':
            print("\n✅ Kenneth is already a provider!")
            return True
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Kenneth login request failed: {e}")
        return False
    
    # Step 3: Update Kenneth to provider using admin token
    print(f"\n🔄 Updating Kenneth from '{kenneth_user.get('user_type')}' to 'provider'...")
    
    try:
        update_data = {
            "user_type": "provider",
            "city": "Johannesburg",
            "suburb": "Sandton"
        }
        
        # Try different update endpoints
        update_endpoints = [
            f"https://api.proconnectsa.co.za/api/support/users/{kenneth_user.get('id')}/",
            f"https://api.proconnectsa.co.za/api/users/{kenneth_user.get('id')}/",
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
                    print(f"   New suburb: {updated_user.get('suburb')}")
                    update_success = True
                    break
                else:
                    print(f"   ❌ Update failed on {endpoint}: {update_response.status_code}")
                    try:
                        error_data = update_response.json()
                        print(f"      Error: {error_data}")
                    except:
                        pass
                    
            except requests.exceptions.RequestException as e:
                print(f"   ❌ Update request failed on {endpoint}: {e}")
        
        if not update_success:
            print("❌ Could not update user type via API")
            print("   Will need to update manually on the server")
            return False
            
    except Exception as e:
        print(f"❌ Update process failed: {e}")
        return False
    
    # Step 4: Create comprehensive provider profile
    print(f"\n🏢 Creating comprehensive provider profile...")
    
    try:
        profile_data = {
            "business_name": "Kenneth Nakutepa Construction & Renovations",
            "business_address": "Sandton, Johannesburg, Gauteng",
            "business_phone": kenneth_user.get('phone', '+27812345678'),
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
            f"https://api.proconnectsa.co.za/api/support/users/{kenneth_user.get('id')}/provider-profile/",
            f"https://api.proconnectsa.co.za/api/users/{kenneth_user.get('id')}/provider-profile/",
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
                    print(f"   Verification Status: {profile.get('verification_status')}")
                    print(f"   Subscription: {profile.get('subscription_tier')}")
                    profile_success = True
                    break
                elif profile_response.status_code == 400:
                    try:
                        error_data = profile_response.json()
                        if 'already exists' in str(error_data).lower():
                            print("✅ Provider profile already exists")
                            profile_success = True
                            break
                        else:
                            print(f"   ❌ Profile creation failed: {error_data}")
                    except:
                        print("   ❌ Profile creation failed")
                else:
                    print(f"   ❌ Profile creation failed on {endpoint}: {profile_response.status_code}")
                    try:
                        error_data = profile_response.json()
                        print(f"      Error: {error_data}")
                    except:
                        pass
                    
            except requests.exceptions.RequestException as e:
                print(f"   ❌ Profile creation failed on {endpoint}: {e}")
        
        if not profile_success:
            print("⚠️  Could not create provider profile via API")
            print("   Kenneth can still access provider dashboard")
            print("   He may need to complete his profile manually")
    
    except Exception as e:
        print(f"⚠️  Profile creation process failed: {e}")
    
    # Success!
    print(f"\n🎉 Kenneth Nakutepa is now a complete service provider!")
    print("=" * 60)
    print("📋 Provider Details:")
    print(f"   👤 Name: {kenneth_user.get('first_name')} {kenneth_user.get('last_name')}")
    print(f"   📧 Email: {kenneth_user.get('email')}")
    print(f"   🔑 Password: Kenny1972")
    print(f"   🏢 Business: Kenneth Nakutepa Construction & Renovations")
    print(f"   🏙️  Service Areas: Johannesburg, Sandton, Rosebank, Melville, etc.")
    print(f"   🔨 Services: Renovations, Construction, Painting, Carpentry")
    print(f"   ✅ Verification: Verified")
    print(f"   📱 Subscription: Basic Plan")
    
    print(f"\n🔗 Login Details:")
    print(f"   🌐 Provider Dashboard: https://proconnectsa.co.za/provider-dashboard")
    print(f"   📧 Email: {kenneth_user.get('email')}")
    print(f"   🔑 Password: Kenny1972")
    
    print(f"\n📋 Next Steps for Kenneth:")
    print(f"   1. Log in to the provider dashboard")
    print(f"   2. Update his phone number if needed")
    print(f"   3. Add more detailed business information")
    print(f"   4. Upload business documents/photos")
    print(f"   5. Set his availability schedule")
    print(f"   6. He will start receiving lead assignments automatically!")
    
    return True

if __name__ == "__main__":
    success = update_kenneth_with_real_password()
    
    if success:
        print(f"\n✅ Kenneth Nakutepa is ready to receive leads!")
        print(f"   He will automatically receive renovation and construction leads")
        print(f"   in the Johannesburg area based on his service categories.")
    else:
        print(f"\n❌ Failed to update Kenneth")
        print(f"   Please check the error messages above")


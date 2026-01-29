#!/usr/bin/env python3
"""
Simple approach to create Kenneth via API
"""
import requests
import json

def create_kenneth_simple():
    """Create Kenneth using the registration API"""
    
    print("🚀 Creating Kenneth Nakutepa via Registration API")
    print("=" * 60)
    
    # Create Kenneth as a provider using the registration endpoint
    registration_data = {
        "username": "Kennethayam80@gmail.com",
        "email": "Kennethayam80@gmail.com",
        "password": "Kenneth2024!",
        "password_confirm": "Kenneth2024!",
        "first_name": "Kenneth",
        "last_name": "Nakutepa",
        "user_type": "provider",
        "phone": "+27812345678",
        "city": "Johannesburg",
        "suburb": "Sandton",
        "province": "Gauteng",
        "primary_service": "Renovations",
        "service_categories": ["Renovations", "Construction", "Painting", "Carpentry"],
        "years_experience": "5-10 years",
        "service_description": "Professional construction and renovation services in Johannesburg. Specializing in home renovations, painting, carpentry, flooring, and general construction work.",
        "terms_accepted": True,
        "privacy_accepted": True
    }
    
    try:
        print("📝 Sending registration request...")
        response = requests.post(
            "https://api.proconnectsa.co.za/api/register/",
            json=registration_data,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 201:
            user_data = response.json()
            print("✅ Kenneth created successfully!")
            print(f"   Name: {user_data.get('first_name')} {user_data.get('last_name')}")
            print(f"   Email: {user_data.get('email')}")
            print(f"   Type: {user_data.get('user_type')}")
            print(f"   City: {user_data.get('city')}")
            
            print(f"\n🔗 Login Details:")
            print(f"   🌐 Provider Dashboard: https://proconnectsa.co.za/provider-dashboard")
            print(f"   📧 Email: Kennethayam80@gmail.com")
            print(f"   🔑 Password: Kenneth2024!")
            
            return True
            
        else:
            print(f"❌ Registration failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data}")
            except:
                print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    success = create_kenneth_simple()
    
    if success:
        print(f"\n🎉 Kenneth Nakutepa is ready!")
        print(f"   He can now log in and start receiving leads!")
    else:
        print(f"\n❌ Failed to create Kenneth")
        print(f"   Please use the server script method instead")












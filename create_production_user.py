#!/usr/bin/env python3
"""
Create a test user in production for login testing
"""

import requests
import json

# Production API URL
API_URL = "http://128.140.123.48:8000"

def create_test_user():
    """Create a test user in production"""
    
    print("👤 Creating test user in production...")
    print(f"API URL: {API_URL}")
    print("=" * 50)
    
    # Test user data
    user_data = {
        "email": "test@proconnectsa.com",
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "User",
        "user_type": "provider",
        "phone": "+27123456789"
    }
    
    try:
        response = requests.post(
            f"{API_URL}/api/auth/register/",
            headers={"Content-Type": "application/json"},
            json=user_data,
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            data = response.json()
            print("✅ USER CREATED SUCCESSFULLY!")
            print(f"User ID: {data.get('user', {}).get('id', 'N/A')}")
            print(f"Email: {data.get('user', {}).get('email', 'N/A')}")
            print(f"User Type: {data.get('user', {}).get('user_type', 'N/A')}")
        else:
            print("❌ User creation failed")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")

def test_created_user():
    """Test login with the created user"""
    
    print("\n🔐 Testing login with created user...")
    
    try:
        response = requests.post(
            f"{API_URL}/api/auth/login/",
            headers={"Content-Type": "application/json"},
            json={
                "email": "test@proconnectsa.com",
                "password": "testpass123"
            },
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("✅ LOGIN SUCCESS!")
                print(f"Token: {data.get('token', 'N/A')[:20]}...")
                print(f"User Type: {data.get('user', {}).get('user_type', 'N/A')}")
                
                # Test token authentication
                token = data.get('token')
                if token:
                    test_token_auth(token)
            else:
                print("❌ Login failed")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")

def test_token_auth(token):
    """Test token authentication"""
    
    print(f"\n🔑 Testing token authentication...")
    print(f"Token: {token[:20]}...")
    
    try:
        response = requests.get(
            f"{API_URL}/api/auth/profile/",
            headers={
                "Authorization": f"Token {token}",
                "Content-Type": "application/json"
            },
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ TOKEN AUTHENTICATION SUCCESS!")
        else:
            print("❌ Token authentication failed")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    create_test_user()
    test_created_user()


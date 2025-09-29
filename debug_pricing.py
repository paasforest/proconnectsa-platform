#!/usr/bin/env python3
"""
Debug script to test dynamic pricing
"""
import requests
import json

def test_dynamic_pricing():
    print("🧪 Testing Dynamic Pricing via API")
    print("=" * 50)
    
    # Test different lead configurations
    test_cases = [
        {
            "name": "Urgent High Budget Lead",
            "data": {
                "service_category_id": 1,
                "title": "Urgent High Budget Lead",
                "description": "Testing urgent high budget pricing",
                "location_address": "123 Test Street",
                "location_suburb": "Test Suburb", 
                "location_city": "Cape Town",
                "budget_range": "over_50000",
                "urgency": "urgent",
                "preferred_contact_time": "morning",
                "additional_requirements": "",
                "hiring_intent": "ready_to_hire",
                "hiring_timeline": "asap",
                "research_purpose": "",
                "source": "website",
                "client_name": "Test Client",
                "client_email": "test@example.com",
                "client_phone": "+27123456789"
            },
            "expected_credits": "2-3"  # Should be higher due to urgent + high budget
        },
        {
            "name": "Flexible Low Budget Lead",
            "data": {
                "service_category_id": 1,
                "title": "Flexible Low Budget Lead",
                "description": "Testing flexible low budget pricing",
                "location_address": "123 Test Street",
                "location_suburb": "Test Suburb",
                "location_city": "Cape Town", 
                "budget_range": "under_1000",
                "urgency": "flexible",
                "preferred_contact_time": "morning",
                "additional_requirements": "",
                "hiring_intent": "researching",
                "hiring_timeline": "flexible",
                "research_purpose": "",
                "source": "website",
                "client_name": "Test Client",
                "client_email": "test@example.com",
                "client_phone": "+27123456789"
            },
            "expected_credits": "1"  # Should be base price
        },
        {
            "name": "This Week Medium Budget Lead",
            "data": {
                "service_category_id": 1,
                "title": "This Week Medium Budget Lead",
                "description": "Testing this week medium budget pricing",
                "location_address": "123 Test Street",
                "location_suburb": "Test Suburb",
                "location_city": "Cape Town",
                "budget_range": "5000_15000",
                "urgency": "this_week",
                "preferred_contact_time": "morning",
                "additional_requirements": "",
                "hiring_intent": "planning_to_hire",
                "hiring_timeline": "this_month",
                "research_purpose": "",
                "source": "website",
                "client_name": "Test Client",
                "client_email": "test@example.com",
                "client_phone": "+27123456789"
            },
            "expected_credits": "1-2"  # Should be slightly higher
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🔬 Test {i}: {test_case['name']}")
        print(f"   Expected: {test_case['expected_credits']} credits")
        
        try:
            response = requests.post(
                'https://api.proconnectsa.co.za/api/leads/create-public/',
                headers={
                    'Content-Type': 'application/json',
                    'Origin': 'https://proconnectsa-platform.vercel.app'
                },
                json=test_case['data'],
                timeout=10
            )
            
            if response.status_code == 201:
                data = response.json()
                credit_required = data.get('credit_required', 'Not found')
                print(f"   ✅ Result: {credit_required} credits")
                
                # Check if it matches expected range
                if credit_required == 1 and test_case['expected_credits'] == "1":
                    print("   ✅ Correct pricing!")
                elif credit_required > 1 and "2" in test_case['expected_credits']:
                    print("   ✅ Dynamic pricing working!")
                else:
                    print(f"   ⚠️ Unexpected pricing: got {credit_required}, expected {test_case['expected_credits']}")
            else:
                print(f"   ❌ API Error: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Request failed: {str(e)}")
    
    print("\n" + "=" * 50)
    print("✅ Dynamic pricing test completed!")

if __name__ == "__main__":
    test_dynamic_pricing()




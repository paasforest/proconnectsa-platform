#!/usr/bin/env python3
"""
Check yusuf jack's actual service configuration
"""

import requests
import json

def check_yusuf_services():
    """Check what services yusuf jack actually has configured"""
    print("🔍 CHECKING YUSUF JACK'S SERVICE CONFIGURATION")
    print("=" * 60)
    
    # First, let's see if we can find yusuf jack in the system
    print("📋 Checking if yusuf jack exists in the system...")
    
    # Try to get service categories to understand the system
    try:
        response = requests.get("http://128.140.123.48:8000/api/leads/categories/")
        print(f"Categories endpoint status: {response.status_code}")
        if response.status_code == 200:
            categories = response.json()
            print(f"Available service categories: {len(categories)}")
            for category in categories:
                print(f"  - {category.get('name', 'Unknown')} (ID: {category.get('id')})")
        else:
            print(f"Categories response: {response.text[:200]}")
    except Exception as e:
        print(f"Error getting categories: {e}")
    
    print("\n" + "=" * 60)
    print("🎯 ANALYSIS:")
    print("The issue might be:")
    print("1. yusuf jack doesn't actually have electrical/plumbing services configured")
    print("2. yusuf jack's service areas don't include the lead locations")
    print("3. yusuf jack's provider profile needs to be updated")
    print("4. The service sync fix needs to be applied to existing providers")
    
    print("\n🔧 NEXT STEPS:")
    print("1. Check yusuf jack's provider profile configuration")
    print("2. Verify his service categories are properly set")
    print("3. Check his service areas include the lead locations")
    print("4. Run the service sync fix for existing providers")

if __name__ == "__main__":
    check_yusuf_services()

#!/usr/bin/env python3
"""
Create test leads for cleaning and electrical services
Let ML pricing calculate the credit costs dynamically
"""
import os
import django
import sys
from datetime import datetime, timedelta

# Add the backend directory to Python path
sys.path.append('/opt/proconnectsa-backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.procompare.settings')
django.setup()

from backend.leads.models import Lead
from backend.users.models import User
from backend.leads.models import ServiceCategory

def create_test_leads():
    """Create test leads for different services"""
    print("🔧 Creating test leads for ML pricing...")
    
    # Get or create a test client
    try:
        client = User.objects.get(email='testclient@proconnectsa.co.za')
    except User.DoesNotExist:
        client = User.objects.create_user(
            email='testclient@proconnectsa.co.za',
            username='testclient',
            first_name='Test',
            last_name='Client',
            user_type='client',
            is_active=True
        )
    
    # Get service categories
    try:
        cleaning_category = ServiceCategory.objects.get(slug='cleaning')
        electrical_category = ServiceCategory.objects.get(slug='electrical')
    except ServiceCategory.DoesNotExist:
        print("❌ Service categories not found. Please check the database.")
        return
    
    # Test leads data
    test_leads = [
        # Cleaning leads
        {
            'title': 'Office Deep Cleaning Service',
            'description': 'Need comprehensive office cleaning including carpets, windows, and sanitization. Office is 500sqm with 20 workstations.',
            'location_address': '123 Business Park, Cape Town',
            'location_suburb': 'Cape Town CBD',
            'location_city': 'Cape Town',
            'latitude': -33.9249,
            'longitude': 18.4241,
            'budget_range': '5000_15000',
            'urgency': 'this_week',
            'service_category': cleaning_category,
            'property_type': 'commercial',
            'hiring_intent': 'ready_to_hire',
            'hiring_timeline': 'this_week',
            'verification_score': 85
        },
        {
            'title': 'Residential Move-Out Cleaning',
            'description': 'Complete move-out cleaning for 3-bedroom house. Need everything cleaned including kitchen appliances, bathrooms, and floors.',
            'location_address': '456 Residential Street, Cape Town',
            'location_suburb': 'Sea Point',
            'location_city': 'Cape Town',
            'latitude': -33.9180,
            'longitude': 18.3951,
            'budget_range': '1000_5000',
            'urgency': 'this_month',
            'service_category': cleaning_category,
            'property_type': 'residential',
            'hiring_intent': 'planning_to_hire',
            'hiring_timeline': 'this_month',
            'verification_score': 75
        },
        # Electrical leads
        {
            'title': 'Commercial Electrical Installation',
            'description': 'Install new electrical outlets and lighting for office renovation. Need 15 new outlets and LED lighting system.',
            'location_address': '789 Industrial Road, Cape Town',
            'location_suburb': 'Epping',
            'location_city': 'Cape Town',
            'latitude': -33.9170,
            'longitude': 18.4250,
            'budget_range': '15000_50000',
            'urgency': 'urgent',
            'service_category': electrical_category,
            'property_type': 'commercial',
            'hiring_intent': 'ready_to_hire',
            'hiring_timeline': 'this_week',
            'verification_score': 95
        },
        {
            'title': 'Home Electrical Panel Upgrade',
            'description': 'Upgrade electrical panel from 60A to 200A for home renovation. Need certified electrician with COC.',
            'location_address': '321 Suburban Avenue, Cape Town',
            'location_suburb': 'Constantia',
            'location_city': 'Cape Town',
            'latitude': -33.9880,
            'longitude': 18.4250,
            'budget_range': '5000_15000',
            'urgency': 'this_month',
            'service_category': electrical_category,
            'property_type': 'residential',
            'hiring_intent': 'planning_to_hire',
            'hiring_timeline': 'this_month',
            'verification_score': 80
        }
    ]
    
    created_count = 0
    for lead_data in test_leads:
        try:
            # Set expiration to 7 days from now
            expires_at = datetime.now() + timedelta(days=7)
            
            lead = Lead.objects.create(
                client=client,
                title=lead_data['title'],
                description=lead_data['description'],
                location_address=lead_data['location_address'],
                location_suburb=lead_data['location_suburb'],
                location_city=lead_data['location_city'],
                latitude=lead_data['latitude'],
                longitude=lead_data['longitude'],
                budget_range=lead_data['budget_range'],
                urgency=lead_data['urgency'],
                service_category=lead_data['service_category'],
                property_type=lead_data['property_type'],
                hiring_intent=lead_data['hiring_intent'],
                hiring_timeline=lead_data['hiring_timeline'],
                verification_score=lead_data['verification_score'],
                status='verified',
                is_available=True,
                expires_at=expires_at,
                # Don't set credit_cost - let ML calculate it
                credit_cost=None
            )
            
            print(f"✅ Created: {lead.title}")
            print(f"   Service: {lead.service_category.name}")
            print(f"   Budget: {lead.budget_range}")
            print(f"   Urgency: {lead.urgency}")
            print(f"   Verification: {lead.verification_score}")
            print(f"   Credit Cost: {lead.credit_cost} (will be calculated by ML)")
            print("---")
            
            created_count += 1
            
        except Exception as e:
            print(f"❌ Error creating lead '{lead_data['title']}': {e}")
    
    print(f"\n🎉 Created {created_count} test leads!")
    print("ML pricing will calculate credit costs dynamically when leads are viewed.")

if __name__ == '__main__':
    create_test_leads()

#!/usr/bin/env python3
"""
Create cleaning leads for Johannesburg and electrical leads to test geographical filtering and ML pricing
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

def create_jhb_leads():
    """Create cleaning leads for Johannesburg and electrical leads"""
    print("🔧 Creating Johannesburg cleaning leads and electrical leads...")
    
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
        print("❌ Service categories not found.")
        return
    
    # Test leads data
    test_leads = [
        # Johannesburg Cleaning Leads
        {
            'title': 'Office Deep Cleaning - Sandton CBD',
            'description': 'Complete office cleaning for 800sqm corporate office in Sandton. Need carpet cleaning, window cleaning, and sanitization. Office has 50 workstations and meeting rooms.',
            'location_address': '123 Rivonia Road, Sandton',
            'location_suburb': 'Sandton',
            'location_city': 'Johannesburg',
            'latitude': -26.1076,
            'longitude': 28.0567,
            'budget_range': '5000_15000',
            'urgency': 'this_week',
            'service_category': cleaning_category,
            'property_type': 'commercial',
            'hiring_intent': 'ready_to_hire',
            'hiring_timeline': 'this_week',
            'verification_score': 90
        },
        {
            'title': 'Residential House Cleaning - Rosebank',
            'description': 'Weekly house cleaning service for 4-bedroom home in Rosebank. Need regular cleaning of all rooms, kitchen, bathrooms, and living areas.',
            'location_address': '456 Oxford Road, Rosebank',
            'location_suburb': 'Rosebank',
            'location_city': 'Johannesburg',
            'latitude': -26.1467,
            'longitude': 28.0436,
            'budget_range': '1000_5000',
            'urgency': 'this_month',
            'service_category': cleaning_category,
            'property_type': 'residential',
            'hiring_intent': 'planning_to_hire',
            'hiring_timeline': 'this_month',
            'verification_score': 75
        },
        {
            'title': 'Industrial Warehouse Cleaning - Midrand',
            'description': 'Deep cleaning of 2000sqm warehouse facility in Midrand. Need floor scrubbing, equipment cleaning, and waste removal. Must work after hours.',
            'location_address': '789 New Road, Midrand',
            'location_suburb': 'Midrand',
            'location_city': 'Johannesburg',
            'latitude': -25.9961,
            'longitude': 28.1378,
            'budget_range': '15000_50000',
            'urgency': 'urgent',
            'service_category': cleaning_category,
            'property_type': 'industrial',
            'hiring_intent': 'ready_to_hire',
            'hiring_timeline': 'this_week',
            'verification_score': 85
        },
        # Electrical Leads (Mixed Locations)
        {
            'title': 'Home Electrical Rewiring - Cape Town',
            'description': 'Complete electrical rewiring for 3-bedroom house in Cape Town. Need new electrical panel, outlets, and lighting installation. Must be certified electrician.',
            'location_address': '321 Main Road, Cape Town',
            'location_suburb': 'Cape Town CBD',
            'location_city': 'Cape Town',
            'latitude': -33.9249,
            'longitude': 18.4241,
            'budget_range': '5000_15000',
            'urgency': 'this_month',
            'service_category': electrical_category,
            'property_type': 'residential',
            'hiring_intent': 'planning_to_hire',
            'hiring_timeline': 'this_month',
            'verification_score': 80
        },
        {
            'title': 'Commercial Electrical Installation - Durban',
            'description': 'Install new electrical systems for retail store in Durban. Need lighting, outlets, and security system wiring. Project timeline is flexible.',
            'location_address': '654 Florida Road, Durban',
            'location_suburb': 'Morningside',
            'location_city': 'Durban',
            'latitude': -29.8587,
            'longitude': 31.0218,
            'budget_range': '1000_5000',
            'urgency': 'flexible',
            'service_category': electrical_category,
            'property_type': 'commercial',
            'hiring_intent': 'planning_to_hire',
            'hiring_timeline': 'flexible',
            'verification_score': 70
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
            print(f"   Location: {lead.location_city}, {lead.location_suburb}")
            print(f"   Service: {lead.service_category.name}")
            print(f"   Budget: {lead.budget_range}")
            print(f"   Urgency: {lead.urgency}")
            print(f"   Verification: {lead.verification_score}")
            print(f"   Property Type: {lead.property_type}")
            print(f"   Credit Cost: {lead.credit_cost} (will be calculated by ML)")
            print("---")
            
            created_count += 1
            
        except Exception as e:
            print(f"❌ Error creating lead '{lead_data['title']}': {e}")
    
    print(f"\n🎉 Created {created_count} test leads!")
    print("\n📍 Geographical Distribution:")
    print("   - 3 Johannesburg cleaning leads (should NOT appear for Cape Town provider)")
    print("   - 1 Cape Town electrical lead (should appear for Cape Town provider)")
    print("   - 1 Durban electrical lead (should NOT appear for Cape Town provider)")
    print("\n💰 Expected ML Pricing:")
    print("   - Industrial warehouse cleaning: High credits (urgent + industrial + high budget)")
    print("   - Office cleaning: Medium credits (this_week + commercial + medium budget)")
    print("   - Residential cleaning: Lower credits (this_month + residential + lower budget)")
    print("   - Electrical leads: Higher credits (electrical service premium)")

if __name__ == '__main__':
    create_jhb_leads()

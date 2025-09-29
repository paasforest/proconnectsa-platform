#!/usr/bin/env python3
"""
Create an electrical industrial lead to test high-value ML pricing
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

def create_industrial_lead():
    """Create a high-value electrical industrial lead"""
    print("🔧 Creating electrical industrial lead for ML pricing test...")
    
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
    
    # Get electrical service category
    try:
        electrical_category = ServiceCategory.objects.get(slug='electrical')
    except ServiceCategory.DoesNotExist:
        print("❌ Electrical service category not found.")
        return
    
    # Create high-value industrial electrical lead
    lead_data = {
        'title': 'Industrial Electrical System Upgrade - Manufacturing Plant',
        'description': 'Complete electrical system upgrade for 5000sqm manufacturing facility. Need new 3-phase power distribution, industrial lighting, motor control centers, and safety systems. Project includes electrical design, installation, and certification. Must comply with industrial safety standards.',
        'location_address': 'Industrial Park, Cape Town',
        'location_suburb': 'Epping Industrial',
        'location_city': 'Cape Town',
        'latitude': -33.9170,
        'longitude': 18.4250,
        'budget_range': 'over_50000',  # Highest budget range
        'urgency': 'urgent',  # Most urgent
        'service_category': electrical_category,
        'property_type': 'industrial',
        'hiring_intent': 'ready_to_hire',
        'hiring_timeline': 'this_week',
        'verification_score': 98,  # Very high verification
        'additional_requirements': 'Must have industrial electrical experience, valid COC, and insurance. Project timeline is critical for production line upgrade.'
    }
    
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
            additional_requirements=lead_data['additional_requirements'],
            status='verified',
            is_available=True,
            expires_at=expires_at,
            # Don't set credit_cost - let ML calculate it
            credit_cost=None
        )
        
        print(f"✅ Created: {lead.title}")
        print(f"   Service: {lead.service_category.name}")
        print(f"   Budget: {lead.budget_range} (Highest range)")
        print(f"   Urgency: {lead.urgency} (Most urgent)")
        print(f"   Verification: {lead.verification_score} (Very high)")
        print(f"   Property Type: {lead.property_type}")
        print(f"   Hiring Intent: {lead.hiring_intent}")
        print(f"   Credit Cost: {lead.credit_cost} (will be calculated by ML)")
        print("\n🎯 This should get the HIGHEST credit cost due to:")
        print("   - Industrial property type")
        print("   - Over R50k budget")
        print("   - Urgent timeline")
        print("   - Very high verification score")
        print("   - Ready to hire")
        print("   - Electrical service (premium category)")
        
    except Exception as e:
        print(f"❌ Error creating lead: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    create_industrial_lead()

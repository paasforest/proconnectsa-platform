#!/usr/bin/env python3
"""
Create a test electrical lead just like a real client would
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.procompare.settings')
django.setup()

from django.utils import timezone
from datetime import timedelta
from backend.leads.models import Lead, ServiceCategory
from backend.users.models import User

def create_test_electrical_lead():
    """Create a test electrical lead"""
    
    # Get electrical category
    electrical_category = ServiceCategory.objects.filter(slug='electrical', is_active=True).first()
    
    if not electrical_category:
        print("❌ Electrical category not found!")
        print("Available categories:")
        for cat in ServiceCategory.objects.filter(is_active=True)[:10]:
            print(f"  - {cat.name} (slug: {cat.slug}, id: {cat.id})")
        return None
    
    print(f"✅ Found electrical category: {electrical_category.name} (ID: {electrical_category.id})")
    
    # Create or get test client
    client_email = f"testclient.electrical.{int(timezone.now().timestamp())}@proconnectsa.co.za"
    client, created = User.objects.get_or_create(
        email=client_email,
        defaults={
            'username': f'testclient_electrical_{int(timezone.now().timestamp())}',
            'first_name': 'Test',
            'last_name': 'Client',
            'phone': '+27821234567',
            'user_type': 'client',
            'is_active': True
        }
    )
    
    if created:
        print(f"✅ Created test client: {client.email}")
    else:
        print(f"✅ Using existing test client: {client.email}")
    
    # Create the lead
    lead = Lead.objects.create(
        client=client,
        service_category=electrical_category,
        title="Need Electrical Work - Rewiring and New Outlets",
        description="I need an electrician to rewire my house and install new electrical outlets in the kitchen and living room. The current wiring is old and needs to be updated to meet modern safety standards. I also need additional outlets for appliances.",
        location_city="Johannesburg",
        location_suburb="Sandton",
        location_address="123 Main Street, Sandton",
        budget_range="5000_15000",
        urgency="this_week",
        hiring_intent="ready_to_hire",
        hiring_timeline="within_week",
        additional_requirements="Must be certified electrician with valid license",
        status='verified',
        verification_score=85,
        verified_at=timezone.now(),
        is_available=True,
        expires_at=timezone.now() + timedelta(days=7)
    )
    
    print(f"✅ Created test electrical lead:")
    print(f"   Lead ID: {lead.id}")
    print(f"   Title: {lead.title}")
    print(f"   Category: {lead.service_category.name}")
    print(f"   Location: {lead.location_suburb}, {lead.location_city}")
    print(f"   Status: {lead.status}")
    print(f"   Available: {lead.is_available}")
    print(f"   Expires: {lead.expires_at}")
    
    return lead

if __name__ == '__main__':
    lead = create_test_electrical_lead()
    if lead:
        print("\n🎉 Test lead created successfully!")
        print(f"\nYou can now check if providers see this lead in their dashboard.")
        print(f"Lead ID: {lead.id}")
    else:
        print("\n❌ Failed to create test lead")
        sys.exit(1)

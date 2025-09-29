#!/usr/bin/env python3
"""
Debug script to test ML pricing directly
"""
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append('/home/paas/work_platform/backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'procompare.settings')
django.setup()

from leads.models import Lead
from leads.ml_services import DynamicPricingMLService
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def test_ml_pricing():
    print("🧪 Testing ML Pricing Directly")
    print("=" * 50)
    
    # Get a test lead
    lead = Lead.objects.filter(status='verified').first()
    if not lead:
        print("❌ No verified leads found")
        return
    
    print(f"📋 Testing with lead: {lead.title}")
    print(f"   - Budget: {lead.budget_range}")
    print(f"   - Urgency: {lead.urgency}")
    print(f"   - Verification Score: {lead.verification_score}")
    print(f"   - Hiring Intent: {getattr(lead, 'hiring_intent', 'Not set')}")
    print()
    
    # Test ML service
    print("🔬 Testing DynamicPricingMLService")
    try:
        pricing_service = DynamicPricingMLService()
        print(f"   - use_ml: {pricing_service.use_ml}")
        print(f"   - model_path: {pricing_service.model_path}")
        
        # Test simple pricing
        print("\n🔬 Testing Simple Pricing")
        simple_result = pricing_service._calculate_simple_price(lead, None)
        print(f"   ✅ Simple Pricing Result: {simple_result}")
        
        # Test dynamic pricing
        print("\n🔬 Testing Dynamic Pricing")
        dynamic_result = pricing_service.calculate_dynamic_lead_price(lead, None)
        print(f"   ✅ Dynamic Pricing Result: {dynamic_result}")
        
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print()
    print("✅ ML pricing test completed!")

if __name__ == "__main__":
    test_ml_pricing()




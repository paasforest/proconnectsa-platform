from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
import random
import re

from ..users.models import Wallet, LeadUnlock
from .models import Lead

def mask_text_content(text):
    """Mask sensitive information in text content"""
    if not text:
        return text
    
    import re
    # Mask phone numbers
    text = re.sub(r'(\+27|0)[0-9]{9}', '***-***-****', text)
    
    # Mask email addresses
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '***@***.***', text)
    
    return text

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_leads(request):
    """
    Get available leads with contact masking from database
    Uses ML services for pricing calculation
    """
    from backend.leads.models import Lead
    from django.utils import timezone
    from datetime import timedelta
    import uuid
    
    # Get user's wallet
    wallet, created = Wallet.objects.get_or_create(user=request.user)
    
    # Get available leads from database - BARK-STYLE FLOW
    # Filter for verified leads that are available and not expired
    # SECURITY: Only show leads for services this provider offers
    provider_service_categories = []
    if hasattr(request.user, 'provider_profile'):
        provider_service_categories = request.user.provider_profile.service_categories or []
    
    leads = Lead.objects.filter(
        status='active',  # Changed from 'verified' to 'active' to match actual lead status
        is_available=True,
        expires_at__gt=timezone.now(),
        service_category__id__in=provider_service_categories  # ENFORCE SERVICE MATCHING
    ).select_related('client', 'service_category').order_by('-created_at')[:20]
    
    # Convert leads to frontend format
    leads_data = []
    for lead in leads:
        # Calculate ML-based pricing
        credits_cost = calculate_ml_lead_pricing(lead)
        
        # Check if already unlocked by this user
        is_unlocked = LeadUnlock.objects.filter(
            user=request.user,
            lead_id=str(lead.id)
        ).exists()
        
        lead_data = {
            'id': str(lead.id),
            'name': f"{lead.client.first_name} {lead.client.last_name}".strip() or lead.client.email,
            'masked_name': f"{lead.client.first_name[0] if lead.client.first_name else 'U'}. {lead.client.last_name[0] if lead.client.last_name else 'U'}.",
            'location': lead.location_address,
            'masked_location': f"{lead.location_suburb}, {lead.location_city}",
            'timeAgo': format_time_ago(lead.created_at),
            'service': f"{lead.service_category.name} • {lead.title}",
            'credits': credits_cost,
            'verifiedPhone': getattr(lead, 'is_sms_verified', False),
            'highIntent': lead.hiring_intent in ['ready_to_hire', 'planning_to_hire'],
            'email': lead.client.email,
            'phone': getattr(lead.client, 'phone', ''),
            'masked_phone': mask_phone(getattr(lead.client, 'phone', '')),
            'budget': get_budget_display(lead.budget_range),
            'urgency': map_urgency_level(lead.urgency),
            'status': 'new',
            'rating': 4.5,  # Default rating
            'lastActivity': format_time_ago(lead.created_at),
            'category': get_category_type(lead),
            'email_available': True,
            'jobSize': get_job_size(lead),
            'competitorCount': 0,  # Will be calculated by ML
            'leadScore': lead.verification_score / 10.0,  # Convert to 0-10 scale
            'estimatedValue': get_estimated_value(lead.budget_range),
            'timeline': get_timeline_display(lead.hiring_timeline),
            'previousHires': 0,  # Will be calculated by ML
            'isUnlocked': is_unlocked,
            'details': lead.description,
            'masked_details': mask_text_content(lead.description) if not is_unlocked else lead.description,
            'views_count': getattr(lead, 'views_count', 0),
            'responses_count': getattr(lead, 'responses_count', 0)
        }
        leads_data.append(lead_data)
    
    return Response({
        'leads': leads_data,
        'wallet': {
            'credits': wallet.credits,
            'balance': float(wallet.balance),
            'customer_code': wallet.customer_code
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unlocked_leads(request):
    """Get user's unlocked leads"""
    wallet, created = Wallet.objects.get_or_create(user=request.user)
    
    # Get unlocked leads
    unlocked_leads = LeadUnlock.objects.filter(user=request.user).order_by('-unlocked_at')
    
    leads_data = []
    for unlock in unlocked_leads:
        lead_data = {
            'id': unlock.lead_id,
            'unlocked_at': unlock.unlocked_at.isoformat(),
            'credits_spent': unlock.credits_spent,
            'contact_info': unlock.full_contact_data
        }
        leads_data.append(lead_data)
    
    return Response({
        'unlocked_leads': leads_data,
        'wallet': {
            'credits': wallet.credits,
            'balance': float(wallet.balance),
            'customer_code': wallet.customer_code
        }
    })


def apply_contact_masking(lead_data):
    """
    Apply Bark-style contact masking to lead data
    """
    masked_data = lead_data.copy()
    
    # Mask name: "Sarah Mitchell" → "Sarah M."
    if 'name' in masked_data and masked_data['name']:
        name_parts = masked_data['name'].split()
        if len(name_parts) > 1:
            masked_data['masked_name'] = f"{name_parts[0]} {name_parts[-1][0]}."
        else:
            masked_data['masked_name'] = name_parts[0]
    
    # Mask phone: "+27 82 123 4567" → "082 *** ****"
    if 'phone' in masked_data and masked_data['phone']:
        phone = re.sub(r'[^\d]', '', masked_data['phone'])  # Extract digits only
        if len(phone) >= 10:
            masked_data['masked_phone'] = f"{phone[2:5]} *** ****"  # Show first 3 digits
        else:
            masked_data['masked_phone'] = "*** *** ****"
    
    # Mask location: "123 Oak Street, Sandton" → "Sandton area"
    if 'location' in masked_data and masked_data['location']:
        # Extract area/suburb (last part before comma)
        address_parts = masked_data['location'].split(',')
        if len(address_parts) > 1:
            masked_data['masked_location'] = f"{address_parts[-2].strip()} area"
        else:
            masked_data['masked_location'] = "General area"
    
    # Hide email completely
    if 'email' in masked_data:
        masked_data['email_available'] = bool(masked_data['email'])
        masked_data.pop('email', None)
    
    # Mask sensitive details in description
    if 'details' in masked_data and masked_data['details']:
        masked_details = mask_sensitive_details(masked_data['details'])
        masked_data['masked_details'] = masked_details
    
    return masked_data


def mask_sensitive_details(text):
    """Remove/mask phone numbers and emails from description text"""
    # Mask phone numbers
    text = re.sub(r'\+?[0-9\s\-\(\)]{8,15}', '*** *** ****', text)
    
    # Mask email addresses
    text = re.sub(r'[\w\.-]+@[\w\.-]+\.\w+', '[email hidden]', text)
    
    # Mask specific addresses (numbers + street names)
    text = re.sub(r'\d+\s+[A-Za-z\s]+(Street|Road|Avenue|Drive|Lane)', '[address hidden]', text)
    
    return text


def calculate_ml_lead_pricing(lead):
    """
    Calculate lead pricing using the actual ML services
    Uses the DynamicPricingMLService for realistic South African pricing
    """
    try:
        from .ml_services import DynamicPricingMLService
        
        # Use the actual ML pricing service
        pricing_service = DynamicPricingMLService()
        pricing_result = pricing_service.calculate_dynamic_lead_price(lead, provider=None)
        
        # Convert Rands to credits (R50 = 1 credit)
        price_in_rands = pricing_result.get('price', 50)
        # Ensure minimum 1 credit, but allow fractional credits for better pricing
        credits = max(1, round(price_in_rands / 50, 1))
        
        return credits
        
    except Exception as e:
        # Fallback to simple pricing if ML service fails
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"ML pricing failed, using fallback: {str(e)}")
        
        # Simple fallback pricing - realistic credit pricing
        base_credits = 1  # 1 credit = R50 base
        
        # Service category multiplier (all categories same base price)
        category_multiplier = 1.0
        
        # Urgency multiplier (based on lead urgency)
        urgency_multipliers = {
            'urgent': 2.0,        # 2 credits = R100
            'this_week': 1.5,     # 1.5 credits = R75
            'this_month': 1.2,    # 1.2 credits = R60
            'flexible': 1.0       # 1 credit = R50
        }
        
        urgency_multiplier = urgency_multipliers.get(lead.urgency, 1.0)
        
        # Quality multiplier (verification score impact)
        verification_multiplier = 1 + (lead.verification_score / 100.0)  # More impactful
        
        # High intent multiplier
        high_intent_multiplier = 1.5 if lead.hiring_intent == 'ready_to_hire' else 1.2 if lead.hiring_intent == 'planning_to_hire' else 1.0
        
        # Calculate final credits
        credits = base_credits * category_multiplier * urgency_multiplier * verification_multiplier * high_intent_multiplier
        
        # Round to nearest 0.5 credits
        credits = round(credits * 2) / 2
        
        # Ensure reasonable bounds (1-3 credits = R50-R150)
        return max(1, min(int(credits), 3))


def format_time_ago(created_at):
    """Format datetime as time ago string"""
    from django.utils import timezone
    now = timezone.now()
    diff = now - created_at
    
    if diff.days > 0:
        return f"{diff.days}d ago"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"{hours}h ago"
    elif diff.seconds > 60:
        minutes = diff.seconds // 60
        return f"{minutes}m ago"
    else:
        return "Just now"

def mask_phone(phone):
    """Mask phone number for display"""
    if not phone or len(phone) < 4:
        return "Phone hidden"
    return phone[:3] + '***' + phone[-2:]

def get_budget_display(budget_range):
    """Convert budget range to display format"""
    budget_display = {
        'under_1000': 'Under R1,000',
        '1000_5000': 'R1,000 - R5,000',
        '5000_15000': 'R5,000 - R15,000',
        '15000_50000': 'R15,000 - R50,000',
        'over_50000': 'Over R50,000',
        'no_budget': 'Need Quote First'
    }
    return budget_display.get(budget_range, 'Not specified')

def map_urgency_level(urgency):
    """Map urgency to frontend format"""
    urgency_map = {
        'urgent': 'high',
        'this_week': 'high',
        'this_month': 'medium',
        'flexible': 'low'
    }
    return urgency_map.get(urgency, 'medium')

def get_category_type(lead):
    """Determine category type based on lead characteristics"""
    if 'commercial' in lead.title.lower() or 'office' in lead.title.lower():
        return 'commercial'
    elif lead.budget_range in ['15000_50000', 'over_50000']:
        return 'premium'
    else:
        return 'residential'

def get_job_size(lead):
    """Determine job size based on budget and description"""
    if lead.budget_range in ['over_50000']:
        return 'large'
    elif lead.budget_range in ['5000_15000', '15000_50000']:
        return 'medium'
    else:
        return 'small'

def get_estimated_value(budget_range):
    """Get estimated value for display"""
    value_map = {
        'under_1000': 'R500',
        '1000_5000': 'R2,500',
        '5000_15000': 'R8,000',
        '15000_50000': 'R25,000',
        'over_50000': 'R75,000',
        'no_budget': 'TBD'
    }
    return value_map.get(budget_range, 'TBD')

def get_timeline_display(hiring_timeline):
    """Convert hiring timeline to display format"""
    timeline_map = {
        'asap': 'ASAP (within 1 week)',
        'this_month': 'This Month',
        'next_month': 'Next Month',
        'flexible': 'Flexible Timing'
    }
    return timeline_map.get(hiring_timeline, 'Not specified')



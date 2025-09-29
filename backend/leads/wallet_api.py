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
    Uses ML services for both pricing calculation AND intelligent filtering
    """
    from backend.leads.models import Lead
    # LeadFilteringService import removed - using direct filtering
    from django.utils import timezone
    from datetime import timedelta
    import uuid
    import logging
    
    logger = logging.getLogger(__name__)
    
    # Get user's wallet
    wallet, created = Wallet.objects.get_or_create(user=request.user)
    
    try:
        # Use ML-based filtering instead of hardcoded queries
        # This provides intelligent lead-provider matching based on:
        # - Service categories compatibility
        # - Geographical proximity with ML
        # - Lead quality preferences
        # - Provider availability and preferences
        # Direct lead filtering (replacing broken LeadFilteringService)
        profile = request.user.provider_profile
        
        # Convert service category slugs to IDs
        from backend.leads.models import ServiceCategory
        category_slugs = profile.service_categories if profile.service_categories else []
        category_ids = ServiceCategory.objects.filter(slug__in=category_slugs).values_list('id', flat=True)
        
        # Base query
        leads = Lead.objects.filter(
            status='verified',
            service_category__id__in=category_ids,
            is_available=True,
            expires_at__gt=timezone.now()
        ).select_related('service_category', 'client')
        
        # Apply geographical filter
        if profile.service_areas:
            from django.db.models import Q
            service_area_filter = Q()
            for area in profile.service_areas:
                service_area_filter |= (
                    Q(location_suburb__icontains=area) |
                    Q(location_city__icontains=area)
                )
            leads = leads.filter(service_area_filter)
        
        # Exclude already assigned leads
        from backend.leads.models import LeadAssignment
        assigned_lead_ids = LeadAssignment.objects.filter(
            provider=request.user
        ).values_list('lead_id', flat=True)
        
        leads = leads.exclude(id__in=assigned_lead_ids)
        
        # Order by priority and apply limit
        leads = leads.order_by('-verification_score', '-created_at')[:20]
        
        logger.info(f"ML filtering returned {leads.count()} leads for provider {request.user.id}")
        
    except Exception as e:
        logger.error(f"ML filtering failed for provider {request.user.id}: {str(e)}")
        
        # Fallback to basic filtering if ML service fails
        logger.info("Falling back to basic filtering")
        
        # Get provider's service categories and areas
        provider_service_categories = []
        provider_service_areas = []
        if hasattr(request.user, 'provider_profile'):
            provider_service_categories = request.user.provider_profile.service_categories or []
            provider_service_areas = request.user.provider_profile.service_areas or []
        
        # Basic service category filtering
        leads = Lead.objects.filter(
            status='verified',
            is_available=True,
            expires_at__gt=timezone.now(),
            service_category__id__in=provider_service_categories
        ).select_related('client', 'service_category').order_by('-created_at')[:20]
        
        # Basic geographical filtering
        if provider_service_areas:
            from django.db.models import Q
            geographical_filter = Q()
            for area in provider_service_areas:
                area_lower = area.lower()
                geographical_filter |= (
                    Q(location_suburb__icontains=area_lower) |
                    Q(location_city__icontains=area_lower) |
                    Q(location_address__icontains=area_lower)
                )
            leads = leads.filter(geographical_filter)
    
    # Convert leads to frontend format using integrated ML services
    leads_data = []
    for lead in leads:
        try:
            # Use integrated ML pricing service
            from .ml_services import DynamicPricingMLService
            pricing_service = DynamicPricingMLService()
            pricing_result = pricing_service.calculate_dynamic_lead_price(lead, request.user)
            # ML service returns credits directly, not Rands
            credits_cost = max(1, round(pricing_result.get('price', 4), 1))
            
            # Check if already unlocked by this user using LeadAccess model
            from .models import LeadAccess
            is_unlocked = LeadAccess.objects.filter(
                provider=request.user,
                lead=lead,
                is_active=True
            ).exists()
            
            # Use LeadAssignmentService for proper data formatting (with error handling)
            try:
                from .services import LeadAssignmentService
                assignment_service = LeadAssignmentService()
                masked_name = assignment_service._mask_client_name(f"{lead.client.first_name} {lead.client.last_name}".strip() if lead.client else 'Anonymous Client')
            except Exception as service_error:
                logger.warning(f"LeadAssignmentService failed for lead {lead.id}: {str(service_error)}")
                # Simple fallback for masking
                client_name = f"{lead.client.first_name} {lead.client.last_name}".strip() if lead.client else 'Anonymous Client'
                if not client_name or client_name == 'Anonymous Client':
                    masked_name = 'A. C.'
                else:
                    parts = client_name.strip().split()
                    if len(parts) >= 2:
                        masked_name = f"{parts[0][0]}. {parts[-1][0]}***"
                    else:
                        masked_name = f"{parts[0][0]}***"
            
            lead_data = {
                'id': str(lead.id),
                'name': f"{lead.client.first_name} {lead.client.last_name}".strip() or lead.client.email if lead.client else 'Anonymous Client',
                'masked_name': masked_name,
                'location': f"{lead.location_address}, {lead.location_city}" if lead.location_address else lead.location_city,
                'masked_location': f"{lead.location_suburb}, {lead.location_city}",
                'timeAgo': format_time_ago(lead.created_at),
                'service': f"{lead.service_category.name} • {lead.title}",
                'credits': credits_cost,
                'credit_required': credits_cost,
                'verifiedPhone': getattr(lead, 'is_sms_verified', False),
                'highIntent': lead.hiring_intent in ['ready_to_hire', 'planning_to_hire'],
                'email': lead.client.email if lead.client else None,
                'phone': getattr(lead.client, 'phone', '') if lead.client else '',
                'masked_phone': mask_phone(getattr(lead.client, 'phone', '')) if lead.client else '***-***-****',
                'budget': get_budget_display(lead.budget_range),
                'urgency': map_urgency_level(lead.urgency),
                'status': 'new',
                'rating': 4.5,  # Can be enhanced with ML-based client rating
                'lastActivity': format_time_ago(lead.created_at),
                'category': get_category_type(lead),
                'email_available': bool(lead.client.email if lead.client else False),
                'jobSize': get_job_size(lead),
                'competitorCount': 0,  # Will be calculated by ML
                'leadScore': lead.verification_score / 10.0 if lead.verification_score else 7.5,  # Convert to 0-10 scale
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
            
        except Exception as e:
            logger.error(f"Error processing lead {lead.id} with ML services: {str(e)}")
            # Fallback to simple processing - BUT USE REAL CLIENT DATA
            try:
                # Calculate proper credit cost even in fallback
                credits_cost = calculate_ml_lead_pricing(lead)
                
                # Use REAL client data, not hardcoded values
                client_name = f"{lead.client.first_name} {lead.client.last_name}".strip() if lead.client else 'Anonymous Client'
                if not client_name or client_name == 'Anonymous Client':
                    client_name = lead.client.email if lead.client else 'Anonymous Client'
                
                lead_data = {
                    'id': str(lead.id),
                    'name': client_name,  # REAL client name
                    'masked_name': 'A. C.' if client_name == 'Anonymous Client' else client_name[:2] + '***',
                    'location': f"{lead.location_address}, {lead.location_city}" if lead.location_address else lead.location_city,
                    'masked_location': f"{lead.location_suburb}, {lead.location_city}",
                    'timeAgo': format_time_ago(lead.created_at),
                    'service': f"{lead.service_category.name} • {lead.title}",
                    'credits': credits_cost,
                'credit_required': credits_cost,
                    'verifiedPhone': getattr(lead, 'is_sms_verified', False),
                    'highIntent': lead.hiring_intent in ['ready_to_hire', 'planning_to_hire'],
                    'email': lead.client.email if lead.client else None,  # REAL email
                    'phone': getattr(lead.client, 'phone', '') if lead.client else '',  # REAL phone
                    'masked_phone': mask_phone(getattr(lead.client, 'phone', '')) if lead.client else '***-***-****',
                    'budget': get_budget_display(lead.budget_range),
                    'urgency': map_urgency_level(lead.urgency),
                    'status': 'new',
                    'rating': 4.5,
                    'lastActivity': format_time_ago(lead.created_at),
                    'category': get_category_type(lead),
                    'email_available': bool(lead.client.email if lead.client else False),
                    'jobSize': get_job_size(lead),  # Use real property type
                    'competitorCount': 0,
                    'leadScore': lead.verification_score / 10.0 if lead.verification_score else 7.5,
                    'estimatedValue': get_estimated_value(lead.budget_range),
                    'timeline': get_timeline_display(lead.hiring_timeline),
                    'previousHires': 0,
                    'isUnlocked': False,
                    'details': lead.description,
                    'masked_details': mask_text_content(lead.description) if not False else lead.description,
                    'views_count': getattr(lead, 'views_count', 0),
                    'responses_count': getattr(lead, 'responses_count', 0)
                }
                leads_data.append(lead_data)
            except Exception as fallback_error:
                logger.error(f"Fallback processing also failed for lead {lead.id}: {str(fallback_error)}")
                continue
    
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
        
        # ML service returns credits directly (1 credit = R50)
        credits = pricing_result.get('price', 4)
        # Ensure minimum 1 credit
        credits = max(1, round(credits, 1))
        
        return credits
        
    except Exception as e:
        # Fallback to simple pricing if ML service fails
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"ML pricing failed, using fallback: {str(e)}")
        
        # Simple fallback pricing - REVENUE OPTIMIZED PRICING
        base_credits = 4  # 4 credits = R200 base - REALISTIC BASE PRICE
        
        # Service category multiplier (different services have different values)
        service_multipliers = {
            'cleaning': 1.0,      # Base multiplier
            'electrical': 1.5,    # Electrical is more valuable
            'plumbing': 1.3,      # Plumbing is valuable
            'hvac': 1.4,          # HVAC is valuable
            'carpentry': 1.2,     # Carpentry is moderately valuable
            'painting': 1.1,      # Painting is slightly more valuable
            'roofing': 1.6,       # Roofing is very valuable
            'flooring': 1.3,      # Flooring is valuable
            'landscaping': 1.1,   # Landscaping is slightly more valuable
            'moving': 1.2,        # Moving is moderately valuable
            'appliance-repair': 1.3,  # Appliance repair is valuable
            'handyman': 1.1,      # Handyman is slightly more valuable
            'pool-maintenance': 1.4,  # Pool maintenance is valuable
            'security': 1.5,      # Security is valuable
            'it-support': 1.3,    # IT support is valuable
            'web-design': 1.2,    # Web design is moderately valuable
            'marketing': 1.1,     # Marketing is slightly more valuable
            'accounting': 1.2,    # Accounting is moderately valuable
            'legal': 1.8,         # Legal is very valuable
            'consulting': 1.4,    # Consulting is valuable
            'other': 1.0          # Other services base multiplier
        }
        category_multiplier = service_multipliers.get(lead.service_category.slug, 1.0)
        
        # Urgency multiplier (based on lead urgency) - AGGRESSIVE PRICING
        urgency_multipliers = {
            'urgent': 3.0,        # 12 credits = R600 (urgent premium)
            'this_week': 2.0,     # 8 credits = R400 (this week premium)
            'this_month': 1.5,    # 6 credits = R300 (this month premium)
            'flexible': 1.0       # 4 credits = R200 (base price)
        }
        
        urgency_multiplier = urgency_multipliers.get(lead.urgency, 1.0)
        
        # Quality multiplier (verification score impact) - HIGHER PREMIUMS
        verification_multiplier = 1 + (lead.verification_score / 50.0)  # More impactful
        
        # High intent multiplier - AGGRESSIVE PRICING
        high_intent_multiplier = 2.0 if lead.hiring_intent == 'ready_to_hire' else 1.5 if lead.hiring_intent == 'planning_to_hire' else 1.0
        
        # Budget multiplier - AGGRESSIVE PRICING
        budget_multipliers = {
            'under_1000': 1.0,
            '1000_5000': 1.5,
            '5000_15000': 2.0,
            '15000_50000': 3.0,
            'over_50000': 4.0
        }
        budget_multiplier = budget_multipliers.get(lead.budget_range, 1.0)
        
        # Calculate final credits - REVENUE OPTIMIZED
        credits = base_credits * category_multiplier * urgency_multiplier * verification_multiplier * high_intent_multiplier * budget_multiplier
        
        # Round to nearest 0.5 credits
        credits = round(credits * 2) / 2
        
        # Ensure reasonable bounds (4-20 credits = R200-R1000) - PROFITABLE PRICING
        return max(4, min(int(credits), 20))


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
    """Determine job size based on property_type field from database"""
    # Use the actual property_type field from the database
    if hasattr(lead, 'property_type') and lead.property_type:
        return lead.property_type
    else:
        # Fallback to budget-based sizing if property_type is not available
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



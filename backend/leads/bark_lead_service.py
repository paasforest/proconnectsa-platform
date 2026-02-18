"""
Bark-style lead flow service
Implements 3-provider limit per lead with real-time updates
"""
from django.db import transaction
from django.utils import timezone
from django.core.cache import cache
from .models import Lead, LeadAssignment
from .ml_services import DynamicPricingMLService, LeadAccessControlMLService
from backend.users.models import ProviderProfile
from backend.payments.models import Transaction
import logging
import hashlib

logger = logging.getLogger(__name__)


class BarkLeadService:
    """Service for managing Bark-style lead flow with 3-provider limits"""
    
    def __init__(self):
        self.pricing_ml = DynamicPricingMLService()
        self.access_control = LeadAccessControlMLService()
    
    def get_available_leads(self, provider, limit=20):
        """Get available leads for a provider with claim status - OPTIMIZED VERSION WITH CACHING"""
        try:
            profile = provider.provider_profile
            
            # Create cache key based on provider and limit
            cache_key = f"available_leads_{provider.id}_{limit}_{profile.subscription_tier}"
            
            # Try to get from cache first (5 minute cache)
            cached_result = cache.get(cache_key)
            if cached_result:
                logger.info(f"Returning cached leads for provider {provider.id}")
                return cached_result
            
            # Optimized database query with select_related to prevent N+1 queries
            # IMPORTANT: Exclude test leads - providers should NEVER see test leads
            from backend.leads.test_lead_utils import exclude_test_leads
            
            available_leads = Lead.objects.filter(
                is_available=True,
                assigned_providers_count__lt=3,  # Less than 3 providers
                status__in=['verified', 'assigned']
            ).exclude(
                assignments__provider=provider  # Exclude already claimed by this provider
            ).select_related('service_category', 'client')
            
            # Filter out test leads
            available_leads = exclude_test_leads(available_leads)
            
            # Apply ordering and limit after filtering
            available_leads = available_leads.order_by('-created_at')[:limit]
            
            # Batch calculate pricing for all leads at once (much faster)
            leads_with_pricing = []
            pricing_results = self.pricing_ml.calculate_batch_pricing(available_leads, provider)
            
            for i, lead in enumerate(available_leads):
                # Use pre-calculated pricing result
                pricing_result = pricing_results[i] if i < len(pricing_results) else {'price': 5, 'reasoning': 'Default pricing'}
                
                # Get claim status
                claim_status = lead.get_claim_status()
                remaining_slots = lead.get_remaining_slots()
                
                lead_data = {
                    'id': str(lead.id),
                    'title': lead.title,
                    'description': lead.description,
                    'service_category': lead.service_category.name,
                    'location': f"{lead.location_suburb}, {lead.location_city}",
                    'budget_range': lead.get_budget_range_display(),
                    'urgency': lead.get_urgency_display(),
                    'verification_score': lead.verification_score,
                    'created_at': lead.created_at,
                    'credit_cost': pricing_result['price'],
                    'pricing_reasoning': pricing_result['reasoning'],
                    'claim_status': claim_status,
                    'remaining_slots': remaining_slots,
                    'assigned_count': lead.assigned_providers_count,
                    'max_providers': lead.max_providers,
                    'can_claim': lead.can_be_claimed() and not LeadAssignment.objects.filter(
                        lead=lead, provider=provider
                    ).exists()
                }
                leads_with_pricing.append(lead_data)
            
            result = {
                'success': True,
                'leads': leads_with_pricing,
                'total_available': len(leads_with_pricing)
            }
            
            # Cache the result for 5 minutes
            cache.set(cache_key, result, 300)
            logger.info(f"Cached leads for provider {provider.id}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error getting available leads: {str(e)}")
            return {
                'success': False,
                'error': 'Failed to load available leads',
                'leads': []
            }
    
    def claim_lead(self, provider, lead_id):
        """Claim a lead for a provider (Bark-style)"""
        try:
            with transaction.atomic():
                # Get the lead
                try:
                    lead = Lead.objects.get(id=lead_id)
                except Lead.DoesNotExist:
                    return {
                        'success': False,
                        'error': 'Lead not found'
                    }
                
                # Check if lead can be claimed
                if not lead.can_be_claimed():
                    return {
                        'success': False,
                        'error': 'Lead is no longer available for claiming'
                    }
                
                # Check if provider already claimed this lead
                if LeadAssignment.objects.filter(lead=lead, provider=provider).exists():
                    return {
                        'success': False,
                        'error': 'You have already claimed this lead'
                    }
                
                # Check provider access and credits
                profile = provider.provider_profile
                access_result = self.access_control.can_access_lead(profile, lead)
                
                if not access_result['can_access']:
                    return {
                        'success': False,
                        'error': access_result['reason']
                    }
                
                # Calculate credit cost
                pricing_result = self.pricing_ml.calculate_dynamic_lead_price(lead, provider)
                credit_cost = pricing_result['price']
                
                # Check if provider has enough credits
                if profile.credit_balance < credit_cost:
                    return {
                        'success': False,
                        'error': f'Insufficient credits. You need {credit_cost} credits but have {profile.credit_balance}',
                        'required_credits': credit_cost,
                        'available_credits': profile.credit_balance
                    }
                
                # Consume lead access (deduct credits)
                consume_result = self.access_control.consume_lead_access(profile, lead)
                
                if not consume_result['success']:
                    return {
                        'success': False,
                        'error': consume_result['message']
                    }
                
                # Claim the lead
                success, message = lead.claim_lead(provider)
                
                if not success:
                    return {
                        'success': False,
                        'error': message
                    }
                
                # Create transaction record (simplified)
                # Note: This would need to be integrated with the payment system
                pass
                
                # Update assignment with credit cost
                assignment = LeadAssignment.objects.get(lead=lead, provider=provider)
                assignment.credit_cost = credit_cost
                assignment.purchased_at = timezone.now()
                assignment.save()
                
                # Increment Bark-style responses count for competition tracking
                lead.increment_responses_count()
                
                return {
                    'success': True,
                    'message': message,
                    'lead_id': str(lead.id),
                    'credit_cost': credit_cost,
                    'remaining_credits': profile.credit_balance,
                    'claim_status': lead.get_claim_status(),
                    'remaining_slots': lead.get_remaining_slots()
                }
                
        except Exception as e:
            logger.error(f"Error claiming lead: {str(e)}")
            return {
                'success': False,
                'error': 'Failed to claim lead'
            }
    
    def get_lead_details(self, lead_id, provider):
        """Get detailed information about a specific lead"""
        try:
            lead = Lead.objects.get(id=lead_id)
            
            # Calculate pricing
            pricing_result = self.pricing_ml.calculate_dynamic_lead_price(lead, provider)
            
            # Check if provider can claim this lead
            can_claim = (
                lead.can_be_claimed() and 
                not LeadAssignment.objects.filter(lead=lead, provider=provider).exists()
            )
            
            # Check provider access
            profile = provider.provider_profile
            access_result = self.access_control.can_access_lead(profile, lead)
            
            return {
                'success': True,
                'lead': {
                    'id': str(lead.id),
                    'title': lead.title,
                    'description': lead.description,
                    'service_category': lead.service_category.name,
                    'location_address': lead.location_address,
                    'location_suburb': lead.location_suburb,
                    'location_city': lead.location_city,
                    'budget_range': lead.get_budget_range_display(),
                    'urgency': lead.get_urgency_display(),
                    'verification_score': lead.verification_score,
                    'hiring_intent': lead.get_hiring_intent_display(),
                    'hiring_timeline': lead.get_hiring_timeline_display(),
                    'additional_requirements': lead.additional_requirements,
                    'created_at': lead.created_at,
                    'credit_cost': pricing_result['price'],
                    'pricing_reasoning': pricing_result['reasoning'],
                    'claim_status': lead.get_claim_status(),
                    'remaining_slots': lead.get_remaining_slots(),
                    'assigned_count': lead.assigned_providers_count,
                    'max_providers': lead.max_providers,
                    'can_claim': can_claim and access_result['can_access'],
                    'access_reason': access_result['reason']
                }
            }
            
        except Lead.DoesNotExist:
            return {
                'success': False,
                'error': 'Lead not found'
            }
        except Exception as e:
            logger.error(f"Error getting lead details: {str(e)}")
            return {
                'success': False,
                'error': 'Failed to load lead details'
            }
    
    def get_provider_claimed_leads(self, provider, limit=20):
        """Get leads claimed by a specific provider"""
        try:
            assignments = LeadAssignment.objects.filter(
                provider=provider,
                status='purchased'
            ).select_related('lead').order_by('-purchased_at')[:limit]
            
            claimed_leads = []
            for assignment in assignments:
                lead = assignment.lead
                claimed_leads.append({
                    'id': str(lead.id),
                    'title': lead.title,
                    'description': lead.description,
                    'service_category': lead.service_category.name,
                    'location': f"{lead.location_suburb}, {lead.location_city}",
                    'budget_range': lead.get_budget_range_display(),
                    'urgency': lead.get_urgency_display(),
                    'verification_score': lead.verification_score,
                    'claimed_at': assignment.purchased_at,
                    'credit_cost': assignment.credit_cost,
                    'status': assignment.status,
                    'claim_status': lead.get_claim_status()
                })
            
            return {
                'success': True,
                'leads': claimed_leads,
                'total_claimed': len(claimed_leads)
            }
            
        except Exception as e:
            logger.error(f"Error getting claimed leads: {str(e)}")
            return {
                'success': False,
                'error': 'Failed to load claimed leads',
                'leads': []
            }

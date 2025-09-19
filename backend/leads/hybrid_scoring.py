from django.conf import settings
from .ml_monitoring import MLReadinessMonitor
import logging

logger = logging.getLogger(__name__)

class HybridLeadScorer:
    """Gradually transition from rule-based to ML scoring"""
    
    def __init__(self):
        self.ml_services = {
            'quality': None,  # Will be loaded when ready
            'conversion': None,
            'pricing': None
        }
        self._load_ml_services()
    
    def _load_ml_services(self):
        """Load ML services only if they're ready"""
        try:
            if MLReadinessMonitor.should_enable_ml_service('LeadQualityMLService'):
                from .ml_services import LeadQualityMLService
                self.ml_services['quality'] = LeadQualityMLService()
                logger.info("✅ LeadQualityMLService loaded for hybrid scoring")
                
            if MLReadinessMonitor.should_enable_ml_service('LeadConversionMLService'):
                from .ml_services import LeadConversionMLService
                self.ml_services['conversion'] = LeadConversionMLService()
                logger.info("✅ LeadConversionMLService loaded for hybrid scoring")
                
            if MLReadinessMonitor.should_enable_ml_service('DynamicPricingMLService'):
                from .ml_services import DynamicPricingMLService
                self.ml_services['pricing'] = DynamicPricingMLService()
                logger.info("✅ DynamicPricingMLService loaded for hybrid scoring")
                
        except Exception as e:
            logger.warning(f"Could not load ML services: {e}")
    
    def get_lead_quality_score(self, lead):
        """Get hybrid quality score transitioning from rules to ML"""
        # Always get rule-based score as fallback
        rule_score = self._rule_based_quality_score(lead)
        
        # If ML is available, blend scores based on confidence
        if self.ml_services['quality'] and getattr(settings, 'ML_ENABLED', True):
            try:
                # Prepare lead data for ML
                lead_data = {
                    'title': lead.title,
                    'description': lead.description,
                    'location_address': lead.location_address,
                    'location_suburb': lead.location_suburb,
                    'location_city': lead.location_city,
                    'budget_range': lead.budget_range,
                    'urgency': lead.urgency,
                    'hiring_intent': getattr(lead, 'hiring_intent', 'researching'),
                    'hiring_timeline': getattr(lead, 'hiring_timeline', 'flexible'),
                    'additional_requirements': getattr(lead, 'additional_requirements', ''),
                    'research_purpose': getattr(lead, 'research_purpose', ''),
                    'verification_score': getattr(lead, 'verification_score', 50),
                    'assigned_providers_count': getattr(lead, 'assigned_providers_count', 0),
                    'total_provider_contacts': getattr(lead, 'total_provider_contacts', 0),
                    'status': lead.status,
                    'client__phone': getattr(lead.client, 'phone', '') if hasattr(lead, 'client') and lead.client else '',
                    'client__email': getattr(lead.client, 'email', '') if hasattr(lead, 'client') and lead.client else ''
                }
                
                ml_score = self.ml_services['quality'].predict_lead_quality(lead_data)
                confidence = self._get_ml_confidence('LeadQualityMLService')
                
                # Blend rule and ML scores based on confidence
                final_score = rule_score * (1 - confidence) + ml_score * confidence
                
                logger.info(f"Hybrid scoring - Rule: {rule_score}, ML: {ml_score}, "
                           f"Confidence: {confidence:.2f}, Final: {final_score}")
                return int(final_score)
                
            except Exception as e:
                logger.error(f"ML scoring failed, falling back to rules: {e}")
        
        return rule_score
    
    def _rule_based_quality_score(self, lead):
        """Enhanced rule-based scoring with SA context"""
        score = 0
        
        # Basic quality indicators
        if lead.title and len(lead.title) > 10:
            score += 20
        if lead.description and len(lead.description) > 50:
            score += 30
        if lead.budget_range != 'no_budget':
            score += 25
        if lead.urgency == 'urgent':
            score += 15
        if hasattr(lead, 'hiring_intent') and lead.hiring_intent == 'ready_to_hire':
            score += 10
        
        # South African context additions
        score += self._sa_context_score(lead)
        
        return min(score, 100)
    
    def _sa_context_score(self, lead):
        """South African specific scoring adjustments"""
        sa_score = 0
        
        # Load shedding related jobs (high value)
        if lead.description:
            desc_lower = lead.description.lower()
            if any(keyword in desc_lower for keyword in ['loadshedding', 'load shedding', 'generator', 'inverter', 'ups']):
                sa_score += 15
            
            # Cash jobs are riskier
            if 'cash only' in desc_lower or 'cash payment' in desc_lower:
                sa_score -= 5
            
            # EFT/Card preferred
            if any(payment in desc_lower for payment in ['eft', 'card', 'electronic', 'bank transfer']):
                sa_score += 10
        
        # Premium area boost
        if hasattr(lead, 'location_city') and lead.location_city:
            premium_areas = ['sandton', 'rosebank', 'camps bay', 'constantia', 'ballito', 'umhlanga']
            if any(area in lead.location_city.lower() for area in premium_areas):
                sa_score += 10
        
        # Language preference specified
        if hasattr(lead, 'preferred_language') and lead.preferred_language:
            sa_score += 5
        
        # Business hours posting (more serious)
        if hasattr(lead, 'created_at'):
            hour = lead.created_at.hour
            if 8 <= hour <= 17:  # Business hours
                sa_score += 5
        
        return sa_score
    
    def _get_ml_confidence(self, service_name):
        """Calculate confidence level for ML service based on data volume"""
        status = MLReadinessMonitor.get_ml_readiness_status()
        service_status = status.get(service_name, {})
        completion_rate = service_status.get('completion_rate', 0)
        
        # Gradual confidence curve
        if completion_rate >= 1.0:
            return 0.8  # Max 80% confidence, always keep some rule-based
        elif completion_rate >= 0.8:
            return 0.6
        elif completion_rate >= 0.5:
            return 0.4
        else:
            return 0.2  # Minimum ML influence
    
    def get_credit_price(self, lead, provider):
        """Hybrid credit pricing"""
        # Rule-based pricing logic
        credits = self._rule_based_credit_calculation(lead, provider)
        
        # ML enhancement if available
        if self.ml_services['pricing'] and getattr(settings, 'ML_ENABLED', True):
            try:
                ml_credits = self.ml_services['pricing'].calculate_optimal_credit_cost(lead, provider)
                confidence = self._get_ml_confidence('DynamicPricingMLService')
                credits = credits * (1 - confidence) + ml_credits * confidence
            except Exception as e:
                logger.error(f"ML pricing failed: {e}")
        
        return max(0.5, round(credits * 2) / 2)  # Round to nearest 0.5
    
    def _rule_based_credit_calculation(self, lead, provider):
        """Rule-based credit calculation"""
        credits = 1.0  # Base
        
        # Competition multiplier
        competition_count = getattr(lead, 'interested_providers_count', 1)
        if competition_count >= 5:
            credits += 0.5
        elif competition_count >= 3:
            credits += 0.3
        
        # Budget multiplier
        if hasattr(lead, 'budget_max') and lead.budget_max:
            if lead.budget_max >= 5000:
                credits += 0.7
            elif lead.budget_max >= 2000:
                credits += 0.3
        
        # Urgency multiplier  
        if lead.urgency == 'urgent':
            credits += 0.5
        elif lead.urgency == 'this_week':
            credits += 0.3
        
        # Service category multiplier
        if hasattr(lead, 'service_category') and lead.service_category:
            high_value_categories = ['building', 'renovation', 'electrical', 'plumbing']
            category = lead.service_category.slug.lower() if hasattr(lead.service_category, 'slug') else str(lead.service_category).lower()
            
            if any(cat in category for cat in high_value_categories):
                credits += 0.5
        
        # Provider tier discount
        if hasattr(provider, 'subscription_tier'):
            if provider.subscription_tier == 'enterprise':
                credits *= 0.8
            elif provider.subscription_tier == 'pro':
                credits *= 0.9
        
        return credits
    
    def get_conversion_probability(self, lead, provider):
        """Get hybrid conversion probability"""
        # Rule-based conversion probability
        rule_prob = self._rule_based_conversion_probability(lead, provider)
        
        # ML enhancement if available
        if self.ml_services['conversion'] and getattr(settings, 'ML_ENABLED', True):
            try:
                # Prepare data for ML
                assignment_data = {
                    'lead_id': lead.id,
                    'provider_id': provider.id,
                    'lead_quality': getattr(lead, 'verification_score', 50),
                    'budget_value': self._get_budget_value(lead.budget_range),
                    'urgency': self._get_urgency_score(lead.urgency),
                    'provider_rating': float(getattr(provider, 'average_rating', 0)),
                    'provider_experience': getattr(provider, 'years_experience', 0),
                    'subscription_tier': getattr(provider, 'subscription_tier', 'basic'),
                    'lead_age_hours': (lead.created_at - lead.created_at).total_seconds() / 3600 if hasattr(lead, 'created_at') else 0
                }
                
                ml_prob = self.ml_services['conversion'].predict_conversion_probability(assignment_data)
                confidence = self._get_ml_confidence('LeadConversionMLService')
                
                final_prob = rule_prob * (1 - confidence) + ml_prob * confidence
                return min(1.0, max(0.0, final_prob))
                
            except Exception as e:
                logger.error(f"ML conversion prediction failed: {e}")
        
        return rule_prob
    
    def _rule_based_conversion_probability(self, lead, provider):
        """Rule-based conversion probability calculation"""
        prob = 0.5  # Base probability
        
        # Lead quality boost
        if hasattr(lead, 'verification_score'):
            if lead.verification_score > 80:
                prob += 0.2
            elif lead.verification_score > 60:
                prob += 0.1
        
        # Provider rating boost
        if hasattr(provider, 'average_rating'):
            if provider.average_rating > 4.5:
                prob += 0.15
            elif provider.average_rating > 4.0:
                prob += 0.1
        
        # Urgency boost
        if lead.urgency == 'urgent':
            prob += 0.1
        elif lead.urgency == 'this_week':
            prob += 0.05
        
        # Budget boost
        if lead.budget_range in ['15000_50000', 'over_50000']:
            prob += 0.1
        elif lead.budget_range == '5000_15000':
            prob += 0.05
        
        return min(1.0, max(0.0, prob))
    
    def _get_budget_value(self, budget_range):
        """Convert budget range to numeric value"""
        mapping = {
            'under_1000': 500,
            '1000_5000': 3000,
            '5000_15000': 10000,
            '15000_50000': 32500,
            'over_50000': 75000,
            'no_budget': 0
        }
        return mapping.get(budget_range, 0)
    
    def _get_urgency_score(self, urgency):
        """Convert urgency to numeric score"""
        mapping = {
            'urgent': 4,
            'this_week': 3,
            'this_month': 2,
            'flexible': 1
        }
        return mapping.get(urgency, 1)
    
    def get_scoring_summary(self, lead, provider=None):
        """Get comprehensive scoring summary for debugging"""
        summary = {
            'lead_quality_score': self.get_lead_quality_score(lead),
            'ml_services_loaded': {name: service is not None for name, service in self.ml_services.items()},
            'ml_confidence': {
                'quality': self._get_ml_confidence('LeadQualityMLService'),
                'conversion': self._get_ml_confidence('LeadConversionMLService'),
                'pricing': self._get_ml_confidence('DynamicPricingMLService')
            }
        }
        
        if provider:
            summary.update({
                'credit_price': self.get_credit_price(lead, provider),
                'conversion_probability': self.get_conversion_probability(lead, provider)
            })
        
        return summary




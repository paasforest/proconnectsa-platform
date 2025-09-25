"""
Lead assignment and filtering services
"""
from django.db.models import Q
from .models import Lead, LeadAssignment, ServiceCategory
from .ml_services import LeadQualityMLService, LeadConversionMLService, DynamicPricingMLService, LeadAccessControlMLService
from .client_behavior_ml import ClientBehaviorML
from .hybrid_scoring import HybridLeadScorer
from .ab_testing import ABTestFramework, EnhancedLeadScorer
import math
from backend.users.models import User, ProviderProfile
from .models import PredictionLog
from backend.payments.models import Transaction
from backend.notifications.consumers import NotificationConsumer
import logging

logger = logging.getLogger(__name__)


class LeadAssignmentService:
    """Service for assigning leads to providers based on various criteria"""
    
    def __init__(self):
        self.quality_ml = LeadQualityMLService()
        self.conversion_ml = LeadConversionMLService()
        self.pricing_ml = DynamicPricingMLService()
        self.access_control = LeadAccessControlMLService()
        self.hybrid_scorer = HybridLeadScorer()
        self.enhanced_scorer = EnhancedLeadScorer()
        self.client_behavior_ml = ClientBehaviorML()
    
    def assign_lead_to_providers(self, lead_id):
        """
        Assign a verified lead to relevant providers based on:
        - Service category matching
        - Geographical service areas
        - Provider availability and credits
        - Lead quality and intent
        """
        try:
            lead = Lead.objects.get(id=lead_id, status='verified')
            logger.info(f"Assigning lead {lead_id} to providers")
            
            # Find matching providers
            matching_providers = self.find_matching_providers(lead)
            
            if not matching_providers:
                logger.warning(f"No matching providers found for lead {lead_id}")
                return []
            
            # Create assignments and calculate compatibility scores
            assignments = []
            compatibility_scores = {}
            provider_ids = []
            
            for provider in matching_providers:
                assignment = self.create_assignment(lead, provider)
                if assignment:
                    assignments.append(assignment)
                    # Calculate ML compatibility score for real-time notification
                    compatibility_score = self.calculate_compatibility_score(lead, provider)
                    compatibility_scores[provider.id] = round(compatibility_score * 100, 1)
                    provider_ids.append(provider.id)
            
            # Update lead status
            if assignments:
                lead.status = 'assigned'
                lead.assigned_providers_count = len(assignments)
                lead.save(update_fields=['status', 'assigned_providers_count'])
                logger.info(f"Assigned lead {lead_id} to {len(assignments)} providers")
                
                # 🚀 SEND REAL-TIME LEAD ALERTS AND CREATE PERSISTENT NOTIFICATIONS
                self._send_real_time_lead_alerts(lead, provider_ids, compatibility_scores)
                self._create_persistent_notifications(lead, assignments)
            
            return assignments
            
        except Lead.DoesNotExist:
            logger.error(f"Lead {lead_id} not found or not verified")
            return []
        except Exception as e:
            logger.error(f"Error assigning lead {lead_id}: {str(e)}")
            return []
    
    def _send_real_time_lead_alerts(self, lead, provider_ids, compatibility_scores):
        """Send real-time WebSocket alerts to matched providers"""
        try:
            # Prepare lead data for notification
            lead_data = {
                'id': str(lead.id),
                'title': lead.title,
                'description': lead.description[:200] + '...' if len(lead.description) > 200 else lead.description,
                'service_category': lead.service_category.name,
                'location_city': lead.location_city,
                'location_suburb': lead.location_suburb,
                'budget_range': lead.budget_range,
                'urgency': lead.urgency,
                'created_at': lead.created_at.isoformat(),
                'estimated_value': self._get_budget_display(lead.budget_range),
                'priority_score': getattr(lead, 'verification_score', 75)
            }
            
            # Send real-time alerts via WebSocket
            NotificationConsumer.send_lead_alert_to_providers(
                provider_ids=provider_ids,
                lead_data=lead_data,
                compatibility_scores=compatibility_scores
            )
            
            # Send SMS notifications to providers
            self._send_sms_lead_alerts(lead, provider_ids, compatibility_scores)
            
            logger.info(f"Sent real-time lead alerts to {len(provider_ids)} providers for lead {lead.id}")
            
        except Exception as e:
            logger.error(f"Error sending real-time lead alerts: {str(e)}")
    
    def _send_sms_lead_alerts(self, lead, provider_ids, compatibility_scores):
        """Send SMS alerts to matched providers"""
        try:
            from backend.notifications.sms_service import SMSService
            from django.contrib.auth import get_user_model
            
            User = get_user_model()
            sms_service = SMSService()
            
            # Get provider users and send SMS
            providers = User.objects.filter(id__in=provider_ids, user_type='provider')
            
            for provider in providers:
                try:
                    # Get provider phone number
                    phone_number = getattr(provider, 'phone', None)
                    if not phone_number and hasattr(provider, 'provider_profile'):
                        phone_number = getattr(provider.provider_profile, 'phone', None)
                    
                    if phone_number:
                        # Get compatibility score
                        compatibility = compatibility_scores.get(provider.id, 0)
                        
                        # Create secure SMS notification (no sensitive details)
                        # Only include generic service category and general location
                        generic_title = f"{lead.service_category.name} Service Request"
                        safe_location = f"{lead.location_suburb}, {lead.location_city}"
                        
                        result = sms_service.send_provider_notification_sms(
                            phone_number, 
                            generic_title, 
                            safe_location
                        )
                        
                        if result['success']:
                            logger.info(f"SMS alert sent to provider {provider.id}")
                        else:
                            logger.warning(f"Failed to send SMS to provider {provider.id}: {result.get('error')}")
                    else:
                        logger.warning(f"No phone number found for provider {provider.id}")
                        
                except Exception as provider_err:
                    logger.error(f"Error sending SMS to provider {provider.id}: {str(provider_err)}")
                    
        except Exception as e:
            logger.error(f"Error sending SMS lead alerts: {str(e)}")
    
    def _create_persistent_notifications(self, lead, assignments):
        """Create persistent database notifications for assigned providers"""
        try:
            from backend.notifications.services import NotificationService
            
            notification_service = NotificationService()
            
            for assignment in assignments:
                provider = assignment.provider
                
                # Create persistent notification in database
                notification = notification_service.create_lead_assigned_notification(
                    provider=provider,
                    lead=lead
                )
                
                if notification:
                    logger.info(f"Created persistent notification for provider {provider.id} for lead {lead.id}")
                else:
                    logger.error(f"Failed to create notification for provider {provider.id} for lead {lead.id}")
                    
        except Exception as e:
            logger.error(f"Error creating persistent notifications: {str(e)}")
    
    def _get_budget_display(self, budget_range):
        """Convert budget range to display format"""
        budget_mapping = {
            'under_1000': 'Under R1,000',
            '1000_5000': 'R1,000 - R5,000', 
            '5000_15000': 'R5,000 - R15,000',
            '15000_50000': 'R15,000 - R50,000',
            'over_50000': 'Over R50,000',
            'no_budget': 'Quote Required'
        }
        return budget_mapping.get(budget_range, 'Unknown')
    
    def find_matching_providers(self, lead):
        """
        Find providers that match the lead criteria:
        1. Service category match (exact match required)
        2. Geographical service area match
        3. Provider is active and verified
        4. Provider has credits or within monthly limit
        5. Provider is available for new leads
        """
        logger.info(f"Finding matching providers for lead: {lead.title} (Category: {lead.service_category.slug})")
        
        # Base query for active providers
        providers = User.objects.filter(
            user_type='provider',
            provider_profile__verification_status='verified',
            is_active=True
        ).select_related('provider_profile')
        
        # Enhanced service category matching
        matching_providers = []
        
        for provider in providers:
            # Check if provider offers this specific service category
            if self._provider_offers_service(provider, lead.service_category.slug):
                logger.info(f"Provider {provider.email} offers {lead.service_category.slug}")
                
                # Check geographical match
                if self.is_geographical_match(lead, provider):
                    logger.info(f"Provider {provider.email} is in service area")
                    
                    # Check lead access using ML-based access control
                    access_check = self.access_control.can_access_lead(provider.provider_profile, lead)
                    if access_check['can_access']:
                        logger.info(f"Provider {provider.email} has access to lead")
                        
                        # Check lead quality match
                        if self.is_lead_quality_match(lead, provider):
                            # Calculate ML-based compatibility score
                            compatibility_score = self.calculate_compatibility_score(lead, provider)
                            matching_providers.append((provider, compatibility_score))
                            logger.info(f"Provider {provider.email} added with score: {compatibility_score}")
                        else:
                            logger.info(f"Provider {provider.email} failed quality match")
                    else:
                        logger.info(f"Provider {provider.email} no access: {access_check.get('reason', 'Unknown')}")
                else:
                    logger.info(f"Provider {provider.email} not in service area")
            else:
                logger.info(f"Provider {provider.email} does not offer {lead.service_category.slug}")
        
        # Sort by ML compatibility score and traditional factors
        matching_providers.sort(
            key=lambda p: (
                p[1],  # ML compatibility score
                p[0].provider_profile.subscription_tier_weight(),
                p[0].provider_profile.average_rating,
                -p[0].provider_profile.response_time_hours
            ),
            reverse=True
        )
        
        logger.info(f"Found {len(matching_providers)} matching providers for lead {lead.id}")
        
        # Limit to top 3 providers (like BARK does)
        return [p[0] for p in matching_providers[:3]]
    
    def _provider_offers_service_deprecated(self, provider, service_slug):
        """DEPRECATED: Check if provider offers the specific service category via JSON field"""
        try:
            service_categories = provider.provider_profile.service_categories
            if isinstance(service_categories, list):
                return service_slug in service_categories
            return False
        except Exception as e:
            logger.error(f"Error checking service categories for provider {provider.id}: {str(e)}")
            return False
    
    def calculate_compatibility_score(self, lead, provider):
        """Calculate ML-based compatibility score between lead and provider"""
        try:
            # Get conversion probability from ML model
            conversion_prob = self.conversion_ml.predict_conversion_probability(lead, provider)
            
            # Get client behavior conversion probability
            try:
                # Try to load and use client behavior ML model
                model_path = '/home/paas/work_platform/backend/models/client_behavior_model.pkl'
                self.client_behavior_ml.load_model(model_path)
                
                if self.client_behavior_ml.is_trained:
                    client_conversion_prob = self.client_behavior_ml.predict_conversion_probability(lead)
                    # Use the higher of the two probabilities
                    conversion_prob = max(conversion_prob, client_conversion_prob)
                    logger.info(f"Using client behavior ML: {client_conversion_prob:.3f} vs conversion ML: {conversion_prob:.3f}")
            except Exception as e:
                logger.warning(f"Client behavior ML not available: {str(e)}")
            
            # Get lead quality score from ML model
            lead_data = {
                'title': lead.title,
                'description': lead.description,
                'location_address': lead.location_address,
                'location_suburb': lead.location_suburb,
                'location_city': lead.location_city,
                'budget_range': lead.budget_range,
                'urgency': lead.urgency,
                'hiring_intent': lead.hiring_intent,
                'hiring_timeline': lead.hiring_timeline,
                'additional_requirements': lead.additional_requirements,
                'research_purpose': lead.research_purpose,
                'contact_phone': getattr(lead.client, 'phone', ''),
                'contact_email': getattr(lead.client, 'email', ''),
            }
            quality_score = self.quality_ml.predict_lead_quality(lead_data)
            
            # Combine scores (weighted average)
            compatibility_score = (conversion_prob * 0.6) + (quality_score / 100 * 0.4)

            # Log predictions (best-effort)
            try:
                PredictionLog.objects.create(
                    prediction_type='conversion',
                    model_version=getattr(self.conversion_ml, 'model_version', 'latest'),
                    lead=lead,
                    provider=provider,
                    input_summary={'lead_id': str(lead.id), 'provider_id': str(provider.id)},
                    output_value=float(conversion_prob),
                )
                PredictionLog.objects.create(
                    prediction_type='quality',
                    model_version=getattr(self.quality_ml, 'model_version', 'latest'),
                    lead=lead,
                    provider=provider,
                    input_summary={'lead_id': str(lead.id)},
                    output_value=float(quality_score),
                )
            except Exception as log_err:
                logger.warning(f"Failed to log prediction: {log_err}")
            
            return compatibility_score
                
        except Exception as e:
            logger.error(f"Error calculating compatibility score: {str(e)}")
            return 0.5  # Default score
    
    @staticmethod
    def is_geographical_match(lead, provider):
        """Check if provider serves the lead's location based on proximity and service areas"""
        try:
            profile = provider.provider_profile
            service_areas_lower = [area.lower() for area in profile.service_areas]
            
            # 1. Check if provider has coordinates and lead has coordinates - use distance calculation
            if (lead.latitude and lead.longitude and 
                hasattr(profile.user, 'latitude') and profile.user.latitude and 
                hasattr(profile.user, 'longitude') and profile.user.longitude):
                
                # Calculate distance using Haversine formula
                distance = LeadAssignmentService.calculate_distance(
                    lead.latitude, lead.longitude,
                    profile.user.latitude, profile.user.longitude
                )
                
                # Check if within travel radius (max 50km as per business rules)
                if distance <= profile.max_travel_distance:
                    logger.info(f"Distance match: {distance:.1f}km <= {profile.max_travel_distance}km for {provider.email}")
                    return True
                else:
                    logger.info(f"Distance too far: {distance:.1f}km > {profile.max_travel_distance}km for {provider.email}")
                    return False
            
            # 2. Check if provider serves the specific city
            if lead.location_city.lower() in service_areas_lower:
                logger.info(f"City match: {lead.location_city} in service areas for {provider.email}")
                return True
            
            # 3. Check if provider serves the specific suburb
            if lead.location_suburb.lower() in service_areas_lower:
                logger.info(f"Suburb match: {lead.location_suburb} in service areas for {provider.email}")
                return True
            
            # 4. Check if provider serves the province (extract province from city)
            lead_province = LeadAssignmentService.get_province_from_city(lead.location_city)
            if lead_province and lead_province.lower() in service_areas_lower:
                logger.info(f"Province match: {lead_province} in service areas for {provider.email}")
                return True
            
            # 5. Check for regional matches (e.g., "Cape Town area", "Gauteng region")
            if LeadAssignmentService.check_regional_match(lead.location_city, service_areas_lower):
                logger.info(f"Regional match: {lead.location_city} matches regional service area for {provider.email}")
                return True
            
            # 6. If provider has "nationwide" but no coordinates, be more restrictive
            if any(keyword in service_areas_lower for keyword in ['south africa', 'nationwide', 'all', 'countrywide']):
                # Only allow if it's a major city or if provider is in the same province
                if LeadAssignmentService.is_major_sa_city(lead.location_city):
                    logger.info(f"Nationwide match: {lead.location_city} is major city for {provider.email}")
                    return True
                elif lead_province and lead_province.lower() in service_areas_lower:
                    logger.info(f"Nationwide province match: {lead_province} for {provider.email}")
                    return True
            
            logger.info(f"No geographical match for {provider.email} - lead in {lead.location_city}")
            return False
                
        except Exception as e:
            logger.error(f"Error checking geographical match: {str(e)}")
            return False  # Default to False for safety
        
    def _provider_offers_service(self, provider, service_category_slug):
        """
        Check if a provider offers a specific service category.
        This is the CRITICAL method that was missing!
        """
        try:
            profile = provider.provider_profile
            
            # Method 1: Check Service objects (most reliable)
            service_categories_from_objects = set()
            for service in profile.services.filter(is_active=True):
                service_categories_from_objects.add(service.category.slug)
            
            if service_category_slug in service_categories_from_objects:
                return True
            
            # Method 2: Fallback to JSON field (for backward compatibility)
            if profile.service_categories:
                service_categories_from_json = set(profile.service_categories)
                if service_category_slug in service_categories_from_json:
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking if provider {provider.email} offers {service_category_slug}: {str(e)}")
            return False
    
    @staticmethod
    def is_provider_available(provider):
        """Check if provider is available to receive leads (deprecated - use access_control instead)"""
        try:
            profile = provider.provider_profile
            
            # Check if provider has credits or is within monthly limit
            has_credits = profile.credit_balance > 0
            within_monthly_limit = profile.leads_used_this_month < profile.monthly_lead_limit
            
            return has_credits or within_monthly_limit
            
        except Exception as e:
            logger.error(f"Error checking provider availability: {str(e)}")
            return False
    
    @staticmethod
    def is_lead_quality_match(lead, provider):
        """Check if lead quality matches provider preferences"""
        try:
            profile = provider.provider_profile
            
            # Check minimum job value
            budget_min = LeadAssignmentService.get_budget_minimum(lead.budget_range)
            if budget_min and budget_min < profile.minimum_job_value:
                return False
            
            # Check if provider wants high-intent leads only
            if (hasattr(profile, 'prefer_high_intent_leads') and 
                profile.prefer_high_intent_leads and 
                lead.hiring_intent not in ['ready_to_hire', 'planning_to_hire']):
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error checking lead quality match: {str(e)}")
            return True  # Default to allowing the lead
    
    def calculate_lead_quality_score(self, lead, user_id=None):
        """Calculate lead quality score using A/B testing enhanced scoring"""
        try:
            if user_id:
                return self.enhanced_scorer.get_lead_score(lead, user_id)
            else:
                return self.hybrid_scorer.get_lead_quality_score(lead)
        except Exception as e:
            logger.error(f"Error calculating lead quality score: {str(e)}")
            return 50  # Default fallback score
    
    def calculate_conversion_probability(self, lead, provider):
        """Calculate conversion probability using hybrid scoring"""
        try:
            return self.hybrid_scorer.get_conversion_probability(lead, provider)
        except Exception as e:
            logger.error(f"Error calculating conversion probability: {str(e)}")
            return 0.5  # Default fallback probability
    
    @staticmethod
    def get_budget_minimum(budget_range):
        """Get minimum budget value from budget range"""
        budget_map = {
            'under_1000': 0,
            '1000_5000': 1000,
            '5000_15000': 5000,
            '15000_50000': 15000,
            'over_50000': 50000,
            'no_budget': 0,
        }
        return budget_map.get(budget_range, 0)
    
    def create_assignment(self, lead, provider):
        """Create a lead assignment for a provider WITHOUT consuming credits (credits consumed on manual unlock only)"""
        try:
            # Check if assignment already exists
            if LeadAssignment.objects.filter(lead=lead, provider=provider).exists():
                logger.warning(f"Assignment already exists for lead {lead.id} and provider {provider.id}")
                return None
            
            # Check if provider has access (but DON'T consume credits yet)
            access_result = self.access_control.can_access_lead(provider.provider_profile, lead)
            
            if not access_result['can_access']:
                logger.warning(f"Cannot create assignment: {access_result['reason']}")
                return None
            
            # Calculate credit cost using A/B testing enhanced scoring (for display only)
            credit_cost = self.enhanced_scorer.get_credit_price(lead, provider, str(provider.id))
            
            # Create assignment WITHOUT consuming credits
            assignment = LeadAssignment.objects.create(
                lead=lead,
                provider=provider,
                credit_cost=credit_cost,
                status='assigned'  # Lead is assigned but NOT purchased yet
            )
            
            # Increment provider contact counter (like BARK shows)
            lead.increment_provider_contacts()
            
            logger.info(f"Created assignment for lead {lead.id} and provider {provider.id}: Lead assigned (unlock costs {credit_cost} credit)")
            return assignment
            
        except Exception as e:
            logger.error(f"Error creating assignment: {str(e)}")
            return None
    
    @staticmethod
    def calculate_credit_cost(lead):
        """Calculate credit cost based on lead quality and intent"""
        base_cost = 1
        
        # Increase cost for high-intent leads
        if lead.hiring_intent == 'ready_to_hire':
            base_cost += 1
        elif lead.hiring_intent == 'planning_to_hire':
            base_cost += 0.5
        
        # Increase cost for urgent leads
        if lead.urgency == 'urgent':
            base_cost += 1
        elif lead.urgency == 'this_week':
            base_cost += 0.5
        
        # Increase cost for high-budget leads
        if lead.budget_range in ['15000_50000', 'over_50000']:
            base_cost += 1
        elif lead.budget_range == '5000_15000':
            base_cost += 0.5
        
        return int(base_cost)
    
    @staticmethod
    def calculate_distance(lat1, lon1, lat2, lon2):
        """Calculate distance between two points using Haversine formula"""
        # Convert latitude and longitude from degrees to radians
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Radius of earth in kilometers
        r = 6371
        return c * r
    
    @staticmethod
    def get_province_from_city(city):
        """Get South African province from city name"""
        city_lower = city.lower()
        
        province_mapping = {
            'western cape': ['cape town', 'george', 'knysna', 'mossel bay', 'oudtshoorn', 'stellenbosch', 'paarl', 'somerset west'],
            'gauteng': ['johannesburg', 'pretoria', 'soweto', 'sandton', 'randburg', 'centurion', 'midrand', 'benoni', 'kempton park'],
            'kwazulu-natal': ['durban', 'pietermaritzburg', 'newcastle', 'richards bay', 'empangeni', 'ballito', 'umhlanga'],
            'eastern cape': ['port elizabeth', 'east london', 'grahamstown', 'gqeberha', 'nelson mandela bay'],
            'free state': ['bloemfontein', 'welkom', 'bethlehem', 'kroonstad', 'sasolburg'],
            'mpumalanga': ['nelspruit', 'witbank', 'secunda', 'standerton', 'mbombela'],
            'limpopo': ['polokwane', 'tzaneen', 'modimolle', 'bela-bela', 'lephalale'],
            'northern cape': ['kimberley', 'upington', 'springbok', 'de aar', 'kathu'],
            'north west': ['mahikeng', 'klerksdorp', 'potchefstroom', 'rustenburg', 'mafikeng']
        }
        
        for province, cities in province_mapping.items():
            if city_lower in cities:
                return province.title()
        
        return None
    
    @staticmethod
    def is_major_sa_city(city):
        """Check if city is a major South African city"""
        major_cities = [
            'cape town', 'johannesburg', 'durban', 'pretoria', 'port elizabeth',
            'bloemfontein', 'nelspruit', 'polokwane', 'kimberley', 'mahikeng',
            'east london', 'george', 'knysna', 'mossel bay', 'oudtshoorn',
            'soweto', 'sandton', 'randburg', 'centurion', 'midrand'
        ]
        return city.lower() in major_cities
    
    @staticmethod
    def check_regional_match(lead_city, service_areas):
        """Check for regional matches like 'Cape Town area', 'Gauteng region'"""
        city_lower = lead_city.lower()
        
        # Check for area/region matches
        regional_keywords = ['area', 'region', 'metro', 'district']
        
        for area in service_areas:
            area_lower = area.lower()
            for keyword in regional_keywords:
                if keyword in area_lower and city_lower in area_lower:
                    return True
        
        return False


class LeadFilteringService:
    """Service for filtering leads based on provider preferences"""
    
    @staticmethod
    def get_filtered_leads_for_provider(provider, filters=None):
        """
        Get leads filtered for a specific provider based on:
        - Service categories
        - Geographical areas
        - Lead quality preferences
        - Availability status
        """
        try:
            profile = provider.provider_profile
            
            # Build base query with filters
            base_filters = {}
            
            # Apply status filter (default to 'active' if not specified)
            if filters and 'status' in filters:
                base_filters['status'] = filters['status']
            else:
                base_filters['status'] = 'active'  # Use 'active' status for production
            
            # Apply availability filter
            if filters and 'is_available' in filters:
                base_filters['is_available'] = filters['is_available']
            
            # Apply expiry filter
            if filters and 'expires_at__gt' in filters:
                base_filters['expires_at__gt'] = filters['expires_at__gt']
            
            # Base query with optimized database queries
            leads = Lead.objects.filter(
                **base_filters,
                service_category__slug__in=profile.service_categories
            ).select_related('service_category', 'client').prefetch_related(
                'assignments__provider',
                'assignments__provider__provider_profile'
            )
            
            # Apply geographical filter
            leads = LeadFilteringService.apply_geographical_filter(leads, profile)
            
            # Apply additional quality filters
            if filters:
                leads = LeadFilteringService.apply_quality_filters(leads, filters)
            
            # Exclude already assigned leads
            assigned_lead_ids = LeadAssignment.objects.filter(
                provider=provider
            ).values_list('lead_id', flat=True)
            
            leads = leads.exclude(id__in=assigned_lead_ids)
            
            # Apply limit if specified
            if filters and 'limit' in filters:
                leads = leads[:filters['limit']]
            
            # Order by priority
            leads = leads.order_by(
                '-verification_score',
                '-created_at'
            )
            
            return leads
            
        except Exception as e:
            logger.error(f"Error filtering leads for provider {provider.id}: {str(e)}")
            return Lead.objects.none()
    
    @staticmethod
    def apply_geographical_filter(leads, profile):
        """Apply geographical filtering based on provider's service areas"""
        try:
            # Filter by service areas
            service_area_filter = Q()
            for area in profile.service_areas:
                service_area_filter |= (
                    Q(location_suburb__icontains=area) |
                    Q(location_city__icontains=area)
                )
            
            return leads.filter(service_area_filter)
            
        except Exception as e:
            logger.error(f"Error applying geographical filter: {str(e)}")
            return leads
    
    @staticmethod
    def apply_quality_filters(leads, filters):
        """Apply quality-based filters"""
        try:
            # Filter by hiring intent
            if filters.get('hiring_intent'):
                leads = leads.filter(hiring_intent__in=filters['hiring_intent'])
            
            # Filter by urgency
            if filters.get('urgency'):
                leads = leads.filter(urgency__in=filters['urgency'])
            
            # Filter by budget range
            if filters.get('budget_range'):
                leads = leads.filter(budget_range__in=filters['budget_range'])
            
            # Filter by minimum verification score
            if filters.get('min_verification_score'):
                leads = leads.filter(
                    verification_score__gte=filters['min_verification_score']
                )
            
            return leads
            
        except Exception as e:
            logger.error(f"Error applying quality filters: {str(e)}")
            return leads
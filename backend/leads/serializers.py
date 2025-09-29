from rest_framework import serializers
from .models import ServiceCategory, Lead, LeadAssignment
from backend.users.serializers import UserSerializer


class ServiceCategorySerializer(serializers.ModelSerializer):
    """Serializer for ServiceCategory model"""
    subcategories = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceCategory
        fields = [
            'id', 'name', 'slug', 'description', 'parent',
            'icon', 'is_active', 'created_at', 'subcategories'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_subcategories(self, obj):
        """Get active subcategories"""
        if obj.is_parent:
            return ServiceCategorySerializer(
                obj.get_active_subcategories(), 
                many=True, 
                context=self.context
            ).data
        return []


class LeadSerializer(serializers.ModelSerializer):
    """Serializer for Lead model"""
    client = UserSerializer(read_only=True)
    service_category = ServiceCategorySerializer(read_only=True)
    service_category_id = serializers.IntegerField(write_only=True)
    budget_display = serializers.CharField(source='get_budget_display_range', read_only=True)
    urgency_display = serializers.CharField(source='get_urgency_display', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    contact_details_unlocked = serializers.SerializerMethodField()
    credit_required = serializers.SerializerMethodField()
    
    class Meta:
        model = Lead
        fields = [
            'id', 'client', 'service_category', 'service_category_id',
            'title', 'description', 'location_address', 'location_suburb',
            'location_city', 'latitude', 'longitude', 'budget_range',
            'budget_display', 'urgency', 'urgency_display',
            'preferred_contact_time', 'additional_requirements',
            'hiring_intent', 'hiring_timeline', 'research_purpose',
            'verification_score', 'verification_notes', 'is_sms_verified',
            'status', 'assigned_providers_count', 'total_provider_contacts',
            'views_count', 'responses_count',  # Bark-style competition stats
            'source', 'utm_source', 'utm_medium', 'utm_campaign',
            'created_at', 'updated_at', 'verified_at', 'expires_at',
            'is_expired', 'is_available', 'contact_details_unlocked', 'credit_required'
        ]
        read_only_fields = [
            'id', 'client', 'verification_score', 'verification_notes',
            'is_sms_verified', 'status', 'assigned_providers_count',
            'total_provider_contacts', 'views_count', 'responses_count',
            'created_at', 'updated_at', 'verified_at', 'expires_at', 'is_expired'
        ]
    
    def get_contact_details_unlocked(self, obj):
        """Check if contact details are unlocked for the current user"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        # Check if user is the client (always unlocked for client)
        if obj.client == request.user:
            return True
        
        # Check if user is a provider and has unlocked this lead
        if hasattr(request.user, 'provider_profile'):
            from .models import LeadAccess
            return LeadAccess.objects.filter(
                lead=obj,
                provider=request.user,
                is_active=True
            ).exists()
        
        return False
    
    def get_credit_required(self, obj):
        """Get credit cost required to unlock this lead"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 50  # Default cost
        
        # If already unlocked, return 0
        if self.get_contact_details_unlocked(obj):
            return 0
        
        # Calculate dynamic pricing
        try:
            from .ml_services import DynamicPricingMLService
            pricing_service = DynamicPricingMLService()
            pricing_result = pricing_service.calculate_dynamic_lead_price(obj, request.user)
            # Return credits, not price in Rands
            return int(round(pricing_result['price']))
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Dynamic pricing failed: {str(e)}")
            return 1  # Fallback to 1 credit (R50)
    
    def validate_service_category_id(self, value):
        """Validate service category exists and is active"""
        try:
            category = ServiceCategory.objects.get(id=value, is_active=True)
            return value
        except ServiceCategory.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive service category")


class LeadCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new leads"""
    service_category_id = serializers.IntegerField()
    
    class Meta:
        model = Lead
        fields = [
            'service_category_id', 'title', 'description',
            'location_address', 'location_suburb', 'location_city',
            'latitude', 'longitude', 'budget_range', 'urgency',
            'preferred_contact_time', 'additional_requirements',
            'hiring_intent', 'hiring_timeline', 'research_purpose',
            'source', 'utm_source', 'utm_medium', 'utm_campaign',
            'status', 'verification_score', 'verified_at'
        ]
    
    def create(self, validated_data):
        validated_data['client'] = self.context['request'].user
        return super().create(validated_data)


class LeadAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for LeadAssignment model"""
    lead = LeadSerializer(read_only=True)
    provider = UserSerializer(read_only=True)
    response_time_hours = serializers.FloatField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    
    match_explanation = serializers.SerializerMethodField()

    class Meta:
        model = LeadAssignment
        fields = [
            'id', 'lead', 'provider', 'assigned_at', 'viewed_at',
            'contacted_at', 'quote_provided_at', 'provider_notes',
            'quote_amount', 'estimated_duration', 'status', 'won_job',
            'client_feedback', 'provider_rating', 'credit_cost',
            'credit_refunded', 'refund_reason', 'updated_at',
            'response_time_hours', 'is_active', 'match_explanation'
        ]
        read_only_fields = [
            'id', 'lead', 'provider', 'assigned_at', 'viewed_at',
            'contacted_at', 'quote_provided_at', 'updated_at',
            'response_time_hours', 'is_active', 'match_explanation'
        ]

    def get_match_explanation(self, obj):
        try:
            lead = obj.lead
            parts = []
            if lead.hiring_intent:
                parts.append({
                    'ready_to_hire': 'high hiring intent',
                    'planning_to_hire': 'strong hiring intent',
                    'comparing_quotes': 'comparing quotes',
                    'researching': 'researching',
                }.get(lead.hiring_intent, lead.hiring_intent))
            if lead.urgency:
                parts.append({
                    'urgent': 'urgent',
                    'this_week': 'this week',
                    'this_month': 'this month',
                    'flexible': 'flexible timeline',
                }.get(lead.urgency, lead.urgency))
            if lead.location_suburb:
                parts.append(f"near {lead.location_suburb}")
            return ", ".join([p for p in parts if p]) or None
        except Exception:
            return None


class LeadAssignmentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating LeadAssignment status"""
    
    class Meta:
        model = LeadAssignment
        fields = [
            'provider_notes', 'quote_amount', 'estimated_duration',
            'status', 'won_job', 'client_feedback', 'provider_rating'
        ]
    
    def validate_quote_amount(self, value):
        """Validate quote amount is positive"""
        if value is not None and value <= 0:
            raise serializers.ValidationError("Quote amount must be positive")
        return value
    
    def validate_provider_rating(self, value):
        """Validate provider rating is between 1 and 5"""
        if value is not None and (value < 1 or value > 5):
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value


class LeadVerificationSerializer(serializers.Serializer):
    """Serializer for SMS verification"""
    verification_code = serializers.CharField(max_length=6, min_length=6)
    
    def validate_verification_code(self, value):
        """Validate verification code format"""
        if not value.isdigit():
            raise serializers.ValidationError("Verification code must contain only digits")
        return value


class LeadSearchSerializer(serializers.Serializer):
    """Serializer for lead search filters"""
    service_category = serializers.IntegerField(required=False)
    location_city = serializers.CharField(required=False)
    location_suburb = serializers.CharField(required=False)
    budget_range = serializers.CharField(required=False)
    urgency = serializers.CharField(required=False)
    status = serializers.CharField(required=False)
    min_verification_score = serializers.IntegerField(required=False, min_value=0, max_value=100)
    max_verification_score = serializers.IntegerField(required=False, min_value=0, max_value=100)
    created_after = serializers.DateTimeField(required=False)
    created_before = serializers.DateTimeField(required=False)



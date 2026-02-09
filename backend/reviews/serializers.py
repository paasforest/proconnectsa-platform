from rest_framework import serializers
from .models import Review, GoogleReview
from backend.users.serializers import UserSerializer
from backend.leads.serializers import LeadAssignmentSerializer


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model"""
    client = UserSerializer(read_only=True)
    provider = UserSerializer(read_only=True)
    lead_assignment = LeadAssignmentSerializer(read_only=True)
    average_detailed_rating = serializers.FloatField(read_only=True)
    is_positive = serializers.BooleanField(read_only=True)
    is_negative = serializers.BooleanField(read_only=True)
    rating_display = serializers.CharField(source='get_rating_display', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'lead_assignment', 'client', 'provider',
            'rating', 'rating_display', 'title', 'comment',
            'quality_rating', 'communication_rating', 'timeliness_rating',
            'value_rating', 'average_detailed_rating', 'job_completed',
            'final_price', 'would_recommend', 'is_verified', 'is_public',
            'is_moderated', 'moderation_notes', 'created_at', 'updated_at',
            'is_positive', 'is_negative'
        ]
        read_only_fields = [
            'id', 'client', 'provider', 'lead_assignment',
            'is_verified', 'is_moderated', 'moderation_notes',
            'created_at', 'updated_at', 'average_detailed_rating',
            'is_positive', 'is_negative', 'rating_display'
        ]
    
    def validate_rating(self, value):
        """Validate overall rating"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
    
    def validate_quality_rating(self, value):
        """Validate quality rating"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Quality rating must be between 1 and 5")
        return value
    
    def validate_communication_rating(self, value):
        """Validate communication rating"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Communication rating must be between 1 and 5")
        return value
    
    def validate_timeliness_rating(self, value):
        """Validate timeliness rating"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Timeliness rating must be between 1 and 5")
        return value
    
    def validate_value_rating(self, value):
        """Validate value rating"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Value rating must be between 1 and 5")
        return value
    
    def validate_final_price(self, value):
        """Validate final price is positive"""
        if value is not None and value <= 0:
            raise serializers.ValidationError("Final price must be positive")
        return value


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new reviews"""
    lead_assignment_id = serializers.UUIDField()
    
    class Meta:
        model = Review
        fields = [
            'lead_assignment_id', 'rating', 'title', 'comment',
            'quality_rating', 'communication_rating', 'timeliness_rating',
            'value_rating', 'job_completed', 'final_price', 'would_recommend'
        ]
    
    def validate_lead_assignment_id(self, value):
        """
        Validate lead assignment exists and is eligible for review.

        Anti-fake-review rules:
        - Only the *client who created the lead* can review it
        - Only when the provider has *won* the job (represents completion for now)
        - Only one review per assignment (OneToOne)
        """
        from backend.leads.models import LeadAssignment
        
        try:
            assignment = LeadAssignment.objects.get(id=value)
            request = self.context.get('request')
            if not request or not request.user or not request.user.is_authenticated:
                raise serializers.ValidationError("Authentication required")

            # Enforce that ONLY the actual client can review this job
            if assignment.lead.client_id != request.user.id:
                raise serializers.ValidationError("You can only review jobs that you requested")

            # Only allow reviews after job is won (completion gate)
            # NOTE: LeadAssignment does not currently have a 'completed' status.
            if assignment.status != 'won':
                raise serializers.ValidationError("You can only review after the job is marked as won/completed")

            if hasattr(assignment, 'review'):
                raise serializers.ValidationError("Review already exists for this assignment")
            return value
        except LeadAssignment.DoesNotExist:
            raise serializers.ValidationError("Invalid lead assignment")
    
    def create(self, validated_data):
        lead_assignment_id = validated_data.pop('lead_assignment_id')
        from backend.leads.models import LeadAssignment
        
        assignment = LeadAssignment.objects.get(id=lead_assignment_id)
        validated_data['lead_assignment'] = assignment
        request = self.context.get('request')
        validated_data['client'] = request.user if request and request.user and request.user.is_authenticated else assignment.lead.client
        validated_data['provider'] = assignment.provider
        # Assignment-backed reviews are inherently "verified" (job relationship proven in DB)
        validated_data['is_verified'] = True
        
        return super().create(validated_data)


class ReviewModerationSerializer(serializers.ModelSerializer):
    """Serializer for moderating reviews"""
    
    class Meta:
        model = Review
        fields = ['is_public', 'moderation_notes']
    
    def update(self, instance, validated_data):
        # Mark as moderated when updating
        validated_data['is_moderated'] = True
        return super().update(instance, validated_data)


class ReviewSearchSerializer(serializers.Serializer):
    """Serializer for review search filters"""
    provider = serializers.UUIDField(required=False)
    rating = serializers.IntegerField(required=False, min_value=1, max_value=5)
    min_rating = serializers.IntegerField(required=False, min_value=1, max_value=5)
    max_rating = serializers.IntegerField(required=False, min_value=1, max_value=5)
    is_public = serializers.BooleanField(required=False)
    is_verified = serializers.BooleanField(required=False)
    is_moderated = serializers.BooleanField(required=False)
    would_recommend = serializers.BooleanField(required=False)
    created_after = serializers.DateTimeField(required=False)
    created_before = serializers.DateTimeField(required=False)
    service_category = serializers.IntegerField(required=False)



class GoogleReviewSerializer(serializers.ModelSerializer):
    """Serializer for GoogleReview model"""
    provider_profile = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = GoogleReview
        fields = [
            'id', 'provider_profile', 'google_link', 'review_text',
            'review_rating', 'review_screenshot', 'review_status',
            'admin_notes', 'submission_date', 'reviewed_at', 'reviewed_by',
            'reviewed_by_name', 'google_place_id'
        ]
        read_only_fields = [
            'id', 'submission_date', 'reviewed_at', 'reviewed_by',
            'review_status', 'admin_notes'
        ]
    
    def get_provider_profile(self, obj):
        return {
            'id': str(obj.provider_profile.id),
            'business_name': obj.provider_profile.business_name,
        }
    
    def get_reviewed_by_name(self, obj):
        if obj.reviewed_by:
            return f"{obj.reviewed_by.first_name} {obj.reviewed_by.last_name}".strip()
        return None


class GoogleReviewSubmitSerializer(serializers.ModelSerializer):
    """Serializer for providers to submit Google reviews"""
    agreement_accepted = serializers.BooleanField(
        required=True,
        help_text="Must be True - confirms review is genuine"
    )
    
    class Meta:
        model = GoogleReview
        fields = [
            'google_link', 'review_text', 'review_rating',
            'review_screenshot', 'google_place_id', 'agreement_accepted'
        ]
    
    def validate_agreement_accepted(self, value):
        """Ensure agreement checkbox is checked"""
        if not value:
            raise serializers.ValidationError(
                "You must confirm that all reviews submitted are genuine and from your actual Google Business profile."
            )
        return value
    
    def validate_google_link(self, value):
        """Validate Google Maps link"""
        if not value.startswith(('https://www.google.com/maps', 'https://maps.google.com', 'https://goo.gl/maps')):
            raise serializers.ValidationError("Please provide a valid Google Maps link")
        return value
    
    def validate_review_rating(self, value):
        """Validate rating is 1-5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
    
    def create(self, validated_data):
        """Create Google review submission"""
        # Remove agreement_accepted from validated_data (not a model field)
        validated_data.pop('agreement_accepted', None)
        
        # Get provider profile from request user
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_provider:
            raise serializers.ValidationError("Only providers can submit Google reviews")
        
        provider_profile = request.user.provider_profile
        validated_data['provider_profile'] = provider_profile
        validated_data['review_status'] = 'pending'  # Always start as pending
        
        return super().create(validated_data)


class GoogleReviewModerationSerializer(serializers.Serializer):
    """Serializer for admin to approve/reject/ban Google reviews"""
    action = serializers.ChoiceField(
        choices=['approve', 'reject', 'ban'],
        required=True
    )
    admin_notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Optional notes for rejection/ban"
    )

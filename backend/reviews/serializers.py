from rest_framework import serializers
from .models import Review
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
        """Validate lead assignment exists and is completed"""
        from backend.leads.models import LeadAssignment
        
        try:
            assignment = LeadAssignment.objects.get(id=value)
            if assignment.status not in ['won', 'completed']:
                raise serializers.ValidationError("Can only review completed assignments")
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
        validated_data['client'] = assignment.lead.client
        validated_data['provider'] = assignment.provider
        
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



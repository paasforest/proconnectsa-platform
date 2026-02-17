"""
Support System Serializers

This module contains serializers for support ticket management, staff profiles, and teams.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    SupportStaffProfile, SupportTeam, SupportTeamMembership,
    SupportTicket, TicketResponse, TicketTemplate, SupportMetrics
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'is_active']
        read_only_fields = ['id']
        extra_kwargs = {
            'password': {'write_only': True}
        }


class SupportStaffProfileSerializer(serializers.ModelSerializer):
    """Serializer for SupportStaffProfile"""
    
    user = UserSerializer(read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = SupportStaffProfile
        fields = [
            'id', 'user', 'employee_id', 'role', 'department', 'hire_date',
            'is_active', 'max_concurrent_tickets', 'specializations', 'languages',
            'timezone', 'phone', 'emergency_contact', 'notes', 'created_at',
            'updated_at', 'full_name', 'email', 'is_available'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SupportStaffRegistrationSerializer(serializers.Serializer):
    """Serializer for support staff registration"""
    
    user = UserSerializer()
    profile = serializers.DictField()
    
    def validate_employee_id(self, value):
        """Validate unique employee ID"""
        if SupportStaffProfile.objects.filter(employee_id=value).exists():
            raise serializers.ValidationError("Employee ID already exists")
        return value
    
    def validate(self, data):
        """Validate the entire registration data"""
        user_data = data['user']
        profile_data = data['profile']
        
        # Check if username already exists
        if User.objects.filter(username=user_data['username']).exists():
            raise serializers.ValidationError({
                'user': {'username': 'Username already exists'}
            })
        
        # Check if email already exists
        if User.objects.filter(email=user_data['email']).exists():
            raise serializers.ValidationError({
                'user': {'email': 'Email already exists'}
            })
        
        # Validate employee ID
        if 'employee_id' in profile_data:
            self.validate_employee_id(profile_data['employee_id'])
        
        return data


class SupportTeamSerializer(serializers.ModelSerializer):
    """Serializer for SupportTeam"""
    
    team_lead_name = serializers.CharField(source='team_lead.get_full_name', read_only=True)
    member_count = serializers.IntegerField(source='get_member_count', read_only=True)
    
    class Meta:
        model = SupportTeam
        fields = [
            'id', 'name', 'description', 'department', 'team_lead',
            'team_lead_name', 'is_active', 'created_at', 'updated_at',
            'member_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SupportTeamMembershipSerializer(serializers.ModelSerializer):
    """Serializer for SupportTeamMembership"""
    
    team_name = serializers.CharField(source='team.name', read_only=True)
    member_name = serializers.CharField(source='member.get_full_name', read_only=True)
    
    class Meta:
        model = SupportTeamMembership
        fields = [
            'id', 'team', 'member', 'role', 'joined_at', 'is_active',
            'team_name', 'member_name'
        ]
        read_only_fields = ['id', 'joined_at']


class SupportTicketSerializer(serializers.ModelSerializer):
    """Serializer for SupportTicket"""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.get_full_name', read_only=True)
    age_days = serializers.IntegerField(read_only=True)
    is_open = serializers.BooleanField(read_only=True)
    is_resolved = serializers.BooleanField(read_only=True)
    priority_weight = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = SupportTicket
        fields = [
            'id', 'ticket_number', 'title', 'description', 'category', 'priority',
            'status', 'user', 'user_name', 'user_email', 'user_type', 'assigned_to',
            'assigned_to_name', 'assigned_at', 'resolved_by', 'resolved_by_name',
            'resolved_at', 'resolution_notes', 'tags', 'attachments',
            'satisfaction_rating', 'satisfaction_feedback', 'created_at', 'updated_at',
            'due_date', 'age_days', 'is_open', 'is_resolved', 'priority_weight'
        ]
        read_only_fields = [
            'id', 'ticket_number', 'created_at', 'updated_at', 'assigned_at',
            'resolved_at', 'age_days', 'is_open', 'is_resolved', 'priority_weight'
        ]


class SupportTicketCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating SupportTicket"""
    
    class Meta:
        model = SupportTicket
        fields = [
            'id', 'title', 'description', 'category', 'priority', 'tags', 'attachments'
        ]
        read_only_fields = ['id']
    
    def create(self, validated_data):
        """Create new support ticket"""
        validated_data['user'] = self.context['request'].user
        
        # Set user type based on user
        user = validated_data['user']
        if hasattr(user, 'provider_profile'):
            validated_data['user_type'] = 'provider'
        else:
            validated_data['user_type'] = 'client'
        
        return super().create(validated_data)


class SupportTicketUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating SupportTicket"""
    
    class Meta:
        model = SupportTicket
        fields = [
            'title', 'description', 'category', 'priority', 'status', 'tags',
            'attachments', 'satisfaction_rating', 'satisfaction_feedback'
        ]


class TicketResponseSerializer(serializers.ModelSerializer):
    """Serializer for TicketResponse"""
    
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_email = serializers.CharField(source='author.email', read_only=True)
    is_staff = serializers.SerializerMethodField()  # Map response_type to is_staff for frontend compatibility
    
    class Meta:
        model = TicketResponse
        fields = [
            'id', 'ticket', 'author', 'author_name', 'author_email', 'message',
            'response_type', 'is_staff', 'is_internal', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_is_staff(self, obj):
        """Map response_type to is_staff for frontend compatibility"""
        return obj.response_type == 'staff'


class TicketResponseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating TicketResponse"""
    
    class Meta:
        model = TicketResponse
        fields = ['message', 'response_type', 'is_internal']
    
    def create(self, validated_data):
        """Create new ticket response"""
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class TicketTemplateSerializer(serializers.ModelSerializer):
    """Serializer for TicketTemplate"""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = TicketTemplate
        fields = [
            'id', 'name', 'category', 'subject_template', 'message_template',
            'variables', 'is_active', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class SupportMetricsSerializer(serializers.ModelSerializer):
    """Serializer for SupportMetrics"""
    
    class Meta:
        model = SupportMetrics
        fields = [
            'id', 'date', 'total_tickets', 'open_tickets', 'resolved_tickets',
            'avg_resolution_time', 'avg_satisfaction_rating', 'first_response_time',
            'escalation_count', 'active_staff_count', 'staff_utilization',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SupportTicketListSerializer(serializers.ModelSerializer):
    """Simplified serializer for ticket lists"""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    age_days = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = SupportTicket
        fields = [
            'id', 'ticket_number', 'title', 'description', 'category', 'priority', 'status',
            'user_name', 'user_email', 'assigned_to_name', 'created_at', 'updated_at', 'age_days'
        ]


class SupportTicketStatsSerializer(serializers.Serializer):
    """Serializer for support ticket statistics"""
    
    total_tickets = serializers.IntegerField()
    open_tickets = serializers.IntegerField()
    resolved_tickets = serializers.IntegerField()
    avg_resolution_time = serializers.FloatField()
    avg_satisfaction_rating = serializers.FloatField()
    staff_utilization = serializers.FloatField()
    top_categories = serializers.ListField()
    top_priorities = serializers.ListField()
    recent_activity = serializers.ListField()
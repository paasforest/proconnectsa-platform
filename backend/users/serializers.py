from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, ProviderProfile, JobCategory, LeadClaim, MLPricingFactor
from backend.leads.models import Lead
from .input_validation import InputValidator


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'phone', 'is_phone_verified', 'is_email_verified',
            'city', 'suburb', 'latitude', 'longitude', 'last_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_active']
    
    def validate_phone(self, value):
        """Validate South African phone number format"""
        import re
        if not re.match(r'^\+27[0-9]{9}$', value):
            raise serializers.ValidationError(
                "Phone number must be in format: '+27812345678'"
            )
        return value
    
    def validate_first_name(self, value):
        """Validate first name"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("First name must be at least 2 characters")
        if len(value) > 50:
            raise serializers.ValidationError("First name must be less than 50 characters")
        if not re.match(r'^[a-zA-Z\s]+$', value):
            raise serializers.ValidationError("First name can only contain letters and spaces")
        return value.strip()
    
    def validate_last_name(self, value):
        """Validate last name"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Last name must be at least 2 characters")
        if len(value) > 50:
            raise serializers.ValidationError("Last name must be less than 50 characters")
        if not re.match(r'^[a-zA-Z\s]+$', value):
            raise serializers.ValidationError("Last name can only contain letters and spaces")
        return value.strip()
    
    def validate_email(self, value):
        """Validate email format and length"""
        if len(value) > 100:
            raise serializers.ValidationError("Email must be less than 100 characters")
        return value.lower().strip()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    # Provider-specific fields for ML services
    business_name = serializers.CharField(write_only=True, required=False)
    business_address = serializers.CharField(write_only=True, required=False)
    business_phone = serializers.CharField(write_only=True, required=False)
    business_email = serializers.EmailField(write_only=True, required=False)
    primary_service = serializers.CharField(write_only=True, required=False)
    service_categories = serializers.ListField(
        child=serializers.CharField(), 
        write_only=True, 
        required=False,
        default=list
    )
    service_areas = serializers.ListField(
        child=serializers.CharField(), 
        write_only=True, 
        required=False,
        default=list
    )
    max_travel_distance = serializers.IntegerField(write_only=True, required=False, default=30)
    years_experience = serializers.CharField(write_only=True, required=False)
    service_description = serializers.CharField(write_only=True, required=False)
    hourly_rate_min = serializers.DecimalField(write_only=True, required=False, max_digits=8, decimal_places=2)
    hourly_rate_max = serializers.DecimalField(write_only=True, required=False, max_digits=8, decimal_places=2)
    minimum_job_value = serializers.DecimalField(write_only=True, required=False, max_digits=8, decimal_places=2)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'user_type', 'phone',
            'city', 'suburb', 'latitude', 'longitude',
            'business_name', 'business_address', 'business_phone', 'business_email',
            'primary_service', 'service_categories', 'service_areas', 'max_travel_distance',
            'years_experience', 'service_description', 'hourly_rate_min', 'hourly_rate_max', 'minimum_job_value'
        ]
    
    def validate_email(self, value):
        """Enhanced email validation"""
        try:
            return InputValidator.validate_email(value)
        except Exception as e:
            raise serializers.ValidationError(str(e))
    
    def validate_password(self, value):
        """Enhanced password validation"""
        try:
            return InputValidator.validate_password(value)
        except Exception as e:
            raise serializers.ValidationError(str(e))
    
    def validate_phone(self, value):
        """Enhanced phone validation"""
        if not value:
            return None
        try:
            return InputValidator.validate_phone(value)
        except Exception as e:
            raise serializers.ValidationError(str(e))
    
    def validate_business_name(self, value):
        """Enhanced business name validation"""
        if not value:
            return value
        try:
            return InputValidator.validate_business_name(value)
        except Exception as e:
            raise serializers.ValidationError(str(e))
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        
        # Validate location data
        if 'city' in attrs or 'suburb' in attrs:
            try:
                city, suburb, address = InputValidator.validate_location_data(
                    attrs.get('city'),
                    attrs.get('suburb'), 
                    attrs.get('business_address')
                )
                attrs['city'] = city
                attrs['suburb'] = suburb
                if 'business_address' in attrs:
                    attrs['business_address'] = address
            except Exception as e:
                raise serializers.ValidationError(str(e))
        
        return attrs
    
    def _parse_years_experience(self, years_str):
        """Parse years of experience string to integer"""
        if not years_str:
            return None
        
        # Handle different formats
        if isinstance(years_str, int):
            return years_str
        
        # Handle string formats like "3-5 years", "1-2 years", etc.
        if isinstance(years_str, str):
            # Extract numbers from strings like "3-5 years"
            import re
            numbers = re.findall(r'\d+', years_str)
            if numbers:
                # Take the first number as minimum experience
                return int(numbers[0])
        
        return None
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Handle empty phone numbers
        if 'phone' in validated_data and validated_data['phone'] == '':
            validated_data['phone'] = None
        
        # Extract provider-specific data for ML services
        business_name = validated_data.pop('business_name', None)
        business_address = validated_data.pop('business_address', None)
        business_phone = validated_data.pop('business_phone', None)
        business_email = validated_data.pop('business_email', None)
        primary_service = validated_data.pop('primary_service', None)
        service_categories = validated_data.pop('service_categories', [])
        service_areas = validated_data.pop('service_areas', [])
        max_travel_distance = validated_data.pop('max_travel_distance', 30)
        years_experience = validated_data.pop('years_experience', None)
        service_description = validated_data.pop('service_description', None)
        hourly_rate_min = validated_data.pop('hourly_rate_min', None)
        hourly_rate_max = validated_data.pop('hourly_rate_max', None)
        minimum_job_value = validated_data.pop('minimum_job_value', None)
        
        user = User.objects.create_user(password=password, **validated_data)
        
        # Create ProviderProfile if user is a service provider
        if user.user_type == 'provider':
            from .models import ProviderProfile
            
            # Map service names to slugs
            service_slug_mapping = {
                'Plumbing': 'plumbing',
                'Electrical': 'electrical',
                'HVAC': 'hvac',
                'Carpentry': 'carpentry',
                'Painting': 'painting',
                'Roofing': 'roofing',
                'Flooring': 'flooring',
                'Landscaping': 'landscaping',
                'Cleaning': 'cleaning',
                'Moving': 'moving',
                'Appliance Repair': 'appliance-repair',
                'Handyman': 'handyman',
                'Pool Maintenance': 'pool-maintenance',
                'Security': 'security',
                'IT Support': 'it-support',
                'Web Design': 'web-design',
                'Marketing': 'marketing',
                'Accounting': 'accounting',
                'Legal': 'legal',
                'Consulting': 'consulting',
                'Other': 'other'
            }
            
            # Convert primary service to slug
            service_categories = []
            if primary_service and primary_service in service_slug_mapping:
                service_categories.append(service_slug_mapping[primary_service])
            
            ProviderProfile.objects.create(
                user=user,
                business_name=business_name or f"{user.first_name} {user.last_name}'s Business",
                business_registration="Not provided",  # Required field
                license_number="Not provided",  # Required field
                vat_number="Not provided",  # Required field
                business_address=business_address or f"{user.city}, {user.suburb}" if user.city and user.suburb else "Address not provided",
                business_phone=business_phone or user.phone or "+27123456789",
                business_email=business_email or user.email,
                service_areas=service_areas or ([user.city] if user.city else []),
                service_categories=service_categories,
                max_travel_distance=max_travel_distance,
                verification_status='pending',
                subscription_tier='pay_as_you_go',
                bio=service_description or f"Professional {primary_service or 'service'} provider",
                profile_image="",  # Required field - empty string for now
                years_experience=self._parse_years_experience(years_experience) if years_experience else None,
                hourly_rate_min=hourly_rate_min,
                hourly_rate_max=hourly_rate_max,
                minimum_job_value=minimum_job_value or 100.00
            )
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # Try to authenticate with email
            try:
                user = User.objects.get(email=email)
                if user.check_password(password):
                    if not user.is_active:
                        raise serializers.ValidationError('User account is disabled')
                    attrs['user'] = user
                    return attrs
                else:
                    raise serializers.ValidationError('Invalid credentials')
            except User.DoesNotExist:
                raise serializers.ValidationError('Invalid credentials')
        else:
            raise serializers.ValidationError('Must include username and password')


class ProviderProfileSerializer(serializers.ModelSerializer):
    """Serializer for ProviderProfile model"""
    user = UserSerializer(read_only=True)
    business_name = serializers.CharField(max_length=200)
    
    class Meta:
        model = ProviderProfile
        fields = [
            'id', 'user', 'business_name', 'business_registration',
            'license_number', 'vat_number', 'business_phone', 'business_email',
            'business_address', 'service_areas', 'max_travel_distance',
            'hourly_rate_min', 'hourly_rate_max', 'minimum_job_value',
            'subscription_tier', 'subscription_start_date', 'subscription_end_date',
            'credit_balance', 'monthly_lead_limit', 'leads_used_this_month',
            'verification_status', 'verification_documents', 'insurance_valid_until',
            'average_rating', 'total_reviews', 'response_time_hours',
            'job_completion_rate', 'bio', 'years_experience', 'profile_image',
            'portfolio_images', 'receives_lead_notifications', 'notification_methods',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'credit_balance', 'monthly_lead_limit',
            'leads_used_this_month', 'average_rating', 'total_reviews',
            'response_time_hours', 'job_completion_rate', 'created_at', 'updated_at'
        ]
    
    def validate_service_areas(self, value):
        """Validate service areas list"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Service areas must be a list")
        if len(value) == 0:
            raise serializers.ValidationError("At least one service area is required")
        return value
    
    def validate_notification_methods(self, value):
        """Validate notification methods"""
        valid_methods = ['sms', 'email', 'push']
        if not isinstance(value, list):
            raise serializers.ValidationError("Notification methods must be a list")
        for method in value:
            if method not in valid_methods:
                raise serializers.ValidationError(f"Invalid notification method: {method}")
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with provider profile if exists"""
    provider_profile = ProviderProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'phone', 'is_phone_verified', 'is_email_verified',
            'city', 'suburb', 'latitude', 'longitude', 'last_active',
            'created_at', 'updated_at', 'provider_profile'
        ]
        read_only_fields = [
            'id', 'user_type', 'is_phone_verified', 'is_email_verified',
            'created_at', 'updated_at', 'last_active', 'provider_profile'
        ]


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value


# VERIFICATION SERIALIZERS

class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for email verification"""
    code = serializers.CharField(
        max_length=6,
        min_length=6,
        help_text="6-digit verification code"
    )
    token = serializers.CharField(
        required=False,
        help_text="Verification token (optional)"
    )
    
    def validate_code(self, value):
        """Validate verification code format"""
        if not value.isdigit():
            raise serializers.ValidationError("Verification code must contain only digits")
        return value


class SMSVerificationSerializer(serializers.Serializer):
    """Serializer for SMS verification"""
    code = serializers.CharField(
        max_length=6,
        min_length=6,
        help_text="6-digit verification code"
    )
    token = serializers.CharField(
        required=False,
        help_text="Verification token (optional)"
    )
    
    def validate_code(self, value):
        """Validate verification code format"""
        if not value.isdigit():
            raise serializers.ValidationError("Verification code must contain only digits")
        return value


class PasswordResetSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    email = serializers.EmailField(
        help_text="Email address of the account"
    )
    method = serializers.ChoiceField(
        choices=[('email', 'Email'), ('sms', 'SMS')],
        default='email',
        required=False,
        help_text="Method to send reset code (email or sms)"
    )


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation"""
    email = serializers.EmailField(
        help_text="Email address of the account"
    )
    code = serializers.CharField(
        max_length=6,
        min_length=6,
        help_text="6-digit reset code"
    )
    token = serializers.CharField(
        help_text="Reset token"
    )
    new_password = serializers.CharField(
        required=False,
        write_only=True,
        help_text="New password (required for password reset)"
    )
    
    def validate_code(self, value):
        """Validate reset code format"""
        if not value.isdigit():
            raise serializers.ValidationError("Reset code must contain only digits")
        return value
    
    def validate_new_password(self, value):
        """Validate new password"""
        if value:
            validate_password(value)
        return value


class TwoFactorAuthSerializer(serializers.Serializer):
    """Serializer for two-factor authentication"""
    code = serializers.CharField(
        max_length=6,
        min_length=6,
        help_text="6-digit authentication code"
    )
    token = serializers.CharField(
        help_text="Authentication token"
    )
    
    def validate_code(self, value):
        """Validate authentication code format"""
        if not value.isdigit():
            raise serializers.ValidationError("Authentication code must contain only digits")
        return value


# ===== LEAD MANAGEMENT SERIALIZERS =====

class JobCategorySerializer(serializers.ModelSerializer):
    """Serializer for JobCategory model"""
    
    class Meta:
        model = JobCategory
        fields = ['id', 'name', 'base_price', 'description', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class LeadSerializer(serializers.ModelSerializer):
    """Serializer for Lead model"""
    category_name = serializers.CharField(source='service_category.name', read_only=True)
    is_available = serializers.SerializerMethodField()
    remaining_slots = serializers.SerializerMethodField()
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    
    class Meta:
        model = Lead
        fields = [
            'id', 'title', 'description', 'service_category', 'category_name',
            'location_address', 'urgency', 'budget_range',
            'base_price', 'ml_multiplier', 'final_price', 'status',
            'max_providers', 'assigned_providers_count', 'is_available', 'remaining_slots',
            'client', 'client_name', 'client_phone', 'client_email',
            'created_at', 'expires_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'final_price', 'is_available', 
            'remaining_slots', 'created_at', 'updated_at'
        ]
    
    def get_is_available(self, obj):
        """Check if lead is available for claiming"""
        return obj.is_available
    
    def get_remaining_slots(self, obj):
        """Get remaining available slots"""
        return obj.get_remaining_slots()


class LeadClaimSerializer(serializers.ModelSerializer):
    """Serializer for LeadClaim model"""
    lead_title = serializers.CharField(source='lead.title', read_only=True)
    provider_name = serializers.CharField(source='provider.get_full_name', read_only=True)
    
    class Meta:
        model = LeadClaim
        fields = [
            'id', 'lead', 'lead_title', 'provider', 'provider_name',
            'claimed_at', 'price_paid', 'is_top_up', 'payment_method'
        ]
        read_only_fields = ['id', 'claimed_at']


class DetailedLeadClaimSerializer(serializers.ModelSerializer):
    """Detailed serializer for LeadClaim with full lead and client details"""
    lead_title = serializers.CharField(source='lead.title', read_only=True)
    lead_description = serializers.CharField(source='lead.description', read_only=True)
    lead_category = serializers.CharField(source='lead.service_category.name', read_only=True)
    lead_location = serializers.SerializerMethodField()
    lead_budget = serializers.CharField(source='lead.budget_range', read_only=True)
    lead_urgency = serializers.CharField(source='lead.urgency', read_only=True)
    client_name = serializers.SerializerMethodField()
    client_email = serializers.CharField(source='lead.client.email', read_only=True)
    client_phone = serializers.CharField(source='lead.client.phone', read_only=True)
    provider_name = serializers.CharField(source='provider.get_full_name', read_only=True)
    
    def get_lead_location(self, obj):
        """Get formatted location"""
        if obj.lead.location_suburb and obj.lead.location_city:
            return f"{obj.lead.location_suburb}, {obj.lead.location_city}"
        return obj.lead.location_city or "Location not specified"
    
    def get_client_name(self, obj):
        """Get client full name"""
        if obj.lead.client.first_name and obj.lead.client.last_name:
            return f"{obj.lead.client.first_name} {obj.lead.client.last_name}"
        return obj.lead.client.email or "Unknown Client"
    
    class Meta:
        model = LeadClaim
        fields = [
            'id', 'lead', 'lead_title', 'lead_description', 'lead_category', 
            'lead_location', 'lead_budget', 'lead_urgency',
            'client_name', 'client_email', 'client_phone',
            'provider', 'provider_name', 'claimed_at', 'price_paid', 
            'is_top_up', 'payment_method'
        ]
        read_only_fields = ['id', 'claimed_at']


class MLPricingFactorSerializer(serializers.ModelSerializer):
    """Serializer for MLPricingFactor model"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = MLPricingFactor
        fields = [
            'id', 'category', 'category_name', 'location', 'urgency',
            'time_of_day', 'day_of_week', 'demand_multiplier',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LeadCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new leads"""
    category_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Lead
        fields = [
            'category_id', 'title', 'description', 'location',
            'urgency', 'budget_min', 'budget_max', 'client_name',
            'client_phone', 'client_email', 'expires_at'
        ]
    
    def create(self, validated_data):
        """Create a new lead with ML pricing"""
        category_id = validated_data.pop('category_id')
        try:
            category = JobCategory.objects.get(id=category_id, is_active=True)
        except JobCategory.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive job category")
        
        validated_data['category'] = category
        validated_data['client'] = self.context['request'].user
        
        # Calculate ML multiplier using existing ML services
        try:
            from backend.leads.ml_services import DynamicPricingMLService
            pricing_service = DynamicPricingMLService()
            
            # Create a temporary lead object for ML calculation
            temp_lead = Lead(
                category=category,
                urgency=validated_data.get('urgency', 'medium'),
                location=validated_data.get('location', ''),
                base_price=category.base_price
            )
            
            # Calculate ML multiplier
            pricing_result = pricing_service.calculate_dynamic_lead_price(temp_lead, validated_data['client'])
            validated_data['ml_multiplier'] = pricing_result.get('final_multiplier', 1.0)
            
        except Exception:
            # Fallback to simple calculation
            validated_data['ml_multiplier'] = 1.0
        
        return super().create(validated_data)


class LeadClaimCreateSerializer(serializers.Serializer):
    """Serializer for claiming a lead"""
    lead_id = serializers.UUIDField()
    
    def validate_lead_id(self, value):
        """Validate lead exists and is available"""
        try:
            lead = Lead.objects.get(id=value)
            if not lead.is_available():
                raise serializers.ValidationError("Lead is no longer available")
            return value
        except Lead.DoesNotExist:
            raise serializers.ValidationError("Lead not found")


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    tier = serializers.CharField()
    credits = serializers.DecimalField(max_digits=10, decimal_places=2)
    monthly_allocation = serializers.IntegerField()
    leads_used_this_month = serializers.IntegerField()
    remaining_allocation = serializers.IntegerField()
    total_leads_available = serializers.IntegerField()
    recent_claims = LeadClaimSerializer(many=True, read_only=True)



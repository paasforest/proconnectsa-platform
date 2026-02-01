from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator, MinValueValidator
import uuid
from decimal import Decimal
from django.utils import timezone
import string
import random


class User(AbstractUser):
    """
    Extended User model with additional fields for the platform.
    Supports clients, service providers, and administrators.
    """
    USER_TYPES = [
        ('client', 'Client'),
        ('provider', 'Service Provider'),
        ('admin', 'Administrator'),
        ('support', 'Support Team'),
    ]
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # User type and verification
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='client')
    is_phone_verified = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    
    # Contact information
    phone_regex = RegexValidator(
        regex=r'^\+27\d{9}$', 
        message="Phone number must be in format: '+27812345678'"
    )
    phone = models.CharField(
        validators=[phone_regex], 
        max_length=13, 
        unique=True,
        blank=True,
        null=True,
        help_text="South African phone number in format +27XXXXXXXXX"
    )
    
    # Location information
    city = models.CharField(max_length=100, blank=True)
    suburb = models.CharField(max_length=100, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    # Activity tracking
    last_active = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user_type', 'created_at']),
            models.Index(fields=['phone']),
            models.Index(fields=['city', 'suburb']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.user_type})"
    
    @property
    def is_provider(self):
        return self.user_type == 'provider'
    
    @property
    def is_client(self):
        return self.user_type == 'client'
    
    @property
    def is_admin(self):
        return self.user_type == 'admin'
    
    @property
    def is_support(self):
        return self.user_type == 'support'
    
    def update_last_active(self):
        """Update last active timestamp"""
        self.last_active = timezone.now()
        self.save(update_fields=['last_active'])


class ProviderProfile(models.Model):
    """
    Extended profile for service providers with business information,
    subscription details, and performance metrics.
    """
    SUBSCRIPTION_TIERS = [
        ('pay_as_you_go', 'Pay-as-You-Go - R50 per lead'),
        ('basic', 'Basic - R299/month (5 leads)'),
        ('advanced', 'Advanced - R599/month (12 leads)'),
        ('pro', 'Pro - R999/month (30 leads)'),
        ('enterprise', 'Enterprise - R1,000/month (50 leads)'),
    ]
    
    VERIFICATION_STATUS = [
        ('pending', 'Pending Verification'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended'),
    ]
    
    # Core relationship
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='provider_profile'
    )
    
    # Business information
    business_name = models.CharField(max_length=200)
    business_registration = models.CharField(max_length=50, blank=True)
    license_number = models.CharField(max_length=100, blank=True)
    vat_number = models.CharField(max_length=20, blank=True)
    customer_code = models.CharField(
        max_length=10, 
        unique=True, 
        blank=True,
        null=True,
        help_text="Unique customer code for automatic deposit processing"
    )
    
    # Contact & Location
    business_phone = models.CharField(max_length=13, blank=True)
    business_email = models.EmailField(blank=True)
    business_address = models.TextField()
    service_areas = models.JSONField(
        default=list,
        help_text="List of service areas: ['Cape Town CBD', 'Bellville']"
    )
    service_categories = models.JSONField(
        default=list,
        help_text="List of service category slugs: ['plumbing', 'electrical']"
    )
    max_travel_distance = models.IntegerField(
        default=30,
        help_text="Maximum travel distance in kilometers"
    )
    
    # Pricing information
    hourly_rate_min = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    hourly_rate_max = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    minimum_job_value = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        default=Decimal('500.00')
    )
    
    # Subscription & Credits
    subscription_tier = models.CharField(
        max_length=20, 
        choices=SUBSCRIPTION_TIERS, 
        default='pay_as_you_go'
    )
    subscription_start_date = models.DateTimeField(null=True, blank=True)
    subscription_end_date = models.DateTimeField(null=True, blank=True)
    credit_balance = models.IntegerField(default=0)
    monthly_lead_limit = models.IntegerField(default=5)
    leads_used_this_month = models.IntegerField(default=0)
    
    # Verification & Quality
    verification_status = models.CharField(
        max_length=20, 
        choices=VERIFICATION_STATUS, 
        default='pending'
    )
    verification_documents = models.JSONField(
        default=dict,
        help_text="Store document URLs and metadata"
    )
    insurance_valid_until = models.DateField(null=True, blank=True)
    
    # Performance Metrics
    average_rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=Decimal('0.00')
    )
    total_reviews = models.IntegerField(default=0)
    response_time_hours = models.FloatField(
        default=24.0,
        help_text="Average response time in hours"
    )
    job_completion_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=Decimal('0.00')
    )
    
    # Profile Information
    bio = models.TextField(blank=True)
    years_experience = models.IntegerField(null=True, blank=True)
    profile_image = models.URLField(blank=True)
    portfolio_images = models.JSONField(
        default=list,
        help_text="List of portfolio image URLs"
    )
    
    # Notification Settings
    receives_lead_notifications = models.BooleanField(default=True)
    notification_methods = models.JSONField(
        default=list,
        help_text="Preferred notification methods: ['sms', 'email', 'push']"
    )
    
    # ML-Powered Quality Scores
    ml_quality_score = models.FloatField(
        default=0.0,
        help_text="ML-predicted quality score (0-100)"
    )
    ml_risk_score = models.FloatField(
        default=0.0,
        help_text="ML-predicted risk score (0-100)"
    )
    ml_follow_through_score = models.FloatField(
        default=0.0,
        help_text="ML-predicted follow-through score (0-100)"
    )
    ml_last_updated = models.DateTimeField(
        null=True, blank=True,
        help_text="When ML scores were last updated"
    )
    
    # Premium Listing (for public directory visibility)
    is_premium_listing = models.BooleanField(
        default=False,
        help_text="Provider has paid for premium listing in public directory"
    )
    premium_listing_started_at = models.DateTimeField(
        null=True, blank=True,
        help_text="When premium listing was activated"
    )
    premium_listing_expires_at = models.DateTimeField(
        null=True, blank=True,
        help_text="When premium listing expires (null = lifetime)"
    )
    premium_listing_payment_reference = models.CharField(
        max_length=100, blank=True,
        help_text="EFT reference number for premium listing payment"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['verification_status', 'subscription_tier']),
            models.Index(fields=['average_rating', 'total_reviews']),
            models.Index(fields=['subscription_end_date']),
        ]
    
    def __str__(self):
        return f"{self.business_name} ({self.user.get_full_name()})"
    
    @property
    def is_subscription_active(self):
        """Check if subscription is currently active"""
        if not self.subscription_end_date:
            return False
        return self.subscription_end_date > timezone.now()
    
    @property
    def can_receive_leads(self):
        """Check if provider can receive new leads"""
        return (
            self.verification_status == 'verified' and
            self.credit_balance > 0  # Only need credits, no monthly limits
        )
    
    @property
    def is_premium_listing_active(self):
        """Check if premium listing is currently active (for free lead access)"""
        if not self.is_premium_listing:
            return False
        if not self.premium_listing_started_at:
            return False
        # Check if expired (null expiry = lifetime)
        if self.premium_listing_expires_at is None:
            return True  # Lifetime premium
        return self.premium_listing_expires_at > timezone.now()
    
    def subscription_tier_weight(self):
        """Get numeric weight for subscription tier (for ranking)"""
        weights = {
            'pay_as_you_go': 0,
            'basic': 1, 
            'advanced': 2, 
            'pro': 3, 
            'enterprise': 4
        }
        return weights.get(self.subscription_tier, 0)
    
    def get_monthly_lead_limit(self):
        """Get monthly lead limit based on subscription tier"""
        limits = {
            'pay_as_you_go': 0,  # No monthly limit, pay per lead
            'basic': 5,          # 5 leads per month
            'advanced': 12,      # 12 leads per month
            'pro': 30,           # 30 leads per month
            'enterprise': 50     # 50 leads per month
        }
        return limits.get(self.subscription_tier, 0)
    
    def get_subscription_price(self):
        """Get monthly subscription price based on tier"""
        prices = {
            'pay_as_you_go': 0,      # Pay per lead
            'basic': 299,            # R299 per month
            'advanced': 599,         # R599 per month
            'pro': 999,              # R999 per month
            'enterprise': 1000       # R1,000 per month
        }
        return prices.get(self.subscription_tier, 0)
    
    def get_effective_cost_per_lead(self):
        """Get effective cost per lead for subscription tiers"""
        if self.subscription_tier == 'pay_as_you_go':
            return 50  # R50 per lead
        elif self.subscription_tier == 'basic':
            return 59.80  # R299 / 5 leads
        elif self.subscription_tier == 'advanced':
            return 49.92  # R599 / 12 leads
        elif self.subscription_tier == 'pro':
            return 33.30  # R999 / 30 leads
        elif self.subscription_tier == 'enterprise':
            return 20.00  # R1,000 / 50 leads
        else:
            return 50  # Default to pay-as-you-go rate
    
    def reset_monthly_usage(self):
        """Reset monthly lead usage - call this monthly via cron job"""
        self.leads_used_this_month = 0
        self.save(update_fields=['leads_used_this_month'])
    
    def update_performance_metrics(self):
        """Update performance metrics based on recent activity"""
        # This would be called periodically to update metrics
        # Implementation would depend on related models
        pass
    
    def generate_customer_code(self):
        """Generate a unique customer code for automatic deposit processing"""
        import random
        import string
        
        # Generate 6-character alphanumeric code
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if not ProviderProfile.objects.filter(customer_code=code).exists():
                return code
    
    def save(self, *args, **kwargs):
        if not self.pk:
            # Set default values for new profiles
            self.credit_balance = 0
            self.leads_used_this_month = 0
            # Generate customer code if not provided
            if not self.customer_code:
                self.customer_code = self.generate_customer_code()
        super().save(*args, **kwargs)


# ===== LEAD MANAGEMENT MODELS =====

class JobCategory(models.Model):
    """Job categories for leads"""
    name = models.CharField(max_length=100, unique=True)
    base_price = models.DecimalField(max_digits=8, decimal_places=2, default=50.00)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        verbose_name_plural = "Job Categories"
    
    def __str__(self):
        return self.name


class Lead(models.Model):
    """Lead model for job postings"""
    URGENCY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('expired', 'Expired'),
    ]
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Lead details
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(JobCategory, on_delete=models.CASCADE, related_name='leads')
    location = models.CharField(max_length=100)
    urgency = models.CharField(max_length=10, choices=URGENCY_CHOICES, default='medium')
    
    # Budget information
    budget_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    budget_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Pricing
    base_price = models.DecimalField(max_digits=8, decimal_places=2, default=50.00)
    ml_multiplier = models.DecimalField(max_digits=3, decimal_places=2, default=1.00)
    final_price = models.DecimalField(max_digits=8, decimal_places=2)
    
    # Lead management
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    max_providers = models.IntegerField(default=3)
    current_claims = models.IntegerField(default=0)
    
    # Client information
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_leads')
    client_name = models.CharField(max_length=100)
    client_phone = models.CharField(max_length=20)
    client_email = models.EmailField()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'current_claims', 'max_providers']),
            models.Index(fields=['category', 'location']),
            models.Index(fields=['urgency', 'created_at']),
            models.Index(fields=['expires_at']),
        ]
    
    def save(self, *args, **kwargs):
        # Calculate final price with ML multiplier
        self.final_price = self.base_price * self.ml_multiplier
        super().save(*args, **kwargs)
    
    def is_available(self):
        """Check if lead is available for claiming"""
        return (
            self.status == 'active' and 
            self.current_claims < self.max_providers and
            self.expires_at > timezone.now()
        )
    
    @property
    def remaining_slots(self):
        """Get remaining available slots"""
        return max(0, self.max_providers - self.current_claims)
    
    def __str__(self):
        return f"{self.title} - R{self.final_price}"


class LeadClaim(models.Model):
    """Lead claims by providers"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    lead = models.ForeignKey('leads.Lead', on_delete=models.CASCADE, related_name='claims')
    provider = models.ForeignKey(User, on_delete=models.CASCADE, related_name='claimed_leads')
    
    # Claim details
    claimed_at = models.DateTimeField(auto_now_add=True)
    price_paid = models.DecimalField(max_digits=8, decimal_places=2)
    is_top_up = models.BooleanField(default=False)  # True if beyond monthly allocation
    payment_method = models.CharField(
        max_length=20,
        choices=[
            ('allocation', 'Monthly Allocation'),
            ('topup', 'Credit Top-up'),
            ('payasyougo', 'Pay-as-You-Go'),
        ],
        default='payasyougo'
    )
    
    class Meta:
        unique_together = ['lead', 'provider']
        ordering = ['-claimed_at']
        indexes = [
            models.Index(fields=['provider', 'claimed_at']),
            models.Index(fields=['lead', 'claimed_at']),
        ]
    
    def __str__(self):
        return f"{self.provider.username} claimed {self.lead.title}"


class MLPricingFactor(models.Model):
    """ML pricing factors for dynamic pricing"""
    TIME_OF_DAY_CHOICES = [
        ('morning', 'Morning (6-12)'),
        ('afternoon', 'Afternoon (12-17)'),
        ('evening', 'Evening (17-21)'),
        ('night', 'Night (21-6)'),
    ]
    
    DAY_OF_WEEK_CHOICES = [
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ]
    
    # Factors
    category = models.ForeignKey(JobCategory, on_delete=models.CASCADE, null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)
    urgency = models.CharField(max_length=10, choices=Lead.URGENCY_CHOICES, blank=True)
    time_of_day = models.CharField(max_length=10, choices=TIME_OF_DAY_CHOICES, blank=True)
    day_of_week = models.CharField(max_length=10, choices=DAY_OF_WEEK_CHOICES, blank=True)
    
    # Multiplier
    demand_multiplier = models.DecimalField(max_digits=3, decimal_places=2, default=1.00)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'location']),
            models.Index(fields=['urgency', 'time_of_day']),
        ]
    
    def __str__(self):
        return f"{self.category or 'All'} - {self.demand_multiplier}x"


# ===== WALLET SYSTEM MODELS =====

class Wallet(models.Model):
    """User wallet for credits and deposits"""
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        related_name='wallet'
    )
    balance = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    credits = models.PositiveIntegerField(default=0)
    customer_code = models.CharField(
        max_length=20, 
        unique=True,
        help_text="Unique code for bank deposit reference"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.customer_code:
            self.customer_code = self.generate_customer_code()
        super().save(*args, **kwargs)
    
    def generate_customer_code(self):
        """Generate unique 8-digit customer code for deposits"""
        while True:
            code = ''.join(random.choices(string.digits, k=8))
            if not Wallet.objects.filter(customer_code=code).exists():
                return f"CUS{code}"
    
    def add_credits(self, amount_in_rands):
        """Convert R50 = 1 credit and add to wallet"""
        credits_to_add = int(amount_in_rands // 50)  # R50 = 1 credit
        self.credits += credits_to_add
        # DO NOT add to balance - money is converted to credits, not stored as cash
        # self.balance should remain 0 after credit conversion
        self.balance = Decimal('0.00')  # Balance is 0 because money is now credits
        self.save()
        return credits_to_add
    
    def deduct_credits(self, credits_needed):
        """Deduct credits for lead unlock"""
        if self.credits < credits_needed:
            raise ValueError(f"Insufficient credits. Need {credits_needed}, have {self.credits}")
        
        self.credits -= credits_needed
        self.save()
        return True
    
    def __str__(self):
        return f"{self.user.username}'s Wallet - {self.credits} credits"


class WalletTransaction(models.Model):
    """Track all wallet transactions"""
    TRANSACTION_TYPES = [
        ('deposit', 'Deposit'),
        ('unlock', 'Lead Unlock'),
        ('refund', 'Refund'),  # For exceptional cases only
        ('bonus', 'Bonus Credits'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(
        Wallet, 
        on_delete=models.CASCADE, 
        related_name="transactions",
        null=True, blank=True  # Can be null for unmatched deposits
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    credits = models.PositiveIntegerField(default=0)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    reference = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    description = models.TextField(blank=True)
    
    # Lead unlock specific fields
    lead_id = models.CharField(max_length=50, blank=True, null=True)
    lead_title = models.CharField(max_length=200, blank=True)
    
    # Bank/Payment specific fields
    bank_reference = models.CharField(max_length=100, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['reference']),
            models.Index(fields=['wallet', '-created_at']),
            models.Index(fields=['status', 'transaction_type']),
        ]
    
    def __str__(self):
        return f"{self.transaction_type.title()} - R{self.amount} ({self.status})"


class LeadUnlock(models.Model):
    """Track which leads each user has unlocked"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lead_id = models.CharField(max_length=50)
    credits_spent = models.PositiveIntegerField()
    transaction = models.ForeignKey(
        WalletTransaction, 
        on_delete=models.CASCADE,
        related_name='lead_unlocks'
    )
    unlocked_at = models.DateTimeField(auto_now_add=True)
    
    # Store unlocked contact info (encrypted in production)
    full_contact_data = models.JSONField()  # Store phone, email, full address
    
    class Meta:
        unique_together = ['user', 'lead_id']
        indexes = [
            models.Index(fields=['user', 'lead_id']),
        ]
    
    def __str__(self):
        return f"{self.user.username} unlocked lead {self.lead_id}"


class LeadPurchase(models.Model):
    """
    Model to track lead purchases by providers
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lead_purchases')
    lead = models.ForeignKey('leads.Lead', on_delete=models.CASCADE, related_name='purchases')
    credits_spent = models.PositiveIntegerField()
    purchased_at = models.DateTimeField(auto_now_add=True)
    contacted_at = models.DateTimeField(null=True, blank=True)
    quoted_at = models.DateTimeField(null=True, blank=True)
    won_at = models.DateTimeField(null=True, blank=True)
    lost_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    next_follow_up = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'lead']
        ordering = ['-purchased_at']

    def __str__(self):
        return f"LeadPurchase {self.user.email} - {self.lead.title}"


class Service(models.Model):
    """
    Model for provider services
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.ForeignKey(ProviderProfile, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=200)
    category = models.ForeignKey('leads.ServiceCategory', on_delete=models.CASCADE)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Service {self.name} - {self.provider.user.email}"


# SupportTicket and TicketResponse models moved to support app


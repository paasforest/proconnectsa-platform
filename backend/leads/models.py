from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta


class ServiceCategory(models.Model):
    """
    Hierarchical service categories for organizing leads and providers.
    Supports parent-child relationships for subcategories.
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='subcategories'
    )
    icon = models.CharField(
        max_length=50, 
        blank=True,
        help_text="Icon class name for frontend display"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Service Categories"
        ordering = ['name']
        indexes = [
            models.Index(fields=['is_active', 'name']),
            models.Index(fields=['parent', 'is_active']),
        ]
    
    def __str__(self):
        return self.name
    
    def get_full_name(self):
        """Get full category path including parent categories"""
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return self.name
    
    @property
    def is_parent(self):
        """Check if this category has subcategories"""
        return self.subcategories.exists()
    
    def get_active_subcategories(self):
        """Get all active subcategories"""
        return self.subcategories.filter(is_active=True)


class Lead(models.Model):
    """
    Service request from clients that gets verified and assigned to providers.
    Contains job details, location, budget, and verification status.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending Verification'),
        ('verifying', 'Client Verification in Progress'),
        ('verified', 'Verified & Ready for Assignment'),
        ('assigned', 'Assigned to Providers'),
        ('completed', 'Job Completed'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    ]
    
    URGENCY_CHOICES = [
        ('urgent', 'Urgent (ASAP)'),
        ('this_week', 'This Week'),
        ('this_month', 'This Month'),
        ('flexible', 'Flexible Timing'),
    ]
    
    BUDGET_RANGES = [
        ('under_1000', 'Under R1,000'),
        ('1000_5000', 'R1,000 - R5,000'),
        ('5000_15000', 'R5,000 - R15,000'),
        ('15000_50000', 'R15,000 - R50,000'),
        ('over_50000', 'Over R50,000'),
        ('no_budget', 'Need Quote First'),
    ]
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Core relationships
    client = models.ForeignKey(
        'users.User', 
        on_delete=models.CASCADE, 
        related_name='leads_created'
    )
    service_category = models.ForeignKey(
        ServiceCategory, 
        on_delete=models.CASCADE
    )
    
    # Job Details
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Location Information
    location_address = models.TextField()
    location_suburb = models.CharField(max_length=100)
    location_city = models.CharField(max_length=100, default='Cape Town')
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    # Requirements
    budget_range = models.CharField(max_length=20, choices=BUDGET_RANGES)
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES)
    preferred_contact_time = models.CharField(max_length=100, blank=True)
    additional_requirements = models.TextField(blank=True)
    
    # Property Type
    PROPERTY_TYPE_CHOICES = [
        ('residential', 'Residential'),
        ('commercial', 'Commercial/Office'),
        ('industrial', 'Industrial'),
        ('retail', 'Retail'),
        ('other', 'Other'),
    ]
    property_type = models.CharField(
        max_length=20, 
        choices=PROPERTY_TYPE_CHOICES,
        blank=True,
        help_text="Type of property where work will be performed"
    )
    
    # Client Intent & Hiring Timeline
    HIRING_INTENT_CHOICES = [
        ('ready_to_hire', 'Ready to Hire'),
        ('planning_to_hire', 'Planning to Hire Soon'),
        ('researching', 'Just Researching/Exploring'),
        ('comparing_quotes', 'Comparing Quotes'),
    ]
    
    HIRING_TIMELINE_CHOICES = [
        ('asap', 'ASAP (within 1 week)'),
        ('this_month', 'This Month'),
        ('next_month', 'Next Month'),
        ('flexible', 'Flexible Timing'),
    ]
    
    hiring_intent = models.CharField(
        max_length=20, 
        choices=HIRING_INTENT_CHOICES,
        blank=True,
        help_text="Client's hiring intent and readiness"
    )
    hiring_timeline = models.CharField(
        max_length=20, 
        choices=HIRING_TIMELINE_CHOICES,
        blank=True,
        help_text="When client plans to start the project"
    )
    research_purpose = models.TextField(
        blank=True,
        help_text="Additional context about project goals and requirements"
    )
    
    # Verification & Quality
    verification_score = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    verification_notes = models.TextField(blank=True)
    is_sms_verified = models.BooleanField(default=False)
    sms_verification_code = models.CharField(max_length=6, blank=True)
    sms_verification_attempts = models.IntegerField(default=0)
    
    # Status & Workflow
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    assigned_providers_count = models.IntegerField(default=0)
    total_provider_contacts = models.IntegerField(default=0)
    
    # Bark-style Competition Stats
    views_count = models.PositiveIntegerField(
        default=0, 
        help_text="Number of providers who viewed this lead"
    )
    responses_count = models.PositiveIntegerField(
        default=0, 
        help_text="Number of providers who responded/purchased this lead"
    )
    
    # Marketing & Analytics
    source = models.CharField(
        max_length=50, 
        default='website',
        help_text="Lead source: website, api, referral, etc."
    )
    utm_source = models.CharField(max_length=100, blank=True)
    utm_medium = models.CharField(max_length=100, blank=True)
    utm_campaign = models.CharField(max_length=100, blank=True)
    
    # Bark-style Lead Flow Fields
    max_providers = models.IntegerField(default=3, help_text="Maximum number of providers who can claim this lead")
    is_available = models.BooleanField(default=True, help_text="Whether this lead is still available for claiming")
    claimed_at = models.DateTimeField(null=True, blank=True, help_text="When the lead was fully claimed (all slots filled)")
    
    # Dynamic Pricing
    credit_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Credit cost for this lead (R50 base + ML multipliers)"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-verification_score', '-created_at']
        indexes = [
            models.Index(fields=['status', 'service_category_id']),
            models.Index(fields=['location_city', 'status']),
            models.Index(fields=['verification_score', 'created_at']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['service_category_id', 'location_city']),
            models.Index(fields=['client', 'created_at']),
            models.Index(fields=['expires_at']),
            models.Index(fields=['is_available', 'status']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.location_suburb} ({self.status})"
    
    def save(self, *args, **kwargs):
        """Set expiry date if not set"""
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=30)
        super().save(*args, **kwargs)
    
    @property
    def is_expired(self):
        """Check if lead has expired"""
        return timezone.now() > self.expires_at
    
    @property
    def is_verified(self):
        """Check if lead is verified and ready for assignment"""
        return self.status == 'verified'
    
    def get_budget_display_range(self):
        """Get human-readable budget range"""
        budget_map = {
            'under_1000': 'Under R1,000',
            '1000_5000': 'R1,000 - R5,000',
            '5000_15000': 'R5,000 - R15,000',
            '15000_50000': 'R15,000 - R50,000',
            'over_50000': 'Over R50,000',
            'no_budget': 'Budget TBD',
        }
        return budget_map.get(self.budget_range, self.budget_range)
    
    def get_urgency_display(self):
        """Get human-readable urgency level"""
        urgency_map = {
            'urgent': 'Urgent (ASAP)',
            'this_week': 'This Week',
            'this_month': 'This Month',
            'flexible': 'Flexible Timing',
        }
        return urgency_map.get(self.urgency, self.urgency)
    
    def increment_provider_contacts(self):
        """Increment the total provider contacts counter"""
        self.total_provider_contacts += 1
        self.save(update_fields=['total_provider_contacts'])
    
    def increment_views_count(self):
        """Increment the views count for Bark-style competition tracking"""
        self.views_count += 1
        self.save(update_fields=['views_count'])
    
    def increment_responses_count(self):
        """Increment the responses count for Bark-style competition tracking"""
        self.responses_count += 1
        self.save(update_fields=['responses_count'])
    
    def can_be_claimed(self):
        """Check if this lead can still be claimed by providers"""
        return (
            self.is_available and 
            self.assigned_providers_count < self.max_providers and
            self.status in ['verified', 'assigned']
        )
    
    def get_remaining_slots(self):
        """Get the number of remaining provider slots"""
        return max(0, self.max_providers - self.assigned_providers_count)
    
    def claim_lead(self, provider):
        """Claim this lead for a provider (Bark-style)"""
        if not self.can_be_claimed():
            return False, "Lead is no longer available for claiming"
        
        # Check if provider already claimed this lead
        if LeadAssignment.objects.filter(lead=self, provider=provider).exists():
            return False, "You have already claimed this lead"
        
        # Create assignment
        assignment = LeadAssignment.objects.create(
            lead=self,
            provider=provider,
            status='purchased'  # Directly purchased in Bark-style
        )
        
        # Update lead counts
        self.assigned_providers_count += 1
        self.total_provider_contacts += 1
        self.responses_count += 1  # Increment Bark-style responses count
        
        # Check if lead is now fully claimed
        if self.assigned_providers_count >= self.max_providers:
            self.is_available = False
            self.claimed_at = timezone.now()
            self.status = 'assigned'  # All slots filled
        
        self.save(update_fields=[
            'assigned_providers_count', 
            'total_provider_contacts',
            'responses_count',
            'is_available',
            'claimed_at',
            'status'
        ])
        
        return True, f"Lead claimed successfully! ({self.assigned_providers_count}/{self.max_providers} providers)"
    
    def get_claim_status(self):
        """Get the current claim status for display"""
        if not self.is_available:
            return "Fully Claimed"
        elif self.assigned_providers_count == 0:
            return "Available"
        else:
            return f"{self.assigned_providers_count}/{self.max_providers} Claimed"


class LeadAccess(models.Model):
    """
    Track which leads have been unlocked for which providers
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='accesses')
    provider = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='lead_accesses')
    unlocked_at = models.DateTimeField(auto_now_add=True)
    credit_cost = models.IntegerField(default=1)  # Credits used to unlock
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['lead', 'provider']
        ordering = ['-unlocked_at']
    
    def __str__(self):
        return f"{self.provider.email} - {self.lead.title}"


class LeadAssignment(models.Model):
    """
    Assignment of a lead to a specific provider with tracking
    of provider actions and outcomes.
    """
    ASSIGNMENT_STATUS = [
        ('assigned', 'Assigned'),
        ('viewed', 'Viewed by Provider'),
        ('purchased', 'Purchased by Provider'),
        ('contacted', 'Provider Contacted Client'),
        ('quoted', 'Quote Provided'),
        ('won', 'Job Won'),
        ('lost', 'Job Lost'),
        ('no_response', 'No Response from Provider'),
    ]
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Core relationships
    lead = models.ForeignKey(
        Lead, 
        on_delete=models.CASCADE, 
        related_name='assignments'
    )
    provider = models.ForeignKey(
        'users.User', 
        on_delete=models.CASCADE, 
        related_name='lead_assignments'
    )
    
    # Assignment Details
    assigned_at = models.DateTimeField(auto_now_add=True)
    viewed_at = models.DateTimeField(null=True, blank=True)
    contacted_at = models.DateTimeField(null=True, blank=True)
    quote_provided_at = models.DateTimeField(null=True, blank=True)
    purchased_at = models.DateTimeField(null=True, blank=True)
    
    # Provider Actions
    provider_notes = models.TextField(blank=True)
    quote_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    estimated_duration = models.CharField(max_length=100, blank=True)
    
    # Outcome
    status = models.CharField(
        max_length=20, 
        choices=ASSIGNMENT_STATUS, 
        default='assigned'
    )
    won_job = models.BooleanField(null=True, blank=True)
    client_feedback = models.TextField(blank=True)
    provider_rating = models.IntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    
    # Credit Management
    credit_cost = models.IntegerField(default=1)
    credit_refunded = models.BooleanField(default=False)
    refund_reason = models.TextField(blank=True)
    
    # Timestamps
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['lead', 'provider']
        ordering = ['-assigned_at']
        indexes = [
            models.Index(fields=['provider', 'assigned_at']),
            models.Index(fields=['lead', 'status']),
            models.Index(fields=['status', 'assigned_at']),
        ]
    
    def __str__(self):
        return f"{self.lead.title} → {self.provider.get_full_name()}"
    
    @property
    def response_time_hours(self):
        """Calculate response time in hours"""
        if not self.viewed_at:
            return None
        return (self.viewed_at - self.assigned_at).total_seconds() / 3600
    
    @property
    def is_active(self):
        """Check if assignment is still active"""
        return self.status in ['assigned', 'viewed', 'contacted', 'quoted']
    
    @property
    def follow_through_score(self):
        """Calculate follow-through score for this provider"""
        # Check if provider contacted client after purchasing
        if self.status in ['contacted', 'quoted', 'won', 'lost']:
            return 100  # Perfect follow-through
        elif self.status == 'purchased' and self.purchased_at:
            # Check how long since purchase without contact
            hours_since_purchase = (timezone.now() - self.purchased_at).total_seconds() / 3600
            if hours_since_purchase > 48:  # More than 2 days
                return 0  # Poor follow-through
            elif hours_since_purchase > 24:  # More than 1 day
                return 50  # Moderate follow-through
            else:
                return 75  # Good (recent purchase)
        return 0  # No purchase yet
    
    def mark_as_viewed(self):
        """Mark assignment as viewed by provider"""
        if not self.viewed_at:
            self.viewed_at = timezone.now()
            self.status = 'viewed'
            self.save(update_fields=['viewed_at', 'status'])
    
    def mark_as_contacted(self):
        """Mark assignment as contacted by provider"""
        if not self.contacted_at:
            self.contacted_at = timezone.now()
            self.status = 'contacted'
            self.save(update_fields=['contacted_at', 'status'])
            
            # Log the contact for audit trail
            logger.info(f"Provider {self.provider.email} contacted client for lead {self.lead.id}")
    
    def mark_as_quoted(self, quote_amount=None, estimated_duration=None):
        """Mark assignment as quoted by provider"""
        if not self.quote_provided_at:
            self.quote_provided_at = timezone.now()
            self.status = 'quoted'
            if quote_amount:
                self.quote_amount = quote_amount
            if estimated_duration:
                self.estimated_duration = estimated_duration
            self.save(update_fields=['quote_provided_at', 'status', 'quote_amount', 'estimated_duration'])
    
    def mark_as_won(self):
        """Mark assignment as won"""
        self.won_job = True
        self.status = 'won'
        self.save(update_fields=['won_job', 'status'])
    
    def mark_as_lost(self):
        """Mark assignment as lost"""
        self.won_job = False
        self.status = 'lost'
        self.save(update_fields=['won_job', 'status'])


class PredictionLog(models.Model):
    """Audit log for ML predictions for explainability and evaluation."""
    PREDICTION_TYPES = [
        ('quality', 'Lead Quality'),
        ('conversion', 'Conversion Probability'),
        ('pricing', 'Dynamic Pricing'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prediction_type = models.CharField(max_length=20, choices=PREDICTION_TYPES)
    model_version = models.CharField(max_length=50)

    # Foreign keys kept nullable to allow logging for any path
    lead = models.ForeignKey(Lead, on_delete=models.SET_NULL, null=True, blank=True)
    provider = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)

    input_summary = models.JSONField(default=dict, blank=True)
    output_value = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['prediction_type', 'created_at']),
            models.Index(fields=['model_version']),
        ]

    def __str__(self):
        return f"{self.prediction_type} v{self.model_version} @ {self.created_at.isoformat()}"



class LeadReservation(models.Model):
    """
    A temporary reservation for a provider to secure a lead while completing a manual EFT top-up.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending Payment'),
        ('paid', 'Paid'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='reservations')
    provider = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='lead_reservations')
    
    credits_required = models.IntegerField(default=1)
    amount_due = models.DecimalField(max_digits=10, decimal_places=2, help_text="Rands due for this reservation")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Link to a deposit request if created (manual EFT top-up)
    deposit_request = models.ForeignKey('payments.DepositRequest', on_delete=models.SET_NULL, null=True, blank=True, related_name='lead_reservations')
    reference_number = models.CharField(max_length=100, blank=True, help_text="Deposit reference number")
    
    expires_at = models.DateTimeField(help_text="Reservation expiry timestamp")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['provider', 'created_at']),
            models.Index(fields=['lead', 'status']),
            models.Index(fields=['status', 'expires_at']),
        ]
    
    def __str__(self):
        return f"Reservation {self.id} for {self.provider.email} → {self.lead.title}"
    
    @property
    def is_active(self):
        return self.status == 'pending' and timezone.now() < self.expires_at


from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, URLValidator
import uuid
from decimal import Decimal
from django.utils import timezone


class Review(models.Model):
    """
    Review and rating system for completed jobs.
    Links to LeadAssignment and tracks detailed quality metrics.
    """
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Core relationships
    lead_assignment = models.OneToOneField(
        'leads.LeadAssignment', 
        on_delete=models.CASCADE, 
        related_name='review'
    )
    client = models.ForeignKey(
        'users.User', 
        on_delete=models.CASCADE, 
        related_name='reviews_given'
    )
    provider = models.ForeignKey(
        'users.User', 
        on_delete=models.CASCADE, 
        related_name='reviews_received'
    )
    
    # Review Content
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Overall rating from 1 to 5 stars"
    )
    title = models.CharField(max_length=200)
    comment = models.TextField()
    
    # Detailed Quality Metrics
    quality_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Quality of work rating"
    )
    communication_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Communication quality rating"
    )
    timeliness_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Timeliness rating"
    )
    value_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Value for money rating"
    )
    
    # Job Details
    job_completed = models.BooleanField(default=True)
    final_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    would_recommend = models.BooleanField(default=True)
    
    # Verification & Moderation
    is_verified = models.BooleanField(
        default=False,
        help_text="Verified that job actually happened"
    )
    is_public = models.BooleanField(default=True)
    is_moderated = models.BooleanField(default=False)
    moderation_notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['provider', 'is_public', 'created_at']),
            models.Index(fields=['rating', 'is_public']),
            models.Index(fields=['is_verified', 'is_public']),
        ]
    
    def __str__(self):
        return f"Review for {self.provider.get_full_name()} - {self.rating}★"
    
    @property
    def average_detailed_rating(self):
        """Calculate average of detailed ratings"""
        ratings = [
            self.quality_rating,
            self.communication_rating,
            self.timeliness_rating,
            self.value_rating
        ]
        return sum(ratings) / len(ratings)
    
    @property
    def is_positive(self):
        """Check if review is positive (4+ stars)"""
        return self.rating >= 4
    
    @property
    def is_negative(self):
        """Check if review is negative (2 or fewer stars)"""
        return self.rating <= 2
    
    def get_rating_display(self):
        """Get star display for rating"""
        return "★" * self.rating + "☆" * (5 - self.rating)
    
    def moderate(self, is_approved=True, notes=""):
        """Moderate the review"""
        self.is_moderated = True
        self.is_public = is_approved
        self.moderation_notes = notes
        self.save(update_fields=['is_moderated', 'is_public', 'moderation_notes'])
    
    def verify(self):
        """Mark review as verified"""
        self.is_verified = True
        self.save(update_fields=['is_verified'])


class GoogleReview(models.Model):
    """
    Google Reviews submitted by providers for verification.
    Providers submit their Google Business reviews with screenshots for admin verification.
    """
    REVIEW_STATUS = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('banned', 'Banned'),
    ]
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Provider relationship
    provider_profile = models.ForeignKey(
        'users.ProviderProfile',
        on_delete=models.CASCADE,
        related_name='google_reviews',
        help_text="The provider who submitted this review"
    )
    
    # Review information
    google_link = models.URLField(
        max_length=500,
        validators=[URLValidator()],
        help_text="Google Maps link to the review"
    )
    review_text = models.TextField(
        blank=True,
        help_text="The review text (optional, can be extracted from screenshot)"
    )
    review_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Star rating (1-5)"
    )
    review_screenshot = models.URLField(
        blank=True,
        help_text="URL to uploaded screenshot image"
    )
    
    # Verification status
    review_status = models.CharField(
        max_length=20,
        choices=REVIEW_STATUS,
        default='pending',
        help_text="Admin verification status"
    )
    
    # Admin notes
    admin_notes = models.TextField(
        blank=True,
        help_text="Admin notes for rejection/ban reasons"
    )
    
    # Timestamps
    submission_date = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='google_reviews_reviewed',
        help_text="Admin who reviewed this submission"
    )
    
    # Optional: For future automation
    google_place_id = models.CharField(
        max_length=255,
        blank=True,
        help_text="Google Place ID for automated fetching (future feature)"
    )
    
    class Meta:
        ordering = ['-submission_date']
        indexes = [
            models.Index(fields=['provider_profile', 'review_status']),
            models.Index(fields=['review_status', 'submission_date']),
        ]
        verbose_name = "Google Review"
        verbose_name_plural = "Google Reviews"
    
    def __str__(self):
        return f"Google Review for {self.provider_profile.business_name} - {self.review_rating}★ ({self.review_status})"
    
    def approve(self, admin_user=None):
        """Approve the review"""
        self.review_status = 'approved'
        self.reviewed_at = timezone.now()
        if admin_user:
            self.reviewed_by = admin_user
        self.save(update_fields=['review_status', 'reviewed_at', 'reviewed_by'])
    
    def reject(self, admin_user=None, notes=""):
        """Reject the review"""
        self.review_status = 'rejected'
        self.reviewed_at = timezone.now()
        if admin_user:
            self.reviewed_by = admin_user
        if notes:
            self.admin_notes = notes
        self.save(update_fields=['review_status', 'reviewed_at', 'reviewed_by', 'admin_notes'])
    
    def ban(self, admin_user=None, notes=""):
        """Ban the review and optionally disable provider account"""
        self.review_status = 'banned'
        self.reviewed_at = timezone.now()
        if admin_user:
            self.reviewed_by = admin_user
        if notes:
            self.admin_notes = notes
        self.save(update_fields=['review_status', 'reviewed_at', 'reviewed_by', 'admin_notes'])
        
        # Optionally suspend provider account for false reviews
        if self.provider_profile.verification_status != 'suspended':
            self.provider_profile.verification_status = 'suspended'
            self.provider_profile.save(update_fields=['verification_status'])


from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
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



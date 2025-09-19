from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """Admin configuration for Review model"""
    list_display = [
        'provider', 'client', 'rating', 'title', 
        'is_public', 'is_verified', 'is_moderated', 'created_at'
    ]
    list_filter = [
        'rating', 'is_public', 'is_verified', 'is_moderated',
        'would_recommend', 'job_completed', 'created_at'
    ]
    search_fields = [
        'title', 'comment', 'provider__username', 'client__username'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        ('Review Information', {
            'fields': (
                'lead_assignment', 'client', 'provider',
                'rating', 'title', 'comment'
            )
        }),
        ('Detailed Ratings', {
            'fields': (
                'quality_rating', 'communication_rating',
                'timeliness_rating', 'value_rating'
            )
        }),
        ('Job Details', {
            'fields': (
                'job_completed', 'final_price', 'would_recommend'
            )
        }),
        ('Moderation', {
            'fields': (
                'is_verified', 'is_public', 'is_moderated', 'moderation_notes'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    actions = ['approve_reviews', 'reject_reviews', 'verify_reviews']
    
    def approve_reviews(self, request, queryset):
        """Approve selected reviews"""
        updated = queryset.update(is_public=True, is_moderated=True)
        self.message_user(request, f'{updated} reviews approved.')
    approve_reviews.short_description = 'Approve selected reviews'
    
    def reject_reviews(self, request, queryset):
        """Reject selected reviews"""
        updated = queryset.update(is_public=False, is_moderated=True)
        self.message_user(request, f'{updated} reviews rejected.')
    reject_reviews.short_description = 'Reject selected reviews'
    
    def verify_reviews(self, request, queryset):
        """Verify selected reviews"""
        updated = queryset.update(is_verified=True)
        self.message_user(request, f'{updated} reviews verified.')
    verify_reviews.short_description = 'Verify selected reviews'


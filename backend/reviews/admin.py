from django.contrib import admin
from .models import Review, GoogleReview


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


@admin.register(GoogleReview)
class GoogleReviewAdmin(admin.ModelAdmin):
    """Admin configuration for GoogleReview model"""
    list_display = [
        'provider_profile', 'review_rating', 'review_status',
        'submission_date', 'reviewed_at', 'reviewed_by'
    ]
    list_filter = [
        'review_status', 'review_rating', 'submission_date', 'reviewed_at'
    ]
    search_fields = [
        'provider_profile__business_name', 'review_text', 'google_link',
        'admin_notes'
    ]
    ordering = ['-submission_date']
    readonly_fields = ['submission_date', 'reviewed_at']
    
    fieldsets = (
        ('Provider Information', {
            'fields': ('provider_profile',)
        }),
        ('Review Information', {
            'fields': (
                'google_link', 'review_text', 'review_rating',
                'review_screenshot', 'google_place_id'
            )
        }),
        ('Verification Status', {
            'fields': (
                'review_status', 'admin_notes', 'reviewed_by', 'reviewed_at'
            )
        }),
        ('Timestamps', {
            'fields': ('submission_date',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['approve_google_reviews', 'reject_google_reviews', 'ban_google_reviews']
    
    def approve_google_reviews(self, request, queryset):
        """Approve selected Google reviews"""
        count = 0
        for review in queryset:
            review.approve(admin_user=request.user)
            count += 1
        self.message_user(request, f'{count} Google reviews approved.')
    approve_google_reviews.short_description = 'Approve selected Google reviews'
    
    def reject_google_reviews(self, request, queryset):
        """Reject selected Google reviews"""
        count = 0
        for review in queryset:
            review.reject(admin_user=request.user, notes='Bulk rejection from admin')
            count += 1
        self.message_user(request, f'{count} Google reviews rejected.')
    reject_google_reviews.short_description = 'Reject selected Google reviews'
    
    def ban_google_reviews(self, request, queryset):
        """Ban selected Google reviews (and suspend provider accounts)"""
        count = 0
        for review in queryset:
            review.ban(admin_user=request.user, notes='Bulk ban from admin - false reviews detected')
            count += 1
        self.message_user(request, f'{count} Google reviews banned and providers suspended.')
    ban_google_reviews.short_description = 'Ban selected Google reviews (suspends providers)'


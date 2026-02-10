from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils import timezone
import os
import logging
from .models import Review, GoogleReview
from .serializers import (
    ReviewSerializer, ReviewCreateSerializer, ReviewModerationSerializer,
    ReviewSearchSerializer, GoogleReviewSerializer, GoogleReviewSubmitSerializer,
    GoogleReviewModerationSerializer
)
from backend.users.models import ProviderProfile
from backend.leads.models import LeadAssignment

logger = logging.getLogger(__name__)


class ReviewListView(generics.ListAPIView):
    """List reviews with filtering"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['provider', 'rating', 'is_public', 'is_verified', 'would_recommend']
    search_fields = ['title', 'comment']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_client:
            # Clients see reviews they've given
            return Review.objects.filter(client=user)
        elif user.is_provider:
            # Providers see reviews they've received
            return Review.objects.filter(provider=user, is_public=True)
        elif user.is_admin:
            # Admins see all reviews
            return Review.objects.all()
        else:
            return Review.objects.none()


class ReviewCreateView(generics.CreateAPIView):
    """Create new review"""
    serializer_class = ReviewCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Only clients can create reviews
        if not request.user.is_client:
            return Response(
                {'error': 'Only clients can create reviews'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        
        return Response(
            ReviewSerializer(review).data, 
            status=status.HTTP_201_CREATED
        )


class ReviewDetailView(generics.RetrieveUpdateAPIView):
    """Review detail view"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_client:
            return Review.objects.filter(client=user)
        elif user.is_provider:
            return Review.objects.filter(provider=user)
        elif user.is_admin:
            return Review.objects.all()
        else:
            return Review.objects.none()


class ReviewModerationView(generics.UpdateAPIView):
    """Moderate reviews (admin only)"""
    serializer_class = ReviewModerationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_admin:
            return Review.objects.all()
        return Review.objects.none()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def provider_reviews_view(request, provider_id):
    """Get public reviews for a specific provider"""
    reviews = Review.objects.filter(
        provider_id=provider_id, 
        is_public=True
    ).order_by('-created_at')
    
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def provider_reviews_by_profile_view(request, profile_id):
    """Get public reviews for a provider by ProviderProfile id (used by frontend /providers/[id]/reviews)"""
    try:
        profile = ProviderProfile.objects.select_related('user').get(id=profile_id)
        user_id = profile.user_id
    except ProviderProfile.DoesNotExist:
        return Response({'error': 'Provider not found'}, status=status.HTTP_404_NOT_FOUND)
    reviews = Review.objects.filter(
        provider_id=user_id,
        is_public=True
    ).order_by('-created_at')
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def eligible_review_assignments_by_profile_view(request, profile_id):
    """
    Returns lead assignments the current client is allowed to review for a given provider profile.
    This is used to show a "Write a review" button only when the client has completed a job with the provider.
    """
    if not request.user.is_client:
        return Response({'error': 'Only clients can review providers'}, status=status.HTTP_403_FORBIDDEN)

    try:
        profile = ProviderProfile.objects.select_related('user').get(id=profile_id)
        provider_user_id = profile.user_id
    except ProviderProfile.DoesNotExist:
        return Response({'error': 'Provider not found'}, status=status.HTTP_404_NOT_FOUND)

    qs = LeadAssignment.objects.filter(
        provider_id=provider_user_id,
        lead__client_id=request.user.id,
        status='won',
    ).select_related('lead').order_by('-updated_at')

    # Exclude assignments already reviewed (Review is OneToOne)
    qs = qs.exclude(review__isnull=False)

    data = [
        {
            'lead_assignment_id': str(a.id),
            'lead_id': str(a.lead_id),
            'lead_title': a.lead.title,
            'status': a.status,
            'won_job': a.won_job,
            'updated_at': a.updated_at.isoformat() if a.updated_at else None,
        }
        for a in qs
    ]

    return Response({'eligible': data, 'count': len(data)})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def review_stats_by_profile_view(request, profile_id):
    """Get review statistics for a provider by ProviderProfile id"""
    try:
        profile = ProviderProfile.objects.select_related('user').get(id=profile_id)
        user_id = profile.user_id
    except ProviderProfile.DoesNotExist:
        return Response({'error': 'Provider not found'}, status=status.HTTP_404_NOT_FOUND)
    reviews = Review.objects.filter(provider_id=user_id, is_public=True)
    if not reviews.exists():
        return Response({
            'total_reviews': 0,
            'average_rating': 0,
            'rating_distribution': {},
            'recommendation_rate': 0
        })
    total_reviews = reviews.count()
    average_rating = sum(r.rating for r in reviews) / total_reviews
    rating_distribution = {i: reviews.filter(rating=i).count() for i in range(1, 6)}
    recommended = reviews.filter(would_recommend=True).count()
    recommendation_rate = (recommended / total_reviews) * 100
    return Response({
        'total_reviews': total_reviews,
        'average_rating': round(average_rating, 2),
        'rating_distribution': rating_distribution,
        'recommendation_rate': round(recommendation_rate, 2)
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def review_stats_view(request, provider_id):
    """Get review statistics for a provider (by User UUID)"""
    reviews = Review.objects.filter(provider_id=provider_id, is_public=True)
    
    if not reviews.exists():
        return Response({
            'total_reviews': 0,
            'average_rating': 0,
            'rating_distribution': {},
            'recommendation_rate': 0
        })
    
    total_reviews = reviews.count()
    average_rating = sum(r.rating for r in reviews) / total_reviews
    
    # Rating distribution
    rating_distribution = {}
    for i in range(1, 6):
        rating_distribution[i] = reviews.filter(rating=i).count()
    
    # Recommendation rate
    recommended = reviews.filter(would_recommend=True).count()
    recommendation_rate = (recommended / total_reviews) * 100
    
    return Response({
        'total_reviews': total_reviews,
        'average_rating': round(average_rating, 2),
        'rating_distribution': rating_distribution,
        'recommendation_rate': round(recommendation_rate, 2)
    })


# ========== Google Reviews API Views ==========

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def submit_google_review(request):
    """
    Provider submits a Google review for verification.
    Accepts FormData with:
    - google_link (required): URL to Google Maps review
    - review_text (optional): Review text
    - review_rating (required): 1-5 star rating
    - review_screenshot (optional): Image file (JPEG, PNG, max 10MB)
    - agreement_accepted (required): Must be 'true' or True
    - google_place_id (optional): For future automation
    """
    if not request.user.is_provider:
        return Response(
            {'error': 'Only providers can submit Google reviews'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Handle file upload for screenshot
    screenshot_url = None
    if 'review_screenshot' in request.FILES:
        screenshot_file = request.FILES['review_screenshot']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
        if screenshot_file.content_type not in allowed_types:
            return Response(
                {'error': 'Invalid file type. Only JPEG, PNG, and GIF files are allowed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (max 10MB)
        if screenshot_file.size > 10 * 1024 * 1024:
            return Response(
                {'error': 'File too large. Maximum size is 10MB.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save file
        try:
            file_extension = os.path.splitext(screenshot_file.name)[1]
            filename = f"google_reviews/user_{request.user.id}/screenshot_{int(timezone.now().timestamp())}{file_extension}"
            saved_path = default_storage.save(filename, ContentFile(screenshot_file.read()))
            screenshot_url = default_storage.url(saved_path) if hasattr(default_storage, 'url') else f"/media/{saved_path}"
        except Exception as e:
            logger.error(f"Error saving screenshot: {str(e)}")
            return Response(
                {'error': 'Failed to save screenshot'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    # Prepare data for serializer
    data = request.data.copy()
    if screenshot_url:
        data['review_screenshot'] = screenshot_url
    
    # Handle agreement_accepted from form data (might be string 'true'/'false')
    if 'agreement_accepted' in data:
        if isinstance(data['agreement_accepted'], str):
            data['agreement_accepted'] = data['agreement_accepted'].lower() == 'true'
    
    serializer = GoogleReviewSubmitSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        google_review = serializer.save()
        return Response(
            GoogleReviewSerializer(google_review).data,
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_my_google_reviews(request):
    """Provider lists their own Google review submissions"""
    if not request.user.is_provider:
        return Response(
            {'error': 'Only providers can view their Google reviews'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    provider_profile = request.user.provider_profile
    reviews = GoogleReview.objects.filter(provider_profile=provider_profile).order_by('-submission_date')
    serializer = GoogleReviewSerializer(reviews, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_google_reviews_by_profile(request, profile_id):
    """Get approved Google reviews for a provider (public endpoint)"""
    try:
        profile = ProviderProfile.objects.get(id=profile_id)
    except ProviderProfile.DoesNotExist:
        return Response({'error': 'Provider not found'}, status=status.HTTP_404_NOT_FOUND)
    
    reviews = GoogleReview.objects.filter(
        provider_profile=profile,
        review_status='approved'
    ).order_by('-submission_date')
    
    serializer = GoogleReviewSerializer(reviews, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def admin_list_google_reviews(request):
    """Admin lists all Google review submissions with filtering"""
    try:
        # Check if user is admin or staff
        if not (request.user.is_staff or request.user.user_type in ['admin', 'support']):
            return Response(
                {'error': 'Only admins can view all Google reviews'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        status_filter = request.GET.get('status', 'pending')
        if status_filter not in ['pending', 'approved', 'rejected', 'banned', 'all']:
            status_filter = 'pending'
        
        # Get reviews with safe select_related to avoid DoesNotExist errors
        reviews = GoogleReview.objects.select_related('provider_profile', 'reviewed_by').order_by('-submission_date')
        
        if status_filter != 'all':
            reviews = reviews.filter(review_status=status_filter)
        
        # Serialize reviews with error handling for each item
        reviews_list = []
        for review in reviews:
            try:
                serializer = GoogleReviewSerializer(review)
                reviews_list.append(serializer.data)
            except Exception as e:
                logger.error(f"Error serializing GoogleReview {review.id}: {str(e)}")
                # Include basic info even if serialization fails
                reviews_list.append({
                    'id': str(review.id),
                    'error': 'Failed to serialize review data',
                    'review_status': review.review_status,
                    'submission_date': review.submission_date.isoformat() if review.submission_date else None,
                })
        
        return Response(reviews_list)
    except Exception as e:
        logger.error(f"Error in admin_list_google_reviews: {str(e)}")
        import traceback
        error_trace = traceback.format_exc()
        logger.error(error_trace)
        return Response(
            {
                'error': 'Failed to fetch Google reviews',
                'message': str(e),
                'details': error_trace.split('\n')[-5:] if error_trace else []
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def admin_moderate_google_review(request, review_id):
    """Admin approves/rejects/bans a Google review"""
    # Check if user is admin or staff
    if not (request.user.is_staff or request.user.user_type in ['admin', 'support']):
        return Response(
            {'error': 'Only admins can moderate Google reviews'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        google_review = GoogleReview.objects.get(id=review_id)
    except GoogleReview.DoesNotExist:
        return Response({'error': 'Google review not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = GoogleReviewModerationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    action = serializer.validated_data['action']
    admin_notes = serializer.validated_data.get('admin_notes', '')
    
    if action == 'approve':
        google_review.approve(admin_user=request.user)
    elif action == 'reject':
        google_review.reject(admin_user=request.user, notes=admin_notes)
    elif action == 'ban':
        google_review.ban(admin_user=request.user, notes=admin_notes)
    
    return Response(GoogleReviewSerializer(google_review).data)


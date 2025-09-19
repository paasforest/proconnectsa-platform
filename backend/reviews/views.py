from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Review
from .serializers import (
    ReviewSerializer, ReviewCreateSerializer, ReviewModerationSerializer,
    ReviewSearchSerializer
)


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
@permission_classes([permissions.IsAuthenticated])
def review_stats_view(request, provider_id):
    """Get review statistics for a provider"""
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


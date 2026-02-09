from django.urls import path
from . import views

urlpatterns = [
    # Reviews
    path('', views.ReviewListView.as_view(), name='review-list'),
    path('create/', views.ReviewCreateView.as_view(), name='review-create'),
    path('<uuid:pk>/', views.ReviewDetailView.as_view(), name='review-detail'),
    path('<uuid:pk>/moderate/', views.ReviewModerationView.as_view(), name='review-moderate'),
    
    # Provider reviews (by User UUID - for authenticated/internal use)
    path('provider/<uuid:provider_id>/', views.provider_reviews_view, name='provider-reviews'),
    path('provider/<uuid:provider_id>/stats/', views.review_stats_view, name='provider-review-stats'),
    # Provider reviews by profile id (public - for frontend /providers/[id]/reviews)
    path('provider-by-profile/<int:profile_id>/', views.provider_reviews_by_profile_view, name='provider-reviews-by-profile'),
    path('provider-by-profile/<int:profile_id>/stats/', views.review_stats_by_profile_view, name='provider-review-stats-by-profile'),
    # Eligible review assignments (authenticated client only)
    path('provider-by-profile/<int:profile_id>/eligible/', views.eligible_review_assignments_by_profile_view, name='provider-review-eligible-by-profile'),
    
    # Google Reviews
    path('google/submit/', views.submit_google_review, name='google-review-submit'),
    path('google/my-reviews/', views.list_my_google_reviews, name='google-review-list-my'),
    path('google/provider-by-profile/<int:profile_id>/', views.public_google_reviews_by_profile, name='google-review-by-profile'),
    path('google/admin/list/', views.admin_list_google_reviews, name='google-review-admin-list'),
    path('google/admin/<uuid:review_id>/moderate/', views.admin_moderate_google_review, name='google-review-admin-moderate'),
]


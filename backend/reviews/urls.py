from django.urls import path
from . import views

urlpatterns = [
    # Reviews
    path('', views.ReviewListView.as_view(), name='review-list'),
    path('create/', views.ReviewCreateView.as_view(), name='review-create'),
    path('<uuid:pk>/', views.ReviewDetailView.as_view(), name='review-detail'),
    path('<uuid:pk>/moderate/', views.ReviewModerationView.as_view(), name='review-moderate'),
    
    # Provider reviews
    path('provider/<uuid:provider_id>/', views.provider_reviews_view, name='provider-reviews'),
    path('provider/<uuid:provider_id>/stats/', views.review_stats_view, name='provider-review-stats'),
]


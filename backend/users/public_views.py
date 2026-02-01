from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.core.paginator import Paginator
from django.utils.text import slugify
from django.utils import timezone

from .models import ProviderProfile, User
from backend.leads.models import ServiceCategory


def _provider_public_dict(p: ProviderProfile):
    u = p.user
    # Check if premium listing is active
    is_premium_active = (
        p.is_premium_listing and
        (p.premium_listing_expires_at is None or p.premium_listing_expires_at > timezone.now())
    )
    return {
        'id': str(p.id),
        'business_name': p.business_name,
        'city': u.city,
        'suburb': u.suburb,
        'service_categories': p.service_categories or [],
        'average_rating': float(p.average_rating or 0),
        'total_reviews': p.total_reviews,
        'verification_status': p.verification_status,
        'is_premium_listing': is_premium_active,
        'slug': slugify(p.business_name)[:60],
        # No sensitive contact info exposed here (email, phone hidden)
    }


@api_view(['GET'])
@permission_classes([AllowAny])
def public_providers_list(request):
    """
    Public: list verified providers OR premium listings with optional filters: category, city, page, page_size
    
    Visibility rules:
    - Verified providers are always visible (existing providers stay visible)
    - Premium listings are visible even if pending verification (but must be verified to show contact info)
    - NEW providers (created after 2025-02-01) must be BOTH verified AND premium to appear
    """
    category_slug = request.GET.get('category')
    city = request.GET.get('city')
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 20))

    # Show verified providers OR active premium listings
    # Grandfather clause: existing verified providers (created before cutoff) stay visible
    # New providers (after cutoff) need both verified AND premium
    from django.db.models import Q
    from datetime import datetime
    now = timezone.now()
    cutoff_date = timezone.make_aware(datetime(2025, 2, 1))  # Date when premium requirement started for new providers
    
    # Base query: verified OR premium
    qs = ProviderProfile.objects.filter(
        Q(verification_status='verified') |  # Verified providers (existing ones stay)
        Q(
            is_premium_listing=True,
            premium_listing_started_at__isnull=False,
            premium_listing_expires_at__gt=now
        ) |  # Monthly premium (not expired)
        Q(
            is_premium_listing=True,
            premium_listing_started_at__isnull=False,
            premium_listing_expires_at__isnull=True  # Lifetime premium
        )
    )
    
    # For NEW providers (created after cutoff), require BOTH verified AND premium
    # Exclude new providers that are not both verified AND premium
    qs = qs.exclude(
        created_at__gte=cutoff_date,  # Created after cutoff
        ~Q(verification_status='verified'),  # AND not verified
        ~Q(is_premium_listing=True)  # AND not premium
    )

    if category_slug:
        qs = qs.filter(service_categories__contains=[category_slug])
    if city:
        qs = qs.filter(user__city__iexact=city)

    # Order: premium first, then by rating/reviews
    qs = qs.select_related('user').order_by(
        '-is_premium_listing',
        '-average_rating',
        '-total_reviews',
        'business_name'
    )
    paginator = Paginator(qs, page_size)
    page_obj = paginator.get_page(page)

    data = [_provider_public_dict(p) for p in page_obj.object_list]
    return Response({
        'results': data,
        'pagination': {
            'page': page_obj.number,
            'pages': paginator.num_pages,
            'page_size': page_size,
            'total': paginator.count
        }
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def public_provider_detail(request, provider_id):
    """
    Public: provider profile detail
    
    Visibility rules:
    - Verified providers are always visible
    - Premium listings are visible even if pending verification
    """
    try:
        p = ProviderProfile.objects.select_related('user').get(id=provider_id)
        
        # Check visibility: verified OR active premium listing
        now = timezone.now()
        is_visible = (
            p.verification_status == 'verified' or
            (
                p.is_premium_listing and
                p.premium_listing_started_at is not None and
                (
                    p.premium_listing_expires_at is None or
                    p.premium_listing_expires_at > now
                )
            )
        )
        
        if not is_visible:
            return Response({
                'error': 'Provider profile not available',
                'message': 'This provider profile is not currently visible in the public directory.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        return Response(_provider_public_dict(p))
    except ProviderProfile.DoesNotExist:
        return Response({'error': 'Provider not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([AllowAny])
def list_all_providers_debug(request):
    """
    TEMPORARY: List ALL providers (including non-verified) for investigation.
    This endpoint should be removed after cleanup is complete.
    """
    qs = ProviderProfile.objects.select_related('user').order_by('business_name')
    
    data = []
    for p in qs:
        u = p.user
        data.append({
            'id': str(p.id),
            'business_name': p.business_name,
            'email': u.email,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'full_name': f"{u.first_name} {u.last_name}".strip(),
            'city': u.city,
            'suburb': u.suburb,
            'service_categories': p.service_categories or [],
            'verification_status': p.verification_status,
            'average_rating': float(p.average_rating or 0),
            'total_reviews': p.total_reviews,
            'credit_balance': p.credit_balance,
            'created_at': p.created_at.isoformat() if p.created_at else None,
        })
    
    return Response({
        'total': len(data),
        'providers': data,
        'note': 'TEMPORARY endpoint - includes all providers regardless of verification status'
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def search_provider_by_name(request):
    """
    TEMPORARY: Search for a provider by name (business name or user name).
    """
    search_query = request.GET.get('q', '').strip().lower()
    
    if not search_query:
        return Response({'error': 'Please provide a search query (?q=name)'}, status=400)
    
    # Search in provider profiles and user names
    from django.db.models import Q
    qs = ProviderProfile.objects.select_related('user').filter(
        Q(business_name__icontains=search_query) |
        Q(user__first_name__icontains=search_query) |
        Q(user__last_name__icontains=search_query) |
        Q(user__email__icontains=search_query)
    ).order_by('business_name')
    
    data = []
    for p in qs:
        u = p.user
        data.append({
            'id': str(p.id),
            'business_name': p.business_name,
            'email': u.email,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'full_name': f"{u.first_name} {u.last_name}".strip(),
            'city': u.city,
            'suburb': u.suburb,
            'service_categories': p.service_categories or [],
            'verification_status': p.verification_status,
        })
    
    return Response({
        'query': search_query,
        'count': len(data),
        'results': data
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def search_all_users(request):
    """
    TEMPORARY: Search ALL users (including those without provider profiles) by name or email.
    """
    search_query = request.GET.get('q', '').strip().lower()
    
    if not search_query:
        return Response({'error': 'Please provide a search query (?q=name)'}, status=400)
    
    from django.db.models import Q
    # Search all users
    users = User.objects.filter(
        Q(first_name__icontains=search_query) |
        Q(last_name__icontains=search_query) |
        Q(email__icontains=search_query) |
        Q(username__icontains=search_query)
    ).order_by('email')
    
    data = []
    for u in users:
        has_profile = hasattr(u, 'provider_profile')
        profile_data = None
        if has_profile:
            p = u.provider_profile
            profile_data = {
                'id': str(p.id),
                'business_name': p.business_name,
                'verification_status': p.verification_status,
                'service_categories': p.service_categories or [],
            }
        
        data.append({
            'user_id': str(u.id),
            'email': u.email,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'full_name': f"{u.first_name} {u.last_name}".strip(),
            'user_type': u.user_type,
            'is_active': u.is_active,
            'city': u.city,
            'suburb': u.suburb,
            'has_provider_profile': has_profile,
            'provider_profile': profile_data,
            'date_joined': u.date_joined.isoformat() if u.date_joined else None,
        })
    
    return Response({
        'query': search_query,
        'count': len(data),
        'results': data
    })


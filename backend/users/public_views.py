from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.core.paginator import Paginator
from django.utils.text import slugify
from django.utils import timezone
from django.db.models import Case, When, Value, BooleanField

from .models import ProviderProfile, User
from backend.leads.models import ServiceCategory


def _provider_public_dict(p: ProviderProfile):
    u = p.user
    # Get service category names from slugs
    service_category_names = []
    if p.service_categories:
        for slug in p.service_categories:
            try:
                cat = ServiceCategory.objects.get(slug=slug, is_active=True)
                service_category_names.append(cat.name)
            except ServiceCategory.DoesNotExist:
                service_category_names.append(slug.replace('-', ' ').title())
    
    return {
        'id': str(p.id),
        'business_name': p.business_name,
        'city': u.city,
        'suburb': u.suburb,
        'service_categories': p.service_categories or [],
        'service_category_names': service_category_names,
        'average_rating': float(p.average_rating or 0),
        'total_reviews': p.total_reviews,
        'verification_status': p.verification_status,
        'is_premium_listing': bool(p.is_premium_listing),
        # Active if lifetime (expires_at is null) OR expires_at is in the future.
        'is_premium_listing_active': bool(p.is_premium_listing) and (
            p.premium_listing_expires_at is None or p.premium_listing_expires_at > timezone.now()
        ),
        'slug': slugify(p.business_name)[:60],
        # Enhanced company details
        'bio': p.bio or '',
        'years_experience': p.years_experience,
        'service_areas': p.service_areas or [],
        'max_travel_distance': p.max_travel_distance,
        'hourly_rate_min': float(p.hourly_rate_min) if p.hourly_rate_min else None,
        'hourly_rate_max': float(p.hourly_rate_max) if p.hourly_rate_max else None,
        'minimum_job_value': float(p.minimum_job_value) if p.minimum_job_value else None,
        'response_time_hours': float(p.response_time_hours) if p.response_time_hours else None,
        'job_completion_rate': float(p.job_completion_rate) if p.job_completion_rate else None,
        'profile_image': p.profile_image or '',
        'portfolio_images': p.portfolio_images or [],
        'insurance_valid_until': p.insurance_valid_until.isoformat() if p.insurance_valid_until else None,
        # No sensitive contact info exposed here
    }


@api_view(['GET'])
@permission_classes([AllowAny])
def public_providers_list(request):
    """
    Public: list verified providers with optional filters: category, city, page, page_size
    Shows verified + pending providers (excludes rejected/suspended). Premium providers are flagged in response.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    category_slug = request.GET.get('category')
    city = request.GET.get('city')
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 20))

    qs = ProviderProfile.objects.filter(verification_status__in=['verified', 'pending']).exclude(
        verification_status__in=['rejected', 'suspended']
    )

    if category_slug:
        qs = qs.filter(service_categories__contains=[category_slug])
    if city:
        qs = qs.filter(user__city__iexact=city)

    now = timezone.now()
    qs = qs.annotate(
        premium_active=Case(
            When(is_premium_listing=True, premium_listing_expires_at__isnull=True, then=Value(True)),
            When(is_premium_listing=True, premium_listing_expires_at__gt=now, then=Value(True)),
            default=Value(False),
            output_field=BooleanField(),
        )
    ).select_related('user').order_by(
        '-premium_active',
        # Verified providers first, then pending
        Case(
            When(verification_status='verified', then=Value(0)),
            When(verification_status='pending', then=Value(1)),
            default=Value(2),
        ),
        '-average_rating',
        '-total_reviews',
        'business_name',
    )
    paginator = Paginator(qs, page_size)
    page_obj = paginator.get_page(page)

    data = [_provider_public_dict(p) for p in page_obj.object_list]
    
    logger.info(f"Returning {len(data)} providers")
    
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
    Public: provider profile detail (verified or pending; excludes rejected/suspended)
    """
    try:
        p = ProviderProfile.objects.select_related('user').get(
            id=provider_id,
            verification_status__in=['verified', 'pending'],
        )
        if p.verification_status in ['rejected', 'suspended']:
            return Response({'error': 'Provider not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(_provider_public_dict(p))
    except ProviderProfile.DoesNotExist:
        return Response({'error': 'Provider not found'}, status=status.HTTP_404_NOT_FOUND)


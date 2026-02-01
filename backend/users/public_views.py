from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.core.paginator import Paginator
from django.utils.text import slugify

from .models import ProviderProfile, User
from backend.leads.models import ServiceCategory


def _provider_public_dict(p: ProviderProfile):
    u = p.user
    return {
        'id': str(p.id),
        'business_name': p.business_name,
        'city': u.city,
        'suburb': u.suburb,
        'service_categories': p.service_categories or [],
        'average_rating': float(p.average_rating or 0),
        'total_reviews': p.total_reviews,
        'verification_status': p.verification_status,
        'slug': slugify(p.business_name)[:60],
        # No sensitive contact info exposed here
    }


@api_view(['GET'])
@permission_classes([AllowAny])
def public_providers_list(request):
    """
    Public: list verified providers with optional filters: category, city, page, page_size
    """
    category_slug = request.GET.get('category')
    city = request.GET.get('city')
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 20))

    qs = ProviderProfile.objects.filter(verification_status='verified')

    if category_slug:
        qs = qs.filter(service_categories__contains=[category_slug])
    if city:
        qs = qs.filter(user__city__iexact=city)

    qs = qs.select_related('user').order_by('-average_rating', '-total_reviews', 'business_name')
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
    Public: provider profile detail (verified only)
    """
    try:
        p = ProviderProfile.objects.select_related('user').get(id=provider_id, verification_status='verified')
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


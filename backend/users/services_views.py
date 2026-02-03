"""
Services API views for managing provider services
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from django.utils import timezone
import logging

from .models import User, ProviderProfile, Service
from backend.leads.models import Lead
from .models import LeadPurchase

logger = logging.getLogger(__name__)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def my_services(request):
    """
    Get all services for the authenticated provider (GET) or add a new service (POST)
    """
    try:
        user = request.user
        
        # Check if user has a provider profile, create one if they don't
        try:
            provider_profile = ProviderProfile.objects.get(user=user)
        except ProviderProfile.DoesNotExist:
            # Create a basic provider profile for the user
            provider_profile = ProviderProfile.objects.create(
                user=user,
                business_name=f"{user.get_full_name() or user.username}'s Business",
                business_address="Address not provided",
                service_areas=[],
                service_categories=[],
                verification_status='pending',
                subscription_tier='pay_as_you_go'
            )
        
        if request.method == 'POST':
            # Add new service
            name = request.data.get('name')
            category_name = request.data.get('category')
            description = request.data.get('description', '')
            
            if not name or not category_name:
                return Response(
                    {'error': 'Service name and category are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check for duplicate service
            existing_service = Service.objects.filter(
                provider=provider_profile,
                name__iexact=name,
                category__name__iexact=category_name
            ).first()
            
            if existing_service:
                return Response(
                    {'error': f'A service with name "{name}" in category "{category_name}" already exists'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create service category
            from backend.leads.models import ServiceCategory
            category, created = ServiceCategory.objects.get_or_create(
                name=category_name,
                defaults={'description': f'Category for {category_name}'}
            )
            
            # Create the service
            service = Service.objects.create(
                provider=provider_profile,
                name=name,
                category=category,
                description=description,
                is_active=True
            )
            
            return Response({
                'success': True,
                'message': f'Service "{name}" has been successfully added!',
                'service': {
                    'id': str(service.id),
                    'name': service.name,
                    'category': service.category.name,
                    'description': service.description,
                    'is_active': service.is_active,
                    'created_at': service.created_at.isoformat(),
                    'lead_count': 0,
                    'success_rate': 0
                }
            }, status=status.HTTP_201_CREATED)
        
        # Get all services for this provider
        services = Service.objects.filter(provider=provider_profile).order_by('-created_at')
        
        services_data = []
        for service in services:
            # Calculate lead count and success rate
            lead_count = Lead.objects.filter(
                service_category=service.category
            ).count()
            
            # Get purchased leads for this service
            purchased_leads = LeadPurchase.objects.filter(
                user=user,
                lead__service_category=service.category
            )
            
            won_leads = purchased_leads.filter(won_at__isnull=False).count()
            success_rate = round((won_leads / purchased_leads.count() * 100) if purchased_leads.count() > 0 else 0, 1)
            
            services_data.append({
                'id': str(service.id),
                'name': service.name,
                'category': service.category.name,
                'description': service.description,
                'is_active': service.is_active,
                'created_at': service.created_at.isoformat(),
                'lead_count': lead_count,
                'success_rate': success_rate
            })
        
        return Response({
            'services': services_data,
            'total': len(services_data)
        })
        
    except Exception as e:
        logger.error(f"Failed to fetch services for user {request.user.email}: {str(e)}")
        return Response(
            {'error': 'Failed to fetch services'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_service(request):
    """
    Add a new service for the provider
    """
    try:
        user = request.user
        provider_profile = get_object_or_404(ProviderProfile, user=user)
        
        name = request.data.get('name')
        category_name = request.data.get('category')
        description = request.data.get('description', '')
        
        if not name or not category_name:
            return Response(
                {'error': 'Service name and category are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create service category
        from backend.leads.models import ServiceCategory
        category, created = ServiceCategory.objects.get_or_create(
            name=category_name,
            defaults={'description': f'Service category for {category_name}'}
        )
        
        # Create service
        service = Service.objects.create(
            provider=provider_profile,
            name=name,
            category=category,
            description=description,
            is_active=True
        )
        
        # CRITICAL FIX: Update service_categories JSON field to sync with Service objects
        _sync_service_categories_json_field(provider_profile)
        
        return Response({
            'success': True,
            'service': {
                'id': str(service.id),
                'name': service.name,
                'category': service.category.name,
                'description': service.description,
                'is_active': service.is_active,
                'created_at': service.created_at.isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Failed to add service for user {request.user.email}: {str(e)}")
        return Response(
            {'error': 'Failed to add service'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_service(request, service_id):
    """
    Update an existing service
    """
    try:
        user = request.user
        provider_profile = get_object_or_404(ProviderProfile, user=user)
        
        service = get_object_or_404(Service, id=service_id, provider=provider_profile)
        
        # Update fields
        if 'name' in request.data:
            service.name = request.data['name']
        if 'description' in request.data:
            service.description = request.data['description']
        if 'is_active' in request.data:
            service.is_active = request.data['is_active']
        
        service.save()
        
        return Response({
            'success': True,
            'service': {
                'id': str(service.id),
                'name': service.name,
                'category': service.category.name,
                'description': service.description,
                'is_active': service.is_active,
                'updated_at': service.updated_at.isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Failed to update service for user {request.user.email}: {str(e)}")
        return Response(
            {'error': 'Failed to update service'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_service(request, service_id):
    """
    Delete a service
    """
    try:
        user = request.user
        provider_profile = get_object_or_404(ProviderProfile, user=user)
        
        service = get_object_or_404(Service, id=service_id, provider=provider_profile)
        service.delete()
        
        return Response({
            'success': True,
            'message': 'Service deleted successfully'
        })
        
    except Exception as e:
        logger.error(f"Failed to delete service for user {request.user.email}: {str(e)}")
        return Response(
            {'error': 'Failed to delete service'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def service_stats(request):
    """
    Get service statistics for the provider
    """
    try:
        user = request.user
        provider_profile = get_object_or_404(ProviderProfile, user=user)
        
        # Get all services for this provider
        services = Service.objects.filter(provider=provider_profile)
        
        total_services = services.count()
        active_services = services.filter(is_active=True).count()
        
        # Calculate total leads and success rate
        total_leads = 0
        total_won = 0
        
        for service in services:
            lead_count = Lead.objects.filter(service_category=service.category).count()
            total_leads += lead_count
            
            purchased_leads = LeadPurchase.objects.filter(
                user=user,
                lead__service_category=service.category
            )
            won_leads = purchased_leads.filter(won_at__isnull=False).count()
            total_won += won_leads
        
        success_rate = round((total_won / total_leads * 100) if total_leads > 0 else 0, 1)
        
        return Response({
            'total_services': total_services,
            'active_services': active_services,
            'total_leads': total_leads,
            'total_won': total_won,
            'success_rate': success_rate
        })
        
    except Exception as e:
        logger.error(f"Failed to fetch service stats for user {request.user.email}: {str(e)}")
        return Response(
            {'error': 'Failed to fetch service stats'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def _sync_service_categories_json_field(provider_profile):
    """
    CRITICAL FIX: Sync service_categories JSON field with Service objects.
    This ensures that when services are added/removed, the JSON field is updated
    so that lead filtering works correctly.
    """
    try:
        # Get all active service category slugs from Service objects
        active_service_categories = set()
        for service in provider_profile.services.filter(is_active=True):
            if service.category.slug:
                active_service_categories.add(service.category.slug)

        # Add parent slugs for any selected child categories (e.g. cctv-installation -> security)
        if active_service_categories:
            parents = ServiceCategory.objects.filter(
                slug__in=list(active_service_categories),
                is_active=True,
                parent__isnull=False,
            ).select_related("parent").values_list("parent__slug", flat=True)
            for p in parents:
                if p:
                    active_service_categories.add(p)
        
        # Update the JSON field to match Service objects
        provider_profile.service_categories = list(active_service_categories)
        provider_profile.save(update_fields=['service_categories'])
        
        logger.info(f"Synced service_categories for {provider_profile.user.email}: {list(active_service_categories)}")
        
    except Exception as e:
        logger.error(f"Failed to sync service_categories for {provider_profile.user.email}: {str(e)}")

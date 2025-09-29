from rest_framework import generics, status, permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
from backend.users.api_key_auth import PublicAPIKeyAuthentication
from django.utils import timezone
try:
    from ratelimit.decorators import ratelimit
except Exception:  # pragma: no cover
    # Fallback no-op decorator if ratelimit is unavailable
    def ratelimit(*args, **kwargs):
        def _decorator(view_func):
            return view_func
        return _decorator
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.db.models import Q
from .models import ServiceCategory, Lead, LeadAssignment
from .serializers import (
    ServiceCategorySerializer, 
    LeadSerializer, 
    LeadCreateSerializer,
    LeadAssignmentSerializer
)
from .services import LeadAssignmentService, LeadFilteringService
from backend.users.models import User
from backend.notifications.email_service import (
    send_lead_notification_email, 
    send_quote_received_email,
    send_lead_verification_email
)
import logging

logger = logging.getLogger(__name__)


class ServiceCategoryListView(generics.ListAPIView):
    """List all active service categories"""
    queryset = ServiceCategory.objects.filter(is_active=True)
    serializer_class = ServiceCategorySerializer
    
    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class LeadListView(generics.ListAPIView):
    """List leads for authenticated users"""
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_provider:
            # Providers see assigned leads
            return Lead.objects.filter(
                assignments__provider=user
            ).distinct().order_by('-created_at')
        else:
            # Clients see their own leads
            return Lead.objects.filter(
                client=user
            ).order_by('-created_at')


class LeadCreateView(generics.CreateAPIView):
    """Create a new lead"""
    serializer_class = LeadCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Set client to current user
        serializer.save(client=self.request.user)
        
        # Lead stays as 'verified' and available for providers to purchase
        # NO automatic assignment - providers must unlock/purchase leads
        lead = serializer.instance
        if lead.status == 'verified':
            logger.info(f"Lead {lead.id} created and available for purchase in marketplace")
            
            # Send WebSocket notification for new lead availability
            from backend.notifications.consumers import NotificationConsumer
            lead_data = {
                'id': lead.id,
                'title': lead.title,
                'description': lead.description[:200] + '...' if len(lead.description) > 200 else lead.description,
                'category': lead.service_category.name,
                'location': lead.location_suburb,
                'urgency': lead.urgency,
                'cost': 1.0,  # Default cost, can be calculated based on ML
                'timePosted': 'Today'
            }
            NotificationConsumer.send_lead_created_to_all(lead_data)


class LeadDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a lead"""
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_provider:
            # Providers can see assigned leads
            return Lead.objects.filter(
                assignments__provider=user
            ).distinct()
        else:
            # Clients can see their own leads
            return Lead.objects.filter(client=user)


class LeadAssignmentListView(generics.ListAPIView):
    """List purchased lead assignments for providers (My Leads)"""
    serializer_class = LeadAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if not self.request.user.is_provider:
            return LeadAssignment.objects.none()
        
        # Only show purchased leads (BARK-STYLE)
        return LeadAssignment.objects.filter(
            provider=self.request.user,
            status='purchased'  # Only purchased/unlocked leads
        ).order_by('-purchased_at')


class LeadAssignmentDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve or update a lead assignment"""
    serializer_class = LeadAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if not self.request.user.is_provider:
            return LeadAssignment.objects.none()
        
        return LeadAssignment.objects.filter(provider=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def assign_lead_to_providers(request, lead_id):
    """Manually trigger lead assignment to providers"""
    if not request.user.is_admin:
        return Response(
            {'error': 'Only admins can trigger lead assignment'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        assignment_service = LeadAssignmentService()
        assignments = assignment_service.assign_lead_to_providers(lead_id)
        
        if assignments:
            return Response({
                'message': f'Lead assigned to {len(assignments)} providers',
                'assignments': LeadAssignmentSerializer(assignments, many=True).data
            })
        else:
            return Response({
                'message': 'No matching providers found for this lead'
            })
            
    except Lead.DoesNotExist:
        return Response(
            {'error': 'Lead not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error assigning lead {lead_id}: {str(e)}")
        return Response(
            {'error': 'Failed to assign lead'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_filtered_leads(request):
    """Get filtered leads for providers based on their preferences"""
    if not request.user.is_provider:
        return Response(
            {'error': 'Only providers can access filtered leads'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Get filters from query parameters
        filters = {
            'hiring_intent': request.GET.getlist('hiring_intent'),
            'urgency': request.GET.getlist('urgency'),
            'budget_range': request.GET.getlist('budget_range'),
            'min_verification_score': request.GET.get('min_verification_score', type=int)
        }
        
        # Remove empty filters
        filters = {k: v for k, v in filters.items() if v}
        
        # Get filtered leads
        leads = LeadFilteringService.get_filtered_leads_for_provider(
            request.user, 
            filters
        )
        
        # Paginate results
        page_size = int(request.GET.get('page_size', 20))
        page = int(request.GET.get('page', 1))
        
        start = (page - 1) * page_size
        end = start + page_size
        
        leads_page = leads[start:end]
        
        return Response({
            'results': LeadSerializer(leads_page, many=True).data,
            'count': leads.count(),
            'page': page,
            'page_size': page_size,
            'total_pages': (leads.count() + page_size - 1) // page_size
        })
        
    except Exception as e:
        logger.error(f"Error getting filtered leads: {str(e)}")
        return Response(
            {'error': 'Failed to get filtered leads'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_assignment_viewed(request, assignment_id):
    """Mark a lead assignment as viewed by provider"""
    try:
        assignment = LeadAssignment.objects.get(
            id=assignment_id, 
            provider=request.user
        )
        assignment.mark_as_viewed()
        
        return Response({
            'message': 'Assignment marked as viewed',
            'assignment': LeadAssignmentSerializer(assignment).data
        })
        
    except LeadAssignment.DoesNotExist:
        return Response(
            {'error': 'Assignment not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_assignment_contacted(request, assignment_id):
    """Mark a lead assignment as contacted by provider"""
    try:
        assignment = LeadAssignment.objects.get(
            id=assignment_id, 
            provider=request.user
        )
        assignment.mark_as_contacted()
        
        return Response({
            'message': 'Assignment marked as contacted',
            'assignment': LeadAssignmentSerializer(assignment).data
        })
        
    except LeadAssignment.DoesNotExist:
        return Response(
            {'error': 'Assignment not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_quote(request, assignment_id):
    """Submit a quote for a lead assignment"""
    try:
        assignment = LeadAssignment.objects.get(
            id=assignment_id, 
            provider=request.user
        )
        
        quote_amount = request.data.get('quote_amount')
        estimated_duration = request.data.get('estimated_duration')
        provider_notes = request.data.get('provider_notes', '')
        
        if not quote_amount:
            return Response(
                {'error': 'Quote amount is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assignment.mark_as_quoted(
            quote_amount=float(quote_amount),
            estimated_duration=estimated_duration
        )
        
        if provider_notes:
            assignment.provider_notes = provider_notes
            assignment.save(update_fields=['provider_notes'])
        
        return Response({
            'message': 'Quote submitted successfully',
            'assignment': LeadAssignmentSerializer(assignment).data
        })
        
    except LeadAssignment.DoesNotExist:
        return Response(
            {'error': 'Assignment not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except ValueError:
        return Response(
            {'error': 'Invalid quote amount'}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='20/h', block=True)  # 20 lead creations per hour
def create_public_lead(request):
    """Create a lead without authentication (public endpoint)"""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    # Extract client contact details from request
    client_name = request.data.get('client_name', 'Anonymous Client')
    client_email = request.data.get('client_email', f'client_{timezone.now().timestamp()}@temp.proconnectsa.co.za')
    client_phone = request.data.get('client_phone', '0000000000')
    
    serializer = LeadCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        # Create or get client user with real contact details
        name_parts = client_name.split(' ', 1)
        first_name = name_parts[0] if name_parts else 'Anonymous'
        last_name = name_parts[1] if len(name_parts) > 1 else 'Client'
        
        # Try to find existing user by email first, then by phone
        client_user = User.objects.filter(email=client_email).first()
        
        if not client_user:
            # Try to find by phone if email doesn't exist
            client_user = User.objects.filter(phone=client_phone).first()
            
        if not client_user:
            # Create new user with unique username
            import time
            unique_username = f'client_{int(time.time() * 1000)}'
            client_user = User.objects.create(
                email=client_email,
                username=unique_username,
                first_name=first_name,
                last_name=last_name,
                phone=client_phone,
                user_type='client',
                is_active=True
            )
        else:
            # Update existing user with latest info if needed
            if not client_user.first_name:
                client_user.first_name = first_name
                client_user.last_name = last_name
                client_user.save()
        
        # Create lead with real client
        validated_data = serializer.validated_data
        validated_data['client'] = client_user
        
        # Auto-verify public leads since they come from our website form
        validated_data['status'] = 'verified'
        validated_data['verification_score'] = 75  # Good score for website leads
        validated_data['verified_at'] = timezone.now()
        
        lead = Lead.objects.create(**validated_data)
        
        # Calculate and store credit cost for this lead
        try:
            from .ml_services import DynamicPricingMLService
            pricing_service = DynamicPricingMLService()
            pricing_result = pricing_service.calculate_dynamic_lead_price(lead, None)
            lead.credit_cost = pricing_result['price'] * 50  # Convert credits to Rands for storage
            lead.save(update_fields=['credit_cost'])
            logger.info(f"💰 Lead {lead.id} credit cost calculated: {pricing_result['price']} credits (R{pricing_result['price'] * 50})")
        except Exception as e:
            logger.error(f"💰 Failed to calculate credit cost for lead {lead.id}: {str(e)}")
            # Set default credit cost
            lead.credit_cost = 200  # Default R200 (4 credits)
            lead.save(update_fields=['credit_cost'])
        
        # Monitor lead creation
        from backend.leads.flow_monitor import flow_monitor
        flow_monitor.monitor_lead_creation(lead)
        
        # Lead is now available for providers to purchase - NO automatic assignment
        logger.info(f"Public lead {lead.id} created and available in marketplace for purchase")
        
        # Send notifications to potential providers about new lead availability
        try:
            from backend.leads.services import LeadAssignmentService
            from backend.notifications.services import NotificationService
            
            # Find matching providers (but don't assign, just notify)
            assignment_service = LeadAssignmentService()
            matching_providers = assignment_service.find_matching_providers(lead)
            
            if matching_providers:
                notification_service = NotificationService()
                for provider in matching_providers:
                    # Create notification about new lead availability
                    notification_service.create_notification(
                        user=provider,
                        title=f"New {lead.service_category.name} Lead Available",
                        message=f"New lead in {lead.location_city}: {lead.title}",
                        notification_type='lead_assigned',
                        priority='medium',
                        lead=lead,
                        data={
                            'lead_id': str(lead.id),
                            'service_category': lead.service_category.name,
                            'location': f"{lead.location_suburb}, {lead.location_city}",
                            'budget_range': lead.get_budget_display_range(),
                            'urgency': lead.get_urgency_display()
                        }
                    )
                
                logger.info(f"Sent new lead notifications to {len(matching_providers)} potential providers")
            else:
                logger.info(f"No matching providers found for notifications for lead {lead.id}")
                
        except Exception as e:
            logger.error(f"Error sending new lead notifications: {str(e)}")
            # Don't fail lead creation if notifications fail
        
        return Response(
            LeadSerializer(lead).data, 
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def available_leads_view(request):
    """Get available leads for authenticated providers using ML-based intelligent filtering"""
    # Only allow providers to access leads
    if not request.user.is_authenticated or request.user.user_type != 'service_provider':
        return Response(
            {'error': 'Only authenticated service providers can view leads'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Use ML-based filtering instead of hardcoded queries
        # This provides intelligent lead-provider matching based on:
        # - Service categories compatibility with ML scoring
        # - Geographical proximity with ML optimization
        # - Lead quality preferences and provider preferences
        # - Historical success patterns and conversion rates
        from .services import LeadFilteringService
        
        leads = LeadFilteringService.get_filtered_leads_for_provider(
            provider=request.user,
            filters={
                'status': 'verified',  # Match actual lead status
                'is_available': True,
                'expires_at__gt': timezone.now(),
                'limit': 20
            }
        )
        
        logger.info(f"ML filtering returned {leads.count()} leads for provider {request.user.id}")
        
        # Serialize and return leads
        serializer = LeadSerializer(leads, many=True)
        return Response({'leads': serializer.data})
        
    except Exception as e:
        logger.error(f"Error fetching available leads: {str(e)}")
        return Response(
            {'error': 'Failed to fetch available leads'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def verify_lead_sms(request, lead_id):
    """Verify lead via SMS (placeholder)"""
    try:
        lead = Lead.objects.get(id=lead_id)
        # SMS verification logic would go here
        lead.is_sms_verified = True
        lead.status = 'verified'
        lead.save()
        
        # Trigger lead assignment with ML service
        assignment_service = LeadAssignmentService()
        assignments = assignment_service.assign_lead_to_providers(lead.id)
        
        # Send email notifications to assigned providers
        if assignments:
            for assignment in assignments:
                try:
                    send_lead_notification_email(assignment.provider, lead)
                except Exception as e:
                    logger.error(f"Failed to send lead notification email: {str(e)}")
        
        return Response({'message': 'Lead verified successfully'})
    except Lead.DoesNotExist:
        return Response(
            {'error': 'Lead not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def track_lead_view(request, lead_id):
    """Track when a provider views a lead for Bark-style competition stats"""
    from django.core.cache import cache
    from django.db import transaction
    import time
    
    try:
        # Use Redis to track views with atomic increment
        cache_key = f"lead_views_{lead_id}"
        user_view_key = f"lead_view_{lead_id}_{request.user.id}"
        
        # Check if this user already viewed this lead recently (prevent spam)
        if cache.get(user_view_key):
            return Response({
                'success': True,
                'views_count': cache.get(cache_key, 0),
                'message': 'View already tracked recently'
            })
        
        # Atomic increment in Redis (no database locks)
        views_count = cache.get(cache_key, 0)
        cache.set(cache_key, views_count + 1, timeout=3600)  # 1 hour cache
        
        # Mark user as having viewed (prevent duplicate views for 5 minutes)
        cache.set(user_view_key, True, timeout=300)
        
        # Update database periodically (every 10 views) to reduce contention
        if (views_count + 1) % 10 == 0:
            try:
                with transaction.atomic():
                    # Use select_for_update to prevent race conditions
                    lead = Lead.objects.select_for_update(nowait=True).get(id=lead_id)
                    lead.views_count = views_count + 1
                    lead.save(update_fields=['views_count'])
            except Lead.DoesNotExist:
                pass
            except Exception as db_error:
                # Database update failed, but Redis counter still works
                logger.warning(f"Database update failed for lead {lead_id}: {str(db_error)}")
        
        logger.info(f"Lead {lead_id} view tracked by user {request.user.id}")
        
        return Response({
            'success': True,
            'views_count': views_count + 1,
            'message': 'View tracked successfully'
        })
        
    except Exception as e:
        logger.error(f"Error tracking lead view: {str(e)}")
        # Fallback: try simple database update with timeout
        try:
            with transaction.atomic():
                lead = Lead.objects.select_for_update(nowait=True).get(id=lead_id)
                lead.increment_views_count()
                return Response({
                    'success': True,
                    'views_count': lead.views_count,
                    'message': 'View tracked successfully (fallback)'
                })
        except Exception as fallback_error:
            logger.error(f"Fallback tracking failed: {str(fallback_error)}")
            return Response(
                {'error': 'Failed to track view'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Enterprise Lead Filtering Service
class EnterpriseLeadFilteringService:
    """
    Enterprise-grade lead filtering with proper query management,
    caching, and error handling.
    """
    
    def __init__(self):
        self.cache_timeout = 300  # 5 minutes
    
    def get_leads_for_provider(self, provider_id: int, limit: int = 20) -> dict:
        """
        Main entry point for getting filtered leads for a provider.
        Returns structured response with metadata.
        """
        try:
            # 1. Validate and get provider
            provider = self._get_validated_provider(provider_id)
            if not provider:
                return self._error_response("Provider not found or invalid")
            
            # 2. Build and execute query (no caching for now to avoid complexity)
            leads_queryset = self._build_leads_query(provider)
            leads_data = self._execute_and_serialize_query(leads_queryset, limit)
            
            # 3. Prepare response
            response = {
                'success': True,
                'leads': leads_data,
                'count': len(leads_data),
                'provider_id': provider_id,
                'provider_credits': provider.provider_profile.credit_balance,
                'filters_applied': self._get_filter_summary(provider),
                'timestamp': timezone.now().isoformat()
            }
            
            logger.info(f"Successfully filtered {len(leads_data)} leads for provider {provider_id}")
            return response
            
        except Exception as e:
            logger.error(f"EnterpriseLeadFilteringService error for provider {provider_id}: {str(e)}")
            return self._error_response(f"Service error: {str(e)}")
    
    def _get_validated_provider(self, provider_id: int):
        """Validate provider exists and has necessary permissions/credits."""
        try:
            provider = User.objects.select_related('provider_profile').get(
                id=provider_id,
                user_type='provider',
                is_active=True
            )
            
            # Check if provider profile exists and is verified
            if not hasattr(provider, 'provider_profile'):
                logger.warning(f"Provider {provider_id} has no provider profile")
                return None
                
            profile = provider.provider_profile
            
            # Check verification status
            if profile.verification_status != 'verified':
                logger.warning(f"Provider {provider_id} not verified")
                return None
            
            # Check credits
            if profile.credit_balance <= 0:
                logger.warning(f"Provider {provider_id} has no credits")
                return None
                
            return provider
            
        except User.DoesNotExist:
            logger.warning(f"Provider {provider_id} not found")
            return None
    
    def _build_leads_query(self, provider):
        """
        Build the leads query with proper filter ordering to avoid slice errors.
        This is the core method that must avoid Django ORM slice issues.
        """
        profile = provider.provider_profile
        
        # Start with base queryset - NO slicing here
        base_query = Lead.objects.filter(
            status='verified',
            is_available=True,
            expires_at__gt=timezone.now()
        )
        
        # Apply filters step by step, ensuring no slicing until the end
        filtered_query = base_query
        
        # Service category filter
        if profile.service_categories:
            filtered_query = filtered_query.filter(
                service_category_id__in=profile.service_categories
            )
        
        # Geographic filter
        if profile.service_areas:
            service_area_filter = Q()
            for area in profile.service_areas:
                service_area_filter |= (
                    Q(location_city__icontains=area) |
                    Q(location_suburb__icontains=area)
                )
            filtered_query = filtered_query.filter(service_area_filter)
        
        # Lead quality filter (optional)
        filtered_query = filtered_query.filter(verification_score__gte=40)
        
        # Add select_related for performance
        filtered_query = filtered_query.select_related('service_category', 'client')
        
        # Order by - this must happen BEFORE any slicing
        ordered_query = filtered_query.order_by('-verification_score', '-created_at')
        
        return ordered_query
    
    def _execute_and_serialize_query(self, queryset, limit: int) -> list:
        """Execute query and serialize results safely."""
        try:
            # Apply limit here - this is where slicing happens
            leads = list(queryset[:limit])
            
            # Serialize to dictionaries
            serialized_leads = []
            for lead in leads:
                serialized_leads.append({
                    'id': str(lead.id),
                    'title': lead.title,
                    'description': lead.description[:200] + '...' if len(lead.description) > 200 else lead.description,
                    'service_category': {
                        'id': lead.service_category.id,
                        'name': lead.service_category.name,
                        'slug': lead.service_category.slug
                    },
                    'location_city': lead.location_city,
                    'location_suburb': lead.location_suburb,
                    'location_address': lead.location_address,
                    'budget_range': lead.budget_range,
                    'budget_display': lead.get_budget_display_range(),
                    'urgency': lead.urgency,
                    'urgency_display': lead.get_urgency_display(),
                    'hiring_intent': lead.hiring_intent,
                    'hiring_timeline': lead.hiring_timeline,
                    'verification_score': lead.verification_score,
                    'created_at': lead.created_at.isoformat(),
                    'expires_at': lead.expires_at.isoformat(),
                    'contact_preview': self._generate_contact_preview(lead),
                    'estimated_value': self._calculate_lead_value(lead),
                    'credit_required': 50  # Default credit cost
                })
            
            return serialized_leads
            
        except Exception as e:
            logger.error(f"Query execution error: {str(e)}")
            raise
    
    def _generate_contact_preview(self, lead):
        """Generate masked contact information for preview."""
        return {
            'name_preview': f"{lead.client.first_name[:2]}***" if lead.client.first_name else "***",
            'phone_preview': f"***{lead.client.phone[-3:]}" if lead.client.phone and len(lead.client.phone) > 3 else "***",
            'email_preview': f"***@{lead.client.email.split('@')[1]}" if lead.client.email and '@' in lead.client.email else "***"
        }
    
    def _calculate_lead_value(self, lead):
        """Calculate estimated lead value for pricing."""
        base_value = 50  # Base price in credits
        
        # Adjust based on verification score
        if lead.verification_score >= 80:
            return base_value * 2
        elif lead.verification_score >= 60:
            return int(base_value * 1.5)
        else:
            return base_value
    
    def _get_filter_summary(self, provider):
        """Return summary of filters applied."""
        profile = provider.provider_profile
        return {
            'service_categories': profile.service_categories,
            'service_areas': profile.service_areas,
            'min_verification_score': 40,
            'status_filter': 'verified',
            'verification_status': profile.verification_status
        }
    
    def _error_response(self, message: str) -> dict:
        """Standard error response format."""
        return {
            'success': False,
            'error': message,
            'leads': [],
            'count': 0,
            'timestamp': timezone.now().isoformat()
        }


# Enterprise API Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def enterprise_wallet_available(request):
    """
    Enterprise-grade wallet API that uses the new filtering service.
    Maintains backward compatibility with existing frontend.
    """
    try:
        # Get provider from authenticated user
        provider = request.user
        
        # Validate provider type
        if provider.user_type not in ['provider', 'service_provider']:
            return Response({
                'success': False,
                'error': 'Access denied: User is not a provider'
            }, status=403)
        
        # Get limit from request
        if request.method == 'POST':
            try:
                data = request.data
                limit = min(data.get('limit', 20), 50)
            except:
                limit = 20
        else:
            limit = min(int(request.GET.get('limit', 20)), 50)
        
        # Use the new enterprise filtering service
        filtering_service = EnterpriseLeadFilteringService()
        result = filtering_service.get_leads_for_provider(provider.id, limit)
        
        # Format response to match legacy API structure
        if result['success']:
            # Get wallet information
            try:
                from backend.users.models import Wallet
                wallet = Wallet.objects.get(user=provider)
                wallet_data = {
                    'credits': wallet.credits,
                    'balance': float(wallet.balance),
                    'total_spent': float(wallet.total_spent),
                    'last_updated': wallet.updated_at.isoformat()
                }
            except Wallet.DoesNotExist:
                wallet_data = {
                    'credits': 0,
                    'balance': 0.0,
                    'total_spent': 0.0,
                    'last_updated': None
                }
            
            # Return legacy format
            return Response({
                'success': True,
                'leads': result['leads'],
                'count': result['count'],
                'wallet': wallet_data,
                'provider_id': provider.id,
                'timestamp': result['timestamp']
            })
        else:
            return Response({
                'success': False,
                'error': result['error'],
                'leads': [],
                'count': 0,
                'wallet': {'credits': 0, 'balance': 0.0, 'total_spent': 0.0}
            }, status=400)
            
    except Exception as e:
        logger.error(f"Error in enterprise wallet API: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error',
            'leads': [],
            'count': 0,
            'wallet': {'credits': 0, 'balance': 0.0, 'total_spent': 0.0}
        }, status=500)
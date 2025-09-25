from rest_framework import generics, status, permissions
from rest_framework.permissions import AllowAny
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
@ratelimit(key='ip', rate='5/m', block=True)
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
@permission_classes([IsAuthenticated])
def available_leads_view(request):
    """Get available leads for authenticated providers only"""
    # Only allow providers to access leads
    if not request.user.is_authenticated or request.user.user_type != 'service_provider':
        return Response(
            {'error': 'Only authenticated service providers can view leads'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        # Get available leads that are not already claimed by this provider
        leads = Lead.objects.filter(
            is_available=True,
            status='active',  # Changed from 'verified' to 'active' to match actual lead status
            expires_at__gt=timezone.now()
        ).exclude(
            # Exclude leads already claimed by this provider
            assignments__provider=request.user
        ).order_by('-created_at')[:20]
        
        # For new providers, return empty list to show clean dashboard
        if not request.user.provider_profile or not hasattr(request.user.provider_profile, 'service_categories'):
            return Response({'leads': []})
        
        # Filter by provider's service categories
        provider_categories = request.user.provider_profile.service_categories.all()
        if provider_categories.exists():
            leads = leads.filter(service_category__in=provider_categories)
        else:
            # New provider with no service categories - return empty
            return Response({'leads': []})
        
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
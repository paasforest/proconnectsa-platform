"""
Support Ticket Views

This module defines API views for support ticket management, including:
- Ticket creation, listing, and updates
- Ticket responses and conversations
- Admin ticket management
- Support metrics and reporting
"""

from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Count, Avg
from django.utils import timezone
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import SupportTicket, TicketResponse, TicketTemplate, SupportMetrics
from .serializers import (
    SupportTicketSerializer, SupportTicketCreateSerializer, SupportTicketUpdateSerializer,
    TicketResponseSerializer, TicketResponseCreateSerializer,
    TicketTemplateSerializer, SupportMetricsSerializer,
    SupportTicketListSerializer, SupportTicketStatsSerializer
)
from .ml_services import SupportTicketMLService

User = get_user_model()


class SupportTicketPagination(PageNumberPagination):
    """Custom pagination for support tickets"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class SupportTicketListCreateView(generics.ListCreateAPIView):
    """List and create support tickets"""
    
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = SupportTicketPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'priority', 'status', 'user_type']
    search_fields = ['title', 'description', 'ticket_number']
    ordering_fields = ['created_at', 'updated_at', 'priority', 'status']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return SupportTicketCreateSerializer
        return SupportTicketListSerializer
    
    def create(self, request, *args, **kwargs):
        """Override create method to ensure ID is returned"""
        # Use create serializer for validation and creation
        create_serializer = self.get_serializer(data=request.data)
        create_serializer.is_valid(raise_exception=True)
        instance = create_serializer.save()
        
        # Return the created instance data directly with ID
        response_data = {
            'id': str(instance.id),
            'title': instance.title,
            'description': instance.description,
            'category': instance.category,
            'priority': instance.priority,
            'status': instance.status,
            'created_at': instance.created_at.isoformat(),
            'updated_at': instance.updated_at.isoformat()
        }
        
        headers = self.get_success_headers(response_data)
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)
    
    def get_queryset(self):
        """Filter tickets based on user permissions"""
        user = self.request.user
        
        # Debug logging
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"SupportTicketListCreateView.get_queryset: user={user.email}, is_staff={user.is_staff}, user_type={getattr(user, 'user_type', None)}")
        
        # Admin and staff users can see all tickets
        if user.is_staff or getattr(user, 'user_type', None) in ['admin', 'support']:
            # Staff/admin can see all tickets
            queryset = SupportTicket.objects.all().order_by('-created_at')
            logger.info(f"Admin/staff user - returning all tickets: {queryset.count()} tickets")
            return queryset
        else:
            # Users can only see their own tickets
            queryset = SupportTicket.objects.filter(user=user).order_by('-created_at')
            logger.info(f"Regular user - returning own tickets: {queryset.count()} tickets")
            return queryset


class SupportTicketDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a support ticket"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return SupportTicketUpdateSerializer
        return SupportTicketSerializer
    
    def get_queryset(self):
        """Filter tickets based on user permissions"""
        user = self.request.user
        
        # Admin and staff users can see all tickets
        if user.is_staff or getattr(user, 'user_type', None) in ['admin', 'support']:
            return SupportTicket.objects.all()
        else:
            return SupportTicket.objects.filter(user=user)
    
    def perform_update(self, serializer):
        """Update ticket with additional logic"""
        instance = serializer.instance
        
        # Update status based on changes
        if 'status' in serializer.validated_data:
            new_status = serializer.validated_data['status']
            
            if new_status == 'resolved' and not instance.resolved_at:
                serializer.validated_data['resolved_at'] = timezone.now()
                serializer.validated_data['resolved_by'] = self.request.user
            
            elif new_status == 'closed' and not instance.closed_at:
                serializer.validated_data['closed_at'] = timezone.now()
                if not instance.resolved_by:
                    serializer.validated_data['resolved_by'] = self.request.user
        
        serializer.save()


class TicketResponseListCreateView(APIView):
    """List and create ticket responses"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        """List responses for a specific ticket"""
        ticket_id = self.kwargs['ticket_id']
        user = request.user
        
        try:
            if user.is_staff:
                ticket = SupportTicket.objects.get(id=ticket_id)
            else:
                ticket = SupportTicket.objects.get(id=ticket_id, user=user)
        except SupportTicket.DoesNotExist:
            return Response({"error": "Ticket not found or access denied"}, status=status.HTTP_404_NOT_FOUND)
        
        # Filter responses based on user type
        if user.is_staff:
            responses = ticket.responses.all()
        else:
            responses = ticket.responses.filter(is_internal=False)
        
        serializer = TicketResponseSerializer(responses, many=True)
        return Response(serializer.data)
    
    def post(self, request, *args, **kwargs):
        """Create new ticket response"""
        ticket_id = self.kwargs['ticket_id']
        user = request.user
        
        # Check if user has access to this ticket
        try:
            if user.is_staff:
                ticket = SupportTicket.objects.get(id=ticket_id)
            else:
                ticket = SupportTicket.objects.get(id=ticket_id, user=user)
        except SupportTicket.DoesNotExist:
            return Response({"error": "Ticket not found or access denied"}, status=status.HTTP_404_NOT_FOUND)
        
        # Get message from request
        message = request.data.get('message', '')
        if not message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Set response type based on user
        response_type = 'staff' if user.is_staff else 'customer'
        
        # Update ticket status when customer responds
        if not user.is_staff and ticket.status in ['in_progress', 'pending_customer']:
            ticket.status = 'in_progress'
            ticket.save(update_fields=['status', 'updated_at'])
        
        # Create response directly
        response = TicketResponse.objects.create(
            ticket=ticket,
            author=user,
            message=message,
            response_type=response_type,
            is_internal=False
        )
        
        # Return the created response
        serializer = TicketResponseSerializer(response)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    


class TicketTemplateListCreateView(generics.ListCreateAPIView):
    """List and create ticket templates"""
    
    permission_classes = [permissions.IsAuthenticated]
    queryset = TicketTemplate.objects.filter(is_active=True)
    serializer_class = TicketTemplateSerializer
    
    def get_queryset(self):
        """Filter templates by category if specified"""
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        return queryset


class SupportMetricsView(generics.ListAPIView):
    """Get support metrics and statistics"""
    
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SupportMetricsSerializer
    
    def get_queryset(self):
        """Get metrics for the specified date range"""
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        queryset = SupportMetrics.objects.all()
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset.order_by('-date')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def support_dashboard_stats(request):
    """Get comprehensive support dashboard statistics"""
    
    if not request.user.is_staff:
        return Response(
            {'error': 'Only staff members can access dashboard stats'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get date range
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    if not start_date:
        start_date = timezone.now().date()
    if not end_date:
        end_date = timezone.now().date()
    
    # Base queryset
    tickets = SupportTicket.objects.filter(created_at__date__range=[start_date, end_date])
    
    # Basic statistics
    stats = {
        'total_tickets': tickets.count(),
        'open_tickets': tickets.filter(status__in=['open', 'in_progress', 'pending_customer', 'pending_internal']).count(),
        'resolved_tickets': tickets.filter(status='resolved').count(),
        'closed_tickets': tickets.filter(status='closed').count(),
        'avg_resolution_time_hours': 0.0,
        'avg_satisfaction_rating': 0.0,
        'tickets_by_category': {},
        'tickets_by_priority': {},
        'tickets_by_status': {},
        'recent_tickets': [],
        'urgent_tickets': [],
        'unassigned_tickets': []
    }
    
    # Calculate average resolution time
    resolved_tickets = tickets.filter(
        status__in=['resolved', 'closed'],
        resolved_at__isnull=False
    )
    
    if resolved_tickets.exists():
        total_hours = 0
        count = 0
        for ticket in resolved_tickets:
            if ticket.resolved_at:
                hours = (ticket.resolved_at - ticket.created_at).total_seconds() / 3600
                total_hours += hours
                count += 1
        
        if count > 0:
            stats['avg_resolution_time_hours'] = round(total_hours / count, 2)
    
    # Calculate average satisfaction rating
    rated_tickets = tickets.filter(satisfaction_rating__isnull=False)
    if rated_tickets.exists():
        avg_rating = rated_tickets.aggregate(avg_rating=Avg('satisfaction_rating'))['avg_rating']
        stats['avg_satisfaction_rating'] = round(avg_rating or 0.0, 2)
    
    # Tickets by category
    stats['tickets_by_category'] = dict(
        tickets.values('category').annotate(count=Count('id')).values_list('category', 'count')
    )
    
    # Tickets by priority
    stats['tickets_by_priority'] = dict(
        tickets.values('priority').annotate(count=Count('id')).values_list('priority', 'count')
    )
    
    # Tickets by status
    stats['tickets_by_status'] = dict(
        tickets.values('status').annotate(count=Count('id')).values_list('status', 'count')
    )
    
    # Recent tickets (last 10)
    recent_tickets = tickets.order_by('-created_at')[:10]
    stats['recent_tickets'] = SupportTicketListSerializer(recent_tickets, many=True).data
    
    # Urgent tickets (high priority and open)
    urgent_tickets = tickets.filter(
        priority__in=['urgent', 'critical'],
        status__in=['open', 'in_progress', 'pending_customer', 'pending_internal']
    ).order_by('-created_at')[:10]
    stats['urgent_tickets'] = SupportTicketListSerializer(urgent_tickets, many=True).data
    
    # Unassigned tickets
    unassigned_tickets = tickets.filter(
        assigned_to__isnull=True,
        status__in=['open', 'in_progress']
    ).order_by('-created_at')[:10]
    stats['unassigned_tickets'] = SupportTicketListSerializer(unassigned_tickets, many=True).data
    
    return Response(stats)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def assign_ticket(request, ticket_id):
    """Assign ticket to staff member"""
    
    if not request.user.is_staff:
        return Response(
            {'error': 'Only staff members can assign tickets'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        ticket = SupportTicket.objects.get(id=ticket_id)
    except SupportTicket.DoesNotExist:
        return Response(
            {'error': 'Ticket not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    assigned_to_id = request.data.get('assigned_to')
    if not assigned_to_id:
        return Response(
            {'error': 'assigned_to is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        assigned_to = User.objects.get(id=assigned_to_id, is_staff=True)
    except User.DoesNotExist:
        return Response(
            {'error': 'Staff member not found'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    ticket.assign_to(assigned_to)
    
    return Response({
        'message': f'Ticket {ticket.ticket_number} assigned to {assigned_to.get_full_name()}',
        'ticket': SupportTicketSerializer(ticket).data
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def resolve_ticket(request, ticket_id):
    """Resolve ticket"""
    
    if not request.user.is_staff:
        return Response(
            {'error': 'Only staff members can resolve tickets'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        ticket = SupportTicket.objects.get(id=ticket_id)
    except SupportTicket.DoesNotExist:
        return Response(
            {'error': 'Ticket not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    resolution_notes = request.data.get('resolution_notes', '')
    ticket.resolve(request.user, resolution_notes)
    
    return Response({
        'message': f'Ticket {ticket.ticket_number} resolved',
        'ticket': SupportTicketSerializer(ticket).data
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def close_ticket(request, ticket_id):
    """Close ticket"""
    
    if not request.user.is_staff:
        return Response(
            {'error': 'Only staff members can close tickets'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        ticket = SupportTicket.objects.get(id=ticket_id)
    except SupportTicket.DoesNotExist:
        return Response(
            {'error': 'Ticket not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    ticket.close(request.user)
    
    return Response({
        'message': f'Ticket {ticket.ticket_number} closed',
        'ticket': SupportTicketSerializer(ticket).data
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def rate_ticket(request, ticket_id):
    """Rate ticket satisfaction"""
    
    try:
        ticket = SupportTicket.objects.get(id=ticket_id, user=request.user)
    except SupportTicket.DoesNotExist:
        return Response(
            {'error': 'Ticket not found or access denied'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    rating = request.data.get('rating')
    feedback = request.data.get('feedback', '')
    
    if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
        return Response(
            {'error': 'Rating must be an integer between 1 and 5'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    ticket.add_satisfaction_rating(rating, feedback)
    
    return Response({
        'message': f'Ticket {ticket.ticket_number} rated {rating} stars',
        'ticket': SupportTicketSerializer(ticket).data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_tickets(request):
    """Get current user's tickets"""
    
    tickets = SupportTicket.objects.filter(user=request.user).order_by('-created_at')
    
    # Apply filters
    category = request.query_params.get('category')
    status = request.query_params.get('status')
    priority = request.query_params.get('priority')
    
    if category:
        tickets = tickets.filter(category=category)
    if status:
        tickets = tickets.filter(status=status)
    if priority:
        tickets = tickets.filter(priority=priority)
    
    serializer = SupportTicketListSerializer(tickets, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def get_ml_recommendations(request):
    """Get ML recommendations for a ticket before creation"""
    
    title = request.data.get('title', '')
    description = request.data.get('description', '')
    user_type = request.data.get('user_type', 'client')
    
    if not title or not description:
        return Response(
            {'error': 'Title and description are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        ml_service = SupportTicketMLService()
        recommendations = ml_service.get_ml_recommendations(title, description, user_type)
        
        if recommendations['success']:
            return Response(recommendations)
        else:
            return Response(
                {'error': recommendations['error']}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_ticket_with_ml(request):
    """Create support ticket with ML recommendations"""
    
    if not request.user.is_authenticated:
        return Response(
            {'error': 'Authentication required'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Get ticket data
    title = request.data.get('title', '')
    description = request.data.get('description', '')
    category = request.data.get('category', '')
    priority = request.data.get('priority', '')
    tags = request.data.get('tags', [])
    attachments = request.data.get('attachments', [])
    
    if not title or not description:
        return Response(
            {'error': 'Title and description are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Determine user type
    user_type = 'provider' if hasattr(request.user, 'provider_profile') else 'client'
    
    try:
        # Get ML recommendations
        ml_service = SupportTicketMLService()
        recommendations = ml_service.get_ml_recommendations(title, description, user_type)
        
        # Create ticket data
        ticket_data = {
            'title': title,
            'description': description,
            'category': category or recommendations['recommendations']['category']['category'],
            'priority': priority or recommendations['recommendations']['priority']['priority'],
            'tags': tags + [recommendations['recommendations']] if recommendations['success'] else tags,
            'attachments': attachments
        }
        
        # Create ticket
        ticket = SupportTicket.objects.create(
            user=request.user,
            user_type=user_type,
            **ticket_data
        )
        
        # Auto-assign if ML suggests it
        if recommendations['success']:
            assignment = recommendations['recommendations']['auto_assignment']
            if assignment['suggested_staff_id'] and assignment['confidence'] > 0.7:
                try:
                    from django.contrib.auth import get_user_model
                    User = get_user_model()
                    suggested_staff = User.objects.get(
                        id=assignment['suggested_staff_id'],
                        is_staff=True
                    )
                    ticket.assign_to(suggested_staff)
                except User.DoesNotExist:
                    pass
        
        serializer = SupportTicketSerializer(ticket)
        return Response({
            'success': True,
            'ticket': serializer.data,
            'ml_recommendations': recommendations['recommendations'] if recommendations['success'] else None
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def support_ml_insights(request):
    """Get ML insights for support tickets (admin only)"""
    
    if not request.user.is_staff:
        return Response(
            {'error': 'Only staff members can access ML insights'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from backend.leads.tasks import generate_support_ml_insights
        result = generate_support_ml_insights()
        
        if result['insights_generated']:
            return Response(result)
        else:
            return Response(
                {'error': result.get('error', 'Failed to generate insights')}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

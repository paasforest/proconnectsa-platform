"""
Client Dashboard API Views
Provides client-specific dashboard data and functionality
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from backend.leads.models import Lead, LeadAssignment, LeadAccess
from backend.leads.serializers import LeadSerializer
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client_dashboard_stats(request):
    """
    Get dashboard statistics for client users
    """
    try:
        user = request.user
        
        # Only allow clients to access this endpoint
        if user.user_type != 'client':
            return Response({
                'error': 'This endpoint is for clients only'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get client's leads
        client_leads = Lead.objects.filter(client=user)
        
        # Calculate stats
        total_requests = client_leads.count()
        active_requests = client_leads.filter(status__in=['verified', 'assigned']).count()
        completed_jobs = client_leads.filter(status='completed').count()
        
        # Provider interest stats
        total_assignments = LeadAssignment.objects.filter(lead__client=user).count()
        providers_unlocked = LeadAccess.objects.filter(lead__client=user).count()
        
        # Recent activity (last 7 days)
        week_ago = timezone.now() - timedelta(days=7)
        recent_activity = LeadAssignment.objects.filter(
            lead__client=user,
            assigned_at__gte=week_ago
        ).count()
        
        # Average response time (time from lead creation to first assignment)
        avg_response_hours = 0
        leads_with_assignments = client_leads.filter(assignments__isnull=False).distinct()
        if leads_with_assignments.exists():
            total_hours = 0
            count = 0
            for lead in leads_with_assignments:
                first_assignment = lead.assignments.order_by('assigned_at').first()
                if first_assignment:
                    hours = (first_assignment.assigned_at - lead.created_at).total_seconds() / 3600
                    total_hours += hours
                    count += 1
            if count > 0:
                avg_response_hours = round(total_hours / count, 1)
        
        stats = {
            'total_requests': total_requests,
            'active_requests': active_requests,
            'completed_jobs': completed_jobs,
            'total_provider_interest': total_assignments,
            'providers_unlocked_contact': providers_unlocked,
            'recent_activity_week': recent_activity,
            'avg_response_hours': avg_response_hours,
            'success_rate': round((completed_jobs / total_requests * 100) if total_requests > 0 else 0, 1)
        }
        
        logger.info(f"Client dashboard stats for {user.email}: {stats}")
        
        return Response({
            'success': True,
            'stats': stats,
            'user': {
                'name': f"{user.first_name} {user.last_name}".strip() or user.email,
                'email': user.email,
                'member_since': user.created_at.strftime('%B %Y')
            }
        })
        
    except Exception as e:
        logger.error(f"Error fetching client dashboard stats: {str(e)}")
        return Response({
            'error': 'Failed to fetch dashboard statistics'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client_leads_list(request):
    """
    Get client's service requests with provider interest details
    """
    try:
        user = request.user
        
        # Only allow clients to access this endpoint
        if user.user_type != 'client':
            return Response({
                'error': 'This endpoint is for clients only'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get client's leads with related data
        leads = Lead.objects.filter(client=user).prefetch_related(
            'assignments__provider__provider_profile',
            'service_category'
        ).order_by('-created_at')
        
        # Build response data
        leads_data = []
        for lead in leads:
            # Get provider interest data
            assignments = lead.assignments.all()
            unlocked_providers = LeadAccess.objects.filter(lead=lead)
            
            provider_interest = []
            for assignment in assignments:
                provider_data = {
                    'provider_name': assignment.provider.provider_profile.business_name,
                    'provider_email': assignment.provider.email,
                    'assigned_at': assignment.assigned_at.isoformat(),
                    'status': assignment.status,
                    'has_unlocked': unlocked_providers.filter(provider=assignment.provider).exists(),
                    'viewed_at': assignment.viewed_at.isoformat() if assignment.viewed_at else None,
                    'contacted_at': assignment.contacted_at.isoformat() if assignment.contacted_at else None,
                }
                provider_interest.append(provider_data)
            
            lead_data = {
                'id': str(lead.id),
                'title': lead.title,
                'description': lead.description,
                'service_category': lead.service_category.name,
                'location': f"{lead.location_suburb}, {lead.location_city}",
                'budget_range': lead.budget_range,
                'urgency': lead.urgency,
                'status': lead.status,
                'created_at': lead.created_at.isoformat(),
                'provider_interest_count': assignments.count(),
                'providers_unlocked_count': unlocked_providers.count(),
                'provider_interest': provider_interest,
                'next_steps': get_lead_next_steps(lead, assignments, unlocked_providers)
            }
            leads_data.append(lead_data)
        
        return Response({
            'success': True,
            'leads': leads_data,
            'total_count': len(leads_data)
        })
        
    except Exception as e:
        logger.error(f"Error fetching client leads: {str(e)}")
        return Response({
            'error': 'Failed to fetch your service requests'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resubmit_similar_lead(request, lead_id):
    """
    Create a new lead based on an existing one
    """
    try:
        user = request.user
        
        # Only allow clients to access this endpoint
        if user.user_type != 'client':
            return Response({
                'error': 'This endpoint is for clients only'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get original lead
        try:
            original_lead = Lead.objects.get(id=lead_id, client=user)
        except Lead.DoesNotExist:
            return Response({
                'error': 'Original service request not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Create new lead with similar details
        new_lead = Lead.objects.create(
            client=user,
            title=f"Similar to: {original_lead.title}",
            description=original_lead.description,
            service_category=original_lead.service_category,
            location_address=original_lead.location_address,
            location_suburb=original_lead.location_suburb,
            location_city=original_lead.location_city,
            budget_range=original_lead.budget_range,
            urgency=original_lead.urgency,
            preferred_contact_time=original_lead.preferred_contact_time,
            additional_requirements=original_lead.additional_requirements,
            status='verified',  # Auto-verify for returning clients
            verification_score=85,  # High score for repeat clients
            verified_at=timezone.now()
        )
        
        # Monitor lead creation - NO automatic assignment
        try:
            from backend.leads.flow_monitor import flow_monitor
            
            # Monitor lead creation
            flow_monitor.monitor_lead_creation(new_lead)
            logger.info(f"Resubmitted lead {new_lead.id} created and available for purchase in marketplace")
                
        except Exception as e:
            logger.error(f"Failed to monitor resubmitted lead {new_lead.id}: {str(e)}")
        
        return Response({
            'success': True,
            'message': 'Similar service request created successfully',
            'new_lead': {
                'id': str(new_lead.id),
                'title': new_lead.title,
                'status': new_lead.status,
                'created_at': new_lead.created_at.isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Error resubmitting lead: {str(e)}")
        return Response({
            'error': 'Failed to create similar service request'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def get_lead_next_steps(lead, assignments, unlocked_providers):
    """
    Determine next steps for client based on lead status
    """
    if lead.status == 'completed':
        return "Job completed successfully"
    elif lead.status == 'cancelled':
        return "Request cancelled"
    elif unlocked_providers.count() > 0:
        return f"Expect calls from {unlocked_providers.count()} provider(s)"
    elif assignments.count() > 0:
        return f"{assignments.count()} provider(s) are interested - waiting for contact"
    elif lead.status == 'verified':
        return "Finding matching providers in your area"
    else:
        return "Verifying your request"



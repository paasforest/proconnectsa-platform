"""
My Leads API views for managing purchased leads
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
import logging

from .models import User, Wallet
from backend.leads.models import Lead, LeadAssignment

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_leads(request):
    """
    Get all purchased leads for the authenticated user
    """
    try:
        user = request.user
        
        # Get only PURCHASED lead assignments for this user (provider)
        # Only show leads that have been manually unlocked with credits
        assignments = LeadAssignment.objects.filter(
            provider=user,
            status__in=['purchased', 'contacted', 'quoted', 'won', 'lost']
        ).select_related('lead', 'lead__client', 'lead__service_category').order_by('-purchased_at', '-assigned_at')
        
        leads_data = []
        for assignment in assignments:
            lead = assignment.lead
            
            # Use assignment status directly
            status = assignment.status
            
            leads_data.append({
                'id': str(lead.id),
                'title': lead.title,
                'name': f"{lead.client.first_name} {lead.client.last_name}".strip() or lead.client.email,
                'location': f"{lead.location_suburb}, {lead.location_city}",
                'service': lead.service_category.name if lead.service_category else 'General Service',
                'budget': lead.get_budget_display_range() if hasattr(lead, 'get_budget_display_range') else lead.budget_range,
                'credits_spent': getattr(assignment, 'credit_cost', 1) or 1,
                'unlocked_at': (assignment.purchased_at or assignment.assigned_at).isoformat(),
                'status': status,
                'phone': getattr(lead.client, 'phone', 'Not provided'),
                'email': lead.client.email,
                'description': lead.description,
                'urgency': lead.urgency,
                'timeline': lead.hiring_timeline,
                'notes': assignment.provider_notes or '',
                'last_contact': assignment.contacted_at.isoformat() if assignment.contacted_at else None,
                'next_follow_up': None,  # Not tracked in assignments yet
                'created_at': lead.created_at.isoformat(),
                'updated_at': assignment.updated_at.isoformat()
            })
        
        return Response({
            'leads': leads_data,
            'total': len(leads_data)
        })
        
    except Exception as e:
        logger.error(f"Failed to fetch my leads for user {request.user.email}: {str(e)}")
        return Response(
            {'error': 'Failed to fetch leads'}, 
            status=500
        )

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_lead_status(request, lead_id):
    """
    Update the status of a purchased lead (uses LeadAssignment)
    """
    try:
        user = request.user
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'Status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        valid_statuses = ['purchased', 'contacted', 'quoted', 'won', 'lost']
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assignment = get_object_or_404(
            LeadAssignment,
            provider=user,
            lead_id=lead_id
        )
        
        now = timezone.now()
        update_fields = ['status', 'updated_at']
        assignment.status = new_status
        if new_status == 'contacted' and not assignment.contacted_at:
            assignment.contacted_at = now
            update_fields.append('contacted_at')
        elif new_status == 'quoted' and not assignment.quote_provided_at:
            assignment.quote_provided_at = now
            update_fields.append('quote_provided_at')
        
        assignment.save(update_fields=update_fields)
        
        return Response({
            'success': True,
            'status': new_status,
            'updated_at': assignment.updated_at.isoformat()
        })
        
    except Exception as e:
        logger.error(f"Failed to update lead status for user {request.user.email}: {str(e)}")
        return Response(
            {'error': 'Failed to update lead status'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_lead_note(request, lead_id):
    """
    Add a note to a purchased lead (uses LeadAssignment.provider_notes)
    """
    try:
        user = request.user
        note = request.data.get('note')
        
        if not note:
            return Response(
                {'error': 'Note is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assignment = get_object_or_404(
            LeadAssignment,
            provider=user,
            lead_id=lead_id
        )
        
        existing = (assignment.provider_notes or '').strip()
        assignment.provider_notes = f"{existing}\n{note}".strip() if existing else note
        assignment.save(update_fields=['provider_notes', 'updated_at'])
        
        return Response({
            'success': True,
            'note': note,
            'updated_at': assignment.updated_at.isoformat()
        })
        
    except Exception as e:
        logger.error(f"Failed to add lead note for user {request.user.email}: {str(e)}")
        return Response(
            {'error': 'Failed to add note'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lead_stats(request):
    """
    Get lead statistics for the user (uses LeadAssignment)
    """
    try:
        user = request.user
        
        assignments = LeadAssignment.objects.filter(
            provider=user,
            status__in=['purchased', 'contacted', 'quoted', 'won', 'lost']
        )
        
        total_leads = assignments.count()
        won_leads = assignments.filter(status='won').count()
        in_progress = assignments.filter(
            status__in=['contacted', 'quoted']
        ).count()
        total_credits_spent = sum(getattr(a, 'credit_cost', 1) or 1 for a in assignments)
        
        return Response({
            'total_leads': total_leads,
            'won_leads': won_leads,
            'in_progress': in_progress,
            'total_credits_spent': total_credits_spent,
            'conversion_rate': round((won_leads / total_leads * 100) if total_leads > 0 else 0, 1)
        })
        
    except Exception as e:
        logger.error(f"Failed to fetch lead stats for user {request.user.email}: {str(e)}")
        return Response(
            {'error': 'Failed to fetch stats'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

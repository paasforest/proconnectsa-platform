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
            status__in=['purchased', 'contacted', 'quoted', 'won', 'lost']  # Only purchased/unlocked leads
        ).select_related('lead').order_by('-assigned_at')
        
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
                'budget': lead.get_budget_range_display() if hasattr(lead, 'get_budget_range_display') else lead.budget_range,
                'credits_spent': 1,  # Default credit cost
                'unlocked_at': assignment.assigned_at.isoformat(),
                'status': status,
                'phone': getattr(lead.client, 'phone', 'Not provided'),
                'email': lead.client.email,
                'description': lead.description,
                'urgency': lead.urgency,
                'timeline': lead.hiring_timeline,
                'notes': '',  # No notes in assignments yet
                'last_contact': None,  # Not tracked in assignments yet
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
    Update the status of a purchased lead
    """
    try:
        user = request.user
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'Status is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the lead purchase
        purchase = get_object_or_404(
            LeadPurchase, 
            user=user, 
            lead_id=lead_id
        )
        
        # Update status based on new_status
        now = timezone.now()
        if new_status == 'contacted' and not purchase.contacted_at:
            purchase.contacted_at = now
        elif new_status == 'quoted' and not purchase.quoted_at:
            purchase.quoted_at = now
        elif new_status == 'won' and not purchase.won_at:
            purchase.won_at = now
        elif new_status == 'lost' and not purchase.lost_at:
            purchase.lost_at = now
        
        purchase.save()
        
        return Response({
            'success': True,
            'status': new_status,
            'updated_at': purchase.updated_at.isoformat()
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
    Add a note to a purchased lead
    """
    try:
        user = request.user
        note = request.data.get('note')
        
        if not note:
            return Response(
                {'error': 'Note is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the lead purchase
        purchase = get_object_or_404(
            LeadPurchase, 
            user=user, 
            lead_id=lead_id
        )
        
        # Update notes
        purchase.notes = note
        purchase.save()
        
        return Response({
            'success': True,
            'note': note,
            'updated_at': purchase.updated_at.isoformat()
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
    Get lead statistics for the user
    """
    try:
        user = request.user
        
        # Get all purchases for this user
        purchases = LeadPurchase.objects.filter(user=user)
        
        total_leads = purchases.count()
        won_leads = purchases.filter(won_at__isnull=False).count()
        in_progress = purchases.filter(
            Q(contacted_at__isnull=False) | 
            Q(quoted_at__isnull=False)
        ).exclude(
            Q(won_at__isnull=False) | 
            Q(lost_at__isnull=False)
        ).count()
        
        total_credits_spent = sum(p.credits_spent for p in purchases)
        
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

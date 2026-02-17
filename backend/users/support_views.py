"""
Support API views for ticket management
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
import logging
import uuid

from .models import User
from backend.support.models import SupportTicket, TicketResponse

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def support_tickets(request):
    """
    Get all support tickets for the authenticated user
    """
    try:
        user = request.user
        
        # Get all tickets for this user
        tickets = SupportTicket.objects.filter(user=user).order_by('-created_at')
        
        tickets_data = []
        for ticket in tickets:
            # Get responses for this ticket
            responses = TicketResponse.objects.filter(ticket=ticket).order_by('created_at')
            
            responses_data = []
            for response in responses:
                responses_data.append({
                    'id': str(response.id),
                    'message': response.message,
                    'is_staff': response.is_staff,
                    'created_at': response.created_at.isoformat()
                })
            
            tickets_data.append({
                'id': str(ticket.id),
                'subject': ticket.title,  # Map 'title' from model to 'subject' for frontend compatibility
                'title': ticket.title,  # Also include 'title' for consistency
                'description': ticket.description,
                'status': ticket.status,
                'priority': ticket.priority,
                'category': ticket.category,
                'created_at': ticket.created_at.isoformat(),
                'updated_at': ticket.updated_at.isoformat(),
                'responses': responses_data
            })
        
        return Response({
            'tickets': tickets_data,
            'total': len(tickets_data)
        })
        
    except Exception as e:
        logger.error(f"Failed to fetch support tickets for user {request.user.email}: {str(e)}")
        return Response(
            {'error': 'Failed to fetch tickets'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_ticket(request):
    """
    Create a new support ticket
    """
    try:
        user = request.user
        
        # Accept both 'title' and 'subject' for compatibility
        subject = request.data.get('subject') or request.data.get('title')
        description = request.data.get('description')
        category = request.data.get('category', 'general')
        priority = request.data.get('priority', 'medium')
        
        if not subject or not description:
            return Response(
                {'error': 'Title/subject and description are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate category and priority
        valid_categories = ['general', 'technical', 'billing', 'account']
        valid_priorities = ['low', 'medium', 'high', 'urgent']
        
        if category not in valid_categories:
            return Response(
                {'error': 'Invalid category'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if priority not in valid_priorities:
            return Response(
                {'error': 'Invalid priority'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create ticket - SupportTicket model uses 'title' not 'subject'
        ticket = SupportTicket.objects.create(
            user=user,
            title=subject,  # Map 'subject' from request to 'title' field in model
            description=description,
            category=category,
            priority=priority,
            status='open',
            user_type='provider' if hasattr(user, 'provider_profile') else 'client'
        )
        
        return Response({
            'success': True,
            'ticket': {
                'id': str(ticket.id),
                'subject': ticket.title,  # Map 'title' to 'subject' for frontend
                'title': ticket.title,  # Also include 'title'
                'description': ticket.description,
                'status': ticket.status,
                'priority': ticket.priority,
                'category': ticket.category,
                'created_at': ticket.created_at.isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Failed to create ticket for user {request.user.email}: {str(e)}")
        return Response(
            {'error': 'Failed to create ticket'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ticket_detail(request, ticket_id):
    """
    Get details of a specific ticket
    """
    try:
        user = request.user
        ticket = get_object_or_404(SupportTicket, id=ticket_id, user=user)
        
        # Get responses for this ticket
        responses = TicketResponse.objects.filter(ticket=ticket).order_by('created_at')
        
        responses_data = []
        for response in responses:
            responses_data.append({
                'id': str(response.id),
                'message': response.message,
                'is_staff': response.is_staff,
                'created_at': response.created_at.isoformat()
            })
        
        return Response({
            'ticket': {
                'id': str(ticket.id),
                'subject': ticket.title,  # Map 'title' to 'subject' for frontend
                'title': ticket.title,  # Also include 'title'
                'description': ticket.description,
                'status': ticket.status,
                'priority': ticket.priority,
                'category': ticket.category,
                'created_at': ticket.created_at.isoformat(),
                'updated_at': ticket.updated_at.isoformat(),
                'responses': responses_data
            }
        })
        
    except Exception as e:
        logger.error(f"Failed to fetch ticket details for user {request.user.email}: {str(e)}")
        return Response(
            {'error': 'Failed to fetch ticket details'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_ticket_response(request, ticket_id):
    """
    Add a response to a ticket
    """
    try:
        user = request.user
        ticket = get_object_or_404(SupportTicket, id=ticket_id, user=user)
        
        message = request.data.get('message')
        
        if not message:
            return Response(
                {'error': 'Message is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create response
        response = TicketResponse.objects.create(
            ticket=ticket,
            message=message,
            is_staff=False,
            user=user
        )
        
        # Update ticket status if it was closed
        if ticket.status == 'closed':
            ticket.status = 'open'
            ticket.save()
        
        return Response({
            'success': True,
            'response': {
                'id': str(response.id),
                'message': response.message,
                'is_staff': response.is_staff,
                'created_at': response.created_at.isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Failed to add ticket response for user {request.user.email}: {str(e)}")
        return Response(
            {'error': 'Failed to add response'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_ticket_status(request, ticket_id):
    """
    Update ticket status (user can only close their own tickets)
    """
    try:
        user = request.user
        ticket = get_object_or_404(SupportTicket, id=ticket_id, user=user)
        
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'Status is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Users can only close their own tickets
        if new_status == 'closed':
            ticket.status = 'closed'
            ticket.save()
        else:
            return Response(
                {'error': 'You can only close tickets'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'success': True,
            'status': ticket.status,
            'updated_at': ticket.updated_at.isoformat()
        })
        
    except Exception as e:
        logger.error(f"Failed to update ticket status for user {request.user.email}: {str(e)}")
        return Response(
            {'error': 'Failed to update ticket status'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def support_stats(request):
    """
    Get support statistics for the user
    """
    try:
        user = request.user
        
        # Get all tickets for this user
        tickets = SupportTicket.objects.filter(user=user)
        
        total_tickets = tickets.count()
        open_tickets = tickets.filter(status='open').count()
        in_progress_tickets = tickets.filter(status='in_progress').count()
        resolved_tickets = tickets.filter(status='resolved').count()
        closed_tickets = tickets.filter(status='closed').count()
        
        return Response({
            'total_tickets': total_tickets,
            'open_tickets': open_tickets,
            'in_progress_tickets': in_progress_tickets,
            'resolved_tickets': resolved_tickets,
            'closed_tickets': closed_tickets
        })
        
    except Exception as e:
        logger.error(f"Failed to fetch support stats for user {request.user.email}: {str(e)}")
        return Response(
            {'error': 'Failed to fetch support stats'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


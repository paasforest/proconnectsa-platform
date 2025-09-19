"""
API views for Bark-style lead flow
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .bark_lead_service import BarkLeadService
from .models import Lead
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_leads(request):
    """Get available leads for claiming (Bark-style)"""
    if not hasattr(request.user, 'provider_profile'):
        return Response(
            {'error': 'Only providers can access leads'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        limit = int(request.GET.get('limit', 20))
        service = BarkLeadService()
        result = service.get_available_leads(request.user, limit)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error getting available leads: {str(e)}")
        return Response(
            {'error': 'Failed to load available leads'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def claim_lead(request, lead_id):
    """Claim a lead (Bark-style)"""
    if not hasattr(request.user, 'provider_profile'):
        return Response(
            {'error': 'Only providers can claim leads'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        service = BarkLeadService()
        result = service.claim_lead(request.user, lead_id)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error claiming lead: {str(e)}")
        return Response(
            {'error': 'Failed to claim lead'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_lead_details(request, lead_id):
    """Get detailed information about a specific lead"""
    if not hasattr(request.user, 'provider_profile'):
        return Response(
            {'error': 'Only providers can view lead details'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        service = BarkLeadService()
        result = service.get_lead_details(lead_id, request.user)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error getting lead details: {str(e)}")
        return Response(
            {'error': 'Failed to load lead details'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_claimed_leads(request):
    """Get leads claimed by the current provider"""
    if not hasattr(request.user, 'provider_profile'):
        return Response(
            {'error': 'Only providers can view claimed leads'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        limit = int(request.GET.get('limit', 20))
        service = BarkLeadService()
        result = service.get_provider_claimed_leads(request.user, limit)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error getting claimed leads: {str(e)}")
        return Response(
            {'error': 'Failed to load claimed leads'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_lead_claim_status(request, lead_id):
    """Get the current claim status of a lead"""
    try:
        lead = Lead.objects.get(id=lead_id)
        
        return Response({
            'lead_id': str(lead.id),
            'claim_status': lead.get_claim_status(),
            'remaining_slots': lead.get_remaining_slots(),
            'assigned_count': lead.assigned_providers_count,
            'max_providers': lead.max_providers,
            'is_available': lead.is_available,
            'can_be_claimed': lead.can_be_claimed()
        }, status=status.HTTP_200_OK)
        
    except Lead.DoesNotExist:
        return Response(
            {'error': 'Lead not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error getting lead claim status: {str(e)}")
        return Response(
            {'error': 'Failed to get lead status'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

"""
Minimal Payment Views for Migration

Temporary minimal views to allow migrations to run
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_credit_balance(request):
    """Get current credit balance for provider"""
    if not request.user.is_provider:
        return Response(
            {'error': 'Only providers can access credit balance'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    provider = request.user.provider_profile
    return Response({
        'credit_balance': provider.credit_balance,
        'subscription_tier': provider.subscription_tier,
        'is_subscription_active': provider.is_subscription_active,
        'monthly_lead_limit': provider.get_monthly_lead_limit(),
        'leads_used_this_month': provider.leads_used_this_month,
        'credit_rate': 50.0 if provider.is_subscription_active else 80.0
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_customer_code_info(request):
    """Get customer code information for current provider"""
    if not request.user.is_provider:
        return Response(
            {'error': 'Only providers can access customer code info'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    from .auto_deposit_service import AutoDepositService
    
    provider = request.user.provider_profile
    if not provider.customer_code:
        # Generate customer code if not exists
        provider.customer_code = provider.generate_customer_code()
        provider.save(update_fields=['customer_code'])
    
    service = AutoDepositService()
    result = service.get_deposit_instructions(provider.customer_code)
    
    return Response(result)



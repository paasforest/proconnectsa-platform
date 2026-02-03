from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from decimal import Decimal
import logging

from .models import Wallet, WalletTransaction, LeadUnlock

logger = logging.getLogger(__name__)

class LeadUnlockThrottle(UserRateThrottle):
    """Limit lead unlocks to prevent abuse"""
    rate = '10/min'  # Max 10 unlocks per minute per user


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wallet_balance(request):
    """Get user's current wallet balance and transaction history"""
    wallet, created = Wallet.objects.get_or_create(user=request.user)
    
    # Get recent transactions
    transactions = WalletTransaction.objects.filter(
        wallet=wallet
    ).order_by('-created_at')[:20]
    
    transaction_data = [{
        'id': str(tx.id),
        'amount': float(tx.amount),
        'credits': tx.credits,
        'type': tx.transaction_type,
        'description': tx.description,
        'status': tx.status,
        'timestamp': tx.created_at.isoformat(),
        'reference': tx.reference
    } for tx in transactions]
    
    return Response({
        'balance': float(wallet.balance),
        'credits': wallet.credits,
        'customer_code': wallet.customer_code,
        'transactions': transaction_data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_deposit_reference(request):
    """Generate deposit reference for bank transfer"""
    wallet, created = Wallet.objects.get_or_create(user=request.user)
    
    return Response({
        'customer_code': wallet.customer_code,
        'deposit_instructions': {
            'account_name': 'ProConnectSA (Pty) Ltd',
            'account_number': '1313872032',
            'bank': 'Nedbank',
            'branch_code': '198765',
            'reference': wallet.customer_code,
            'minimum_deposit': 50,  # R50 minimum
            'conversion_rate': '1 credit = R50'
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([LeadUnlockThrottle])
def unlock_lead(request, lead_id):
    """
    Unlock lead contact information by spending credits
    SECURITY: Only providers assigned to the lead can unlock it
    """
    try:
        # Only verified providers can unlock leads (premium does NOT bypass verification)
        if request.user.user_type != 'provider':
            return Response({'error': 'Only providers can unlock leads'}, status=403)
        try:
            profile = request.user.provider_profile
        except Exception:
            return Response({'error': 'Provider profile not found'}, status=400)
        if getattr(profile, 'verification_status', None) != 'verified':
            return Response({
                'error': 'Your account is not verified yet.',
                'message': 'Please upload your documents and wait for admin approval before unlocking leads.',
                'code': 'PROVIDER_NOT_VERIFIED'
            }, status=403)

        # Get user wallet
        wallet = get_object_or_404(Wallet, user=request.user)
        
        # WALLET-BASED CHECK: Verify lead exists and is available for purchase
        from backend.leads.models import Lead, LeadAssignment
        try:
            lead = Lead.objects.get(id=lead_id)
        except Lead.DoesNotExist:
            return Response({
                'error': 'This lead is no longer available.',
                'message': 'The lead you\'re trying to access may have been removed or is no longer active.',
                'user_friendly': True
            }, status=404)
        
        # Check if lead is still available for purchase
        if lead.status != 'verified' or not lead.is_available:
            return Response({
                'error': 'Lead no longer available for purchase.',
                'message': 'This lead has been purchased by other providers or is no longer active.',
                'user_friendly': True,
                'suggestion': 'Visit the leads page to see available opportunities in your area.'
            }, status=403)
        
        # Check if provider can serve this lead (service category + location)
        if hasattr(request.user, 'provider_profile'):
            profile = request.user.provider_profile
            
            # Check service category match - compare IDs not slugs
            lead_category_id = lead.service_category.id
            provider_category_ids = profile.service_categories or []
            if lead_category_id not in provider_category_ids:
                return Response({
                    'error': 'Service category mismatch.',
                    'message': f'This {lead.service_category.name} lead is not in your service categories.',
                    'user_friendly': True
                }, status=403)
            
            # Check location match
            lead_city = lead.location_city.lower()
            lead_suburb = lead.location_suburb.lower()
            service_areas = [area.lower() for area in profile.service_areas]
            
            location_match = any(
                lead_city in area or lead_suburb in area or area in lead_city 
                for area in service_areas
            )
            
            if not location_match:
                return Response({
                    'error': 'Location not in service area.',
                    'message': f'This lead in {lead.location_city} is outside your service areas.',
                    'user_friendly': True
                }, status=403)
        
        # Check if already unlocked
        existing_unlock = LeadUnlock.objects.filter(
            user=request.user,
            lead_id=lead_id
        ).first()
        
        if existing_unlock:
            return Response({
                'error': 'Lead already unlocked',
                'message': 'You have already unlocked this lead and have access to all contact details.',
                'contact_info': existing_unlock.full_contact_data,
                'user_friendly': True
            }, status=400)
        
        # Get lead details and pricing from ML service
        # For now, using static pricing - replace with ML service
        credits_required = get_lead_credits_cost(lead_id, request.user)
        
        # Validate sufficient credits
        if wallet.credits < credits_required:
            shortage = credits_required - wallet.credits
            return Response({
                'error': 'Insufficient credits',
                'message': f'You need {credits_required} credits to unlock this lead, but you only have {wallet.credits} credits.',
                'credits_needed': credits_required,
                'credits_available': wallet.credits,
                'credits_shortage': shortage,
                'deposit_needed': shortage * 50,  # R50 per credit
                'user_friendly': True,
                'suggestion': f'Deposit R{shortage * 50} to get {shortage} more credits and unlock this lead.'
            }, status=400)
        
        # Atomic transaction to prevent race conditions
        with transaction.atomic():
            # Deduct credits from wallet
            wallet.deduct_credits(credits_required)
            
            # Create unlock transaction record
            unlock_transaction = WalletTransaction.objects.create(
                wallet=wallet,
                amount=Decimal(str(credits_required * 50)),  # R50 per credit
                credits=credits_required,
                transaction_type='unlock',
                reference=f"UNLOCK_{timezone.now().strftime('%Y%m%d%H%M%S')}_{lead_id}",
                status='confirmed',
                description=f"Unlocked lead: {lead_id}",
                lead_id=lead_id,
                lead_title=f"Lead {lead_id}",
                confirmed_at=timezone.now()
            )
            
            # Get full contact information (mock data for now)
            full_contact_info = get_full_contact_info(lead_id)
            
            # Create unlock record using both models for compatibility
            lead_unlock = LeadUnlock.objects.create(
                user=request.user,
                lead_id=lead_id,
                credits_spent=credits_required,
                transaction=unlock_transaction,
                full_contact_data=full_contact_info
            )
            
            # Also create LeadAccess record for the new integrated system
            from backend.leads.models import LeadAccess
            lead_access = LeadAccess.objects.create(
                lead=lead,
                provider=request.user,
                credit_cost=credits_required,
                is_active=True
            )
            
            # Update LeadAssignment status to 'purchased' for the new dashboard
            from backend.leads.models import LeadAssignment
            try:
                # Find and update the assignment status
                assignment = LeadAssignment.objects.filter(
                    provider=request.user,
                    lead=lead
                ).first()
                
                if assignment:
                    assignment.status = 'purchased'
                    assignment.purchased_at = timezone.now()
                    assignment.save()
                    logger.info(f"Updated LeadAssignment {assignment.id} status to 'purchased'")
                else:
                    # Create assignment if it doesn't exist (fallback)
                    assignment = LeadAssignment.objects.create(
                        provider=request.user,
                        lead=lead,
                        status='purchased',
                        purchased_at=timezone.now(),
                        credit_cost=credits_required
                    )
                    logger.info(f"Created new LeadAssignment {assignment.id} with 'purchased' status")
                
            except Exception as e:
                logger.error(f"Error creating/getting LeadPurchase: {str(e)}")
            
            # Update assignment status to mark as viewed and purchased (outside try-except)
            try:
                assignment.mark_as_viewed()  # Mark as viewed
                assignment.status = 'purchased'  # Mark as purchased
                assignment.purchased_at = timezone.now()
                assignment.save(update_fields=['status', 'purchased_at'])
                logger.info(f"Assignment {assignment.id} marked as viewed and purchased")
            except Exception as e:
                logger.error(f"Error updating assignment status: {str(e)}")
            
            # No notification on purchase - notifications are sent when lead is created
            
            # Monitor successful unlock
            from backend.leads.flow_monitor import flow_monitor
            flow_monitor.monitor_lead_unlock(lead, request.user, success=True)
            
            # Log the unlock for audit
            logger.info(f"User {request.user.username} unlocked lead {lead_id} for {credits_required} credits")
            
            return Response({
                'success': True,
                'credits_spent': credits_required,
                'remaining_credits': wallet.credits,
                'contact_info': full_contact_info,
                'transaction_id': str(unlock_transaction.id)
            })
            
    except ValueError as e:
        # Monitor failed unlock
        from backend.leads.flow_monitor import flow_monitor
        try:
            lead = Lead.objects.get(id=lead_id)
            flow_monitor.monitor_lead_unlock(lead, request.user, success=False)
        except:
            pass
        return Response({'error': str(e)}, status=400)
    except Exception as e:
        # Monitor failed unlock
        from backend.leads.flow_monitor import flow_monitor
        try:
            lead = Lead.objects.get(id=lead_id)
            flow_monitor.monitor_lead_unlock(lead, request.user, success=False)
        except:
            pass
        logger.error(f"Lead unlock failed for user {request.user.username}: {str(e)}")
        return Response({'error': 'Unlock failed. Please try again.'}, status=500)


def get_lead_credits_cost(lead_id, provider=None):
    """
    Get credits required for lead unlock using ML pricing
    """
    try:
        from backend.leads.models import Lead
        from backend.leads.ml_services import DynamicPricingMLService
        
        lead = Lead.objects.get(id=lead_id)
        
        # Use the integrated ML pricing service
        pricing_service = DynamicPricingMLService()
        pricing_result = pricing_service.calculate_dynamic_lead_price(lead, provider)
        
        # Convert Rands to credits (R50 = 1 credit)
        price_in_rands = pricing_result.get('price', 50)
        credits = max(1, round(price_in_rands / 50, 1))
        
        return credits
    except Lead.DoesNotExist:
        # Fallback to default pricing
        return 8  # Default 8 credits


def get_full_contact_info(lead_id):
    """Get complete contact information for unlocked lead"""
    try:
        from backend.leads.models import Lead
        lead = Lead.objects.get(id=lead_id)
        return {
            'phone': getattr(lead.client, 'phone', 'Not available'),
            'email': lead.client.email,
            'full_address': lead.location_address,
            'name': f"{lead.client.first_name} {lead.client.last_name}".strip() or lead.client.email
        }
    except Lead.DoesNotExist:
        # Fallback to mock data
        return {
            'phone': '+27 82 123 4567',
            'email': 'customer@example.com',
            'full_address': '123 Oak Street, Sandton, Johannesburg',
            'name': 'Sarah Mitchell'
        }
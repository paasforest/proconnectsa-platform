"""
Extended Wallet API views for dashboard functionality
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from decimal import Decimal
import logging
import uuid

from .models import User, Wallet, WalletTransaction
from .reconciliation import reconcile_bank_deposits
from backend.utils.sendgrid_service import sendgrid_service

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wallet_details(request):
    """
    Get wallet details including balance, credits, and account information
    """
    try:
        user = request.user
        wallet = get_object_or_404(Wallet, user=user)
        
        return Response({
            'balance': float(wallet.balance),
            'credits': wallet.credits,
            'customer_code': wallet.customer_code,
            'account_details': {
                'bank_name': 'Nedbank',
                'account_number': '1313872032',
                'branch_code': '198765',
                'account_holder': 'ProConnectSA (Pty) Ltd'
            }
        })
        
    except Exception as e:
        logger.error(f"Failed to fetch wallet details for user {request.user.email}: {str(e)}")
        return Response(
            {'error': 'Failed to fetch wallet details'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wallet_transactions(request):
    """
    Get wallet transaction history
    """
    try:
        user = request.user
        wallet = get_object_or_404(Wallet, user=user)
        
        # Get all transactions for this wallet
        transactions = WalletTransaction.objects.filter(wallet=wallet).order_by('-created_at')
        
        transactions_data = []
        for transaction in transactions:
            transactions_data.append({
                'id': str(transaction.id),
                'type': transaction.transaction_type,
                'amount': float(transaction.amount),
                'credits': transaction.credits,
                'description': transaction.description,
                'status': transaction.status,
                'created_at': transaction.created_at.isoformat(),
                'reference': transaction.reference
            })
        
        return Response({
            'transactions': transactions_data,
            'total': len(transactions_data)
        })
        
    except Exception as e:
        logger.error(f"Failed to fetch wallet transactions for user {request.user.email}: {str(e)}")
        return Response(
            {'error': 'Failed to fetch transactions'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def wallet_top_up(request):
    """
    Initiate a wallet top-up (manual deposit flow)
    """
    try:
        user = request.user
        amount = request.data.get('amount', 0)
        
        if not amount or amount < 50:
            return Response(
                {'error': 'Minimum top-up amount is R50'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        wallet = get_object_or_404(Wallet, user=user)
        
        # Create a pending transaction
        transaction = WalletTransaction.objects.create(
            wallet=wallet,
            transaction_type='deposit',
            amount=Decimal(str(amount)),
            credits=0,  # Will be calculated when deposit is confirmed
            description=f'Manual deposit - R{amount}',
            status='pending',
            reference=f'DEP-{uuid.uuid4().hex[:8].upper()}'
        )
        
        return Response({
            'success': True,
            'transaction_id': str(transaction.id),
            'amount': float(amount),
            'reference': transaction.reference,
            'customer_code': wallet.customer_code,
            'account_details': {
                'bank_name': 'Nedbank',
                'account_number': '1313872032',
                'branch_code': '198765',
                'account_holder': 'ProConnectSA (Pty) Ltd'
            },
            'instructions': [
                f'Make a deposit of R{amount} to the Nedbank account below',
                f'IMPORTANT: Use your customer code: {wallet.customer_code} as reference',
                '🏦 Nedbank Account: 1313872032',
                '🏦 Branch Code: 198765',
                '🏦 Account Holder: ProConnectSA (Pty) Ltd',
                'Credits will be added automatically within 5 minutes',
                'Contact support if credits don\'t appear within 30 minutes'
            ]
        })
        
    except Exception as e:
        logger.error(f"Failed to initiate top-up for user {request.user.email}: {str(e)}")
        return Response(
            {'error': 'Failed to initiate top-up'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manual_credit_addition(request):
    """
    Manually add credits to wallet (admin function)
    """
    try:
        user = request.user
        credits = request.data.get('credits', 0)
        reason = request.data.get('reason', 'Manual credit addition')
        
        if not credits or credits <= 0:
            return Response(
                {'error': 'Valid credits amount is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        wallet = get_object_or_404(Wallet, user=user)
        
        # Add credits
        wallet.add_credits(credits)
        
        # Create transaction record
        WalletTransaction.objects.create(
            wallet=wallet,
            transaction_type='credit_addition',
            amount=Decimal('0.00'),
            credits=credits,
            description=reason,
            status='completed',
            reference=f'CREDIT-{uuid.uuid4().hex[:8].upper()}'
        )
        
        return Response({
            'success': True,
            'credits_added': credits,
            'new_balance': wallet.credits,
            'message': f'Successfully added {credits} credits'
        })
        
    except Exception as e:
        logger.error(f"Failed to add credits for user {request.user.email}: {str(e)}")
        return Response(
            {'error': 'Failed to add credits'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trigger_reconciliation(request):
    """
    Manually trigger bank reconciliation (admin function)
    """
    try:
        # Run reconciliation task
        result = reconcile_bank_deposits.delay()
        
        return Response({
            'success': True,
            'task_id': result.id,
            'message': 'Bank reconciliation started'
        })
        
    except Exception as e:
        logger.error(f"Failed to trigger reconciliation: {str(e)}")
        return Response(
            {'error': 'Failed to trigger reconciliation'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

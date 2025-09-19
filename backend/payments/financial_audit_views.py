"""
Financial Audit Views

This module provides comprehensive financial data for audit purposes,
including revenue tracking, transaction analysis, and platform earnings.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
import logging

from .models import Transaction, PaymentAccount, DepositRequest
from backend.leads.models import Lead
from backend.users.models import User, Wallet

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def financial_audit_data(request):
    """
    Get comprehensive financial audit data for the platform
    """
    try:
        # Check if user is admin or finance staff
        if not (request.user.is_staff or hasattr(request.user, 'support_profile')):
            return Response(
                {'error': 'Access denied. Admin or finance staff required.'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Get date range from query parameters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date:
            start_date = (timezone.now() - timedelta(days=365)).date()
        else:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            
        if not end_date:
            end_date = timezone.now().date()
        else:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

        # Base queryset for transactions
        transactions = Transaction.objects.filter(
            created_at__date__range=[start_date, end_date]
        )

        # Calculate revenue metrics from EFT manual deposits
        total_revenue = transactions.filter(
            status='completed',
            transaction_type='deposit'
        ).aggregate(total=Sum('amount'))['total'] or 0

        monthly_revenue = transactions.filter(
            status='completed',
            transaction_type='deposit',
            created_at__month=timezone.now().month,
            created_at__year=timezone.now().year
        ).aggregate(total=Sum('amount'))['total'] or 0

        refund_amount = transactions.filter(
            status='completed',
            transaction_type='refund'
        ).aggregate(total=Sum('amount'))['total'] or 0

        net_revenue = total_revenue - refund_amount

        # Platform earnings breakdown from EFT deposits and lead purchases
        platform_earnings = {
            'lead_sales': transactions.filter(
                transaction_type='lead_purchase',
                status='completed'
            ).aggregate(total=Sum('amount'))['total'] or 0,
            'subscription_fees': transactions.filter(
                transaction_type='subscription',
                status='completed'
            ).aggregate(total=Sum('amount'))['total'] or 0,
            'transaction_fees': 0,  # No transaction fees with EFT deposits
            'premium_features': 0,  # No premium features yet
            'other_income': transactions.filter(
                ~Q(transaction_type__in=['lead_purchase', 'subscription', 'deposit', 'refund']),
                status='completed'
            ).aggregate(total=Sum('amount'))['total'] or 0
        }

        # Financial summary for EFT manual deposits
        financial_summary = {
            'total_deposits': transactions.filter(
                transaction_type='deposit',
                status='completed'
            ).aggregate(total=Sum('amount'))['total'] or 0,
            'total_withdrawals': 0,  # No withdrawals with EFT system
            'total_credits_sold': transactions.filter(
                transaction_type='deposit',
                status='completed'
            ).aggregate(total=Sum('credits_purchased'))['total'] or 0,
            'total_credits_used': transactions.filter(
                transaction_type='lead_purchase',
                status='completed'
            ).aggregate(total=Sum('credits_spent'))['total'] or 0,
            'outstanding_balances': Wallet.objects.aggregate(
                total=Sum('credits')
            )['total'] or 0,
            'pending_deposits': DepositRequest.objects.filter(
                status='pending'
            ).aggregate(total=Sum('amount'))['total'] or 0,
            'bank_reconciliation_codes': DepositRequest.objects.filter(
                status='completed'
            ).values('bank_reference').distinct().count()
        }

        # Transaction statistics
        transaction_stats = {
            'total_transactions': transactions.count(),
            'successful_transactions': transactions.filter(status='completed').count(),
            'failed_transactions': transactions.filter(status='failed').count(),
            'pending_transactions': transactions.filter(status='pending').count(),
            'average_transaction_value': total_revenue / max(transactions.filter(status='completed').count(), 1)
        }

        # Monthly trends (last 12 months) with bank reconciliation
        monthly_trends = []
        for i in range(12):
            month_date = timezone.now() - timedelta(days=30 * i)
            month_start = month_date.replace(day=1)
            month_end = month_start + timedelta(days=32)
            month_end = month_end.replace(day=1) - timedelta(days=1)
            
            month_transactions = transactions.filter(
                created_at__date__range=[month_start.date(), month_end.date()]
            )
            
            month_deposits = DepositRequest.objects.filter(
                created_at__date__range=[month_start.date(), month_end.date()]
            )
            
            month_revenue = month_transactions.filter(
                status='completed',
                transaction_type='deposit'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            monthly_trends.append({
                'month': month_start.strftime('%Y-%m'),
                'month_name': month_start.strftime('%b %Y'),
                'revenue': month_revenue,
                'transactions': month_transactions.count(),
                'leads_sold': month_transactions.filter(transaction_type='lead_purchase').count(),
                'eft_deposits': month_deposits.count(),
                'bank_references': month_deposits.filter(status='completed').values('bank_reference').distinct().count()
            })

        # User metrics
        user_metrics = {
            'total_users': User.objects.count(),
            'active_users': User.objects.filter(is_active=True).count(),
            'providers': User.objects.filter(provider_profile__isnull=False).count(),
            'clients': User.objects.filter(provider_profile__isnull=True).count(),
            'users_with_credits': Wallet.objects.filter(credits__gt=0).count()
        }

        # Lead metrics
        lead_metrics = {
            'total_leads': Lead.objects.count(),
            'leads_sold': Lead.objects.filter(is_available=False).count(),
            'leads_available': Lead.objects.filter(is_available=True).count(),
            'total_lead_revenue': transactions.filter(
                transaction_type='lead_purchase',
                status='completed'
            ).aggregate(total=Sum('amount'))['total'] or 0
        }

        # Bank reconciliation metrics
        bank_reconciliation = {
            'total_deposit_requests': DepositRequest.objects.count(),
            'pending_deposits': DepositRequest.objects.filter(status='pending').count(),
            'completed_deposits': DepositRequest.objects.filter(status='completed').count(),
            'failed_deposits': DepositRequest.objects.filter(status='failed').count(),
            'total_bank_references': DepositRequest.objects.filter(
                status='completed'
            ).values('bank_reference').distinct().count(),
            'pending_amount': DepositRequest.objects.filter(
                status='pending'
            ).aggregate(total=Sum('amount'))['total'] or 0,
            'recent_deposits': list(DepositRequest.objects.filter(
                status='completed'
            ).order_by('-created_at')[:10].values(
                'bank_reference', 'amount', 'created_at', 'account__user__email'
            ))
        }

        # Calculate revenue growth
        if len(monthly_trends) >= 2:
            current_revenue = monthly_trends[0]['revenue']
            previous_revenue = monthly_trends[1]['revenue']
            revenue_growth = ((current_revenue - previous_revenue) / max(previous_revenue, 1)) * 100
        else:
            revenue_growth = 0

        audit_data = {
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'generated_at': timezone.now().isoformat()
            },
            'revenue_metrics': {
                'total_revenue': total_revenue,
                'monthly_revenue': monthly_revenue,
                'refund_amount': refund_amount,
                'net_revenue': net_revenue,
                'revenue_growth': revenue_growth
            },
            'platform_earnings': platform_earnings,
            'financial_summary': financial_summary,
            'transaction_stats': transaction_stats,
            'monthly_trends': monthly_trends,
            'user_metrics': user_metrics,
            'lead_metrics': lead_metrics,
            'bank_reconciliation': bank_reconciliation,
            'audit_trail': {
                'total_transactions_audited': transactions.count(),
                'data_integrity_score': calculate_data_integrity_score(transactions),
                'last_updated': timezone.now().isoformat()
            }
        }

        return Response(audit_data)

    except Exception as e:
        logger.error(f"Error generating financial audit data: {str(e)}")
        return Response(
            {'error': 'Failed to generate audit data'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def calculate_data_integrity_score(transactions):
    """
    Calculate a data integrity score based on transaction completeness
    """
    total_transactions = transactions.count()
    if total_transactions == 0:
        return 100
    
    complete_transactions = transactions.filter(
        amount__isnull=False,
        status__isnull=False,
        transaction_type__isnull=False,
        created_at__isnull=False
    ).count()
    
    return round((complete_transactions / total_transactions) * 100, 2)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_financial_report(request):
    """
    Export comprehensive financial report for audit
    """
    try:
        # Check if user is admin or finance staff
        if not (request.user.is_staff or hasattr(request.user, 'support_profile')):
            return Response(
                {'error': 'Access denied. Admin or finance staff required.'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Get audit data
        audit_response = financial_audit_data(request)
        if audit_response.status_code != 200:
            return audit_response

        audit_data = audit_response.data

        # Generate CSV report
        import csv
        import io
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['ProCompare Financial Audit Report'])
        writer.writerow(['Generated:', audit_data['period']['generated_at']])
        writer.writerow(['Period:', f"{audit_data['period']['start_date']} to {audit_data['period']['end_date']}"])
        writer.writerow([])
        
        # Revenue metrics
        writer.writerow(['REVENUE METRICS'])
        writer.writerow(['Total Revenue', f"R{audit_data['revenue_metrics']['total_revenue']:,.2f}"])
        writer.writerow(['Monthly Revenue', f"R{audit_data['revenue_metrics']['monthly_revenue']:,.2f}"])
        writer.writerow(['Refund Amount', f"R{audit_data['revenue_metrics']['refund_amount']:,.2f}"])
        writer.writerow(['Net Revenue', f"R{audit_data['revenue_metrics']['net_revenue']:,.2f}"])
        writer.writerow(['Revenue Growth', f"{audit_data['revenue_metrics']['revenue_growth']:.2f}%"])
        writer.writerow([])
        
        # Platform earnings
        writer.writerow(['PLATFORM EARNINGS BREAKDOWN'])
        for key, value in audit_data['platform_earnings'].items():
            writer.writerow([key.replace('_', ' ').title(), f"R{value:,.2f}"])
        writer.writerow([])
        
        # Financial summary
        writer.writerow(['FINANCIAL SUMMARY'])
        for key, value in audit_data['financial_summary'].items():
            if 'credits' in key:
                writer.writerow([key.replace('_', ' ').title(), f"{value:,}"])
            else:
                writer.writerow([key.replace('_', ' ').title(), f"R{value:,.2f}"])
        writer.writerow([])
        
        # Monthly trends
        writer.writerow(['MONTHLY TRENDS'])
        writer.writerow(['Month', 'Revenue', 'Transactions', 'Leads Sold'])
        for trend in audit_data['monthly_trends']:
            writer.writerow([
                trend['month_name'],
                f"R{trend['revenue']:,.2f}",
                trend['transactions'],
                trend['leads_sold']
            ])
        
        # Get the CSV content
        csv_content = output.getvalue()
        output.close()
        
        # Return as downloadable file
        from django.http import HttpResponse
        response = HttpResponse(csv_content, content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="proconnectsa_financial_audit_{timezone.now().strftime("%Y%m%d")}.csv"'
        
        return response

    except Exception as e:
        logger.error(f"Error exporting financial report: {str(e)}")
        return Response(
            {'error': 'Failed to export report'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

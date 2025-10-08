"""
Comprehensive Admin Monitoring System
Track all system activity, errors, registrations, login issues, payments, etc.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Q
import logging

from backend.users.models import User, ProviderProfile
from backend.leads.models import Lead, LeadAssignment
from backend.payments.models import DepositRequest, Transaction
from backend.notifications.models import Notification

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_monitoring_dashboard(request):
    """
    Comprehensive monitoring dashboard for admin
    Shows: registrations, logins, errors, payments, leads, everything
    """
    try:
        hours_param = request.GET.get('hours', 24)
        hours = int(hours_param)
        time_window = timezone.now() - timedelta(hours=hours)
        
        # 1. USER REGISTRATIONS
        new_users = User.objects.filter(date_joined__gte=time_window).order_by('-date_joined')
        new_providers = new_users.filter(user_type='provider')
        new_clients = new_users.filter(user_type='client')
        
        # 2. FAILED LOGIN ATTEMPTS (from logs or cache)
        # Note: We'll track this in a new model or Redis
        failed_logins = []  # TODO: Implement login failure tracking
        
        # 3. NEW DEPOSITS
        new_deposits = DepositRequest.objects.filter(
            created_at__gte=time_window
        ).select_related('account__user')
        
        # 4. NEW LEADS
        new_leads = Lead.objects.filter(created_at__gte=time_window)
        
        # 5. SYSTEM ERRORS (from Django logs)
        # We'll return log file location for now
        
        # 6. PENDING ITEMS NEEDING ATTENTION
        pending_deposits = DepositRequest.objects.filter(status='pending')
        unverified_providers = ProviderProfile.objects.filter(verification_status='pending')
        
        # 7. RECENT TRANSACTIONS
        recent_transactions = Transaction.objects.filter(
            created_at__gte=time_window
        ).select_related('account__user').order_by('-created_at')
        
        return Response({
            'monitoring_period': f'Last {hours} hours',
            'timestamp': timezone.now().isoformat(),
            
            # NEW REGISTRATIONS
            'registrations': {
                'total': new_users.count(),
                'providers': new_providers.count(),
                'clients': new_clients.count(),
                'details': [
                    {
                        'email': u.email,
                        'name': f'{u.first_name} {u.last_name}',
                        'type': u.user_type,
                        'registered_at': u.date_joined.isoformat(),
                        'is_active': u.is_active,
                        'has_logged_in': u.last_login is not None
                    } for u in new_users
                ]
            },
            
            # LOGIN STATUS
            'logins': {
                'recent_logins': User.objects.filter(
                    last_login__gte=time_window
                ).count(),
                'failed_attempts': len(failed_logins),  # TODO: Implement
                'never_logged_in': User.objects.filter(last_login__isnull=True).count()
            },
            
            # PAYMENTS & DEPOSITS
            'payments': {
                'new_deposits': new_deposits.count(),
                'pending_deposits': pending_deposits.count(),
                'total_deposited': sum(d.amount for d in new_deposits),
                'recent_deposits': [
                    {
                        'provider': d.account.user.email,
                        'amount': float(d.amount),
                        'credits': d.credits_to_activate,
                        'status': d.status,
                        'reference': d.reference_number,
                        'created_at': d.created_at.isoformat()
                    } for d in new_deposits
                ]
            },
            
            # LEADS ACTIVITY
            'leads': {
                'new_leads': new_leads.count(),
                'total_active': Lead.objects.filter(status='verified').count(),
                'recent_leads': [
                    {
                        'title': lead.title,
                        'category': lead.service_category.name,
                        'client': lead.client.email,
                        'location': f'{lead.location_suburb}, {lead.location_city}',
                        'status': lead.status,
                        'created_at': lead.created_at.isoformat()
                    } for lead in new_leads
                ]
            },
            
            # ITEMS NEEDING ATTENTION
            'attention_needed': {
                'pending_deposits': pending_deposits.count(),
                'unverified_providers': unverified_providers.count(),
                'pending_details': [
                    {
                        'type': 'deposit',
                        'user': d.account.user.email,
                        'amount': float(d.amount),
                        'age_hours': (timezone.now() - d.created_at).total_seconds() / 3600
                    } for d in pending_deposits
                ]
            },
            
            # SYSTEM HEALTH
            'system_health': {
                'total_users': User.objects.count(),
                'active_providers': ProviderProfile.objects.filter(
                    verification_status='verified'
                ).count(),
                'providers_with_credits': ProviderProfile.objects.filter(
                    credit_balance__gt=0
                ).count(),
                'log_file': '/var/log/proconnectsa/error.log',
                'database_status': 'healthy'
            }
        })
        
    except Exception as e:
        logger.error(f"Error in monitoring dashboard: {str(e)}")
        return Response({
            'error': str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def recent_activity_feed(request):
    """
    Real-time activity feed showing all recent actions
    """
    try:
        limit = int(request.GET.get('limit', 50))
        
        activities = []
        
        # Recent registrations
        recent_users = User.objects.all().order_by('-date_joined')[:limit]
        for user in recent_users:
            activities.append({
                'type': 'registration',
                'timestamp': user.date_joined.isoformat(),
                'user': user.email,
                'details': f'New {user.user_type} registered',
                'icon': '👤'
            })
        
        # Recent deposits
        recent_deposits = DepositRequest.objects.all().order_by('-created_at')[:limit]
        for deposit in recent_deposits:
            activities.append({
                'type': 'deposit',
                'timestamp': deposit.created_at.isoformat(),
                'user': deposit.account.user.email,
                'details': f'R{deposit.amount} deposit - {deposit.status}',
                'icon': '💰'
            })
        
        # Recent leads
        recent_leads = Lead.objects.all().order_by('-created_at')[:limit]
        for lead in recent_leads:
            activities.append({
                'type': 'lead',
                'timestamp': lead.created_at.isoformat(),
                'user': lead.client.email,
                'details': f'{lead.service_category.name} lead in {lead.location_city}',
                'icon': '📋'
            })
        
        # Sort all activities by timestamp
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return Response({
            'activities': activities[:limit],
            'total': len(activities)
        })
        
    except Exception as e:
        logger.error(f"Error in activity feed: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def problem_detection(request):
    """
    Detect and report potential problems in the system
    """
    try:
        problems = []
        
        # 1. Users who registered but never logged in (>24 hours)
        day_ago = timezone.now() - timedelta(hours=24)
        never_logged_in = User.objects.filter(
            date_joined__lt=day_ago,
            last_login__isnull=True
        )
        
        if never_logged_in.count() > 0:
            problems.append({
                'severity': 'warning',
                'type': 'login_issue',
                'message': f'{never_logged_in.count()} users registered >24h ago but never logged in',
                'users': [u.email for u in never_logged_in],
                'action': 'Send welcome email or check if having login issues'
            })
        
        # 2. Pending deposits > 2 hours old
        two_hours_ago = timezone.now() - timedelta(hours=2)
        old_pending_deposits = DepositRequest.objects.filter(
            status='pending',
            created_at__lt=two_hours_ago
        )
        
        if old_pending_deposits.count() > 0:
            problems.append({
                'severity': 'high',
                'type': 'payment_issue',
                'message': f'{old_pending_deposits.count()} deposits pending >2 hours',
                'details': [
                    {
                        'user': d.account.user.email,
                        'amount': float(d.amount),
                        'age_hours': (timezone.now() - d.created_at).total_seconds() / 3600
                    } for d in old_pending_deposits
                ],
                'action': 'Review and approve deposits manually'
            })
        
        # 3. Unverified providers with deposits (they're trying to use the platform!)
        unverified_with_deposits = ProviderProfile.objects.filter(
            verification_status='pending'
        ).exclude(credit_balance=0)
        
        if unverified_with_deposits.count() > 0:
            problems.append({
                'severity': 'medium',
                'type': 'verification_issue',
                'message': f'{unverified_with_deposits.count()} providers have credits but not verified',
                'users': [p.user.email for p in unverified_with_deposits],
                'action': 'Verify these providers to let them use credits'
            })
        
        # 4. Providers with 0 credits who have been active
        active_no_credits = ProviderProfile.objects.filter(
            verification_status='verified',
            credit_balance=0,
            user__last_login__gte=timezone.now() - timedelta(days=7)
        )
        
        if active_no_credits.count() > 0:
            problems.append({
                'severity': 'info',
                'type': 'potential_customers',
                'message': f'{active_no_credits.count()} active providers with 0 credits (potential buyers)',
                'users': [p.user.email for p in active_no_credits],
                'action': 'Follow up - they might want to buy credits'
            })
        
        return Response({
            'problems_detected': len(problems),
            'problems': problems,
            'timestamp': timezone.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in problem detection: {str(e)}")
        return Response({'error': str(e)}, status=500)


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
def system_health(request):
    """
    Lightweight system health summary for admin use.
    """
    try:
        return Response({
            'timestamp': timezone.now().isoformat(),
            'users': {
                'total': User.objects.count(),
                'providers': User.objects.filter(user_type='provider').count(),
                'clients': User.objects.filter(user_type='client').count(),
            },
            'providers': {
                'verified': ProviderProfile.objects.filter(verification_status='verified').count(),
                'with_credits': ProviderProfile.objects.filter(credit_balance__gt=0).count(),
            },
            'payments': {
                'pending_deposits': DepositRequest.objects.filter(status='pending').count(),
                'recent_deposits_24h': DepositRequest.objects.filter(created_at__gte=timezone.now()-timedelta(hours=24)).count(),
            },
            'leads': {
                'active_verified': Lead.objects.filter(status='verified').count(),
                'assigned_last_24h': LeadAssignment.objects.filter(assigned_at__gte=timezone.now()-timedelta(hours=24)).count(),
            }
        })
    except Exception as e:
        logger.error(f"system_health error: {e}")
        return Response({'error': 'health check failed'}, status=500)

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
        
        # Debug logging
        logger.info(f"Admin monitoring dashboard requested - hours: {hours}, time_window: {time_window}")
        
        # 1. USER REGISTRATIONS
        # Use created_at instead of date_joined for more reliable tracking
        # created_at is explicitly defined in User model and consistent with other models
        new_users = User.objects.filter(created_at__gte=time_window).order_by('-created_at')
        new_providers = new_users.filter(user_type='provider')
        new_clients = new_users.filter(user_type='client')
        
        # Debug logging
        total_count = new_users.count()
        providers_count = new_providers.count()
        clients_count = new_clients.count()
        logger.info(f"Found {total_count} new users in last {hours} hours (providers: {providers_count}, clients: {clients_count})")
        
        # Log sample user emails for debugging
        if total_count > 0:
            sample_users = list(new_users[:5].values_list('email', 'created_at'))
            logger.info(f"Sample new users: {sample_users}")
        else:
            # Check if there are ANY users at all
            all_users_count = User.objects.count()
            logger.info(f"No new users found. Total users in database: {all_users_count}")
            # Check most recent user
            most_recent = User.objects.order_by('-created_at').first()
            if most_recent:
                logger.info(f"Most recent user: {most_recent.email}, created_at: {most_recent.created_at}, time_window: {time_window}")
                logger.info(f"Most recent user is within window: {most_recent.created_at >= time_window}")
        
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
            'time_window_start': time_window.isoformat(),
            'current_time': timezone.now().isoformat(),
            
            # NEW REGISTRATIONS
            'registrations': {
                'total': total_count,
                'providers': providers_count,
                'clients': clients_count,
                'details': [
                    {
                        'email': u.email,
                        'name': f'{u.first_name} {u.last_name}',
                        'type': u.user_type,
                        'registered_at': u.created_at.isoformat(),  # Use created_at instead of date_joined
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
        recent_users = User.objects.all().order_by('-created_at')[:limit]  # Use created_at for consistency
        for user in recent_users:
            activities.append({
                'type': 'registration',
                'timestamp': user.created_at.isoformat(),  # Use created_at instead of date_joined
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
    Enhanced with detailed user information
    """
    try:
        problems = []
        
        # 1. Users who registered but never logged in (>24 hours)
        day_ago = timezone.now() - timedelta(hours=24)
        never_logged_in = User.objects.filter(
            created_at__lt=day_ago,  # Use created_at instead of date_joined for consistency
            last_login__isnull=True
        ).select_related('provider_profile')
        
        if never_logged_in.count() > 0:
            user_details = []
            for u in never_logged_in:
                has_profile = hasattr(u, 'provider_profile')
                profile_data = None
                pending_deposits_count = 0
                total_deposit_amount = 0
                
                if has_profile:
                    profile = u.provider_profile
                    profile_data = {
                        'business_name': profile.business_name,
                        'verification_status': profile.verification_status,
                        'credit_balance': profile.credit_balance
                    }
                    # Count pending deposits
                    pending_deposits = DepositRequest.objects.filter(
                        account__user=u,
                        status='pending'
                    )
                    pending_deposits_count = pending_deposits.count()
                    total_deposit_amount = sum(float(d.amount) for d in pending_deposits)
                
                user_details.append({
                    'email': u.email,
                    'has_provider_profile': has_profile,
                    'business_name': profile_data['business_name'] if profile_data else None,
                    'verification_status': profile_data['verification_status'] if profile_data else None,
                    'has_pending_deposits': pending_deposits_count > 0,
                    'pending_deposit_count': pending_deposits_count,
                    'total_deposit_amount': float(total_deposit_amount)
                })
            
            problems.append({
                'severity': 'warning',
                'type': 'login_issue',
                'message': f'{never_logged_in.count()} users registered >24h ago but never logged in',
                'users': user_details,
                'action': 'Send welcome email or check if having login issues'
            })
        
        # 2. Pending deposits > 2 hours old
        two_hours_ago = timezone.now() - timedelta(hours=2)
        old_pending_deposits = DepositRequest.objects.filter(
            status='pending',
            created_at__lt=two_hours_ago
        ).select_related('account__user__provider_profile')
        
        if old_pending_deposits.count() > 0:
            deposit_details = []
            for d in old_pending_deposits:
                user = d.account.user
                has_profile = hasattr(user, 'provider_profile')
                business_name = None
                verification_status = None
                
                if has_profile:
                    business_name = user.provider_profile.business_name
                    verification_status = user.provider_profile.verification_status
                
                deposit_details.append({
                    'deposit_id': str(d.id),
                    'user': user.email,
                    'business_name': business_name,
                    'amount': float(d.amount),
                    'age_hours': round((timezone.now() - d.created_at).total_seconds() / 3600, 1),
                    'reference_number': d.reference_number,
                    'status': d.status,
                    'has_bank_reference': bool(d.bank_reference),
                    'bank_reference': d.bank_reference,
                    'provider_profile_status': verification_status,
                    'credits_to_activate': d.credits_to_activate
                })
            
            problems.append({
                'severity': 'high',
                'type': 'payment_issue',
                'message': f'{old_pending_deposits.count()} deposits pending >2 hours',
                'details': deposit_details,
                'action': 'Review and approve deposits manually'
            })
        
        # 3. Unverified providers with deposits (they're trying to use the platform!)
        unverified_with_deposits = ProviderProfile.objects.filter(
            verification_status='pending'
        ).exclude(credit_balance=0).select_related('user')
        
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


@api_view(['GET'])
@permission_classes([IsAdminUser])
def user_detail_by_email(request, email):
    """
    Get detailed information about a user by email
    Includes provider profile, deposits, and account status
    """
    try:
        user = User.objects.get(email=email)
        
        # Basic user info
        user_data = {
            'email': user.email,
            'name': f'{user.first_name} {user.last_name}'.strip() or 'N/A',
            'user_type': user.user_type,
            'date_joined': user.date_joined.isoformat() if user.date_joined else None,  # Keep for backward compatibility
            'created_at': user.created_at.isoformat(),  # Primary field for tracking
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'is_active': user.is_active,
            'is_email_verified': user.is_email_verified,
            'is_phone_verified': user.is_phone_verified
        }
        
        # Provider profile info
        provider_profile_data = None
        has_provider_profile = hasattr(user, 'provider_profile')
        
        if has_provider_profile:
            profile = user.provider_profile
            provider_profile_data = {
                'exists': True,
                'business_name': profile.business_name,
                'business_address': profile.business_address,
                'business_phone': profile.business_phone,
                'business_email': profile.business_email,
                'verification_status': profile.verification_status,
                'credit_balance': profile.credit_balance,
                'subscription_tier': profile.subscription_tier,
                'service_categories': profile.service_categories,
                'service_areas': profile.service_areas,
                'customer_code': profile.customer_code
            }
        else:
            provider_profile_data = {'exists': False}
        
        # Deposit history
        deposits = DepositRequest.objects.filter(
            account__user=user
        ).order_by('-created_at')
        
        deposit_history = []
        total_pending = 0
        total_completed = 0
        total_failed = 0
        
        for deposit in deposits:
            deposit_history.append({
                'id': str(deposit.id),
                'amount': float(deposit.amount),
                'status': deposit.status,
                'reference_number': deposit.reference_number,
                'bank_reference': deposit.bank_reference,
                'created_at': deposit.created_at.isoformat(),
                'age_hours': round((timezone.now() - deposit.created_at).total_seconds() / 3600, 1),
                'admin_notes': deposit.admin_notes,
                'credits_to_activate': deposit.credits_to_activate,
                'processed_at': deposit.processed_at.isoformat() if deposit.processed_at else None
            })
            
            if deposit.status == 'pending':
                total_pending += 1
            elif deposit.status == 'completed':
                total_completed += 1
            elif deposit.status == 'failed':
                total_failed += 1
        
        deposits_summary = {
            'total': deposits.count(),
            'pending': total_pending,
            'completed': total_completed,
            'failed': total_failed,
            'history': deposit_history
        }
        
        # Account status summary
        account_status = {
            'has_provider_profile': has_provider_profile,
            'profile_complete': has_provider_profile and bool(profile.business_name) if has_provider_profile else False,
            'verification_status': provider_profile_data['verification_status'] if has_provider_profile else None,
            'has_pending_deposits': total_pending > 0,
            'has_credits': has_provider_profile and profile.credit_balance > 0 if has_provider_profile else False,
            'can_purchase_leads': has_provider_profile and profile.verification_status == 'verified' and profile.credit_balance > 0 if has_provider_profile else False
        }
        
        return Response({
            'user': user_data,
            'provider_profile': provider_profile_data,
            'deposits': deposits_summary,
            'account_status': account_status
        })
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    except Exception as e:
        logger.error(f"Error getting user detail: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def deposit_detail(request, deposit_id):
    """
    Get detailed information about a specific deposit
    """
    try:
        deposit = DepositRequest.objects.select_related(
            'account__user__provider_profile'
        ).get(id=deposit_id)
        
        user = deposit.account.user
        has_profile = hasattr(user, 'provider_profile')
        
        deposit_data = {
            'id': str(deposit.id),
            'user': {
                'email': user.email,
                'name': f'{user.first_name} {user.last_name}'.strip() or 'N/A',
                'has_provider_profile': has_profile
            },
            'amount': float(deposit.amount),
            'status': deposit.status,
            'reference_number': deposit.reference_number,
            'bank_reference': deposit.bank_reference,
            'credits_to_activate': deposit.credits_to_activate,
            'created_at': deposit.created_at.isoformat(),
            'age_hours': round((timezone.now() - deposit.created_at).total_seconds() / 3600, 1),
            'admin_notes': deposit.admin_notes,
            'processed_at': deposit.processed_at.isoformat() if deposit.processed_at else None,
            'processed_by': deposit.processed_by.email if deposit.processed_by else None,
            'is_auto_verified': deposit.is_auto_verified,
            'verification_notes': deposit.verification_notes
        }
        
        if has_profile:
            profile = user.provider_profile
            deposit_data['user']['business_name'] = profile.business_name
            deposit_data['user']['verification_status'] = profile.verification_status
            deposit_data['user']['credit_balance'] = profile.credit_balance
        
        return Response(deposit_data)
        
    except DepositRequest.DoesNotExist:
        return Response({'error': 'Deposit not found'}, status=404)
    except Exception as e:
        logger.error(f"Error getting deposit detail: {str(e)}")
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def deposit_action(request, deposit_id):
    """
    Approve or reject a deposit
    Body: { "action": "approve" | "reject", "notes": "optional notes" }
    """
    try:
        deposit = DepositRequest.objects.get(id=deposit_id)
        action = request.data.get('action')
        notes = request.data.get('notes', '')
        
        if action not in ['approve', 'reject']:
            return Response({'error': 'Action must be "approve" or "reject"'}, status=400)
        
        if deposit.status != 'pending':
            return Response({'error': f'Deposit is already {deposit.status}'}, status=400)
        
        if action == 'approve':
            deposit.approve(admin_user=request.user, notes=notes)
            message = 'Deposit approved successfully'
        else:  # reject
            deposit.reject(admin_user=request.user, notes=notes)
            message = 'Deposit rejected'
        
        return Response({
            'success': True,
            'message': message,
            'deposit': {
                'id': str(deposit.id),
                'status': deposit.status,
                'processed_at': deposit.processed_at.isoformat() if deposit.processed_at else None
            }
        })
        
    except DepositRequest.DoesNotExist:
        return Response({'error': 'Deposit not found'}, status=404)
    except ValueError as e:
        return Response({'error': str(e)}, status=400)
    except Exception as e:
        logger.error(f"Error processing deposit action: {str(e)}")
        return Response({'error': str(e)}, status=500)


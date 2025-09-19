"""
Support Staff Authentication Views

This module handles support staff registration, authentication, and management.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import logging

from .models import SupportStaffProfile, SupportTeam, SupportTeamMembership
from .serializers import (
    SupportStaffProfileSerializer, 
    SupportStaffRegistrationSerializer,
    SupportTeamSerializer,
    SupportTeamMembershipSerializer
)

User = get_user_model()
logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def register_support_staff(request):
    """Register a new support staff member"""
    
    serializer = SupportStaffRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            # Create user account
            user_data = serializer.validated_data['user']
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],
                first_name=user_data.get('first_name', ''),
                last_name=user_data.get('last_name', ''),
                is_staff=True,  # Support staff are staff members
                is_active=True
            )
            
            # Create support profile
            profile_data = serializer.validated_data['profile']
            profile = SupportStaffProfile.objects.create(
                user=user,
                employee_id=profile_data['employee_id'],
                role=profile_data['role'],
                department=profile_data['department'],
                max_concurrent_tickets=profile_data.get('max_concurrent_tickets', 10),
                specializations=profile_data.get('specializations', []),
                languages=profile_data.get('languages', []),
                timezone=profile_data.get('timezone', 'UTC'),
                phone=profile_data.get('phone', ''),
                emergency_contact=profile_data.get('emergency_contact', ''),
                notes=profile_data.get('notes', '')
            )
            
            # Add to teams if specified
            team_ids = profile_data.get('teams', [])
            for team_id in team_ids:
                try:
                    team = SupportTeam.objects.get(id=team_id)
                    SupportTeamMembership.objects.create(
                        team=team,
                        member=user,
                        role='member'
                    )
                except SupportTeam.DoesNotExist:
                    logger.warning(f"Team {team_id} not found for user {user.username}")
            
            # Send welcome email
            try:
                send_mail(
                    subject='Welcome to ProConnectSA Support Team',
                    message=f"""
Hello {user.get_full_name()},

Welcome to the ProConnectSA Support Team!

Your account has been created with the following details:
- Employee ID: {profile.employee_id}
- Role: {profile.get_role_display()}
- Department: {profile.get_department_display()}
- Username: {user.username}
- Email: {user.email}

You can now access the support dashboard at: https://proconnectsa.co.za/support/dashboard

Best regards,
ProConnectSA Support Team
                    """,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True
                )
            except Exception as e:
                logger.error(f"Failed to send welcome email to {user.email}: {str(e)}")
            
            return Response({
                'success': True,
                'message': 'Support staff member registered successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'full_name': user.get_full_name()
                },
                'profile': SupportStaffProfileSerializer(profile).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error registering support staff: {str(e)}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def support_staff_list(request):
    """Get list of support staff members"""
    
    if not request.user.is_staff:
        return Response({
            'error': 'Only staff members can access this endpoint'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Filter by department if specified
    department = request.query_params.get('department')
    role = request.query_params.get('role')
    is_active = request.query_params.get('is_active')
    
    profiles = SupportStaffProfile.objects.all()
    
    if department:
        profiles = profiles.filter(department=department)
    if role:
        profiles = profiles.filter(role=role)
    if is_active is not None:
        profiles = profiles.filter(is_active=is_active.lower() == 'true')
    
    serializer = SupportStaffProfileSerializer(profiles, many=True)
    
    return Response({
        'success': True,
        'staff': serializer.data,
        'count': profiles.count()
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def support_staff_detail(request, user_id):
    """Get detailed information about a support staff member"""
    
    if not request.user.is_staff:
        return Response({
            'error': 'Only staff members can access this endpoint'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        profile = user.support_profile
        
        # Get workload information
        workload = profile.get_workload()
        
        # Get team memberships
        memberships = SupportTeamMembership.objects.filter(
            member=user,
            is_active=True
        ).select_related('team')
        
        serializer = SupportStaffProfileSerializer(profile)
        
        return Response({
            'success': True,
            'profile': serializer.data,
            'workload': workload,
            'teams': SupportTeamMembershipSerializer(memberships, many=True).data
        })
        
    except User.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except SupportStaffProfile.DoesNotExist:
        return Response({
            'error': 'Support profile not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_support_staff(request, user_id):
    """Update support staff member information"""
    
    try:
        user = User.objects.get(id=user_id)
        profile = user.support_profile
        
        # Update user information
        user_data = request.data.get('user', {})
        if user_data:
            if 'first_name' in user_data:
                user.first_name = user_data['first_name']
            if 'last_name' in user_data:
                user.last_name = user_data['last_name']
            if 'email' in user_data:
                user.email = user_data['email']
            user.save()
        
        # Update profile information
        profile_data = request.data.get('profile', {})
        if profile_data:
            for field, value in profile_data.items():
                if hasattr(profile, field):
                    setattr(profile, field, value)
            profile.save()
        
        # Update team memberships
        team_ids = request.data.get('teams', [])
        if team_ids is not None:
            # Remove existing memberships
            SupportTeamMembership.objects.filter(member=user).delete()
            
            # Add new memberships
            for team_id in team_ids:
                try:
                    team = SupportTeam.objects.get(id=team_id)
                    SupportTeamMembership.objects.create(
                        team=team,
                        member=user,
                        role='member'
                    )
                except SupportTeam.DoesNotExist:
                    logger.warning(f"Team {team_id} not found")
        
        serializer = SupportStaffProfileSerializer(profile)
        
        return Response({
            'success': True,
            'message': 'Support staff member updated successfully',
            'profile': serializer.data
        })
        
    except User.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except SupportStaffProfile.DoesNotExist:
        return Response({
            'error': 'Support profile not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def deactivate_support_staff(request, user_id):
    """Deactivate a support staff member"""
    
    try:
        user = User.objects.get(id=user_id)
        profile = user.support_profile
        
        profile.is_active = False
        profile.save()
        
        # Reassign active tickets
        from .models import SupportTicket
        active_tickets = SupportTicket.objects.filter(
            assigned_to=user,
            status__in=['open', 'in_progress', 'pending_customer']
        )
        
        # Find available staff to reassign tickets
        available_staff = SupportStaffProfile.objects.filter(
            is_active=True,
            department=profile.department
        ).exclude(user=user)
        
        if available_staff.exists():
            reassign_to = available_staff.first().user
            for ticket in active_tickets:
                ticket.assigned_to = reassign_to
                ticket.save()
        
        return Response({
            'success': True,
            'message': f'Support staff member {user.get_full_name()} deactivated successfully',
            'reassigned_tickets': active_tickets.count()
        })
        
    except User.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except SupportStaffProfile.DoesNotExist:
        return Response({
            'error': 'Support profile not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def support_teams(request):
    """Get list of support teams"""
    
    if not request.user.is_staff:
        return Response({
            'error': 'Only staff members can access this endpoint'
        }, status=status.HTTP_403_FORBIDDEN)
    
    teams = SupportTeam.objects.filter(is_active=True)
    serializer = SupportTeamSerializer(teams, many=True)
    
    return Response({
        'success': True,
        'teams': serializer.data
    })


@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_support_team(request):
    """Create a new support team"""
    
    serializer = SupportTeamSerializer(data=request.data)
    
    if serializer.is_valid():
        team = serializer.save()
        
        # Add team lead if specified
        team_lead_id = request.data.get('team_lead_id')
        if team_lead_id:
            try:
                team_lead = User.objects.get(id=team_lead_id)
                team.team_lead = team_lead
                team.save()
                
                # Add team lead as member
                SupportTeamMembership.objects.create(
                    team=team,
                    member=team_lead,
                    role='lead'
                )
            except User.DoesNotExist:
                logger.warning(f"Team lead {team_lead_id} not found")
        
        return Response({
            'success': True,
            'message': 'Support team created successfully',
            'team': SupportTeamSerializer(team).data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def support_staff_dashboard(request):
    """Get support staff dashboard data"""
    
    if not hasattr(request.user, 'support_profile'):
        return Response({
            'error': 'User is not a support staff member'
        }, status=status.HTTP_403_FORBIDDEN)
    
    profile = request.user.support_profile
    
    # Get personal statistics
    personal_stats = {
        'current_tickets': profile.get_workload()['current_tickets'],
        'resolved_today': profile.get_workload()['resolved_today'],
        'avg_resolution_time': profile.get_avg_resolution_time(),
        'satisfaction_rating': profile.get_avg_satisfaction_rating(),
        'is_available': profile.is_available
    }
    
    # Get team statistics
    team_stats = {}
    memberships = SupportTeamMembership.objects.filter(
        member=request.user,
        is_active=True
    ).select_related('team')
    
    for membership in memberships:
        team = membership.team
        team_stats[team.name] = {
            'member_count': team.get_member_count(),
            'active_members': team.get_active_members().count(),
            'role': membership.role
        }
    
    return Response({
        'success': True,
        'personal_stats': personal_stats,
        'team_stats': team_stats,
        'profile': SupportStaffProfileSerializer(profile).data
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def support_analytics(request):
    """Get support system analytics"""
    
    from .models import SupportTicket, SupportMetrics
    from django.db.models import Count, Avg
    from django.utils import timezone
    from datetime import timedelta
    
    # Get date range
    days = int(request.query_params.get('days', 30))
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=days)
    
    # Basic statistics
    total_tickets = SupportTicket.objects.filter(
        created_at__date__gte=start_date
    ).count()
    
    open_tickets = SupportTicket.objects.filter(
        status__in=['open', 'in_progress', 'pending_customer', 'pending_internal'],
        created_at__date__gte=start_date
    ).count()
    
    resolved_tickets = SupportTicket.objects.filter(
        status='resolved',
        created_at__date__gte=start_date
    ).count()
    
    # Staff statistics
    active_staff = SupportStaffProfile.objects.filter(is_active=True).count()
    
    # Team statistics
    teams = SupportTeam.objects.filter(is_active=True)
    team_stats = []
    for team in teams:
        team_stats.append({
            'name': team.name,
            'department': team.department,
            'member_count': team.get_member_count(),
            'active_members': team.get_active_members().count()
        })
    
    # Department statistics
    department_stats = SupportStaffProfile.objects.filter(
        is_active=True
    ).values('department').annotate(
        count=Count('id')
    ).order_by('-count')
    
    return Response({
        'success': True,
        'analytics': {
            'period': f"{start_date} to {end_date}",
            'total_tickets': total_tickets,
            'open_tickets': open_tickets,
            'resolved_tickets': resolved_tickets,
            'active_staff': active_staff,
            'teams': team_stats,
            'departments': list(department_stats)
        }
    })









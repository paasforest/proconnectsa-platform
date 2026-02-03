from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from django.db import transaction, models
from django.utils import timezone
from django_ratelimit.decorators import ratelimit
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import User, ProviderProfile, JobCategory, LeadClaim, Wallet
from backend.leads.models import Lead
from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserLoginSerializer,
    UserProfileSerializer, ProviderProfileSerializer, PasswordChangeSerializer,
    JobCategorySerializer, LeadSerializer, LeadClaimSerializer, DetailedLeadClaimSerializer,
    LeadCreateSerializer, LeadClaimCreateSerializer, DashboardStatsSerializer
)
from rest_framework.views import APIView
from django.contrib.auth import update_session_auth_hash
from backend.notifications.email_service import send_welcome_email
from .verification_service import VerificationService

from .service_category_utils import (
    enforce_security_subservice_rule,
    normalize_service_category_slugs,
)


class UserRegistrationView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create auth token
        token, created = Token.objects.get_or_create(user=user)
        
        # Send welcome email and email verification
        verification_service = VerificationService()
        try:
            # Send welcome email
            send_welcome_email(user)
            
            # Initiate email verification
            verification_result = verification_service.initiate_email_verification(user)
            if not verification_result.get('success'):
                logger.warning(f"Email verification failed for {user.email}: {verification_result.get('error')}")
                
        except Exception as e:
            # Log error but don't fail registration
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send welcome email to {user.email}: {str(e)}")
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


class UserLoginView(generics.GenericAPIView):
    """User login endpoint"""
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            # Return error in expected format for NextAuth
            return Response({
                'success': False,
                'message': 'Invalid email or password',
                'errors': serializer.errors
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        user = serializer.validated_data['user']
        
        # Create or get auth token
        token, created = Token.objects.get_or_create(user=user)
        
        # Update last active
        user.update_last_active()
        
        return Response({
            'success': True,
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'Login successful'
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_user(request):
    """
    Logout user by deleting their auth token.
    This invalidates the token on the server side for security.
    """
    try:
        # Delete the user's auth token
        request.user.auth_token.delete()
        
        return Response({
            'success': True,
            'message': 'Logged out successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Logout failed: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def refresh_token(request):
    """
    Refresh user's auth token by creating a new one.
    The old token is deleted for security.
    """
    try:
        # Delete old token
        request.user.auth_token.delete()
        
        # Create new token
        token = Token.objects.create(user=request.user)
        
        return Response({
            'success': True,
            'token': token.key,
            'message': 'Token refreshed successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Token refresh failed: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile management"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class PasswordChangeView(generics.GenericAPIView):
    """Password change endpoint"""
    serializer_class = PasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({'message': 'Password changed successfully'})


class ProviderProfileView(generics.RetrieveUpdateAPIView):
    """Provider profile management"""
    serializer_class = ProviderProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        try:
            return self.request.user.provider_profile
        except ProviderProfile.DoesNotExist:
            return None
    
    def get(self, request, *args, **kwargs):
        profile = self.get_object()
        if not profile:
            return Response(
                {'error': 'Provider profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    def put(self, request, *args, **kwargs):
        profile = self.get_object()
        if not profile:
            return Response(
                {'error': 'Provider profile not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ProviderProfileCreateView(generics.CreateAPIView):
    """Create provider profile"""
    serializer_class = ProviderProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Check if user is a provider
        if request.user.user_type != 'provider':
            return Response(
                {'error': 'Only providers can create provider profiles'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if profile already exists
        if hasattr(request.user, 'provider_profile'):
            return Response(
                {'error': 'Provider profile already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            profile = serializer.save(user=request.user)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """User logout endpoint"""
    try:
        request.user.auth_token.delete()
    except:
        pass
    return Response({'message': 'Logged out successfully'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats_view(request):
    """Get user statistics"""
    user = request.user
    
    stats = {
        'user_type': user.user_type,
        'is_phone_verified': user.is_phone_verified,
        'is_email_verified': user.is_email_verified,
        'created_at': user.created_at,
        'last_active': user.last_active,
    }
    
    if user.is_provider and hasattr(user, 'provider_profile'):
        profile = user.provider_profile
        # Get payment account balance
        cash_balance = 0.00
        if hasattr(user, 'payment_account'):
            cash_balance = float(user.payment_account.balance)
        
        stats.update({
            'verification_status': profile.verification_status,
            'subscription_tier': profile.subscription_tier,
            'subscription_active': profile.is_subscription_active,
            'credit_balance': profile.credit_balance,  # Use provider profile credits
            'cash_balance': cash_balance,  # Add cash balance
            'monthly_lead_limit': profile.monthly_lead_limit,
            'leads_used_this_month': profile.leads_used_this_month,
            'average_rating': profile.average_rating,
            'total_reviews': profile.total_reviews,
        })
    
    return Response(stats)


# Service Management Views
@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def manage_services(request):
    """Manage provider services (GET: list, POST: add/update)"""
    try:
        if request.user.user_type != 'provider':
            return Response({'error': 'Only providers can manage services'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        profile = request.user.provider_profile
        
        if request.method == 'GET':
            # Get available service categories
            from backend.leads.models import ServiceCategory
            available_services = ServiceCategory.objects.filter(is_active=True).values('id', 'name', 'slug', 'description')
            current_services = profile.service_categories
            
            return Response({
                'available_services': list(available_services),
                'current_services': current_services,
                'service_areas': profile.service_areas,
                'max_travel_distance': profile.max_travel_distance
            })
        
        elif request.method == 'POST':
            # Update services
            raw_service_categories = request.data.get('service_categories', [])
            service_areas = request.data.get('service_areas', [])
            max_travel_distance = request.data.get('max_travel_distance', profile.max_travel_distance)
            
            # Validate travel distance (max 50km)
            if max_travel_distance > 50:
                return Response({
                    'error': 'Maximum travel distance cannot exceed 50km'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if max_travel_distance < 5:
                return Response({
                    'error': 'Minimum travel distance must be at least 5km'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Normalize and validate service categories
            service_categories = normalize_service_category_slugs(
                raw_service_categories, only_active=True, include_parents=True
            )
            if not service_categories:
                return Response(
                    {'error': 'Please select at least one valid service category'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            security_err = enforce_security_subservice_rule(service_categories)
            if security_err:
                return Response({'error': security_err}, status=status.HTTP_400_BAD_REQUEST)
            
            # Update profile
            profile.service_categories = service_categories
            profile.service_areas = service_areas
            profile.max_travel_distance = max_travel_distance
            profile.save()
            
            return Response({
                'message': 'Services updated successfully',
                'service_categories': profile.service_categories,
                'service_areas': profile.service_areas,
                'max_travel_distance': profile.max_travel_distance
            })
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_service_area(request):
    """Add a new service area"""
    try:
        if request.user.user_type != 'provider':
            return Response({'error': 'Only providers can manage service areas'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        area = request.data.get('area', '').strip()
        if not area:
            return Response({'error': 'Service area is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        profile = request.user.provider_profile
        current_areas = profile.service_areas or []
        
        if area not in current_areas:
            current_areas.append(area)
            profile.service_areas = current_areas
            profile.save()
            
            return Response({
                'message': f'Service area "{area}" added successfully',
                'service_areas': profile.service_areas
            })
        else:
            return Response({
                'error': f'Service area "{area}" already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_service_area(request, area):
    """Remove a service area"""
    try:
        if request.user.user_type != 'provider':
            return Response({'error': 'Only providers can manage service areas'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        profile = request.user.provider_profile
        current_areas = profile.service_areas or []
        
        if area in current_areas:
            current_areas.remove(area)
            profile.service_areas = current_areas
            profile.save()
            
            return Response({
                'message': f'Service area "{area}" removed successfully',
                'service_areas': profile.service_areas
            })
        else:
            return Response({
                'error': f'Service area "{area}" not found'
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_service_suggestions(request):
    """Get service area suggestions based on location"""
    try:
        if request.user.user_type != 'provider':
            return Response({'error': 'Only providers can get service suggestions'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        user = request.user
        suggestions = []
        
        # Get suggestions based on user's location
        if user.city:
            suggestions.append(user.city)
            suggestions.append(f"{user.city} area")
            suggestions.append(f"{user.city} metro")
        
        if user.suburb:
            suggestions.append(user.suburb)
        
        # Add province suggestions
        from backend.leads.services import LeadAssignmentService
        province = LeadAssignmentService.get_province_from_city(user.city)
        if province:
            suggestions.append(province)
        
        # Add major South African cities
        major_cities = [
            'Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth',
            'Bloemfontein', 'Nelspruit', 'Polokwane', 'Kimberley', 'Mahikeng'
        ]
        suggestions.extend(major_cities)
        
        # Remove duplicates and current areas
        current_areas = user.provider_profile.service_areas or []
        suggestions = list(set(suggestions) - set(current_areas))
        
        return Response({
            'suggestions': suggestions[:20]  # Limit to 20 suggestions
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===== LEAD MANAGEMENT VIEWS =====

class LeadViewSet(generics.ListCreateAPIView):
    """ViewSet for lead management"""
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get available leads for providers"""
        if self.request.user.user_type != 'provider':
            return Lead.objects.none()
        
        # Get available leads (not full and not expired)
        return Lead.objects.filter(
            status='verified',
            assigned_providers_count__lt=models.F('max_providers'),
            expires_at__gt=timezone.now()
        ).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """Get available leads with provider-specific information"""
        if request.user.user_type != 'provider':
            return Response(
                {'error': 'Only providers can view leads'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Add provider-specific information
        response_data = {
            'leads': serializer.data,
            'total_count': queryset.count(),
            'provider_stats': self._get_provider_stats(request.user)
        }
        
        return Response(response_data)
    
    def create(self, request, *args, **kwargs):
        """Create a new lead (for clients)"""
        if request.user.user_type != 'client':
            return Response(
                {'error': 'Only clients can create leads'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = LeadCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        lead = serializer.save()
        
        # Send WebSocket notification for new lead
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                "lead_updates",
                {
                    'type': 'lead_created',
                    'lead_data': LeadSerializer(lead).data
                }
            )
        
        return Response(
            LeadSerializer(lead).data, 
            status=status.HTTP_201_CREATED
        )
    
    def _get_provider_stats(self, user):
        """Get provider statistics"""
        try:
            profile = user.provider_profile
            return {
                'tier': profile.subscription_tier,
                'credits': profile.credit_balance,
                'monthly_allocation': profile.get_monthly_lead_limit(),
                'leads_used_this_month': profile.leads_used_this_month,
                'remaining_allocation': max(0, profile.get_monthly_lead_limit() - profile.leads_used_this_month)
            }
        except:
            return {
                'tier': 'unknown',
                'credits': 0,
                'monthly_allocation': 0,
                'leads_used_this_month': 0,
                'remaining_allocation': 0
            }


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def claim_lead(request, lead_id):
    """Claim a lead"""
    try:
        if request.user.user_type != 'provider':
            return Response(
                {'error': 'Only providers can claim leads'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get the lead
        try:
            lead = Lead.objects.get(id=lead_id)
        except Lead.DoesNotExist:
            return Response(
                {'error': 'Lead not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if lead is still available
        if not lead.is_available:
            return Response(
                {'error': 'Lead is no longer available'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if provider already claimed this lead
        if LeadClaim.objects.filter(lead=lead, provider=request.user).exists():
            return Response(
                {'error': 'You have already claimed this lead'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get provider profile
        try:
            provider_profile = request.user.provider_profile
        except ProviderProfile.DoesNotExist:
            return Response(
                {'error': 'Provider profile not found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Determine payment method and check affordability
        is_top_up = False
        payment_method = 'payasyougo'
        
        if provider_profile.subscription_tier != 'pay_as_you_go':
            if provider_profile.leads_used_this_month >= provider_profile.get_monthly_lead_limit():
                is_top_up = True
                payment_method = 'topup'
            else:
                payment_method = 'allocation'
        
        # Calculate credit cost dynamically
        from backend.leads.ml_services import DynamicPricingMLService
        pricing_service = DynamicPricingMLService()
        pricing_result = pricing_service.calculate_dynamic_lead_price(lead, request.user)
        credit_cost = int(round(pricing_result['credits']))
        
        # Check if provider can afford it - always check credit balance
        if provider_profile.credit_balance < credit_cost:
            return Response(
                {'error': 'Insufficient credits'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process the claim
        with transaction.atomic():
            # Create the claim
            claim = LeadClaim.objects.create(
                lead=lead,
                provider=request.user,
                price_paid=credit_cost * 50,  # Always store the credit cost in Rands for display
                is_top_up=is_top_up,
                payment_method=payment_method
            )
            
            # Update lead claim count
            lead.assigned_providers_count += 1
            if lead.assigned_providers_count >= lead.max_providers:
                lead.status = 'completed'
            lead.save()
            
            # Update provider - always deduct credits when claiming leads
            provider_profile.credit_balance -= credit_cost
            provider_profile.leads_used_this_month += 1
            provider_profile.save()
            
            # Send real-time update to all connected clients
            # Send real-time update to other providers via WebSocket
            from backend.notifications.consumers import NotificationConsumer
            NotificationConsumer.send_lead_claimed_update(
                lead_id=lead.id,
                current_claims=lead.assigned_providers_count,
                total_claims=lead.max_providers,
                is_available=lead.is_available,
                status=lead.status
            )
        
        return Response(
            LeadClaimSerializer(claim).data,
            status=status.HTTP_201_CREATED
        )
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics for providers"""
    try:
        if request.user.user_type != 'provider':
            return Response(
                {'error': 'Only providers can view dashboard stats'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        provider_profile = request.user.provider_profile
        
        # Get recent claims
        recent_claims = LeadClaim.objects.filter(
            provider=request.user
        ).order_by('-claimed_at')[:10]
        
        # Get total available leads
        total_leads_available = Lead.objects.filter(
            status='active',
            current_claims__lt=models.F('max_providers'),
            expires_at__gt=timezone.now()
        ).count()
        
        # Use Wallet.credits for consistent credit display across all endpoints
        wallet, created = Wallet.objects.get_or_create(user=request.user)
        
        stats = {
            'tier': provider_profile.subscription_tier,
            'credits': wallet.credits,  # Use wallet credits instead of provider profile
            'monthly_allocation': provider_profile.get_monthly_lead_limit(),
            'leads_used_this_month': provider_profile.leads_used_this_month,
            'remaining_allocation': max(0, provider_profile.get_monthly_lead_limit() - provider_profile.leads_used_this_month),
            'total_leads_available': total_leads_available,
            'recent_claims': LeadClaimSerializer(recent_claims, many=True).data
        }
        
        return Response(stats)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_claimed_leads(request):
    """Get leads claimed by the current provider"""
    try:
        if request.user.user_type != 'provider':
            return Response(
                {'error': 'Only providers can view claimed leads'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        claims = LeadClaim.objects.filter(
            provider=request.user
        ).select_related('lead', 'lead__service_category', 'lead__client').order_by('-claimed_at')
        
        serializer = DetailedLeadClaimSerializer(claims, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def job_categories(request):
    """Get available job categories"""
    try:
        categories = JobCategory.objects.filter(is_active=True).order_by('name')
        serializer = JobCategorySerializer(categories, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SettingsView(APIView):
    """User settings management"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get user settings"""
        try:
            user = request.user
            profile = user.provider_profile
            
            settings_data = {
                'notifications': {
                    'email_notifications': getattr(profile, 'email_notifications', True),
                    'sms_notifications': getattr(profile, 'sms_notifications', False),
                    'push_notifications': getattr(profile, 'push_notifications', True),
                    'lead_alerts': getattr(profile, 'lead_alerts', True),
                    'marketing_emails': getattr(profile, 'marketing_emails', False),
                },
                'privacy': {
                    'profile_visibility': getattr(profile, 'profile_visibility', 'public'),
                    'show_contact_info': getattr(profile, 'show_contact_info', True),
                    'show_ratings': getattr(profile, 'show_ratings', True),
                },
                'preferences': {
                    'max_travel_distance': profile.max_travel_distance,
                    'preferred_lead_types': profile.service_categories,
                    'working_hours': getattr(profile, 'working_hours', '9-17'),
                    'timezone': getattr(profile, 'timezone', 'Africa/Johannesburg'),
                }
            }
            
            return Response(settings_data)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request):
        """Update user settings"""
        try:
            user = request.user
            profile = user.provider_profile
            
            # Update notification settings
            if 'notifications' in request.data:
                notifications = request.data['notifications']
                for key, value in notifications.items():
                    if hasattr(profile, key):
                        setattr(profile, key, value)
            
            # Update privacy settings
            if 'privacy' in request.data:
                privacy = request.data['privacy']
                for key, value in privacy.items():
                    if hasattr(profile, key):
                        setattr(profile, key, value)
            
            # Update preferences
            if 'preferences' in request.data:
                preferences = request.data['preferences']
                if 'max_travel_distance' in preferences:
                    profile.max_travel_distance = preferences['max_travel_distance']
                if 'preferred_lead_types' in preferences:
                    normalized = normalize_service_category_slugs(
                        preferences['preferred_lead_types'], only_active=True, include_parents=True
                    )
                    security_err = enforce_security_subservice_rule(normalized)
                    if security_err:
                        return Response({'error': security_err}, status=status.HTTP_400_BAD_REQUEST)
                    profile.service_categories = normalized
                if 'working_hours' in preferences and hasattr(profile, 'working_hours'):
                    profile.working_hours = preferences['working_hours']
                if 'timezone' in preferences and hasattr(profile, 'timezone'):
                    profile.timezone = preferences['timezone']
            
            profile.save()
            
            return Response({'message': 'Settings updated successfully'})
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasswordChangeView(APIView):
    """Password change endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Change user password"""
        try:
            user = request.user
            current_password = request.data.get('current_password')
            new_password = request.data.get('new_password')
            confirm_password = request.data.get('confirm_password')
            
            # Validate input
            if not current_password or not new_password or not confirm_password:
                return Response({
                    'error': 'All password fields are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if new_password != confirm_password:
                return Response({
                    'error': 'New passwords do not match'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if len(new_password) < 8:
                return Response({
                    'error': 'New password must be at least 8 characters long'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify current password
            if not user.check_password(current_password):
                return Response({
                    'error': 'Current password is incorrect'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update password
            user.set_password(new_password)
            user.save()
            
            # Update session to prevent logout
            update_session_auth_hash(request, user)
            
            return Response({'message': 'Password changed successfully'})
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProviderStatsView(APIView):
    """Provider statistics and performance metrics"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get provider statistics"""
        try:
            user = request.user
            profile = user.provider_profile
            
            # Calculate stats
            leads_claimed_this_month = LeadClaim.objects.filter(
                provider=user,
                claimed_at__gte=timezone.now().replace(day=1)
            ).count()
            
            total_leads_claimed = LeadClaim.objects.filter(provider=user).count()
            
            # Mock data for demo - in production, calculate from actual data
            stats = {
                'business_name': profile.business_name,
                'service_categories': profile.service_categories,
                'service_areas': profile.service_areas,
                'average_rating': 4.7,  # Mock data
                'total_reviews': 23,    # Mock data
                'response_time_hours': 2.5,  # Mock data
                'job_completion_rate': 94.5,  # Mock data
                'leads_claimed_this_month': leads_claimed_this_month,
                'monthly_lead_limit': self._get_monthly_limit(profile.subscription_tier),
                'subscription_tier': profile.subscription_tier,
                'credit_balance': profile.credit_balance,
                'customer_code': profile.customer_code,
                'verification_status': 'verified',  # Mock data
                'total_leads_claimed': total_leads_claimed,
                'success_rate': 89.2,  # Mock data
                'average_response_time': '2.5 hours',  # Mock data
                'top_performing_categories': profile.service_categories[:3],  # Mock data
            }
            
            return Response(stats)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_monthly_limit(self, subscription_tier):
        """Get monthly lead limit based on subscription tier"""
        limits = {
            'basic': 5,
            'advanced': 12,
            'pro': 30,
            'enterprise': 50
        }
        return limits.get(subscription_tier, 5)



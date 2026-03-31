"""
Admin API views for user management
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
import logging
import math

from .models import User, ProviderProfile
from .service_category_utils import enforce_security_subservice_rule, normalize_service_category_slugs
from .serializers import UserSerializer

logger = logging.getLogger(__name__)


def _json_safe_user_row(data: dict) -> dict:
    """Plain dict + strip NaN/inf floats (breaks JSON encoding with standard renderer)."""
    row = dict(data)
    for key in ("latitude", "longitude"):
        v = row.get(key)
        if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
            row[key] = None
    return row


def _float_json_safe(value):
    if value is None:
        return None
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return None
    return value


def _notification_methods_json_safe(nm):
    if nm is None:
        return []
    if isinstance(nm, list):
        return [str(x) for x in nm]
    if isinstance(nm, dict):
        return [str(k) for k in nm.keys()]
    return [str(nm)]


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_providers_directory(request):
    """
    Admin/support: list every signed-up pro (has a ProviderProfile row).
    Built without UserSerializer to avoid rare serialization crashes (500s) in production.
    """
    if not (request.user.is_staff or request.user.user_type in ["admin", "support"]):
        return Response(
            {"error": "Access denied. Admin or support privileges required."},
            status=status.HTTP_403_FORBIDDEN,
        )

    search = (request.query_params.get("search") or "").strip()

    qs = ProviderProfile.objects.select_related("user").order_by("-created_at")
    if search:
        qs = qs.filter(
            Q(business_name__icontains=search)
            | Q(business_email__icontains=search)
            | Q(business_phone__icontains=search)
            | Q(user__email__icontains=search)
            | Q(user__first_name__icontains=search)
            | Q(user__last_name__icontains=search)
            | Q(user__phone__icontains=search)
            | Q(user__city__icontains=search)
            | Q(user__suburb__icontains=search)
        )

    rows = []
    for profile in qs:
        try:
            u = profile.user
            rows.append(
                {
                    "id": str(u.id),
                    "username": u.username or "",
                    "email": u.email or "",
                    "first_name": u.first_name or "",
                    "last_name": u.last_name or "",
                    "phone": u.phone or None,
                    "city": u.city or None,
                    "suburb": u.suburb or None,
                    "latitude": _float_json_safe(u.latitude),
                    "longitude": _float_json_safe(u.longitude),
                    "user_type": u.user_type,
                    "is_active": bool(u.is_active),
                    "created_at": u.created_at.isoformat() if getattr(u, "created_at", None) else None,
                    "provider_profile": {
                        "business_name": profile.business_name,
                        "verification_status": profile.verification_status,
                        "subscription_tier": profile.subscription_tier,
                        "credit_balance": str(profile.credit_balance),
                        "business_phone": profile.business_phone or None,
                        "business_email": profile.business_email or None,
                        "receives_lead_notifications": bool(profile.receives_lead_notifications),
                        "notification_methods": _notification_methods_json_safe(
                            profile.notification_methods
                        ),
                    },
                }
            )
        except Exception as exc:
            logger.warning(
                "admin_providers_directory: skipped profile pk=%s: %s",
                getattr(profile, "pk", None),
                exc,
                exc_info=True,
            )
            continue

    return Response({"success": True, "users": rows, "count": len(rows)})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def support_users_list(request):
    """
    Get list of all users for support/admin purposes
    """
    try:
        # Check if user is admin or support
        if not (request.user.is_staff or request.user.user_type in ['admin', 'support']):
            return Response({
                'error': 'Access denied. Admin or support privileges required.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get query parameters for filtering
        user_type = request.query_params.get('user_type')
        search = request.query_params.get('search')
        is_active = request.query_params.get('is_active')
        
        # Start with all users
        users = User.objects.all().order_by('-created_at')
        
        # Apply filters
        if user_type:
            # Public UI and legacy data use both values
            if user_type == 'provider':
                users = users.filter(user_type__in=['provider', 'service_provider'])
            else:
                users = users.filter(user_type=user_type)
        
        if is_active is not None:
            users = users.filter(is_active=is_active.lower() == 'true')
        
        if search:
            users = users.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )
        
        users = users.select_related('provider_profile')
        total_count = users.count()

        # One row at a time: avoids DRF ReturnList/ReturnDict index bugs; easy to extend safely.
        serialized_users = []
        for u in users:
            try:
                row = _json_safe_user_row(UserSerializer(u).data)
                if u.user_type in ("provider", "service_provider"):
                    try:
                        p = u.provider_profile
                        row["provider_profile"] = {
                            "business_name": getattr(p, "business_name", None),
                            "verification_status": getattr(p, "verification_status", None),
                            "subscription_tier": getattr(p, "subscription_tier", None),
                            "credit_balance": str(getattr(p, "credit_balance", "0")),
                            "receives_lead_notifications": getattr(
                                p, "receives_lead_notifications", True
                            ),
                            "notification_methods": _notification_methods_json_safe(
                                getattr(p, "notification_methods", []) or []
                            ),
                        }
                    except ProviderProfile.DoesNotExist:
                        row["provider_profile"] = None
                serialized_users.append(row)
            except Exception as row_err:
                logger.warning(
                    "support_users_list: skipped user pk=%s: %s",
                    getattr(u, "pk", None),
                    row_err,
                    exc_info=True,
                )
                continue

        return Response({
            'success': True,
            'users': serialized_users,
            'count': total_count,
        })
        
    except Exception as e:
        logger.exception("Failed to fetch users list: %s", e)
        return Response(
            {'error': 'Failed to fetch users list'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_provider(request, user_id):
    """
    Admin/support: approve or reject provider verification.
    Body:
      - action: 'approve' | 'reject'
      - notes: optional string
    """
    try:
        if not (request.user.is_staff or request.user.user_type in ['admin', 'support']):
            return Response({'error': 'Access denied. Admin or support required.'}, status=status.HTTP_403_FORBIDDEN)
        
        user = get_object_or_404(User, id=user_id)
        if user.user_type != 'provider':
            return Response({'error': 'Target user is not a provider'}, status=status.HTTP_400_BAD_REQUEST)
        
        profile = user.provider_profile
        action = (request.data.get('action') or '').lower()
        notes = request.data.get('notes', '')
        
        if action not in ['approve', 'reject']:
            return Response({'error': 'Invalid action. Use approve or reject.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if action == 'approve':
            profile.verification_status = 'verified'
        else:
            profile.verification_status = 'rejected'
            # Optionally include notes inside verification_documents under 'admin_notes'
            docs = profile.verification_documents or {}
            docs['admin_notes'] = notes
            profile.verification_documents = docs
        profile.save(update_fields=['verification_status', 'verification_documents'])
        
        return Response({
            'success': True,
            'message': f'Provider {action}d',
            'verification_status': profile.verification_status
        })
    except Exception as e:
        logger.error(f"Failed to verify provider {user_id}: {str(e)}")
        return Response({'error': 'Failed to update verification status'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def support_user_detail(request, user_id):
    """
    Get detailed information about a specific user
    """
    try:
        # Check if user is admin or support
        if not (request.user.is_staff or request.user.user_type in ['admin', 'support']):
            return Response({
                'error': 'Access denied. Admin or support privileges required.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        user = get_object_or_404(User, id=user_id)
        serializer = UserSerializer(user)
        
        # Get provider profile if exists
        provider_profile = None
        try:
            provider_profile = user.provider_profile
        except ProviderProfile.DoesNotExist:
            pass
        
        response_data = {
            'success': True,
            'user': serializer.data
        }
        
        if provider_profile:
            response_data['provider_profile'] = {
                'business_name': provider_profile.business_name,
                'business_address': provider_profile.business_address,
                'service_areas': provider_profile.service_areas,
                'service_categories': provider_profile.service_categories,
                'verification_status': provider_profile.verification_status,
                'subscription_tier': provider_profile.subscription_tier,
                'years_experience': provider_profile.years_experience,
                'service_description': provider_profile.service_description,
                'minimum_job_value': provider_profile.minimum_job_value,
                'maximum_job_value': provider_profile.maximum_job_value,
                'availability': provider_profile.availability,
                'emergency_services': provider_profile.emergency_services,
                'insurance_covered': provider_profile.insurance_covered,
                'warranty_period': provider_profile.warranty_period,
            }
        
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Failed to fetch user detail for {user_id}: {str(e)}")
        return Response(
            {'error': 'Failed to fetch user detail'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def support_user_update(request, user_id):
    """
    Update user information
    """
    try:
        # Check if user is admin or support
        if not (request.user.is_staff or request.user.user_type in ['admin', 'support']):
            return Response({
                'error': 'Access denied. Admin or support privileges required.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        user = get_object_or_404(User, id=user_id)
        
        # Update user fields
        allowed_fields = [
            'user_type', 'first_name', 'last_name', 'email', 'phone',
            'city', 'suburb', 'is_active', 'is_email_verified', 'is_phone_verified'
        ]
        
        for field in allowed_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        
        user.save()
        
        serializer = UserSerializer(user)
        return Response({
            'success': True,
            'user': serializer.data,
            'message': 'User updated successfully'
        })
        
    except Exception as e:
        logger.error(f"Failed to update user {user_id}: {str(e)}")
        return Response(
            {'error': 'Failed to update user'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def support_user_provider_profile(request, user_id):
    """
    Create or update provider profile for a user
    """
    try:
        # Check if user is admin or support
        if not (request.user.is_staff or request.user.user_type in ['admin', 'support']):
            return Response({
                'error': 'Access denied. Admin or support privileges required.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        user = get_object_or_404(User, id=user_id)
        
        # Check if user is a provider
        if user.user_type != 'provider':
            return Response({
                'error': 'User must be a provider to have a provider profile'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create or update provider profile
        profile_data = request.data.copy()

        # Normalize service categories if provided (admins sometimes paste names/legacy slugs)
        if 'service_categories' in profile_data:
            normalized = normalize_service_category_slugs(profile_data.get('service_categories'), only_active=True, include_parents=True)
            security_err = enforce_security_subservice_rule(normalized)
            if security_err:
                return Response({'error': security_err}, status=status.HTTP_400_BAD_REQUEST)
            profile_data['service_categories'] = normalized
        profile, created = ProviderProfile.objects.get_or_create(
            user=user,
            defaults=profile_data
        )
        
        if not created:
            # Update existing profile
            for field, value in profile_data.items():
                if hasattr(profile, field):
                    setattr(profile, field, value)
            profile.save()
        
        return Response({
            'success': True,
            'provider_profile': {
                'business_name': profile.business_name,
                'business_address': profile.business_address,
                'service_areas': profile.service_areas,
                'service_categories': profile.service_categories,
                'verification_status': profile.verification_status,
                'subscription_tier': profile.subscription_tier,
                'years_experience': profile.years_experience,
                'service_description': profile.service_description,
                'minimum_job_value': profile.minimum_job_value,
                'maximum_job_value': profile.maximum_job_value,
                'availability': profile.availability,
                'emergency_services': profile.emergency_services,
                'insurance_covered': profile.insurance_covered,
                'warranty_period': profile.warranty_period,
            },
            'message': 'Provider profile created successfully' if created else 'Provider profile updated successfully'
        })
        
    except Exception as e:
        logger.error(f"Failed to create/update provider profile for user {user_id}: {str(e)}")
        return Response(
            {'error': 'Failed to create/update provider profile'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )












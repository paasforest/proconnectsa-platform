from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.conf import settings
import logging
import json

from .models import BusinessRegistration, BusinessDirector
from backend.notifications.email_service import EmailService

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_business_registration(request):
    """
    Create a new business registration from frontend form submission
    """
    try:
        data = request.data
        logger.info(f"Business registration received: {data.get('business_name', 'Unknown')}")
        
        # Create main business registration
        registration = BusinessRegistration.objects.create(
            # Personal Information
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            nationality=data.get('nationality'),
            id_type=data.get('id_type'),
            id_number=data.get('id_number'),
            id_document=data.get('id_document'),
            email=data.get('email'),
            phone=data.get('phone'),
            
            # Business Information
            business_name=data.get('business_name'),
            business_name_alternative=data.get('business_name_alternative'),
            business_type=data.get('business_type'),
            business_category=data.get('business_category'),
            business_description=data.get('business_description'),
            
            # Business Address
            street_address=data.get('street_address'),
            suburb=data.get('suburb'),
            city=data.get('city'),
            province=data.get('province'),
            postal_code=data.get('postal_code'),
            
            # Website Requirements
            website_required=data.get('website_required', True),
            website_type=data.get('website_type'),
            website_features=data.get('website_features', []),
            domain_preference=data.get('domain_preference'),
            
            # Registration Timeline
            registration_urgency=data.get('registration_urgency'),
            preferred_start_date=data.get('preferred_start_date'),
            
            # Payment Information
            payment_method=data.get('payment_method'),
            
            # Terms
            terms_accepted=data.get('terms_accepted', False),
            privacy_accepted=data.get('privacy_accepted', False),
            marketing_consent=data.get('marketing_consent', False),
        )
        
        # Create directors
        directors_data = data.get('directors', [])
        for director_data in directors_data:
            BusinessDirector.objects.create(
                business_registration=registration,
                name=director_data.get('name'),
                nationality=director_data.get('nationality'),
                id_type=director_data.get('id_type'),
                id_number=director_data.get('id_number'),
                id_document=director_data.get('id_document'),
                email=director_data.get('email'),
                phone=director_data.get('phone'),
                address=director_data.get('address'),
                shareholding=director_data.get('shareholding', 0)
            )
        
        # Send confirmation emails
        try:
            email_service = EmailService()
            
            # Email to customer
            email_service.send_business_registration_confirmation(
                registration.email,
                {
                    'registration_id': registration.registration_id,
                    'business_name': registration.business_name,
                    'owner_name': registration.full_name,
                    'email': registration.email,
                    'phone': registration.phone,
                    'payment_reference': registration.payment_reference,
                    'payment_amount': str(registration.payment_amount),
                    'bank_details': {
                        'bank': 'Nedbank',
                        'account_name': 'ProConnectSA (Pty) Ltd',
                        'account_number': '1313872032',
                        'branch_code': '198765'
                    }
                }
            )
            
            # Email to admin  
            email_service.send_business_registration_notification(
                'admin@proconnectsa.co.za',  # Use actual admin email
                {
                    'registration_id': registration.registration_id,
                    'business_name': registration.business_name,
                    'owner_name': registration.full_name,
                    'email': registration.email,
                    'phone': registration.phone,
                    'business_type': registration.business_type,
                    'payment_amount': str(registration.payment_amount),
                    'urgency': registration.registration_urgency,
                    'website_required': registration.website_required,
                    'directors_count': len(directors_data)
                }
            )
            
        except Exception as e:
            logger.error(f"Failed to send registration emails: {e}")
        
        return Response({
            'success': True,
            'message': 'Business registration created successfully',
            'registration_id': registration.registration_id,
            'data': {
                'business_name': registration.business_name,
                'owner_name': registration.full_name,
                'email': registration.email,
                'phone': registration.phone,
                'payment_reference': registration.payment_reference,
                'payment_amount': str(registration.payment_amount),
                'status': registration.status
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Business registration creation failed: {e}")
        return Response({
            'success': False,
            'message': 'Failed to create business registration',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_business_registration(request, registration_id):
    """
    Get business registration details by ID
    """
    try:
        registration = BusinessRegistration.objects.get(registration_id=registration_id)
        
        return Response({
            'success': True,
            'data': {
                'registration_id': registration.registration_id,
                'business_name': registration.business_name,
                'owner_name': registration.full_name,
                'email': registration.email,
                'phone': registration.phone,
                'status': registration.status,
                'payment_received': registration.payment_received,
                'payment_amount': str(registration.payment_amount),
                'submitted_at': registration.submitted_at.isoformat(),
            }
        })
        
    except BusinessRegistration.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Business registration not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Failed to fetch business registration: {e}")
        return Response({
            'success': False,
            'message': 'Failed to fetch business registration'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

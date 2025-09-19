"""
Custom adapters for django-allauth
"""
from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class CustomAccountAdapter(DefaultAccountAdapter):
    """Custom account adapter for user registration"""
    
    def save_user(self, request, user, form, commit=True):
        """Save user with additional fields"""
        user = super().save_user(request, user, form, commit=False)
        
        # Set additional fields from form data
        if 'first_name' in form.cleaned_data:
            user.first_name = form.cleaned_data['first_name']
        if 'last_name' in form.cleaned_data:
            user.last_name = form.cleaned_data['last_name']
        if 'phone' in form.cleaned_data:
            user.phone = form.cleaned_data['phone']
        if 'user_type' in form.cleaned_data:
            user.user_type = form.cleaned_data['user_type']
        if 'city' in form.cleaned_data:
            user.city = form.cleaned_data['city']
        if 'suburb' in form.cleaned_data:
            user.suburb = form.cleaned_data['suburb']
        
        if commit:
            user.save()
        return user


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """Custom social account adapter for Google OAuth"""
    
    def populate_user(self, request, sociallogin, data):
        """Populate user data from Google OAuth"""
        user = super().populate_user(request, sociallogin, data)
        
        # Extract additional data from Google profile
        extra_data = sociallogin.account.extra_data
        
        # Set name fields
        if 'given_name' in extra_data:
            user.first_name = extra_data['given_name']
        if 'family_name' in extra_data:
            user.last_name = extra_data['family_name']
        
        # Set default user type to client for Google OAuth users
        user.user_type = 'client'
        
        # Set email as username for consistency
        user.username = user.email
        
        logger.info(f"Google OAuth user created: {user.email}")
        return user
    
    def pre_social_login(self, request, sociallogin):
        """Handle existing users logging in with Google"""
        if sociallogin.account.provider == 'google':
            email = sociallogin.account.extra_data.get('email')
            if email:
                try:
                    existing_user = User.objects.get(email=email)
                    if existing_user:
                        # Link the social account to existing user
                        sociallogin.user = existing_user
                        logger.info(f"Linked Google account to existing user: {email}")
                except User.DoesNotExist:
                    pass
    
    def is_auto_signup_allowed(self, request, sociallogin):
        """Allow automatic signup for Google OAuth users"""
        return True
    
    def save_user(self, request, sociallogin, form=None):
        """Save user from social login"""
        user = super().save_user(request, sociallogin, form)
        
        # Create provider profile if user is a provider
        if user.user_type == 'provider':
            from .models import ProviderProfile
            ProviderProfile.objects.get_or_create(
                user=user,
                defaults={
                    'business_name': f"{user.first_name} {user.last_name}",
                    'verification_status': 'pending',
                    'is_subscription_active': False,
                    'credit_balance': 0,
                    'monthly_lead_limit': 10,
                    'leads_used_this_month': 0,
                    'max_travel_distance': 50,
                    'average_rating': 0.0,
                    'response_time_hours': 24,
                    'job_completion_rate': 0.0,
                    'years_experience': 0,
                    'service_areas': [user.city] if user.city else [],
                    'service_categories': [],
                    'receives_lead_notifications': True,
                }
            )
            logger.info(f"Created provider profile for Google OAuth user: {user.email}")
        
        return user










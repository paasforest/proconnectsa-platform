"""
Django management command for ML-based automatic provider verification
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from backend.users.models import ProviderProfile
from backend.leads.services import LeadAssignmentService
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Automatically verify providers using ML-based criteria and assign available leads'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be verified without making changes',
        )
        parser.add_argument(
            '--min-score',
            type=int,
            default=75,
            help='Minimum ML verification score (default: 75)',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        min_score = options['min_score']
        
        self.stdout.write(
            self.style.SUCCESS('🤖 ML AUTO-VERIFICATION AND LEAD ASSIGNMENT')
        )
        self.stdout.write('=' * 60)
        
        # Get pending providers
        pending_providers = ProviderProfile.objects.filter(verification_status='pending')
        self.stdout.write(f'\n👥 Pending providers: {pending_providers.count()}')
        
        if pending_providers.count() == 0:
            self.stdout.write(self.style.WARNING('No pending providers to verify'))
            return
        
        # ML-based verification
        verified_count = 0
        assignment_service = LeadAssignmentService()
        
        for provider in pending_providers:
            # Calculate ML verification score
            verification_score = self.calculate_ml_verification_score(provider)
            
            self.stdout.write(f'\n👤 Verifying: {provider.user.email}')
            self.stdout.write(f'   Score: {verification_score}/100')
            self.stdout.write(f'   Categories: {provider.service_categories}')
            self.stdout.write(f'   Areas: {provider.service_areas}')
            
            if verification_score >= min_score:
                if not dry_run:
                    provider.verification_status = 'verified'
                    provider.save()
                    self.stdout.write(
                        self.style.SUCCESS(f'   ✅ Auto-verified: {provider.user.email}')
                    )
                    
                    # Assign available leads to newly verified provider
                    self.assign_leads_to_provider(provider, assignment_service)
                else:
                    self.stdout.write(
                        self.style.WARNING(f'   ✅ Would verify: {provider.user.email}')
                    )
                verified_count += 1
            else:
                self.stdout.write(
                    self.style.ERROR(f'   ❌ Not verified: {provider.user.email} (Score: {verification_score})')
                )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(f'\n🎯 DRY RUN: Would verify {verified_count} providers')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'\n🎉 Auto-verified {verified_count} providers!')
            )
    
    def calculate_ml_verification_score(self, provider):
        """Calculate ML-based verification score for a provider"""
        score = 0
        
        # Basic profile completeness (40 points)
        if provider.user.email: score += 10
        if provider.user.phone: score += 10
        if provider.user.first_name: score += 5
        if provider.user.last_name: score += 5
        if provider.service_categories: score += 10
        
        # Service area coverage (20 points)
        if provider.service_areas:
            score += 20
            # Bonus for multiple areas
            if len(provider.service_areas) > 1:
                score += 5
        
        # Profile quality indicators (20 points)
        if len(provider.service_categories) > 1: score += 10  # Multiple services
        if provider.user.is_active: score += 5
        if provider.user.date_joined: score += 5
        
        # ML confidence factors (20 points)
        # Email domain quality
        if provider.user.email and '@gmail.com' in provider.user.email:
            score += 5
        elif provider.user.email and '@' in provider.user.email:
            score += 3
        
        # Phone number format
        if provider.user.phone and len(provider.user.phone) >= 10:
            score += 5
        
        # Profile age (newer profiles get bonus)
        days_since_joined = (timezone.now() - provider.user.date_joined).days
        if days_since_joined <= 7:  # New profiles
            score += 10
        elif days_since_joined <= 30:  # Recent profiles
            score += 5
        
        return min(score, 100)  # Cap at 100
    
    def assign_leads_to_provider(self, provider, assignment_service):
        """Assign available leads to newly verified provider"""
        from backend.leads.models import Lead
        
        # Get available leads that match this provider's categories
        available_leads = Lead.objects.filter(
            status='verified',
            is_available=True,
            service_category__slug__in=provider.service_categories
        )
        
        if available_leads.count() > 0:
            self.stdout.write(f'   📋 Found {available_leads.count()} matching leads')
            
            # Assign leads
            for lead in available_leads[:3]:  # Limit to 3 leads per provider
                try:
                    assignments = assignment_service.assign_lead_to_providers(lead.id)
                    if assignments:
                        self.stdout.write(f'      ✅ Assigned lead: {lead.title}')
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'      ❌ Failed to assign lead: {str(e)}')
                    )
        else:
            self.stdout.write('   ℹ️  No matching leads available')




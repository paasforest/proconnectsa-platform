"""
Management command to validate and fix category consistency across the system.
This prevents the production issues we just fixed.
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from backend.users.models import User, ProviderProfile, Service
from backend.leads.models import ServiceCategory, Lead
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Validate and fix service category consistency across the system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--fix',
            action='store_true',
            help='Fix issues found (default is dry-run)',
        )
        parser.add_argument(
            '--provider',
            type=str,
            help='Check specific provider email',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔍 Starting category validation...'))
        
        issues_found = 0
        fixes_applied = 0
        
        # 1. Validate ServiceCategory table
        issues_found += self.validate_service_categories(options['fix'])
        
        # 2. Validate provider-category consistency
        if options['provider']:
            issues_found += self.validate_single_provider(options['provider'], options['fix'])
        else:
            issues_found += self.validate_all_providers(options['fix'])
        
        # 3. Validate recent leads
        issues_found += self.validate_recent_leads(options['fix'])
        
        # Summary
        self.stdout.write(self.style.SUCCESS(f'\n📊 VALIDATION COMPLETE'))
        self.stdout.write(f'Issues found: {issues_found}')
        if options['fix']:
            self.stdout.write(f'Fixes applied: {fixes_applied}')
        else:
            self.stdout.write(self.style.WARNING('Run with --fix to apply corrections'))

    def validate_service_categories(self, fix=False):
        """Validate ServiceCategory table consistency"""
        self.stdout.write('\n1️⃣ Validating ServiceCategory table...')
        issues = 0
        
        categories = ServiceCategory.objects.all()
        for category in categories:
            # Check for empty slugs
            if not category.slug or category.slug.strip() == '':
                issues += 1
                self.stdout.write(
                    self.style.ERROR(f'   ❌ Category "{category.name}" has empty slug')
                )
                
                if fix:
                    category.slug = category.name.lower().replace(' ', '_')
                    category.save()
                    self.stdout.write(
                        self.style.SUCCESS(f'   ✅ Fixed slug: {category.slug}')
                    )
            
            # Check for duplicate slugs
            duplicates = ServiceCategory.objects.filter(slug=category.slug).exclude(id=category.id)
            if duplicates.exists():
                issues += 1
                self.stdout.write(
                    self.style.ERROR(f'   ❌ Duplicate slug "{category.slug}" found')
                )
        
        if issues == 0:
            self.stdout.write(self.style.SUCCESS('   ✅ ServiceCategory table is clean'))
        
        return issues

    def validate_single_provider(self, email, fix=False):
        """Validate a single provider's category consistency"""
        self.stdout.write(f'\n2️⃣ Validating provider: {email}...')
        issues = 0
        
        try:
            user = User.objects.get(email=email)
            profile = user.provider_profile
            issues += self.validate_provider_profile(profile, fix)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'   ❌ Provider {email} not found'))
            issues += 1
        
        return issues

    def validate_all_providers(self, fix=False):
        """Validate all providers' category consistency"""
        self.stdout.write('\n2️⃣ Validating all providers...')
        issues = 0
        
        providers = ProviderProfile.objects.select_related('user').prefetch_related('services__category')
        
        for profile in providers:
            provider_issues = self.validate_provider_profile(profile, fix, quiet=True)
            if provider_issues > 0:
                self.stdout.write(
                    self.style.ERROR(f'   ❌ {profile.user.email}: {provider_issues} issues')
                )
            issues += provider_issues
        
        if issues == 0:
            self.stdout.write(self.style.SUCCESS('   ✅ All providers have consistent categories'))
        
        return issues

    def validate_provider_profile(self, profile, fix=False, quiet=False):
        """Validate a single provider profile"""
        issues = 0
        
        # Get categories from Service objects
        service_categories = set()
        for service in profile.services.filter(is_active=True):
            if service.category.slug:
                service_categories.add(service.category.slug)
        
        # Get categories from JSON field
        json_categories = set(profile.service_categories or [])
        
        # Check consistency
        if service_categories != json_categories:
            issues += 1
            if not quiet:
                self.stdout.write(
                    self.style.ERROR(f'   ❌ Category mismatch for {profile.user.email}')
                )
                self.stdout.write(f'      Service objects: {service_categories}')
                self.stdout.write(f'      JSON field: {json_categories}')
            
            if fix:
                # Update JSON field to match Service objects
                profile.service_categories = list(service_categories)
                profile.save()
                if not quiet:
                    self.stdout.write(
                        self.style.SUCCESS(f'   ✅ Fixed JSON field: {service_categories}')
                    )
        
        # Check for duplicate services
        service_names = []
        for service in profile.services.all():
            if service.name in service_names:
                issues += 1
                if not quiet:
                    self.stdout.write(
                        self.style.ERROR(f'   ❌ Duplicate service: {service.name}')
                    )
                
                if fix:
                    service.delete()
                    if not quiet:
                        self.stdout.write(
                            self.style.SUCCESS(f'   ✅ Removed duplicate: {service.name}')
                        )
            else:
                service_names.append(service.name)
        
        return issues

    def validate_recent_leads(self, fix=False):
        """Validate recent leads have valid categories"""
        self.stdout.write('\n3️⃣ Validating recent leads...')
        issues = 0
        
        recent_leads = Lead.objects.select_related('service_category').order_by('-created_at')[:50]
        
        for lead in recent_leads:
            # Check if category exists and is active
            if not lead.service_category.is_active:
                issues += 1
                self.stdout.write(
                    self.style.ERROR(f'   ❌ Lead "{lead.title}" uses inactive category: {lead.service_category.name}')
                )
            
            # Check if category has valid slug
            if not lead.service_category.slug or lead.service_category.slug.strip() == '':
                issues += 1
                self.stdout.write(
                    self.style.ERROR(f'   ❌ Lead "{lead.title}" category has empty slug: {lead.service_category.name}')
                )
        
        if issues == 0:
            self.stdout.write(self.style.SUCCESS('   ✅ Recent leads have valid categories'))
        
        return issues




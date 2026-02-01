"""
Django management command to list all provider accounts for review.

This helps identify which providers are real vs test accounts.
"""
from django.core.management.base import BaseCommand
from backend.users.models import ProviderProfile, User
from django.db.models import Q


class Command(BaseCommand):
    help = "List all provider accounts with details for review"

    def add_arguments(self, parser):
        parser.add_argument(
            '--verified-only',
            action='store_true',
            help='Show only verified providers',
        )
        parser.add_argument(
            '--format',
            choices=['table', 'detailed', 'simple'],
            default='table',
            help='Output format',
        )

    def handle(self, *args, **options):
        verified_only = options['verified_only']
        format_type = options['format']

        # Build query
        qs = ProviderProfile.objects.select_related('user').order_by('business_name')
        
        if verified_only:
            qs = qs.filter(verification_status='verified')
            self.stdout.write(self.style.SUCCESS(f'\n📋 Listing VERIFIED providers only...\n'))
        else:
            self.stdout.write(self.style.SUCCESS(f'\n📋 Listing ALL providers (including pending/rejected)...\n'))

        providers = list(qs)

        if not providers:
            self.stdout.write(self.style.WARNING('No providers found.'))
            return

        if format_type == 'simple':
            # Simple list
            for p in providers:
                self.stdout.write(f"{p.business_name} | {p.user.email} | {p.verification_status}")
        
        elif format_type == 'detailed':
            # Detailed view
            for i, p in enumerate(providers, 1):
                user = p.user
                self.stdout.write(f"\n{'='*80}")
                self.stdout.write(f"{i}. {p.business_name}")
                self.stdout.write(f"   ID: {p.id}")
                self.stdout.write(f"   Email: {user.email}")
                self.stdout.write(f"   Verification: {p.verification_status}")
                self.stdout.write(f"   Location: {user.city or 'N/A'}, {user.suburb or 'N/A'}")
                self.stdout.write(f"   Services: {', '.join(p.service_categories or [])}")
                self.stdout.write(f"   Service Areas: {', '.join(p.service_areas or [])}")
                self.stdout.write(f"   Rating: {p.average_rating or 0.0}/5.0 ({p.total_reviews} reviews)")
                self.stdout.write(f"   Credits: {p.credit_balance}")
                self.stdout.write(f"   Created: {user.date_joined.strftime('%Y-%m-%d') if user.date_joined else 'N/A'}")
        
        else:  # table format
            # Table header
            header = f"{'#':<4} {'Business Name':<40} {'Email':<35} {'Status':<12} {'Location':<25} {'Services':<20}"
            self.stdout.write(header)
            self.stdout.write('-' * 140)
            
            for i, p in enumerate(providers, 1):
                user = p.user
                location = f"{user.city or ''}, {user.suburb or ''}".strip(', ')
                if not location:
                    location = 'N/A'
                
                services = ', '.join((p.service_categories or [])[:2])
                if len(p.service_categories or []) > 2:
                    services += '...'
                
                status_color = {
                    'verified': self.style.SUCCESS,
                    'pending': self.style.WARNING,
                    'rejected': self.style.ERROR,
                    'suspended': self.style.ERROR,
                }.get(p.verification_status, lambda x: x)
                
                status = status_color(p.verification_status)
                
                row = f"{i:<4} {p.business_name[:38]:<40} {user.email[:33]:<35} {p.verification_status:<12} {location[:23]:<25} {services[:18]:<20}"
                self.stdout.write(row)

        # Summary
        self.stdout.write(f"\n{'='*80}")
        self.stdout.write(f"Total: {len(providers)} provider(s)")
        
        if not verified_only:
            verified_count = sum(1 for p in providers if p.verification_status == 'verified')
            pending_count = sum(1 for p in providers if p.verification_status == 'pending')
            self.stdout.write(f"  - Verified: {verified_count}")
            self.stdout.write(f"  - Pending: {pending_count}")
            self.stdout.write(f"  - Other: {len(providers) - verified_count - pending_count}")

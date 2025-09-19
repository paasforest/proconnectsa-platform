"""
Management command to find and fix unassigned leads.
This prevents the production issue where leads exist but aren't assigned to any providers.
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from backend.leads.models import Lead, LeadAssignment
from backend.leads.services import LeadAssignmentService
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Find and fix leads that should be assigned but are not'

    def add_arguments(self, parser):
        parser.add_argument(
            '--fix',
            action='store_true',
            help='Fix unassigned leads (default is dry-run)',
        )
        parser.add_argument(
            '--hours',
            type=int,
            default=24,
            help='Check leads created in the last N hours (default: 24)',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔍 Scanning for unassigned leads...'))
        
        # Find verified leads without assignments
        cutoff_time = timezone.now() - timedelta(hours=options['hours'])
        
        unassigned_leads = Lead.objects.filter(
            status='verified',
            created_at__gte=cutoff_time
        ).exclude(
            assignments__isnull=False
        ).distinct()
        
        self.stdout.write(f'Found {unassigned_leads.count()} unassigned leads in the last {options["hours"]} hours')
        
        if unassigned_leads.count() == 0:
            self.stdout.write(self.style.SUCCESS('✅ No unassigned leads found'))
            return
        
        assignment_service = LeadAssignmentService()
        fixed_count = 0
        failed_count = 0
        
        for lead in unassigned_leads:
            self.stdout.write(f'\n📋 Lead: {lead.title}')
            self.stdout.write(f'   ID: {lead.id}')
            self.stdout.write(f'   Category: {lead.service_category.name} ({lead.service_category.slug})')
            self.stdout.write(f'   Location: {lead.location_city}')
            self.stdout.write(f'   Created: {lead.created_at}')
            
            if options['fix']:
                try:
                    # Try to assign the lead
                    assignments = assignment_service.assign_lead_to_providers(lead.id)
                    
                    if assignments:
                        self.stdout.write(
                            self.style.SUCCESS(f'   ✅ Fixed: Assigned to {len(assignments)} providers')
                        )
                        for assignment in assignments:
                            self.stdout.write(f'      - {assignment.provider.email}')
                        fixed_count += 1
                    else:
                        self.stdout.write(
                            self.style.WARNING(f'   ⚠️ No matching providers found')
                        )
                        failed_count += 1
                        
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'   ❌ Failed to assign: {str(e)}')
                    )
                    failed_count += 1
            else:
                # Dry run - just check if providers would match
                try:
                    matching_providers = assignment_service.find_matching_providers(lead)
                    provider_count = len(matching_providers)
                    
                    if provider_count > 0:
                        self.stdout.write(
                            self.style.SUCCESS(f'   ✅ Would assign to {provider_count} providers')
                        )
                        for provider, score in matching_providers[:3]:  # Show top 3
                            self.stdout.write(f'      - {provider.email} (score: {score:.2f})')
                    else:
                        self.stdout.write(
                            self.style.WARNING(f'   ⚠️ No matching providers available')
                        )
                        
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'   ❌ Error checking providers: {str(e)}')
                    )
        
        # Summary
        if options['fix']:
            self.stdout.write(self.style.SUCCESS(f'\n📊 FIXING COMPLETE'))
            self.stdout.write(f'   ✅ Fixed: {fixed_count} leads')
            self.stdout.write(f'   ❌ Failed: {failed_count} leads')
            
            if fixed_count > 0:
                self.stdout.write(self.style.SUCCESS(f'\n🎯 {fixed_count} leads are now properly assigned!'))
        else:
            self.stdout.write(self.style.WARNING(f'\n🔍 Dry run complete. Use --fix to apply changes'))
            
        # Recommendations
        if failed_count > 0:
            self.stdout.write(self.style.WARNING(f'\n💡 RECOMMENDATIONS:'))
            self.stdout.write(f'   • Check if providers exist for these service categories')
            self.stdout.write(f'   • Verify provider service areas cover lead locations')
            self.stdout.write(f'   • Ensure providers have sufficient credits')
            self.stdout.write(f'   • Consider expanding provider network')




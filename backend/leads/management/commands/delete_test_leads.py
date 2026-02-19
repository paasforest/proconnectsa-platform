from django.core.management.base import BaseCommand
from django.db.models import Q
from backend.leads.models import Lead, LeadAccess, LeadAssignment
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Find and delete test leads from the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force deletion without confirmation prompt',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        force = options['force']
        
        self.stdout.write(self.style.WARNING('\n🔍 Searching for test leads...\n'))
        
        # Find all test leads using comprehensive patterns
        test_leads = Lead.objects.filter(
            Q(description__icontains='test lead') |
            Q(description__icontains='TEST LEAD') |
            Q(description__icontains='this is test lead') |
            Q(description__icontains='test lead number') |
            Q(description__icontains='test lead #') |
            Q(description__icontains='location filter test') |
            Q(description__icontains='premium test') |
            Q(description__icontains='[test]') |
            Q(description__icontains='(test)') |
            Q(title__icontains='test:') |
            Q(title__icontains='test -') |
            Q(title__icontains=' #') |
            Q(title__icontains='test lead') |
            Q(title__icontains='TEST LEAD') |
            Q(title__icontains='[test]') |
            Q(title__icontains='(test)') |
            Q(source='test') |
            Q(client__email__icontains='test@') |
            Q(client__email__icontains='@test.') |
            Q(client__email__icontains='testuser') |
            Q(client__email__icontains='test_') |
            Q(client__email__icontains='_test')
        ).distinct()
        
        count = test_leads.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS('✅ No test leads found!'))
            return
        
        self.stdout.write(self.style.WARNING(f'⚠️  Found {count} test lead(s):\n'))
        
        # Show details of test leads
        for lead in test_leads:
            self.stdout.write(f'  • {lead.title}')
            self.stdout.write(f'    ID: {lead.id}')
            self.stdout.write(f'    Description: {lead.description[:100]}...' if len(lead.description) > 100 else f'    Description: {lead.description}')
            self.stdout.write(f'    Client: {lead.client.email if lead.client else "N/A"}')
            self.stdout.write(f'    Status: {lead.status}')
            self.stdout.write(f'    Created: {lead.created_at}')
            
            # Check if any providers have accessed/purchased this lead
            access_count = LeadAccess.objects.filter(lead=lead).count()
            assignment_count = LeadAssignment.objects.filter(lead=lead).count()
            
            if access_count > 0 or assignment_count > 0:
                self.stdout.write(self.style.WARNING(
                    f'    ⚠️  WARNING: {access_count} access(es) and {assignment_count} assignment(s) exist!'
                ))
            
            self.stdout.write('')
        
        if dry_run:
            self.stdout.write(self.style.WARNING(
                f'\n🔍 DRY RUN: Would delete {count} test lead(s). Use --force to actually delete.'
            ))
            return
        
        if not force:
            self.stdout.write(self.style.ERROR(
                f'\n⚠️  WARNING: This will permanently delete {count} test lead(s)!'
            ))
            confirm = input('Type "DELETE" to confirm: ')
            if confirm != 'DELETE':
                self.stdout.write(self.style.ERROR('❌ Deletion cancelled.'))
                return
        
        # Delete related objects first
        self.stdout.write('\n🗑️  Deleting related objects...')
        
        deleted_accesses = 0
        deleted_assignments = 0
        
        for lead in test_leads:
            # Delete LeadAccess records
            accesses = LeadAccess.objects.filter(lead=lead)
            deleted_accesses += accesses.count()
            accesses.delete()
            
            # Delete LeadAssignment records
            assignments = LeadAssignment.objects.filter(lead=lead)
            deleted_assignments += assignments.count()
            assignments.delete()
        
        self.stdout.write(f'  • Deleted {deleted_accesses} LeadAccess record(s)')
        self.stdout.write(f'  • Deleted {deleted_assignments} LeadAssignment record(s)')
        
        # Delete the leads themselves
        self.stdout.write(f'\n🗑️  Deleting {count} test lead(s)...')
        test_leads.delete()
        
        self.stdout.write(self.style.SUCCESS(
            f'\n✅ Successfully deleted {count} test lead(s)!'
        ))
        self.stdout.write(f'   • Also deleted {deleted_accesses} access record(s)')
        self.stdout.write(f'   • Also deleted {deleted_assignments} assignment record(s)')

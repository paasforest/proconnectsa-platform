"""
Production health check command for lead assignment system.
Use this to monitor the system and ensure no leads are orphaned.
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from backend.leads.models import Lead, LeadAssignment, ServiceCategory
from backend.users.models import User, ProviderProfile
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Production health check for lead assignment system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--alert-threshold',
            type=int,
            default=5,
            help='Alert if more than N unassigned leads found (default: 5)',
        )
        parser.add_argument(
            '--hours',
            type=int,
            default=24,
            help='Check leads created in the last N hours (default: 24)',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🏥 PROCONNECTSA ASSIGNMENT HEALTH CHECK'))
        self.stdout.write('=' * 50)
        
        cutoff_time = timezone.now() - timedelta(hours=options['hours'])
        
        # 1. Check for unassigned leads
        unassigned_count = self.check_unassigned_leads(cutoff_time)
        
        # 2. Check provider coverage
        self.check_provider_coverage()
        
        # 3. Check assignment success rate
        self.check_assignment_success_rate(cutoff_time)
        
        # 4. Check system capacity
        self.check_system_capacity()
        
        # 5. Overall health assessment
        self.assess_overall_health(unassigned_count, options['alert_threshold'])

    def check_unassigned_leads(self, cutoff_time):
        """Check for leads without assignments"""
        self.stdout.write('\n🔍 1. UNASSIGNED LEADS CHECK')
        
        unassigned_leads = Lead.objects.filter(
            status='verified',
            created_at__gte=cutoff_time
        ).exclude(
            assignments__isnull=False
        ).distinct()
        
        count = unassigned_leads.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS('   ✅ No unassigned leads found'))
        else:
            self.stdout.write(self.style.ERROR(f'   ❌ {count} unassigned leads found'))
            for lead in unassigned_leads[:5]:  # Show first 5
                self.stdout.write(f'      - {lead.title} ({lead.service_category.name}, {lead.location_city})')
            if count > 5:
                self.stdout.write(f'      ... and {count - 5} more')
        
        return count

    def check_provider_coverage(self):
        """Check provider coverage by category and location"""
        self.stdout.write('\n🗺️ 2. PROVIDER COVERAGE CHECK')
        
        categories = ServiceCategory.objects.filter(is_active=True)
        
        for category in categories:
            providers = User.objects.filter(
                user_type='provider',
                provider_profile__verification_status='verified',
                provider_profile__services__category=category,
                provider_profile__services__is_active=True
            ).distinct().count()
            
            if providers == 0:
                self.stdout.write(
                    self.style.ERROR(f'   ❌ {category.name}: NO PROVIDERS')
                )
            elif providers < 3:
                self.stdout.write(
                    self.style.WARNING(f'   ⚠️ {category.name}: {providers} providers (low coverage)')
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(f'   ✅ {category.name}: {providers} providers')
                )

    def check_assignment_success_rate(self, cutoff_time):
        """Check what percentage of leads get assigned"""
        self.stdout.write('\n📊 3. ASSIGNMENT SUCCESS RATE')
        
        total_leads = Lead.objects.filter(
            status__in=['verified', 'assigned'],
            created_at__gte=cutoff_time
        ).count()
        
        assigned_leads = Lead.objects.filter(
            status='assigned',
            created_at__gte=cutoff_time
        ).count()
        
        if total_leads == 0:
            self.stdout.write('   📭 No leads created recently')
            return
        
        success_rate = (assigned_leads / total_leads) * 100
        
        if success_rate >= 90:
            self.stdout.write(
                self.style.SUCCESS(f'   ✅ Success rate: {success_rate:.1f}% ({assigned_leads}/{total_leads})')
            )
        elif success_rate >= 70:
            self.stdout.write(
                self.style.WARNING(f'   ⚠️ Success rate: {success_rate:.1f}% ({assigned_leads}/{total_leads})')
            )
        else:
            self.stdout.write(
                self.style.ERROR(f'   ❌ Success rate: {success_rate:.1f}% ({assigned_leads}/{total_leads})')
            )

    def check_system_capacity(self):
        """Check if system has capacity to handle leads"""
        self.stdout.write('\n⚡ 4. SYSTEM CAPACITY CHECK')
        
        # Check active providers with credits
        active_providers = User.objects.filter(
            user_type='provider',
            provider_profile__verification_status='verified',
            provider_profile__credit_balance__gt=0
        ).count()
        
        # Check total providers
        total_providers = User.objects.filter(
            user_type='provider',
            provider_profile__verification_status='verified'
        ).count()
        
        capacity_rate = (active_providers / total_providers * 100) if total_providers > 0 else 0
        
        self.stdout.write(f'   Total verified providers: {total_providers}')
        self.stdout.write(f'   Providers with credits: {active_providers}')
        
        if capacity_rate >= 60:
            self.stdout.write(
                self.style.SUCCESS(f'   ✅ Capacity: {capacity_rate:.1f}% providers ready')
            )
        elif capacity_rate >= 30:
            self.stdout.write(
                self.style.WARNING(f'   ⚠️ Capacity: {capacity_rate:.1f}% providers ready')
            )
        else:
            self.stdout.write(
                self.style.ERROR(f'   ❌ Capacity: {capacity_rate:.1f}% providers ready')
            )

    def assess_overall_health(self, unassigned_count, alert_threshold):
        """Provide overall health assessment"""
        self.stdout.write('\n🎯 5. OVERALL HEALTH ASSESSMENT')
        
        if unassigned_count == 0:
            self.stdout.write(self.style.SUCCESS('   🟢 HEALTHY: All leads properly assigned'))
        elif unassigned_count <= alert_threshold:
            self.stdout.write(
                self.style.WARNING(f'   🟡 WARNING: {unassigned_count} unassigned leads (threshold: {alert_threshold})')
            )
        else:
            self.stdout.write(
                self.style.ERROR(f'   🔴 CRITICAL: {unassigned_count} unassigned leads (threshold: {alert_threshold})')
            )
        
        self.stdout.write('\n📋 RECOMMENDATIONS:')
        self.stdout.write('   • Run: python manage.py fix_unassigned_leads --fix')
        self.stdout.write('   • Monitor: python manage.py health_check_assignments')
        self.stdout.write('   • Validate: python manage.py validate_categories --fix')
        
        self.stdout.write('\n🚀 PRODUCTION MONITORING:')
        self.stdout.write('   • Celery task runs every 15 minutes automatically')
        self.stdout.write('   • Check logs for "monitor_and_fix_unassigned_leads" task')
        self.stdout.write('   • Set up alerts for assignment failures')




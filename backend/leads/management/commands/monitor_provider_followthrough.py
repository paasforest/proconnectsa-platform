"""
Django management command to monitor provider follow-through rates
and identify providers who unlock leads but don't contact clients.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from backend.leads.models import LeadAssignment
from collections import defaultdict

User = get_user_model()


class Command(BaseCommand):
    help = 'Monitor provider follow-through rates and identify abuse'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='Number of days to analyze (default: 7)'
        )
        parser.add_argument(
            '--min-unlocks',
            type=int,
            default=2,
            help='Minimum unlocks to flag a provider (default: 2)'
        )

    def handle(self, *args, **options):
        days = options['days']
        min_unlocks = options['min_unlocks']
        
        self.stdout.write(
            self.style.SUCCESS(f'🔍 Analyzing provider follow-through for last {days} days...')
        )
        
        # Get assignments from the specified period
        since_date = timezone.now() - timedelta(days=days)
        assignments = LeadAssignment.objects.filter(
            assigned_at__gte=since_date
        ).select_related('provider', 'lead')
        
        # Group by provider
        provider_stats = defaultdict(lambda: {
            'total_assignments': 0,
            'purchased': 0,
            'contacted': 0,
            'quoted': 0,
            'won': 0,
            'lost': 0,
            'unlocks_without_contact': 0,
            'follow_through_rate': 0,
            'total_credits_spent': 0,
            'recent_purchases': []
        })
        
        # Analyze each assignment
        for assignment in assignments:
            provider_email = assignment.provider.email
            stats = provider_stats[provider_email]
            
            stats['total_assignments'] += 1
            
            if assignment.status == 'purchased':
                stats['purchased'] += 1
                stats['total_credits_spent'] += assignment.credit_cost
                stats['recent_purchases'].append(assignment)
                
                # Check if purchased but not contacted
                if assignment.contacted_at is None and assignment.purchased_at:
                    hours_since_purchase = (timezone.now() - assignment.purchased_at).total_seconds() / 3600
                    if hours_since_purchase > 24:  # More than 24 hours
                        stats['unlocks_without_contact'] += 1
                        
            elif assignment.status == 'contacted':
                stats['contacted'] += 1
            elif assignment.status == 'quoted':
                stats['quoted'] += 1
            elif assignment.status == 'won':
                stats['won'] += 1
            elif assignment.status == 'lost':
                stats['lost'] += 1
        
        # Calculate follow-through rates
        for provider_email, stats in provider_stats.items():
            if stats['purchased'] > 0:
                stats['follow_through_rate'] = (
                    (stats['contacted'] + stats['quoted'] + stats['won'] + stats['lost']) / 
                    stats['purchased'] * 100
                )
        
        # Report results
        self.stdout.write('\n' + '='*80)
        self.stdout.write(self.style.SUCCESS('📊 PROVIDER FOLLOW-THROUGH ANALYSIS'))
        self.stdout.write('='*80)
        
        # Flag problematic providers
        problematic_providers = []
        for provider_email, stats in provider_stats.items():
            if (stats['purchased'] >= min_unlocks and 
                stats['follow_through_rate'] < 50 and 
                stats['unlocks_without_contact'] > 0):
                problematic_providers.append((provider_email, stats))
        
        if problematic_providers:
            self.stdout.write('\n🚨 PROBLEMATIC PROVIDERS (Low Follow-Through):')
            self.stdout.write('-' * 50)
            
            for provider_email, stats in problematic_providers:
                self.stdout.write(f'\n📧 {provider_email}')
                self.stdout.write(f'   📊 Total Assignments: {stats["total_assignments"]}')
                self.stdout.write(f'   💳 Purchased: {stats["purchased"]}')
                self.stdout.write(f'   📞 Contacted: {stats["contacted"]}')
                self.stdout.write(f'   💰 Credits Spent: {stats["total_credits_spent"]}')
                self.stdout.write(f'   📈 Follow-Through Rate: {stats["follow_through_rate"]:.1f}%')
                self.stdout.write(f'   ⚠️  Unlocks Without Contact: {stats["unlocks_without_contact"]}')
                
                # Show recent purchases without contact
                for assignment in stats['recent_purchases'][:3]:  # Show last 3
                    if assignment.contacted_at is None and assignment.purchased_at:
                        hours_ago = (timezone.now() - assignment.purchased_at).total_seconds() / 3600
                        self.stdout.write(f'      🔓 {assignment.lead.title[:40]}... ({hours_ago:.1f}h ago)')
        else:
            self.stdout.write('\n✅ No problematic providers found!')
        
        # Summary statistics
        self.stdout.write('\n📈 SUMMARY STATISTICS:')
        self.stdout.write('-' * 30)
        
        total_providers = len(provider_stats)
        total_assignments = sum(stats['total_assignments'] for stats in provider_stats.values())
        total_purchased = sum(stats['purchased'] for stats in provider_stats.values())
        total_contacted = sum(stats['contacted'] for stats in provider_stats.values())
        total_credits_spent = sum(stats['total_credits_spent'] for stats in provider_stats.values())
        
        overall_follow_through = (total_contacted / total_purchased * 100) if total_purchased > 0 else 0
        
        self.stdout.write(f'👥 Total Providers: {total_providers}')
        self.stdout.write(f'📋 Total Assignments: {total_assignments}')
        self.stdout.write(f'💳 Total Purchased: {total_purchased}')
        self.stdout.write(f'📞 Total Contacted: {total_contacted}')
        self.stdout.write(f'💰 Total Credits Spent: {total_credits_spent}')
        self.stdout.write(f'📈 Overall Follow-Through Rate: {overall_follow_through:.1f}%')
        
        # Recommendations
        self.stdout.write('\n💡 RECOMMENDATIONS:')
        self.stdout.write('-' * 20)
        
        if problematic_providers:
            self.stdout.write('1. 🚨 Contact problematic providers to understand issues')
            self.stdout.write('2. 📧 Send reminder emails to providers with unlocked leads')
            self.stdout.write('3. ⏰ Implement time-based warnings for unused unlocks')
            self.stdout.write('4. 🎯 Consider temporary restrictions for repeat offenders')
        else:
            self.stdout.write('✅ Provider behavior looks healthy!')
        
        self.stdout.write('\n' + '='*80)

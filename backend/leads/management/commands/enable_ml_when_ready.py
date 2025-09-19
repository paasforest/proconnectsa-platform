"""
Management command to check if ML should be auto-enabled based on data thresholds
"""
from django.core.management.base import BaseCommand
from django.conf import settings
from backend.leads.ml_monitoring import MLReadinessMonitor
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Check if ML should be auto-enabled based on data thresholds'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--auto-enable',
            action='store_true',
            help='Automatically enable ML when services are ready (use with caution)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be enabled without making changes',
        )
        parser.add_argument(
            '--service',
            type=str,
            help='Check specific ML service only',
        )
    
    def handle(self, *args, **options):
        """Auto-enable ML services when they have sufficient data"""
        
        auto_enable = options['auto_enable']
        dry_run = options['dry_run']
        specific_service = options.get('service')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
        
        # Get ML readiness status
        status = MLReadinessMonitor.get_ml_readiness_status()
        
        # Filter by specific service if requested
        if specific_service:
            if specific_service not in status:
                self.stdout.write(
                    self.style.ERROR(f'Service "{specific_service}" not found')
                )
                return
            status = {specific_service: status[specific_service]}
        
        # Check current ML status
        current_ml_enabled = getattr(settings, 'ML_ENABLED', False)
        self.stdout.write(f'Current ML_ENABLED status: {current_ml_enabled}')
        
        # Analyze each service
        ready_services = []
        almost_ready_services = []
        not_ready_services = []
        
        for service_name, service_data in status.items():
            ready = service_data.get('ready', False)
            completion_rate = service_data.get('completion_rate', 0)
            progress = service_data.get('progress', 'Unknown')
            
            if ready:
                ready_services.append(service_name)
                status_icon = '✅'
                status_color = self.style.SUCCESS
            elif completion_rate >= 0.8:
                almost_ready_services.append(service_name)
                status_icon = '🟡'
                status_color = self.style.WARNING
            else:
                not_ready_services.append(service_name)
                status_icon = '❌'
                status_color = self.style.ERROR
            
            if status_color == self.style.SUCCESS:
                self.stdout.write(
                    self.style.SUCCESS(f'{status_icon} {service_name}: {progress} ({completion_rate:.1%})')
                )
            elif status_color == self.style.WARNING:
                self.stdout.write(
                    self.style.WARNING(f'{status_icon} {service_name}: {progress} ({completion_rate:.1%})')
                )
            else:
                self.stdout.write(
                    self.style.ERROR(f'{status_icon} {service_name}: {progress} ({completion_rate:.1%})')
                )
        
        # Summary
        self.stdout.write('\n' + '='*50)
        self.stdout.write(f'Ready services: {len(ready_services)}')
        self.stdout.write(f'Almost ready: {len(almost_ready_services)}')
        self.stdout.write(f'Not ready: {len(not_ready_services)}')
        
        # Recommendations
        if ready_services and not current_ml_enabled:
            self.stdout.write('\n' + self.style.SUCCESS('🎯 RECOMMENDATION: ML services are ready!'))
            self.stdout.write(f'Ready services: {", ".join(ready_services)}')
            
            if auto_enable and not dry_run:
                # In a real implementation, you would update settings
                self.stdout.write(
                    self.style.SUCCESS('✅ ML_ENABLED would be set to True')
                )
                self.stdout.write(
                    self.style.WARNING('⚠️  Remember to update your settings.py file!')
                )
            elif auto_enable and dry_run:
                self.stdout.write(
                    self.style.WARNING('🔄 Would enable ML_ENABLED = True')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('💡 Consider enabling ML_ENABLED in settings.py')
                )
                self.stdout.write(
                    self.style.WARNING('   Or run with --auto-enable flag')
                )
        
        elif almost_ready_services:
            self.stdout.write('\n' + self.style.WARNING('🟡 Almost ready services:'))
            for service in almost_ready_services:
                completion = status[service].get('completion_rate', 0)
                self.stdout.write(f'  - {service}: {completion:.1%} ready')
            self.stdout.write('Keep collecting data - almost there!')
        
        elif not_ready_services:
            self.stdout.write('\n' + self.style.ERROR('❌ Services need more data:'))
            for service in not_ready_services:
                completion = status[service].get('completion_rate', 0)
                self.stdout.write(f'  - {service}: {completion:.1%} ready')
            self.stdout.write('Focus on data collection before enabling ML')
        
        # Additional insights
        self.stdout.write('\n' + '='*50)
        self.stdout.write('📊 DETAILED INSIGHTS:')
        
        for service_name, service_data in status.items():
            if service_data.get('ready', False):
                continue
                
            completion_rate = service_data.get('completion_rate', 0)
            data_quality = service_data.get('data_quality', 'Unknown')
            
            if completion_rate < 0.3:
                self.stdout.write(
                    self.style.ERROR(f'🔴 {service_name}: Needs significant data collection')
                )
            elif completion_rate < 0.8:
                self.stdout.write(
                    self.style.WARNING(f'🟡 {service_name}: Getting close - {data_quality}')
                )
        
        # Configuration check
        self.stdout.write('\n' + '='*50)
        self.stdout.write('⚙️  CONFIGURATION CHECK:')
        
        ml_min_leads = getattr(settings, 'ML_MIN_LEADS', 1000)
        ml_min_transactions = getattr(settings, 'ML_MIN_TRANSACTIONS', 500)
        ml_min_conversions = getattr(settings, 'ML_MIN_CONVERSIONS', 300)
        
        self.stdout.write(f'ML_MIN_LEADS: {ml_min_leads}')
        self.stdout.write(f'ML_MIN_TRANSACTIONS: {ml_min_transactions}')
        self.stdout.write(f'ML_MIN_CONVERSIONS: {ml_min_conversions}')
        
        # Final recommendation
        if ready_services:
            self.stdout.write('\n' + '='*50)
            self.stdout.write(self.style.SUCCESS('🚀 NEXT STEPS:'))
            self.stdout.write('1. Update ML_ENABLED = True in settings.py')
            self.stdout.write('2. Restart your Django application')
            self.stdout.write('3. Monitor ML performance in admin dashboard')
            self.stdout.write('4. Set up automated retraining schedule')
        else:
            self.stdout.write('\n' + '='*50)
            self.stdout.write(self.style.WARNING('📈 DATA COLLECTION FOCUS:'))
            self.stdout.write('1. Focus on lead generation')
            self.stdout.write('2. Encourage provider activity')
            self.stdout.write('3. Track conversion outcomes')
            self.stdout.write('4. Run this command regularly to check progress')

from django.core.management.base import BaseCommand
from backend.leads.ml_monitoring import MLReadinessMonitor
import json

class Command(BaseCommand):
    help = 'Check ML readiness status for all services'

    def add_arguments(self, parser):
        parser.add_argument(
            '--format',
            type=str,
            default='table',
            choices=['table', 'json'],
            help='Output format (table or json)'
        )
        parser.add_argument(
            '--service',
            type=str,
            help='Check specific service only'
        )

    def handle(self, *args, **options):
        if options['service']:
            # Check specific service
            service_name = options['service']
            is_ready = MLReadinessMonitor.should_enable_ml_service(service_name)
            
            if options['format'] == 'json':
                self.stdout.write(json.dumps({
                    'service': service_name,
                    'ready': is_ready
                }))
            else:
                status = "✅ READY" if is_ready else "❌ NOT READY"
                self.stdout.write(f"{service_name}: {status}")
        else:
            # Check all services
            dashboard_data = MLReadinessMonitor.get_dashboard_data()
            
            if options['format'] == 'json':
                self.stdout.write(json.dumps(dashboard_data, indent=2))
            else:
                self.print_table(dashboard_data)

    def print_table(self, data):
        """Print ML readiness data in table format"""
        self.stdout.write("\n" + "="*80)
        self.stdout.write("🤖 ML READINESS DASHBOARD")
        self.stdout.write("="*80)
        
        # Overall status
        self.stdout.write(f"\n📊 Overall Readiness: {data['overall_readiness']}%")
        self.stdout.write(f"✅ Services Ready: {data['services_ready']}/{data['total_services']}")
        
        # Services table
        self.stdout.write(f"\n{'Service':<30} {'Status':<12} {'Progress':<20} {'Priority':<8}")
        self.stdout.write("-" * 80)
        
        for service_name, service in data['services'].items():
            status = "✅ READY" if service['ready'] else "❌ NOT READY"
            progress = f"{service['progress']} ({service['completion_rate']:.1%})"
            priority = service['priority'].upper()
            
            self.stdout.write(f"{service_name:<30} {status:<12} {progress:<20} {priority:<8}")
        
        # Recommendations
        if data['recommendations']:
            self.stdout.write(f"\n💡 RECOMMENDATIONS:")
            for i, rec in enumerate(data['recommendations'], 1):
                self.stdout.write(f"   {i}. {rec}")
        
        # Next priorities
        if data['next_priorities']:
            self.stdout.write(f"\n🎯 NEXT PRIORITIES:")
            for i, priority in enumerate(data['next_priorities'], 1):
                self.stdout.write(f"   {i}. {priority['service']} ({priority['priority']}) - {priority['progress']}")
        
        self.stdout.write("\n" + "="*80)

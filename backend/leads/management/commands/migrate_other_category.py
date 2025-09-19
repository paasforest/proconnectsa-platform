"""
Management command to migrate "Other" category services to specific categories.
This improves matching accuracy and user experience.
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from backend.leads.models import ServiceCategory
from backend.users.models import Service
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Migrate services from "Other" category to specific categories'

    def add_arguments(self, parser):
        parser.add_argument(
            '--execute',
            action='store_true',
            help='Execute the migration (default is dry-run)',
        )
        parser.add_argument(
            '--create-categories',
            action='store_true',
            help='Create new categories if they don\'t exist',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔄 Starting Other category migration...'))
        
        # Define service name mappings to proper categories
        service_mappings = {
            'cctv': {
                'category_name': 'Security Systems',
                'category_slug': 'security-systems',
                'description': 'CCTV installation, security cameras, and surveillance systems'
            },
            'security': {
                'category_name': 'Security Systems', 
                'category_slug': 'security-systems',
                'description': 'Security systems, alarms, and access control'
            },
            'alarm': {
                'category_name': 'Security Systems',
                'category_slug': 'security-systems', 
                'description': 'Alarm systems and security monitoring'
            },
            'it': {
                'category_name': 'IT Services',
                'category_slug': 'it-services',
                'description': 'Computer repair, network setup, and IT support'
            },
            'computer': {
                'category_name': 'IT Services',
                'category_slug': 'it-services',
                'description': 'Computer repair and technical support'
            },
            'networking': {
                'category_name': 'IT Services', 
                'category_slug': 'it-services',
                'description': 'Network installation and configuration'
            },
            'solar': {
                'category_name': 'Solar Installation',
                'category_slug': 'solar-installation',
                'description': 'Solar panel installation and renewable energy systems'
            },
            'pool': {
                'category_name': 'Pool Services',
                'category_slug': 'pool-services', 
                'description': 'Pool cleaning, maintenance, and installation'
            },
            'roofing': {
                'category_name': 'Roofing',
                'category_slug': 'roofing',
                'description': 'Roof repairs, installation, and maintenance'
            },
            'flooring': {
                'category_name': 'Flooring',
                'category_slug': 'flooring',
                'description': 'Floor installation, repair, and refinishing'
            },
            'tiling': {
                'category_name': 'Tiling',
                'category_slug': 'tiling', 
                'description': 'Tile installation and repair services'
            },
            'appliance': {
                'category_name': 'Appliance Repair',
                'category_slug': 'appliance-repair',
                'description': 'Appliance installation, repair, and maintenance'
            },
        }
        
        migrations_performed = 0
        categories_created = 0
        
        # Get Other category
        try:
            other_category = ServiceCategory.objects.get(name='Other')
        except ServiceCategory.DoesNotExist:
            self.stdout.write(self.style.ERROR('❌ Other category not found'))
            return
        
        # Get services using Other category
        other_services = Service.objects.filter(category=other_category)
        
        if not other_services.exists():
            self.stdout.write(self.style.SUCCESS('✅ No services using Other category'))
            return
        
        self.stdout.write(f'\n📋 Found {other_services.count()} services using Other category:')
        
        for service in other_services:
            service_name_lower = service.name.lower()
            self.stdout.write(f'   - {service.name} (Provider: {service.provider.user.email})')
            
            # Find matching category
            target_mapping = None
            for keyword, mapping in service_mappings.items():
                if keyword in service_name_lower:
                    target_mapping = mapping
                    break
            
            if target_mapping:
                self.stdout.write(
                    self.style.WARNING(f'   → Suggested: {target_mapping["category_name"]}')
                )
                
                if options['execute']:
                    migrations_performed += self.migrate_service(
                        service, target_mapping, options['create_categories']
                    )
                    if options['create_categories']:
                        categories_created += 1
            else:
                self.stdout.write(
                    self.style.ERROR(f'   ❓ No mapping found for "{service.name}"')
                )
        
        # Summary
        if options['execute']:
            self.stdout.write(self.style.SUCCESS(f'\n✅ Migration complete!'))
            self.stdout.write(f'   Services migrated: {migrations_performed}')
            self.stdout.write(f'   Categories created: {categories_created}')
        else:
            self.stdout.write(self.style.WARNING(f'\n🔍 Dry run complete. Use --execute to apply changes'))
            self.stdout.write(f'   Services that would be migrated: {len([s for s in other_services if any(k in s.name.lower() for k in service_mappings.keys())])}')

    def migrate_service(self, service, mapping, create_categories):
        """Migrate a single service to the target category"""
        try:
            with transaction.atomic():
                # Get or create target category
                target_category, created = ServiceCategory.objects.get_or_create(
                    slug=mapping['category_slug'],
                    defaults={
                        'name': mapping['category_name'],
                        'description': mapping['description'],
                        'is_active': True
                    }
                )
                
                if created and create_categories:
                    self.stdout.write(
                        self.style.SUCCESS(f'   ✅ Created category: {target_category.name}')
                    )
                
                # Update service category
                old_category = service.category.name
                service.category = target_category
                service.save()
                
                # Update provider's service_categories JSON field
                profile = service.provider
                if profile.service_categories:
                    # Remove 'other' and add new category slug
                    categories = set(profile.service_categories)
                    categories.discard('other')
                    categories.add(mapping['category_slug'])
                    profile.service_categories = list(categories)
                    profile.save()
                
                self.stdout.write(
                    self.style.SUCCESS(f'   ✅ Migrated "{service.name}" from {old_category} to {target_category.name}')
                )
                
                return 1
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'   ❌ Failed to migrate "{service.name}": {str(e)}')
            )
            return 0




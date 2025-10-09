from django.core.management.base import BaseCommand
from django.utils.text import slugify
from backend.leads.models import ServiceCategory


class Command(BaseCommand):
    help = 'Add new service categories (Solar, DSTV, CCTV, Access Control, etc.)'

    def handle(self, *args, **options):
        new_categories = [
            {
                'name': 'Solar Installation',
                'description': 'Solar panel installation, maintenance, and renewable energy solutions',
                'icon': 'sun'
            },
            {
                'name': 'PVC Installation',
                'description': 'PVC ceiling, flooring, and wall installation services',
                'icon': 'layers'
            },
            {
                'name': 'DSTV Installation',
                'description': 'DSTV satellite dish installation, repair, and signal optimization',
                'icon': 'tv'
            },
            {
                'name': 'CCTV Installation',
                'description': 'CCTV camera installation, monitoring systems, and security surveillance',
                'icon': 'camera'
            },
            {
                'name': 'Access Control',
                'description': 'Access control systems, biometric scanners, and security gates',
                'icon': 'lock'
            },
            {
                'name': 'Satellite Installation',
                'description': 'Satellite dish installation and alignment services',
                'icon': 'satellite'
            },
            {
                'name': 'Home Automation',
                'description': 'Smart home systems, automation, and IoT device installation',
                'icon': 'home'
            },
            {
                'name': 'Alarm Systems',
                'description': 'Burglar alarms, fire alarms, and security system installation',
                'icon': 'bell'
            },
            {
                'name': 'Electric Fencing',
                'description': 'Electric fence installation, repair, and maintenance',
                'icon': 'zap'
            },
        ]

        created_count = 0
        updated_count = 0
        skipped_count = 0

        for category_data in new_categories:
            slug = slugify(category_data['name'])
            
            category, created = ServiceCategory.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': category_data['name'],
                    'description': category_data['description'],
                    'icon': category_data.get('icon', ''),
                    'is_active': True
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Created: {category.name}')
                )
            else:
                # Update description and icon if they've changed
                updated = False
                if category.description != category_data['description']:
                    category.description = category_data['description']
                    updated = True
                if category.icon != category_data.get('icon', ''):
                    category.icon = category_data.get('icon', '')
                    updated = True
                
                if updated:
                    category.save()
                    updated_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'🔄 Updated: {category.name}')
                    )
                else:
                    skipped_count += 1
                    self.stdout.write(
                        self.style.NOTICE(f'⏭️  Skipped (exists): {category.name}')
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n📊 Summary:\n'
                f'   ✅ Created: {created_count}\n'
                f'   🔄 Updated: {updated_count}\n'
                f'   ⏭️  Skipped: {skipped_count}\n'
                f'   📋 Total categories in database: {ServiceCategory.objects.count()}'
            )
        )


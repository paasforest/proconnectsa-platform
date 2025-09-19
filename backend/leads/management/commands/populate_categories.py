from django.core.management.base import BaseCommand
from backend.leads.models import ServiceCategory


class Command(BaseCommand):
    help = 'Populate service categories'

    def handle(self, *args, **options):
        categories = [
            {
                'name': 'Plumbing',
                'slug': 'plumbing',
                'description': 'Pipes, faucets, toilets, water heaters, and plumbing repairs',
                'icon': 'wrench',
                'is_active': True
            },
            {
                'name': 'Electrical',
                'slug': 'electrical',
                'description': 'Wiring, outlets, lighting, electrical repairs and installations',
                'icon': 'zap',
                'is_active': True
            },
            {
                'name': 'HVAC',
                'slug': 'hvac',
                'description': 'Heating, ventilation, air conditioning systems',
                'icon': 'home',
                'is_active': True
            },
            {
                'name': 'Cleaning',
                'slug': 'cleaning',
                'description': 'House cleaning, office cleaning, deep cleaning services',
                'icon': 'sparkles',
                'is_active': True
            },
            {
                'name': 'Painting',
                'slug': 'painting',
                'description': 'Interior, exterior, decorative painting services',
                'icon': 'paintbrush',
                'is_active': True
            },
            {
                'name': 'Landscaping',
                'slug': 'landscaping',
                'description': 'Garden design, lawn care, tree services, landscaping',
                'icon': 'trees',
                'is_active': True
            },
            {
                'name': 'Renovation',
                'slug': 'renovation',
                'description': 'Kitchen, bathroom, home renovations and remodeling',
                'icon': 'building',
                'is_active': True
            },
            {
                'name': 'Automotive',
                'slug': 'automotive',
                'description': 'Car repairs, maintenance, detailing services',
                'icon': 'car',
                'is_active': True
            },
            {
                'name': 'General Maintenance',
                'slug': 'general',
                'description': 'Handyman services, general repairs and maintenance',
                'icon': 'hammer',
                'is_active': True
            },
            {
                'name': 'Roofing',
                'slug': 'roofing',
                'description': 'Roof repairs, installations, and maintenance',
                'icon': 'home',
                'is_active': True
            },
            {
                'name': 'Pool Maintenance',
                'slug': 'pool',
                'description': 'Pool cleaning, repairs, chemical balancing',
                'icon': 'droplets',
                'is_active': True
            },
            {
                'name': 'Appliance Repair',
                'slug': 'appliance',
                'description': 'Washing machines, fridges, ovens, appliance repairs',
                'icon': 'wrench',
                'is_active': True
            },
            {
                'name': 'Security',
                'slug': 'security',
                'description': 'Alarms, cameras, access control systems',
                'icon': 'shield',
                'is_active': True
            }
        ]

        created_count = 0
        for category_data in categories:
            category, created = ServiceCategory.objects.get_or_create(
                slug=category_data['slug'],
                defaults=category_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created category: {category.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Category already exists: {category.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} new categories')
        )














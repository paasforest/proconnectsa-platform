# Generated migration to create service categories
from django.db import migrations
from django.utils.text import slugify


def create_service_categories(apps, schema_editor):
    """Create all service categories"""
    ServiceCategory = apps.get_model('leads', 'ServiceCategory')
    
    categories = [
        'Cleaning', 'Plumbing', 'Electrical', 'Handyman', 'Painting',
        'Carpentry', 'Landscaping', 'Pest Control', 'Moving Services',
        'HVAC', 'Roofing', 'Flooring', 'Tiling', 'Construction',
        'Renovations', 'Farm Fencing'
    ]
    
    for name in categories:
        ServiceCategory.objects.get_or_create(
            slug=slugify(name),
            defaults={
                'name': name,
                'description': f'{name} services',
                'is_active': True
            }
        )
    
    print(f"✅ Created {len(categories)} service categories")


def reverse_func(apps, schema_editor):
    """Optional: Remove categories if migration is reversed"""
    pass  # Keep categories even if migration is reversed


class Migration(migrations.Migration):

    dependencies = [
        ('leads', '0012_add_property_type_to_lead'),  # Update this to your last migration
    ]

    operations = [
        migrations.RunPython(create_service_categories, reverse_func),
    ]



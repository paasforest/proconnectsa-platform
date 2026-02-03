from django.db import migrations
from django.utils.text import slugify


def add_additional_service_categories(apps, schema_editor):
    """
    Add additional day-to-day service categories used for SEO + marketplace navigation.
    Safe to run multiple times (idempotent).
    """
    ServiceCategory = apps.get_model("leads", "ServiceCategory")

    # Ensure Security parent exists (it may already exist in production).
    security_slug = "security"
    security, _ = ServiceCategory.objects.get_or_create(
        slug=security_slug,
        defaults={"name": "Security", "description": "Security services", "is_active": True},
    )

    categories = [
        # Renewable / power
        ("Solar Installation", None),
        # Security sub-services (children)
        ("CCTV Installation", security),
        ("Access Control", security),
        ("Alarm Systems", security),
        ("Electric Fencing", security),
        ("Gate Motors", security),
        # Keep farm fencing discoverable; it's often a security-related intent.
        ("Farm Fencing", security),
    ]

    created = 0
    for name, parent in categories:
        slug = slugify(name)
        obj, was_created = ServiceCategory.objects.get_or_create(
            slug=slug,
            defaults={
                "name": name,
                "description": f"{name} services",
                "is_active": True,
                "parent": parent,
            },
        )
        # If it existed already but had no parent and we want it under Security, attach it.
        if (not was_created) and parent and (getattr(obj, "parent_id", None) is None):
            obj.parent = parent
            obj.is_active = True
            obj.save(update_fields=["parent", "is_active"])
        if was_created:
            created += 1

    print(f"✅ Added additional service categories (created={created})")


def reverse_func(apps, schema_editor):
    # Keep categories even if migration is reversed.
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("leads", "0013_create_service_categories"),
    ]

    operations = [
        migrations.RunPython(add_additional_service_categories, reverse_func),
    ]


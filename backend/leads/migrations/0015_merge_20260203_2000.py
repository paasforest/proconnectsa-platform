from django.db import migrations


class Migration(migrations.Migration):
    """
    Merge migration to resolve multiple 0014 leaf nodes in production:
    - 0014_leadreservation (already exists on the server)
    - 0014_add_additional_service_categories (added for SEO/service catalog)
    """

    dependencies = [
        ("leads", "0014_leadreservation"),
        ("leads", "0014_add_additional_service_categories"),
    ]

    operations = []


from django.db import migrations


class Migration(migrations.Migration):
    """
    Merge migration to resolve multiple 0014 leaf nodes in production.
    Note: 0014_leadreservation was removed, so this now only depends on 0014_add_additional_service_categories
    """

    dependencies = [
        ("leads", "0014_add_additional_service_categories"),
    ]

    operations = []


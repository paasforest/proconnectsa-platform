# Generated manually to add monthly_lead_limit field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_add_client_field_to_lead'),
    ]

    operations = [
        migrations.AddField(
            model_name='providerprofile',
            name='monthly_lead_limit',
            field=models.IntegerField(default=5),
        ),
    ]
















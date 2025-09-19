# Generated manually to add client field to Lead model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_lead_management_models'),
    ]

    operations = [
        migrations.AddField(
            model_name='lead',
            name='client',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='posted_leads', to='users.user'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='lead',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]





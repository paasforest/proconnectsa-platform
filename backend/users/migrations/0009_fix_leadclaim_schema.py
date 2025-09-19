# Generated manually to fix LeadClaim schema mismatch

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0008_add_monthly_lead_limit'),
    ]

    operations = [
        # First, drop the existing LeadClaim table if it exists
        migrations.DeleteModel(
            name='LeadClaim',
        ),
        
        # Recreate LeadClaim with correct schema
        migrations.CreateModel(
            name='LeadClaim',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('claimed_at', models.DateTimeField(auto_now_add=True)),
                ('price_paid', models.DecimalField(decimal_places=2, max_digits=8)),
                ('is_top_up', models.BooleanField(default=False)),
                ('payment_method', models.CharField(
                    choices=[
                        ('allocation', 'Allocation'),
                        ('topup', 'Top-up'),
                        ('payasyougo', 'Pay as You Go')
                    ],
                    max_length=20
                )),
                ('lead', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='claims', to='leads.lead')),
                ('provider', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='claimed_leads', to='users.user')),
            ],
        ),
        
        # Add unique constraint
        migrations.AlterUniqueTogether(
            name='leadclaim',
            unique_together={('lead', 'provider')},
        ),
    ]















# Generated manually for lead management models

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_alter_providerprofile_subscription_tier'),
    ]

    operations = [
        migrations.CreateModel(
            name='JobCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('base_price', models.DecimalField(decimal_places=2, default=50.0, max_digits=8)),
                ('description', models.TextField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Lead',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('location', models.CharField(max_length=100)),
                ('urgency', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('urgent', 'Urgent')], default='medium', max_length=10)),
                ('budget_min', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('budget_max', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('base_price', models.DecimalField(decimal_places=2, default=50.0, max_digits=8)),
                ('ml_multiplier', models.DecimalField(decimal_places=2, default=1.0, max_digits=3)),
                ('final_price', models.DecimalField(decimal_places=2, max_digits=8)),
                ('status', models.CharField(choices=[('active', 'Active'), ('closed', 'Closed'), ('expired', 'Expired')], default='active', max_length=10)),
                ('max_providers', models.IntegerField(default=3)),
                ('current_claims', models.IntegerField(default=0)),
                ('client_name', models.CharField(max_length=100)),
                ('client_phone', models.CharField(max_length=20)),
                ('client_email', models.EmailField(max_length=254)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateTimeField()),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='leads', to='users.jobcategory')),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='posted_leads', to='users.user')),
            ],
        ),
        migrations.CreateModel(
            name='LeadClaim',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('claim_cost', models.DecimalField(decimal_places=2, max_digits=8)),
                ('payment_method', models.CharField(choices=[('allocation', 'Allocation'), ('topup', 'Top-up'), ('payasyougo', 'Pay as You Go')], max_length=20)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('refunded', 'Refunded')], default='pending', max_length=20)),
                ('claimed_at', models.DateTimeField(auto_now_add=True)),
                ('lead', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.lead')),
                ('provider', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user')),
            ],
        ),
        migrations.CreateModel(
            name='MLPricingFactor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(max_length=100)),
                ('location', models.CharField(max_length=255)),
                ('urgency', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('urgent', 'Urgent')], max_length=10)),
                ('time_of_day', models.CharField(choices=[('morning', 'Morning'), ('afternoon', 'Afternoon'), ('evening', 'Evening'), ('night', 'Night')], max_length=20)),
                ('day_of_week', models.CharField(choices=[('monday', 'Monday'), ('tuesday', 'Tuesday'), ('wednesday', 'Wednesday'), ('thursday', 'Thursday'), ('friday', 'Friday'), ('saturday', 'Saturday'), ('sunday', 'Sunday')], max_length=20)),
                ('demand_multiplier', models.DecimalField(decimal_places=2, default=1.0, max_digits=3)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.AddIndex(
            model_name='lead',
            index=models.Index(fields=['status', 'current_claims', 'max_providers'], name='users_lead_status_idx'),
        ),
        migrations.AddIndex(
            model_name='lead',
            index=models.Index(fields=['location'], name='users_lead_location_idx'),
        ),
        migrations.AddIndex(
            model_name='lead',
            index=models.Index(fields=['category'], name='users_lead_category_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='leadclaim',
            unique_together={('lead', 'provider')},
        ),
    ]

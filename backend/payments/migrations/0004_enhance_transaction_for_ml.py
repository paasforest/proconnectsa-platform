# Generated manually for ML enhancement of Transaction model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0003_bankaccount_remove_manualdeposit_provider_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='transaction',
            name='lead_id',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='transaction',
            name='credits_purchased',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='transaction',
            name='credits_spent',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='transaction',
            name='pricing_method',
            field=models.CharField(choices=[('rule_based', 'Rule Based'), ('ml', 'ML Based'), ('hybrid', 'Hybrid')], default='rule_based', max_length=50),
        ),
        migrations.AddField(
            model_name='transaction',
            name='job_quoted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='transaction',
            name='job_won',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='transaction',
            name='job_completed',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='transaction',
            name='job_value',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='transaction',
            name='outcome_recorded_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='transaction',
            name='predicted_conversion_probability',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='transaction',
            name='predicted_job_value',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='transaction',
            name='ml_confidence_score',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddIndex(
            model_name='transaction',
            index=models.Index(fields=['lead_id'], name='transactions_lead_id_idx'),
        ),
        migrations.AddIndex(
            model_name='transaction',
            index=models.Index(fields=['pricing_method'], name='transactions_pricing_method_idx'),
        ),
        migrations.AddIndex(
            model_name='transaction',
            index=models.Index(fields=['job_completed'], name='transactions_job_completed_idx'),
        ),
    ]

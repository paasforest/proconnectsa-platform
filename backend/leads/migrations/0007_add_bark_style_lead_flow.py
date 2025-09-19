# Generated manually for Bark-style lead flow

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('leads', '0006_mlmodelperformance_mlmodeltraininglog_mlpredictionlog_mlfeatureimportance'),
    ]

    operations = [
        migrations.AddField(
            model_name='lead',
            name='max_providers',
            field=models.IntegerField(
                default=3,
                help_text='Maximum number of providers who can claim this lead'
            ),
        ),
        migrations.AddField(
            model_name='lead',
            name='is_available',
            field=models.BooleanField(
                default=True,
                help_text='Whether this lead is still available for claiming'
            ),
        ),
        migrations.AddField(
            model_name='lead',
            name='claimed_at',
            field=models.DateTimeField(
                null=True,
                blank=True,
                help_text='When the lead was fully claimed (3 providers)'
            ),
        ),
        migrations.AddField(
            model_name='lead',
            name='credit_cost',
            field=models.DecimalField(
                max_digits=10,
                decimal_places=2,
                null=True,
                blank=True,
                help_text='Credit cost for this lead (R50 base + ML multipliers)'
            ),
        ),
    ]

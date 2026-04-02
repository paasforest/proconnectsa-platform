# Generated manually for idempotent verified-lead routing

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('leads', '0015_merge_20260203_2000'),
    ]

    operations = [
        migrations.AddField(
            model_name='lead',
            name='providers_routed_at',
            field=models.DateTimeField(
                null=True,
                blank=True,
                help_text='When this lead was first routed to providers (assign + notify); prevents duplicate sends.',
            ),
        ),
        migrations.AddIndex(
            model_name='lead',
            index=models.Index(fields=['providers_routed_at'], name='leads_lead_provid_6c8f9e_idx'),
        ),
    ]

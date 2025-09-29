# Generated manually for credit cost field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('leads', '0007_add_bark_style_lead_flow'),
    ]

    operations = [
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

# Generated for one-off pro welcome email to existing providers

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0014_make_phone_optional'),
    ]

    operations = [
        migrations.AddField(
            model_name='providerprofile',
            name='pro_welcome_email_sent_at',
            field=models.DateTimeField(
                blank=True,
                help_text='When the pro welcome email (leads, credits) was sent; used to avoid re-sending.',
                null=True
            ),
        ),
    ]

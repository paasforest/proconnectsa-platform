# Generated manually for Bark-style competition stats

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('leads', '0008_leadaccess_delete_mlfeatureimportance_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='lead',
            name='views_count',
            field=models.PositiveIntegerField(default=0, help_text='Number of providers who viewed this lead'),
        ),
        migrations.AddField(
            model_name='lead',
            name='responses_count',
            field=models.PositiveIntegerField(default=0, help_text='Number of providers who responded/purchased this lead'),
        ),
    ]



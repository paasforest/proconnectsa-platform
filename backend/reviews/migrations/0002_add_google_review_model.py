# Generated manually for GoogleReview model

import django.core.validators
import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models
from django.utils import timezone


class Migration(migrations.Migration):

    dependencies = [
        ('reviews', '0001_initial'),
        ('users', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='GoogleReview',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('google_link', models.URLField(help_text='Google Maps link to the review', max_length=500, validators=[django.core.validators.URLValidator()])),
                ('review_text', models.TextField(blank=True, help_text='The review text (optional, can be extracted from screenshot)')),
                ('review_rating', models.IntegerField(help_text='Star rating (1-5)', validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(5)])),
                ('review_screenshot', models.URLField(blank=True, help_text='URL to uploaded screenshot image')),
                ('review_status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected'), ('banned', 'Banned')], default='pending', help_text='Admin verification status', max_length=20)),
                ('admin_notes', models.TextField(blank=True, help_text='Admin notes for rejection/ban reasons')),
                ('submission_date', models.DateTimeField(auto_now_add=True)),
                ('reviewed_at', models.DateTimeField(blank=True, null=True)),
                ('google_place_id', models.CharField(blank=True, help_text='Google Place ID for automated fetching (future feature)', max_length=255)),
                ('provider_profile', models.ForeignKey(help_text='The provider who submitted this review', on_delete=django.db.models.deletion.CASCADE, related_name='google_reviews', to='users.providerprofile')),
                ('reviewed_by', models.ForeignKey(blank=True, help_text='Admin who reviewed this submission', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='google_reviews_reviewed', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Google Review',
                'verbose_name_plural': 'Google Reviews',
                'ordering': ['-submission_date'],
            },
        ),
        migrations.AddIndex(
            model_name='googlereview',
            index=models.Index(fields=['provider_profile', 'review_status'], name='reviews_goog_provider_idx'),
        ),
        migrations.AddIndex(
            model_name='googlereview',
            index=models.Index(fields=['review_status', 'submission_date'], name='reviews_goog_review_s_idx'),
        ),
    ]

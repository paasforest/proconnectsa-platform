# Generated manually - Clean migration without primary key changes
# This migration only includes safe operations:
# - Create PushSubscription table
# - Delete NotificationTemplate (unused)
# - Update NotificationSettings fields
# - Update Notification indexes
# - NO primary key changes

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('leads', '0016_leadreservation'),
        ('notifications', '0003_notificationsettings_notificationtemplate_and_more'),
    ]

    operations = [
        # 1. Create PushSubscription model (NEW TABLE - Safe)
        migrations.CreateModel(
            name='PushSubscription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.TextField(unique=True)),
                ('endpoint', models.URLField(blank=True, null=True)),
                ('keys', models.JSONField(blank=True, default=dict)),
                ('user_agent', models.TextField(blank=True, null=True)),
                ('device_type', models.CharField(blank=True, max_length=50, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('last_used_at', models.DateTimeField(blank=True, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='push_subscriptions', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        
        # 2. Add indexes to PushSubscription
        migrations.AddIndex(
            model_name='pushsubscription',
            index=models.Index(fields=['user', 'is_active'], name='notificatio_user_id_1159a5_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='pushsubscription',
            unique_together={('user', 'token')},
        ),
        
        # 3. Delete NotificationTemplate (Safe - not used in code)
        migrations.DeleteModel(
            name='NotificationTemplate',
        ),
        
        # 4. Remove old indexes from Notification (Safe - will recreate better ones)
        migrations.RemoveIndex(
            model_name='notification',
            name='notificatio_user_id_427e4b_idx',
        ),
        migrations.RemoveIndex(
            model_name='notification',
            name='notificatio_notific_f2898f_idx',
        ),
        migrations.RemoveIndex(
            model_name='notification',
            name='notificatio_created_46ad24_idx',
        ),
        
        # 5. Add new indexes to Notification (Matches model Meta)
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['user', 'is_read', '-created_at'], name='notificatio_user_id_f2ad08_idx'),
        ),
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['user', 'notification_type'], name='notificatio_user_id_f77590_idx'),
        ),
        
        # 6. Update NotificationSettings - Remove old fields
        migrations.RemoveField(
            model_name='notificationsettings',
            name='dashboard_notifications',
        ),
        migrations.RemoveField(
            model_name='notificationsettings',
            name='digest_frequency',
        ),
        migrations.RemoveField(
            model_name='notificationsettings',
            name='email_credit_purchase',
        ),
        migrations.RemoveField(
            model_name='notificationsettings',
            name='email_deposit_verified',
        ),
        migrations.RemoveField(
            model_name='notificationsettings',
            name='email_notifications',
        ),
        migrations.RemoveField(
            model_name='notificationsettings',
            name='email_quote_received',
        ),
        migrations.RemoveField(
            model_name='notificationsettings',
            name='email_quote_response',
        ),
        migrations.RemoveField(
            model_name='notificationsettings',
            name='show_popup',
        ),
        migrations.RemoveField(
            model_name='notificationsettings',
            name='sms_lead_assigned',
        ),
        migrations.RemoveField(
            model_name='notificationsettings',
            name='sms_notifications',
        ),
        migrations.RemoveField(
            model_name='notificationsettings',
            name='sms_quote_received',
        ),
        
        # 7. Update NotificationSettings - Add new fields
        migrations.AddField(
            model_name='notificationsettings',
            name='email_enabled',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='notificationsettings',
            name='email_new_leads',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='notificationsettings',
            name='push_enabled',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='notificationsettings',
            name='push_new_leads',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='notificationsettings',
            name='push_lead_assigned',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='notificationsettings',
            name='push_credits',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='notificationsettings',
            name='push_system',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='notificationsettings',
            name='email_lead_assigned',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='notificationsettings',
            name='email_credits',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='notificationsettings',
            name='email_system',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='notificationsettings',
            name='sms_enabled',
            field=models.BooleanField(default=False),
        ),
        
        # 8. Update Notification.priority field max_length (10 instead of 20)
        migrations.AlterField(
            model_name='notification',
            name='priority',
            field=models.CharField(
                choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('urgent', 'Urgent')],
                default='medium',
                max_length=10,
            ),
        ),
        
        # 9. Ensure Notification.lead field matches model (should already be correct)
        migrations.AlterField(
            model_name='notification',
            name='lead',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='notifications',
                to='leads.lead',
            ),
        ),
        
        # NOTE: We are NOT changing Notification.id from UUIDField to BigAutoField
        # The model now explicitly defines id = UUIDField() to match the database
    ]

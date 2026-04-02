# Generated manually - Clean migration without primary key changes
# This migration only includes safe operations:
# - Create PushSubscription table
# - Delete NotificationTemplate (unused)
# - Update NotificationSettings fields (handles existing fields)
# - Update Notification indexes
# - NO primary key changes

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

_PG_NOTIFICATIONSETTINGS_SQL = """
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications_notificationsettings' AND column_name='email_enabled') THEN
        ALTER TABLE notifications_notificationsettings ADD COLUMN email_enabled BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications_notificationsettings' AND column_name='email_new_leads') THEN
        ALTER TABLE notifications_notificationsettings ADD COLUMN email_new_leads BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications_notificationsettings' AND column_name='push_enabled') THEN
        ALTER TABLE notifications_notificationsettings ADD COLUMN push_enabled BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications_notificationsettings' AND column_name='push_new_leads') THEN
        ALTER TABLE notifications_notificationsettings ADD COLUMN push_new_leads BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications_notificationsettings' AND column_name='push_lead_assigned') THEN
        ALTER TABLE notifications_notificationsettings ADD COLUMN push_lead_assigned BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications_notificationsettings' AND column_name='push_credits') THEN
        ALTER TABLE notifications_notificationsettings ADD COLUMN push_credits BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications_notificationsettings' AND column_name='push_system') THEN
        ALTER TABLE notifications_notificationsettings ADD COLUMN push_system BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications_notificationsettings' AND column_name='email_credits') THEN
        ALTER TABLE notifications_notificationsettings ADD COLUMN email_credits BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications_notificationsettings' AND column_name='sms_enabled') THEN
        ALTER TABLE notifications_notificationsettings ADD COLUMN sms_enabled BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
"""


def _notificationsettings_extra_columns_forwards(apps, schema_editor):
    """SQLite: add NotificationSettings columns if missing (PostgreSQL uses _pg block)."""
    if schema_editor.connection.vendor != 'sqlite':
        return
    table = 'notifications_notificationsettings'
    cursor = schema_editor.connection.cursor()
    cursor.execute(f"PRAGMA table_info({table})")
    existing = {row[1] for row in cursor.fetchall()}
    alters = [
        ('email_enabled', 'BOOLEAN DEFAULT 1'),
        ('email_new_leads', 'BOOLEAN DEFAULT 1'),
        ('push_enabled', 'BOOLEAN DEFAULT 1'),
        ('push_new_leads', 'BOOLEAN DEFAULT 1'),
        ('push_lead_assigned', 'BOOLEAN DEFAULT 1'),
        ('push_credits', 'BOOLEAN DEFAULT 1'),
        ('push_system', 'BOOLEAN DEFAULT 1'),
        ('email_credits', 'BOOLEAN DEFAULT 1'),
        ('sms_enabled', 'BOOLEAN DEFAULT 0'),
    ]
    for col, sql_type in alters:
        if col not in existing:
            cursor.execute(f'ALTER TABLE {table} ADD COLUMN {col} {sql_type}')


def _notificationsettings_extra_columns_reverse(apps, schema_editor):
    pass


def _pg_notificationsettings_columns_forwards(apps, schema_editor):
    if schema_editor.connection.vendor != 'postgresql':
        return
    with schema_editor.connection.cursor() as cursor:
        cursor.execute(_PG_NOTIFICATIONSETTINGS_SQL)


def _pg_notificationsettings_columns_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('leads', '0015_merge_20260203_2000'),
        ('notifications', '0003_notificationsettings_notificationtemplate_and_more'),
    ]

    operations = [
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
        migrations.AddIndex(
            model_name='pushsubscription',
            index=models.Index(fields=['user', 'is_active'], name='notificatio_user_id_1159a5_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='pushsubscription',
            unique_together={('user', 'token')},
        ),
        migrations.DeleteModel(
            name='NotificationTemplate',
        ),
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
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['user', 'is_read', '-created_at'], name='notificatio_user_id_f2ad08_idx'),
        ),
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['user', 'notification_type'], name='notificatio_user_id_f77590_idx'),
        ),
        migrations.RunPython(
            _notificationsettings_extra_columns_forwards,
            _notificationsettings_extra_columns_reverse,
        ),
        migrations.RunPython(
            _pg_notificationsettings_columns_forwards,
            _pg_notificationsettings_columns_reverse,
        ),
        migrations.AlterField(
            model_name='notification',
            name='priority',
            field=models.CharField(
                choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('urgent', 'Urgent')],
                default='medium',
                max_length=10,
            ),
        ),
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
    ]

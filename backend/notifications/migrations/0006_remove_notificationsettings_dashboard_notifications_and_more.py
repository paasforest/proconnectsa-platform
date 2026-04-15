# Sync NotificationSettings + Notification with models after 0004 added columns via raw SQL.
# Database: drop legacy columns (PostgreSQL/SQLite); do NOT re-add columns that 0004 already created.
# email_lead_assigned, email_system, sms_urgent_only remain from 0003.

from django.db import migrations, models


NOTIFICATIONSETTINGS_LEGACY_COLUMNS = (
    "dashboard_notifications",
    "digest_frequency",
    "email_credit_purchase",
    "email_deposit_verified",
    "email_notifications",
    "email_quote_received",
    "email_quote_response",
    "show_popup",
    "sms_lead_assigned",
    "sms_notifications",
    "sms_quote_received",
    "sound_enabled",
)


def _drop_legacy_and_ensure_push_sent(apps, schema_editor):
    conn = schema_editor.connection
    if conn.vendor == "postgresql":
        with conn.cursor() as cursor:
            for col in NOTIFICATIONSETTINGS_LEGACY_COLUMNS:
                cursor.execute(
                    f'ALTER TABLE notifications_notificationsettings DROP COLUMN IF EXISTS "{col}"'
                )
            cursor.execute(
                """
                ALTER TABLE notifications_notification
                ADD COLUMN IF NOT EXISTS is_push_sent BOOLEAN DEFAULT FALSE;
                """
            )
        return
    if conn.vendor == "sqlite":
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(notifications_notificationsettings)")
        existing = {row[1] for row in cursor.fetchall()}
        for col in NOTIFICATIONSETTINGS_LEGACY_COLUMNS:
            if col in existing:
                cursor.execute(
                    f'ALTER TABLE notifications_notificationsettings DROP COLUMN "{col}"'
                )
        cursor.execute("PRAGMA table_info(notifications_notification)")
        ncols = {row[1] for row in cursor.fetchall()}
        if "is_push_sent" not in ncols:
            cursor.execute(
                "ALTER TABLE notifications_notification ADD COLUMN is_push_sent BOOLEAN DEFAULT 0"
            )


def _noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("notifications", "0005_fix_notification_settings_and_push_sent"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(_drop_legacy_and_ensure_push_sent, _noop_reverse),
            ],
            state_operations=[
                migrations.RemoveField(
                    model_name="notificationsettings",
                    name="dashboard_notifications",
                ),
                migrations.RemoveField(
                    model_name="notificationsettings",
                    name="digest_frequency",
                ),
                migrations.RemoveField(
                    model_name="notificationsettings",
                    name="email_credit_purchase",
                ),
                migrations.RemoveField(
                    model_name="notificationsettings",
                    name="email_deposit_verified",
                ),
                migrations.RemoveField(
                    model_name="notificationsettings",
                    name="email_notifications",
                ),
                migrations.RemoveField(
                    model_name="notificationsettings",
                    name="email_quote_received",
                ),
                migrations.RemoveField(
                    model_name="notificationsettings",
                    name="email_quote_response",
                ),
                migrations.RemoveField(
                    model_name="notificationsettings",
                    name="show_popup",
                ),
                migrations.RemoveField(
                    model_name="notificationsettings",
                    name="sms_lead_assigned",
                ),
                migrations.RemoveField(
                    model_name="notificationsettings",
                    name="sms_notifications",
                ),
                migrations.RemoveField(
                    model_name="notificationsettings",
                    name="sms_quote_received",
                ),
                migrations.RemoveField(
                    model_name="notificationsettings",
                    name="sound_enabled",
                ),
                migrations.AddField(
                    model_name="notification",
                    name="is_push_sent",
                    field=models.BooleanField(default=False),
                ),
                migrations.AddField(
                    model_name="notificationsettings",
                    name="email_credits",
                    field=models.BooleanField(default=True),
                ),
                migrations.AddField(
                    model_name="notificationsettings",
                    name="email_enabled",
                    field=models.BooleanField(default=True),
                ),
                migrations.AddField(
                    model_name="notificationsettings",
                    name="email_new_leads",
                    field=models.BooleanField(default=True),
                ),
                migrations.AddField(
                    model_name="notificationsettings",
                    name="push_credits",
                    field=models.BooleanField(default=True),
                ),
                migrations.AddField(
                    model_name="notificationsettings",
                    name="push_enabled",
                    field=models.BooleanField(default=True),
                ),
                migrations.AddField(
                    model_name="notificationsettings",
                    name="push_lead_assigned",
                    field=models.BooleanField(default=True),
                ),
                migrations.AddField(
                    model_name="notificationsettings",
                    name="push_new_leads",
                    field=models.BooleanField(default=True),
                ),
                migrations.AddField(
                    model_name="notificationsettings",
                    name="push_system",
                    field=models.BooleanField(default=True),
                ),
                migrations.AddField(
                    model_name="notificationsettings",
                    name="sms_enabled",
                    field=models.BooleanField(default=False),
                ),
            ],
        ),
    ]

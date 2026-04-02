# Fix NotificationSettings nullability (PostgreSQL) and add is_push_sent.

from django.db import migrations

_PG_ALTER_SETTINGS_NULLABLE = """
ALTER TABLE notifications_notificationsettings ALTER COLUMN email_notifications DROP NOT NULL;
ALTER TABLE notifications_notificationsettings ALTER COLUMN email_credit_purchase DROP NOT NULL;
ALTER TABLE notifications_notificationsettings ALTER COLUMN email_deposit_verified DROP NOT NULL;
ALTER TABLE notifications_notificationsettings ALTER COLUMN email_quote_received DROP NOT NULL;
ALTER TABLE notifications_notificationsettings ALTER COLUMN email_quote_response DROP NOT NULL;
ALTER TABLE notifications_notificationsettings ALTER COLUMN sms_notifications DROP NOT NULL;
ALTER TABLE notifications_notificationsettings ALTER COLUMN sms_lead_assigned DROP NOT NULL;
ALTER TABLE notifications_notificationsettings ALTER COLUMN sms_quote_received DROP NOT NULL;
ALTER TABLE notifications_notificationsettings ALTER COLUMN dashboard_notifications DROP NOT NULL;
ALTER TABLE notifications_notificationsettings ALTER COLUMN show_popup DROP NOT NULL;
ALTER TABLE notifications_notificationsettings ALTER COLUMN sound_enabled DROP NOT NULL;
ALTER TABLE notifications_notificationsettings ALTER COLUMN digest_frequency DROP NOT NULL;
"""


def _forwards(apps, schema_editor):
    conn = schema_editor.connection
    if conn.vendor == 'postgresql':
        with conn.cursor() as cursor:
            for stmt in _PG_ALTER_SETTINGS_NULLABLE.strip().split(';'):
                stmt = stmt.strip()
                if stmt:
                    cursor.execute(stmt)
            cursor.execute(
                """
                ALTER TABLE notifications_notification
                ADD COLUMN IF NOT EXISTS is_push_sent BOOLEAN DEFAULT FALSE;
                """
            )
    elif conn.vendor == 'sqlite':
        table = 'notifications_notification'
        cursor = conn.cursor()
        cursor.execute(f"PRAGMA table_info({table})")
        cols = {row[1] for row in cursor.fetchall()}
        if 'is_push_sent' not in cols:
            cursor.execute(
                f'ALTER TABLE {table} ADD COLUMN is_push_sent BOOLEAN DEFAULT 0'
            )


def _reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0004_pushsubscription_clean'),
    ]

    operations = [
        migrations.RunPython(_forwards, _reverse),
    ]

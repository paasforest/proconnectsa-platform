# Generated manually - Fix database schema issues
# This migration fixes:
# 1. Makes old NotificationSettings fields nullable (so new settings can be created)
# 2. Adds missing is_push_sent column to Notification table

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0004_pushsubscription_clean'),
    ]

    operations = [
        # Make old NotificationSettings fields nullable
        migrations.RunSQL(
            sql="""
                ALTER TABLE notifications_notificationsettings 
                ALTER COLUMN email_notifications DROP NOT NULL;
                
                ALTER TABLE notifications_notificationsettings 
                ALTER COLUMN email_credit_purchase DROP NOT NULL;
                
                ALTER TABLE notifications_notificationsettings 
                ALTER COLUMN email_deposit_verified DROP NOT NULL;
                
                ALTER TABLE notifications_notificationsettings 
                ALTER COLUMN email_quote_received DROP NOT NULL;
                
                ALTER TABLE notifications_notificationsettings 
                ALTER COLUMN email_quote_response DROP NOT NULL;
                
                ALTER TABLE notifications_notificationsettings 
                ALTER COLUMN sms_notifications DROP NOT NULL;
                
                ALTER TABLE notifications_notificationsettings 
                ALTER COLUMN sms_lead_assigned DROP NOT NULL;
                
                ALTER TABLE notifications_notificationsettings 
                ALTER COLUMN sms_quote_received DROP NOT NULL;
                
                ALTER TABLE notifications_notificationsettings 
                ALTER COLUMN dashboard_notifications DROP NOT NULL;
                
                ALTER TABLE notifications_notificationsettings 
                ALTER COLUMN show_popup DROP NOT NULL;
                
                ALTER TABLE notifications_notificationsettings 
                ALTER COLUMN sound_enabled DROP NOT NULL;
                
                ALTER TABLE notifications_notificationsettings 
                ALTER COLUMN digest_frequency DROP NOT NULL;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
        
        # Add missing is_push_sent column
        migrations.RunSQL(
            sql="""
                ALTER TABLE notifications_notification 
                ADD COLUMN IF NOT EXISTS is_push_sent BOOLEAN DEFAULT FALSE;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]

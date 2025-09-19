# Generated manually for support staff models

import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
from django.utils import timezone


class Migration(migrations.Migration):

    dependencies = [
        ('support', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='SupportStaffProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('employee_id', models.CharField(help_text='Unique employee ID', max_length=20, unique=True)),
                ('role', models.CharField(choices=[('agent', 'Support Agent'), ('senior_agent', 'Senior Support Agent'), ('supervisor', 'Support Supervisor'), ('manager', 'Support Manager'), ('admin', 'Support Admin')], default='agent', max_length=20)),
                ('department', models.CharField(choices=[('general', 'General Support'), ('technical', 'Technical Support'), ('billing', 'Billing Support'), ('sales', 'Sales Support'), ('escalation', 'Escalation Team')], default='general', max_length=20)),
                ('hire_date', models.DateTimeField(default=timezone.now)),
                ('is_active', models.BooleanField(default=True)),
                ('max_concurrent_tickets', models.PositiveIntegerField(default=10)),
                ('specializations', models.JSONField(blank=True, default=list, help_text='List of specializations')),
                ('languages', models.JSONField(blank=True, default=list, help_text='List of supported languages')),
                ('timezone', models.CharField(default='UTC', max_length=50)),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('emergency_contact', models.CharField(blank=True, max_length=100)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='support_profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Support Staff Profile',
                'verbose_name_plural': 'Support Staff Profiles',
            },
        ),
        migrations.CreateModel(
            name='SupportTeam',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('department', models.CharField(choices=[('general', 'General Support'), ('technical', 'Technical Support'), ('billing', 'Billing Support'), ('sales', 'Sales Support'), ('escalation', 'Escalation Team')], max_length=20)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('team_lead', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='led_teams', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Support Team',
                'verbose_name_plural': 'Support Teams',
            },
        ),
        migrations.CreateModel(
            name='SupportTeamMembership',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('member', 'Team Member'), ('lead', 'Team Lead'), ('backup_lead', 'Backup Team Lead')], default='member', max_length=20)),
                ('joined_at', models.DateTimeField(auto_now_add=True)),
                ('is_active', models.BooleanField(default=True)),
                ('member', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='support.supportteam')),
            ],
            options={
                'verbose_name': 'Team Membership',
                'verbose_name_plural': 'Team Memberships',
            },
        ),
        migrations.AddField(
            model_name='supportteam',
            name='members',
            field=models.ManyToManyField(related_name='support_teams', through='support.SupportTeamMembership', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterUniqueTogether(
            name='supportteammembership',
            unique_together={('team', 'member')},
        ),
        # Update SupportTicket model to match new structure
        migrations.AlterField(
            model_name='supportticket',
            name='category',
            field=models.CharField(choices=[('general', 'General Inquiry'), ('technical', 'Technical Issue'), ('billing', 'Billing Question'), ('account', 'Account Issue'), ('feature', 'Feature Request'), ('bug', 'Bug Report'), ('refund', 'Refund Request'), ('subscription', 'Subscription Management')], default='general', max_length=20),
        ),
        migrations.AlterField(
            model_name='supportticket',
            name='status',
            field=models.CharField(choices=[('open', 'Open'), ('in_progress', 'In Progress'), ('pending_customer', 'Pending Customer'), ('pending_internal', 'Pending Internal'), ('resolved', 'Resolved'), ('closed', 'Closed')], default='open', max_length=20),
        ),
        migrations.AlterField(
            model_name='supportticket',
            name='user_type',
            field=models.CharField(choices=[('client', 'Client'), ('provider', 'Provider')], max_length=20),
        ),
        # Update SupportMetrics model to match new structure
        migrations.RenameField(
            model_name='supportmetrics',
            old_name='avg_resolution_time_hours',
            new_name='avg_resolution_time',
        ),
        migrations.AddField(
            model_name='supportmetrics',
            name='first_response_time',
            field=models.FloatField(default=0.0, help_text='Average first response time in hours'),
        ),
        migrations.AddField(
            model_name='supportmetrics',
            name='escalation_count',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='supportmetrics',
            name='active_staff_count',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='supportmetrics',
            name='staff_utilization',
            field=models.FloatField(default=0.0, help_text='Staff utilization percentage'),
        ),
        migrations.RemoveField(
            model_name='supportmetrics',
            name='closed_tickets',
        ),
        migrations.RemoveField(
            model_name='supportmetrics',
            name='tickets_by_category',
        ),
        migrations.RemoveField(
            model_name='supportmetrics',
            name='tickets_by_priority',
        ),
    ]

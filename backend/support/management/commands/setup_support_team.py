"""
Management command to set up support teams and staff

Usage:
    python manage.py setup_support_team
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from backend.support.models import SupportStaffProfile, SupportTeam, SupportTeamMembership

User = get_user_model()


class Command(BaseCommand):
    help = 'Set up support teams and create initial support staff'

    def add_arguments(self, parser):
        parser.add_argument(
            '--create-teams',
            action='store_true',
            help='Create default support teams',
        )
        parser.add_argument(
            '--create-staff',
            action='store_true',
            help='Create sample support staff members',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Create both teams and staff',
        )

    def handle(self, *args, **options):
        if options['all'] or options['create_teams']:
            self.create_support_teams()
        
        if options['all'] or options['create_staff']:
            self.create_support_staff()

    def create_support_teams(self):
        """Create default support teams"""
        self.stdout.write('Creating support teams...')
        
        teams_data = [
            {
                'name': 'General Support Team',
                'description': 'Handles general inquiries and basic support requests',
                'department': 'general'
            },
            {
                'name': 'Technical Support Team',
                'description': 'Handles technical issues, bugs, and system problems',
                'department': 'technical'
            },
            {
                'name': 'Billing Support Team',
                'description': 'Handles billing questions, payments, and refunds',
                'department': 'billing'
            },
            {
                'name': 'Sales Support Team',
                'description': 'Handles sales inquiries and feature requests',
                'department': 'sales'
            },
            {
                'name': 'Escalation Team',
                'description': 'Handles escalated and complex issues',
                'department': 'escalation'
            }
        ]
        
        created_count = 0
        for team_data in teams_data:
            team, created = SupportTeam.objects.get_or_create(
                name=team_data['name'],
                defaults=team_data
            )
            if created:
                created_count += 1
                self.stdout.write(f'  ✅ Created team: {team.name}')
            else:
                self.stdout.write(f'  ⚠️  Team already exists: {team.name}')
        
        self.stdout.write(f'Created {created_count} support teams')

    def create_support_staff(self):
        """Create sample support staff members"""
        self.stdout.write('Creating support staff members...')
        
        # Get or create admin user for team leads
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@procompare.co.za',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True
            }
        )
        
        staff_data = [
            {
                'user': {
                    'username': 'support_agent_1',
                    'email': 'agent1@procompare.co.za',
                    'first_name': 'Sarah',
                    'last_name': 'Johnson',
                    'password': 'support123'
                },
                'profile': {
                    'employee_id': 'SUP001',
                    'role': 'agent',
                    'department': 'general',
                    'specializations': ['general_inquiry', 'account_issues'],
                    'languages': ['en', 'af'],
                    'phone': '+27 21 123 4567'
                }
            },
            {
                'user': {
                    'username': 'tech_support_1',
                    'email': 'tech1@procompare.co.za',
                    'first_name': 'Mike',
                    'last_name': 'Chen',
                    'password': 'support123'
                },
                'profile': {
                    'employee_id': 'SUP002',
                    'role': 'senior_agent',
                    'department': 'technical',
                    'specializations': ['technical_issues', 'bug_reports', 'api_support'],
                    'languages': ['en'],
                    'phone': '+27 21 123 4568'
                }
            },
            {
                'user': {
                    'username': 'billing_support_1',
                    'email': 'billing1@procompare.co.za',
                    'first_name': 'Lisa',
                    'last_name': 'Williams',
                    'password': 'support123'
                },
                'profile': {
                    'employee_id': 'SUP003',
                    'role': 'agent',
                    'department': 'billing',
                    'specializations': ['billing_questions', 'payment_issues', 'refunds'],
                    'languages': ['en', 'af'],
                    'phone': '+27 21 123 4569'
                }
            },
            {
                'user': {
                    'username': 'sales_support_1',
                    'email': 'sales1@procompare.co.za',
                    'first_name': 'David',
                    'last_name': 'Brown',
                    'password': 'support123'
                },
                'profile': {
                    'employee_id': 'SUP004',
                    'role': 'agent',
                    'department': 'sales',
                    'specializations': ['sales_inquiries', 'feature_requests', 'onboarding'],
                    'languages': ['en', 'af'],
                    'phone': '+27 21 123 4570'
                }
            },
            {
                'user': {
                    'username': 'support_manager',
                    'email': 'manager@procompare.co.za',
                    'first_name': 'Jennifer',
                    'last_name': 'Davis',
                    'password': 'support123'
                },
                'profile': {
                    'employee_id': 'SUP005',
                    'role': 'manager',
                    'department': 'general',
                    'specializations': ['team_management', 'escalation', 'quality_assurance'],
                    'languages': ['en', 'af'],
                    'phone': '+27 21 123 4571'
                }
            }
        ]
        
        created_count = 0
        for staff_info in staff_data:
            user_data = staff_info['user']
            profile_data = staff_info['profile']
            
            # Create user
            user, user_created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'is_staff': True,
                    'is_active': True
                }
            )
            
            if user_created:
                user.set_password(user_data['password'])
                user.save()
                
                # Create support profile
                profile, profile_created = SupportStaffProfile.objects.get_or_create(
                    user=user,
                    defaults=profile_data
                )
                
                if profile_created:
                    created_count += 1
                    self.stdout.write(f'  ✅ Created staff: {user.get_full_name()} ({profile.role})')
                    
                    # Add to appropriate team
                    try:
                        team = SupportTeam.objects.get(department=profile.department)
                        SupportTeamMembership.objects.get_or_create(
                            team=team,
                            member=user,
                            defaults={'role': 'member'}
                        )
                        self.stdout.write(f'    Added to team: {team.name}')
                    except SupportTeam.DoesNotExist:
                        self.stdout.write(f'    ⚠️  No team found for department: {profile.department}')
                else:
                    self.stdout.write(f'  ⚠️  Profile already exists: {user.get_full_name()}')
            else:
                self.stdout.write(f'  ⚠️  User already exists: {user.get_full_name()}')
        
        self.stdout.write(f'Created {created_count} support staff members')
        
        # Set team leads
        self.set_team_leads()

    def set_team_leads(self):
        """Set team leads for each team"""
        self.stdout.write('Setting team leads...')
        
        team_leads = {
            'general': 'support_manager',
            'technical': 'tech_support_1',
            'billing': 'billing_support_1',
            'sales': 'sales_support_1',
            'escalation': 'support_manager'
        }
        
        for department, username in team_leads.items():
            try:
                team = SupportTeam.objects.get(department=department)
                user = User.objects.get(username=username)
                
                team.team_lead = user
                team.save()
                
                # Update membership role
                membership, created = SupportTeamMembership.objects.get_or_create(
                    team=team,
                    member=user
                )
                membership.role = 'lead'
                membership.save()
                
                self.stdout.write(f'  ✅ Set {user.get_full_name()} as lead for {team.name}')
            except (SupportTeam.DoesNotExist, User.DoesNotExist) as e:
                self.stdout.write(f'  ❌ Error setting team lead for {department}: {str(e)}')

    def create_sample_tickets(self):
        """Create sample support tickets for testing"""
        self.stdout.write('Creating sample support tickets...')
        
        # This would create sample tickets for testing
        # Implementation depends on your specific needs
        pass









"""
Django management command to create a test user for login testing
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a test user for login testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            default='test@example.com',
            help='Email for the test user'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='testpass123',
            help='Password for the test user'
        )
        parser.add_argument(
            '--user-type',
            type=str,
            choices=['client', 'provider', 'admin'],
            default='client',
            help='User type for the test user'
        )

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        user_type = options['user_type']
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f'User with email {email} already exists')
            )
            return
        
        # Create test user
        user = User.objects.create_user(
            username=email.split('@')[0],
            email=email,
            first_name='Test',
            last_name='User',
            user_type=user_type,
            phone='+27812345678',
            city='Cape Town',
            suburb='Sea Point',
            is_active=True,
            is_email_verified=True,
            is_phone_verified=True
        )
        
        user.set_password(password)
        user.save()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Test user created successfully!\n'
                f'   Email: {email}\n'
                f'   Password: {password}\n'
                f'   User Type: {user_type}\n'
                f'   User ID: {user.id}'
            )
        )

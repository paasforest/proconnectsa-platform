"""
Django management command to find a user by name or email.
"""
from django.core.management.base import BaseCommand
from backend.users.models import User, ProviderProfile


class Command(BaseCommand):
    help = "Find a user by name or email"

    def add_arguments(self, parser):
        parser.add_argument('search', type=str, help='Search term (name or email)')

    def handle(self, *args, **options):
        search_term = options['search'].lower()
        
        self.stdout.write(f'\n🔍 Searching for "{search_term}"...\n')
        self.stdout.write('='*100)
        
        # Search all users
        from django.db.models import Q
        users = User.objects.filter(
            Q(first_name__icontains=search_term) |
            Q(last_name__icontains=search_term) |
            Q(email__icontains=search_term) |
            Q(username__icontains=search_term)
        ).order_by('email')
        
        if not users.exists():
            self.stdout.write(self.style.ERROR(f'\n❌ No user found matching "{search_term}"'))
            return
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Found {users.count()} user(s):\n'))
        
        for u in users:
            self.stdout.write(f"Full Name: {u.first_name} {u.last_name}".strip() or 'N/A')
            self.stdout.write(f"Email: {u.email}")
            self.stdout.write(f"User ID: {u.id}")
            self.stdout.write(f"Username: {u.username}")
            self.stdout.write(f"User Type: {u.user_type}")
            self.stdout.write(f"Active: {u.is_active}")
            self.stdout.write(f"Location: {u.city or 'N/A'}, {u.suburb or 'N/A'}")
            self.stdout.write(f"Date Joined: {u.date_joined.strftime('%Y-%m-%d') if u.date_joined else 'N/A'}")
            
            # Check if they have a provider profile
            try:
                profile = u.provider_profile
                self.stdout.write(self.style.SUCCESS(f"✅ Has Provider Profile:"))
                self.stdout.write(f"   Business Name: {profile.business_name}")
                self.stdout.write(f"   Provider ID: {profile.id}")
                self.stdout.write(f"   Verification Status: {profile.verification_status}")
                self.stdout.write(f"   Services: {', '.join(profile.service_categories or [])}")
            except ProviderProfile.DoesNotExist:
                self.stdout.write(self.style.WARNING("⚠️  NO Provider Profile (registered but profile not created)"))
            
            self.stdout.write('-' * 100)

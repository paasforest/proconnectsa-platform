from django.core.management.base import BaseCommand
from backend.users.models import ProviderProfile


class Command(BaseCommand):
    help = 'Reset monthly lead usage for all providers'

    def handle(self, *args, **options):
        """Reset monthly lead usage for all providers"""
        providers = ProviderProfile.objects.all()
        count = 0
        
        for provider in providers:
            provider.reset_monthly_usage()
            count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully reset monthly usage for {count} providers')
        )


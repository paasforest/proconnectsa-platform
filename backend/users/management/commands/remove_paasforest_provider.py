"""
Django management command to remove PaasForest Electrical & Solar test provider
Only removes this specific provider, leaves everything else intact
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from backend.users.models import ProviderProfile, User
from backend.leads.models import LeadAccess, LeadAssignment
from backend.reviews.models import Review


class Command(BaseCommand):
    help = "Remove PaasForest Electrical & Solar test provider only"

    def handle(self, *args, **options):
        self.stdout.write("🔍 Searching for PaasForest Electrical & Solar provider...")
        self.stdout.write("=" * 60)
        
        # Find the provider by business name (case-insensitive)
        provider_profiles = ProviderProfile.objects.filter(
            business_name__icontains="PaasForest"
        )
        
        if not provider_profiles.exists():
            self.stdout.write(self.style.WARNING("❌ No provider found with 'PaasForest' in business name"))
            self.stdout.write("   Searching for variations...")
            
            # Try lowercase
            provider_profiles = ProviderProfile.objects.filter(
                business_name__icontains="paasforest"
            )
        
        if not provider_profiles.exists():
            self.stdout.write(self.style.WARNING("❌ Provider not found. It may have already been deleted."))
            return
        
        self.stdout.write(self.style.SUCCESS(f"✅ Found {provider_profiles.count()} provider(s) matching 'PaasForest':"))
        self.stdout.write("")
        
        for profile in provider_profiles:
            user = profile.user
            self.stdout.write(f"   Business Name: {profile.business_name}")
            self.stdout.write(f"   User Email: {user.email}")
            self.stdout.write(f"   User ID: {user.id}")
            self.stdout.write(f"   Provider ID: {profile.id}")
            self.stdout.write("")
        
        # Delete the provider
        deleted_count = 0
        with transaction.atomic():
            for profile in provider_profiles:
                user = profile.user
                business_name = profile.business_name
                
                self.stdout.write(f"🗑️  Deleting: {business_name} (User: {user.email})...")
                
                try:
                    # Delete related data first
                    LeadAccess.objects.filter(provider=user).delete()
                    LeadAssignment.objects.filter(provider=user).delete()
                    Review.objects.filter(provider=user).delete()
                    Review.objects.filter(client=user).delete()
                    
                    # Delete the provider profile (this will cascade to related data)
                    profile.delete()
                    
                    # Delete the user
                    user.delete()
                    
                    self.stdout.write(self.style.SUCCESS(f"   ✅ Successfully deleted: {business_name}"))
                    deleted_count += 1
                    
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"   ❌ Error deleting {business_name}: {str(e)}"))
                    import traceback
                    traceback.print_exc()
        
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(f"✅ Deletion complete! Removed {deleted_count} provider(s)."))
        self.stdout.write("   All other providers remain untouched.")

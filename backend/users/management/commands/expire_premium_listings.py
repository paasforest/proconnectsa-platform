from django.core.management.base import BaseCommand
from django.utils import timezone
from backend.users.models import ProviderProfile


class Command(BaseCommand):
    help = "Expire premium listings that have passed their expiration date. Sets is_premium_listing=False for expired listings."

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be expired without actually expiring them',
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Show detailed information about each expired listing',
        )

    def handle(self, *args, **options):
        now = timezone.now()
        dry_run = options['dry_run']
        verbose = options['verbose']
        
        # Find all premium listings that have expired
        # Exclude lifetime premiums (premium_listing_expires_at is None)
        expired_listings = ProviderProfile.objects.filter(
            is_premium_listing=True,
            premium_listing_expires_at__isnull=False,
            premium_listing_expires_at__lte=now
        ).select_related('user')
        
        count = expired_listings.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS("✅ No expired premium listings found"))
            return
        
        self.stdout.write(self.style.WARNING(f"Found {count} expired premium listing(s):"))
        
        expired_count = 0
        for profile in expired_listings:
            expired_days = (now - profile.premium_listing_expires_at).days
            self.stdout.write(f"  - {profile.business_name} ({profile.user.email})")
            self.stdout.write(f"    Expired: {profile.premium_listing_expires_at.strftime('%Y-%m-%d %H:%M:%S')} ({expired_days} days ago)")
            if verbose:
                self.stdout.write(f"    Started: {profile.premium_listing_started_at}")
                self.stdout.write(f"    Reference: {profile.premium_listing_payment_reference}")
            
            if not dry_run:
                # Expire the listing
                profile.is_premium_listing = False
                profile.save(update_fields=['is_premium_listing'])
                expired_count += 1
                self.stdout.write(self.style.SUCCESS(f"    ✅ Expired (is_premium_listing set to False)"))
            else:
                self.stdout.write(self.style.WARNING(f"    [DRY RUN] Would expire"))
        
        if dry_run:
            self.stdout.write(self.style.WARNING(f"\n[DRY RUN] Would expire {count} premium listing(s)"))
            self.stdout.write(self.style.WARNING("Run without --dry-run to actually expire them"))
        else:
            self.stdout.write(self.style.SUCCESS(f"\n✅ Expired {expired_count} premium listing(s)"))
            self.stdout.write(self.style.SUCCESS("These providers will now be charged credits for leads"))

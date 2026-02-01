"""
Django management command to remove test provider accounts.

This command identifies and deletes test provider accounts based on business name patterns,
keeping only real provider accounts.
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from backend.users.models import ProviderProfile, User
from backend.payments.models import Wallet, WalletTransaction
from backend.leads.models import LeadAccess, LeadAssignment


class Command(BaseCommand):
    help = "Remove test provider accounts, keeping only real providers"

    # Real accounts to KEEP (case-insensitive partial match)
    # Confirmed real providers
    REAL_BUSINESS_NAMES = [
        'TMA Projects',
        'mischeck ndolo',  # Note: might be spelled "mischeck" or "mischeck"
        'Kenneth Nakutepa',
        'CK SKILLSET',  # Added per user request
        'SUPREME TV',  # Added per user request
    ]
    
    # Also keep by email (in case business name is different)
    REAL_EMAILS = [
        'lonjechisale1@gmail.com',  # CK SKILLSET
        'supremetv1427@gmail.com',  # SUPREME TV
    ]

    # Test account patterns to delete (everything else that's not in REAL_BUSINESS_NAMES)
    # We'll identify test accounts by exclusion - anything NOT matching real names

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']

        if dry_run:
            self.stdout.write(self.style.WARNING('🔍 DRY RUN MODE - No changes will be made\n'))
        else:
            self.stdout.write(self.style.WARNING('⚠️  LIVE MODE - Accounts will be permanently deleted\n'))

        # Find ALL providers
        all_profiles = list(ProviderProfile.objects.select_related('user').all())
        
        # Identify real accounts (to keep) - by business name
        real_profiles = []
        for pattern in self.REAL_BUSINESS_NAMES:
            matches = ProviderProfile.objects.filter(
                business_name__icontains=pattern
            ).select_related('user')
            real_profiles.extend(matches)
        
        # Also identify by email (in case business name is different)
        for email in self.REAL_EMAILS:
            matches = ProviderProfile.objects.filter(
                user__email__iexact=email
            ).select_related('user')
            real_profiles.extend(matches)
        
        # Remove duplicates from real_profiles
        seen_real_ids = set()
        unique_real_profiles = []
        for profile in real_profiles:
            if profile.id not in seen_real_ids:
                seen_real_ids.add(profile.id)
                unique_real_profiles.append(profile)
        
        # Test accounts = everything that's NOT a real account
        test_profiles = [p for p in all_profiles if p.id not in seen_real_ids]

        # Display what will be deleted
        self.stdout.write(f'📋 Found {len(test_profiles)} test provider account(s) to delete:\n')
        for profile in test_profiles:
            self.stdout.write(f'   - {profile.business_name} (ID: {profile.id}, User: {profile.user.email})')

        # Display real accounts that will be kept
        if unique_real_profiles:
            self.stdout.write(f'\n✅ Real provider accounts that will be KEPT ({len(unique_real_profiles)}):\n')
            for profile in unique_real_profiles:
                self.stdout.write(f'   - {profile.business_name} (ID: {profile.id})')

        if not test_profiles:
            self.stdout.write(self.style.SUCCESS('\n✅ No test accounts found to delete.'))
            return

        if dry_run:
            self.stdout.write(self.style.WARNING(
                '\n🔍 DRY RUN: Would delete the above accounts. Run without --dry-run to actually delete.'
            ))
            return

        # Confirm deletion
        self.stdout.write(self.style.WARNING(
            f'\n⚠️  About to delete {len(test_profiles)} provider account(s) and associated data.'
        ))
        confirm = input('Type "DELETE" to confirm: ')
        if confirm != 'DELETE':
            self.stdout.write(self.style.ERROR('❌ Deletion cancelled.'))
            return

        # Delete test accounts
        deleted_count = 0
        with transaction.atomic():
            for profile in test_profiles:
                user = profile.user
                business_name = profile.business_name

                # Delete related data first (CASCADE should handle most, but be explicit)
                # LeadAccess and LeadAssignment will cascade
                # Wallet and WalletTransaction will cascade
                
                # Delete the profile (this will cascade to related data)
                profile.delete()
                
                # Delete the user (if no other relations)
                try:
                    user.delete()
                    self.stdout.write(self.style.SUCCESS(f'   ✅ Deleted: {business_name} (User: {user.email})'))
                    deleted_count += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(
                        f'   ⚠️  Deleted profile but user deletion failed: {business_name} - {str(e)}'
                    ))
                    deleted_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'\n✅ Successfully deleted {deleted_count} test provider account(s).'
        ))

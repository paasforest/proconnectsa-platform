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

    # Test account patterns to delete
    TEST_BUSINESS_NAMES = [
        'AutoTest Services',
        'Malawi Hermanus Society One',
        'Plumber Only',
        'rod plumbing',
        "Ronnie's Multi-Service",
    ]

    # Real accounts to keep (case-insensitive partial match)
    REAL_BUSINESS_NAMES = [
        'TMA Projects',
        'mischeck ndolo',
        'Kenneth Nakutepa',
    ]

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

        # Find test accounts
        test_profiles = []
        for pattern in self.TEST_BUSINESS_NAMES:
            # Case-insensitive search
            matches = ProviderProfile.objects.filter(
                business_name__icontains=pattern
            ).select_related('user')
            test_profiles.extend(matches)

        # Remove duplicates (in case a profile matches multiple patterns)
        seen_ids = set()
        unique_test_profiles = []
        for profile in test_profiles:
            if profile.id not in seen_ids:
                seen_ids.add(profile.id)
                unique_test_profiles.append(profile)

        # Verify we're not deleting real accounts
        real_profiles = []
        for pattern in self.REAL_BUSINESS_NAMES:
            matches = ProviderProfile.objects.filter(
                business_name__icontains=pattern
            ).select_related('user')
            real_profiles.extend(matches)

        # Check for overlap
        test_ids = {p.id for p in unique_test_profiles}
        real_ids = {p.id for p in real_profiles}
        overlap = test_ids & real_ids

        if overlap:
            self.stdout.write(self.style.ERROR(
                f'❌ ERROR: Found overlap between test and real accounts: {overlap}\n'
                'Please review the business names and update the command.\n'
            ))
            return

        # Display what will be deleted
        self.stdout.write(f'📋 Found {len(unique_test_profiles)} test provider account(s) to delete:\n')
        for profile in unique_test_profiles:
            self.stdout.write(f'   - {profile.business_name} (ID: {profile.id}, User: {profile.user.email})')

        # Display real accounts that will be kept
        if real_profiles:
            self.stdout.write(f'\n✅ Real provider accounts that will be KEPT ({len(real_profiles)}):\n')
            for profile in real_profiles:
                self.stdout.write(f'   - {profile.business_name} (ID: {profile.id})')

        if not unique_test_profiles:
            self.stdout.write(self.style.SUCCESS('\n✅ No test accounts found to delete.'))
            return

        if dry_run:
            self.stdout.write(self.style.WARNING(
                '\n🔍 DRY RUN: Would delete the above accounts. Run without --dry-run to actually delete.'
            ))
            return

        # Confirm deletion
        self.stdout.write(self.style.WARNING(
            f'\n⚠️  About to delete {len(unique_test_profiles)} provider account(s) and associated data.'
        ))
        confirm = input('Type "DELETE" to confirm: ')
        if confirm != 'DELETE':
            self.stdout.write(self.style.ERROR('❌ Deletion cancelled.'))
            return

        # Delete test accounts
        deleted_count = 0
        with transaction.atomic():
            for profile in unique_test_profiles:
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

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
    # Confirmed real providers - DO NOT DELETE THESE
    REAL_BUSINESS_NAMES = [
        'TMA Projects',
        'mischeck ndolo',  # Note: might be spelled "mischeck" or "mischeck"
        'Kenneth Nakutepa',
        'CK SKILLSET',  # Added per user request
        'SUPREME TV',  # Added per user request
        'Tinashe',  # Keep Tinashe if found (by name)
        'Kambudzi',  # Keep Tinashe if found (by surname)
    ]
    
    # Also keep by email (in case business name is different)
    REAL_EMAILS = [
        'lonjechisale1@gmail.com',  # CK SKILLSET
        'supremetv1427@gmail.com',  # SUPREME TV
        # Tinashe's email will be added once found
    ]
    
    # Accounts to DELETE by business name or email (user confirmed these are not real)
    ACCOUNTS_TO_DELETE = [
        'rod plumbing',
        "Ronnie's Multi-Service",
        'Malawi Hermanus Society One',
        'jack electrical',
        'Lyton plumbing',
        'tmn',
        'tonny plumbing',
    ]
    
    # Emails to DELETE (user confirmed these are not real)
    EMAILS_TO_DELETE = [
        'rod@gmail.com',  # rod plumbing
        'ronnie@gmail.co',  # Ronnie's Multi-Service
        'yohanechinthomba@gmail.com',  # Malawi Hermanus Society One
        'lubi@gmail.com',  # jack electrical
        'lyton@gmail.com',  # Lyton plumbing
        'dancun@gmail.com',  # tmn
        'tonny@gmail.com',  # tonny plumbing
    ]
    
    # Test account patterns to DELETE (obvious test accounts only)
    TEST_PATTERNS = [
        'AutoTest',
        'autotest',
        'Test',
        'test',
        'Demo',
        'demo',
        'Tester',
        'tester',
        'E2E',
        'Browse Tester',
        'Res Tester',
        'Ver Doc',
        'Marketing Test',
        'Solar Solutions 1760541682',  # Has test pattern in name
        'Plumber Only 08f2a7',  # Test pattern
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
        
        # Also check user first/last name for Tinashe
        tinashe_matches = ProviderProfile.objects.filter(
            user__first_name__icontains='tinashe'
        ).select_related('user')
        real_profiles.extend(tinashe_matches)
        
        tinashe_matches = ProviderProfile.objects.filter(
            user__last_name__icontains='kambudzi'
        ).select_related('user')
        real_profiles.extend(tinashe_matches)
        
        # Remove duplicates from real_profiles
        seen_real_ids = set()
        unique_real_profiles = []
        for profile in real_profiles:
            if profile.id not in seen_real_ids:
                seen_real_ids.add(profile.id)
                unique_real_profiles.append(profile)
        
        # Identify test accounts by patterns and explicit deletion list
        test_profiles = []
        for profile in all_profiles:
            if profile.id in seen_real_ids:
                continue  # Skip real accounts
            
            business_name_lower = profile.business_name.lower()
            email_lower = profile.user.email.lower()
            
            # Check if explicitly marked for deletion
            is_test = False
            
            # Check explicit deletion lists
            if any(name.lower() in business_name_lower for name in self.ACCOUNTS_TO_DELETE):
                is_test = True
            
            if profile.user.email.lower() in [e.lower() for e in self.EMAILS_TO_DELETE]:
                is_test = True
            
            # Check if it matches test patterns
            if any(pattern.lower() in business_name_lower or pattern.lower() in email_lower 
                   for pattern in self.TEST_PATTERNS):
                is_test = True
            
            # Also check for obvious test email patterns
            if any(test_domain in email_lower for test_domain in ['@example.com', '@proconnectsa-test.com']):
                is_test = True
            
            if is_test:
                test_profiles.append(profile)

        # Display what will be deleted
        self.stdout.write(f'📋 Found {len(test_profiles)} test provider account(s) to delete:\n')
        for profile in test_profiles:
            status_icon = '✅' if profile.verification_status == 'verified' else '⏳'
            self.stdout.write(f'   {status_icon} {profile.business_name} (ID: {profile.id}, User: {profile.user.email}, Status: {profile.verification_status})')
        
        # Safety check: warn about verified accounts
        verified_to_delete = [p for p in test_profiles if p.verification_status == 'verified']
        if verified_to_delete:
            self.stdout.write(self.style.WARNING(
                f'\n⚠️  WARNING: {len(verified_to_delete)} verified account(s) will be deleted. '
                'Please double-check these are test accounts!'
            ))
            for p in verified_to_delete:
                self.stdout.write(self.style.WARNING(
                    f'   - {p.business_name} ({p.user.email})'
                ))

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

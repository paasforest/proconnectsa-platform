"""
Send pro welcome email to existing providers who never received it.
Target: ProviderProfile with pro_welcome_email_sent_at=None, created before cutoff (default 2026-03-04).

Usage:
  python manage.py send_pro_welcome_to_existing_providers           # send to all
  python manage.py send_pro_welcome_to_existing_providers --dry-run # preview only
  python manage.py send_pro_welcome_to_existing_providers --limit 5 # test with 5
"""
import time
from datetime import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Q

from backend.users.models import ProviderProfile
from backend.utils.resend_service import send_pro_welcome_email


class Command(BaseCommand):
    help = "Send pro welcome email to existing providers who never received it"

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Preview who would receive the email without sending',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=None,
            help='Max number of emails to send (for testing)',
        )
        parser.add_argument(
            '--before',
            type=str,
            default='2026-03-04',
            help='Only profiles created before this date (YYYY-MM-DD). Default: 2026-03-04',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        limit = options['limit']
        before_str = options['before']

        try:
            before_date = datetime.strptime(before_str, '%Y-%m-%d').replace(tzinfo=timezone.get_current_timezone())
        except ValueError:
            self.stderr.write(self.style.ERROR(f"Invalid --before date. Use YYYY-MM-DD."))
            return

        # Profiles that never got the pro welcome, created before cutoff
        qs = ProviderProfile.objects.filter(
            pro_welcome_email_sent_at__isnull=True,
            created_at__lt=before_date
        ).select_related('user').order_by('created_at')

        total = qs.count()
        if limit is not None:
            qs = qs[:limit]

        self.stdout.write(self.style.WARNING(f"\nPro Welcome Email - Existing Providers"))
        self.stdout.write("=" * 60)
        self.stdout.write(f"Cutoff: profiles created before {before_str}")
        self.stdout.write(f"Eligible (never sent): {total}")
        if limit:
            self.stdout.write(f"Limit: {limit}")
        self.stdout.write(f"Mode: {'DRY RUN (no emails sent)' if dry_run else 'LIVE'}")
        self.stdout.write("")

        if total == 0:
            self.stdout.write(self.style.SUCCESS("No providers need the pro welcome email."))
            return

        sent = 0
        failed = 0
        for i, profile in enumerate(qs, 1):
            email = profile.user.email
            name = profile.business_name or profile.user.get_full_name() or email
            if dry_run:
                self.stdout.write(f"  [{i}] Would send to: {email} ({name})")
                sent += 1
                continue

            try:
                ok = send_pro_welcome_email(profile.user)
                if ok:
                    profile.pro_welcome_email_sent_at = timezone.now()
                    profile.save(update_fields=['pro_welcome_email_sent_at'])
                    self.stdout.write(self.style.SUCCESS(f"  [{i}] Sent to: {email}"))
                    sent += 1
                else:
                    self.stdout.write(self.style.ERROR(f"  [{i}] Failed: {email}"))
                    failed += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  [{i}] Error {email}: {e}"))
                failed += 1

            # Rate limit: 1.5 sec between emails
            if not dry_run:
                time.sleep(1.5)

        self.stdout.write("")
        self.stdout.write("=" * 60)
        if dry_run:
            self.stdout.write(self.style.SUCCESS(f"Dry run: would send to {sent} provider(s)"))
        else:
            self.stdout.write(self.style.SUCCESS(f"Sent: {sent}"))
            if failed:
                self.stdout.write(self.style.ERROR(f"Failed: {failed}"))

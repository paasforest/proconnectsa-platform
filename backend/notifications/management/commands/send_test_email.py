"""
Send a test email via Resend to verify configuration.
Usage: python manage.py send_test_email [email@example.com]
"""
from django.core.management.base import BaseCommand
from backend.utils.resend_service import test_email_delivery


class Command(BaseCommand):
    help = "Send a test email via Resend to verify email is working."

    def add_arguments(self, parser):
        parser.add_argument(
            "email",
            nargs="?",
            type=str,
            default=None,
            help="Recipient email address (optional; prompts if not given)",
        )

    def handle(self, *args, **options):
        email = options.get("email")
        if not email:
            email = input("Enter email address to send test to: ").strip()
        if not email or "@" not in email:
            self.stderr.write(self.style.ERROR("Invalid email address."))
            return
        self.stdout.write(f"Sending test email to {email} via Resend...")
        ok = test_email_delivery(email)
        if ok:
            self.stdout.write(self.style.SUCCESS(f"✅ Test email sent to {email}. Check inbox (and spam)."))
        else:
            self.stderr.write(self.style.ERROR("❌ Failed to send. Check RESEND_API_KEY and Resend dashboard."))

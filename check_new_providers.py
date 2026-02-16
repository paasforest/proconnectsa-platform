#!/usr/bin/env python3
"""
Check for new provider sign-ups
This script can be run locally or on the server
"""
import requests
import json
from datetime import datetime, timedelta

def check_new_providers_via_api():
    """Check for new providers via the admin monitoring API"""
    
    print("🔍 Checking for New Provider Sign-ups")
    print("=" * 70)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    # Note: This requires admin authentication
    # You'll need to login first and get an admin token
    print("\n📋 To check new provider sign-ups:")
    print("   1. Login to admin dashboard: https://api.proconnectsa.co.za/api/login/")
    print("   2. Use email: admin@proconnectsa.co.za")
    print("   3. Get your admin token from the response")
    print("   4. Use the monitoring API endpoint:")
    print("\n   curl -H \"Authorization: Token YOUR_TOKEN\" \\")
    print("     \"https://api.proconnectsa.co.za/api/users/admin/monitoring/dashboard/?hours=168\"")
    print("\n   (hours=168 = last 7 days)")
    
    print("\n" + "=" * 70)
    print("💡 Alternative: Run on server directly")
    print("=" * 70)
    print("\nSSH into server and run:")
    print("  cd /opt/proconnectsa")
    print("  source venv/bin/activate")
    print("  python manage.py shell")
    print("\nThen run:")
    print("""
from django.contrib.auth import get_user_model
from backend.users.models import ProviderProfile
from django.utils import timezone
from datetime import timedelta

User = get_user_model()
recent_providers = ProviderProfile.objects.filter(
    user__date_joined__gte=timezone.now() - timedelta(days=7)
).select_related('user').order_by('-user__date_joined')

print(f'\\n=== NEW PROVIDER SIGN-UPS (Last 7 Days) ===')
print(f'Total: {recent_providers.count()}\\n')

for i, p in enumerate(recent_providers[:20], 1):
    print(f'{i}. {p.business_name} ({p.user.email})')
    print(f'   Joined: {p.user.date_joined.strftime("%Y-%m-%d %H:%M")}')
    print(f'   Status: {p.verification_status}')
    print(f'   Categories: {p.service_categories}')
    print()
""")

if __name__ == "__main__":
    check_new_providers_via_api()

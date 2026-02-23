#!/bin/bash
# Verify and fix admin user permissions on Hetzner server

HETZNER_IP="128.140.123.48"
HETZNER_DIR="/opt/proconnectsa"

echo "🔍 Verifying Admin User Permissions on Hetzner Server"
echo "====================================================="

ssh root@${HETZNER_IP} "cd ${HETZNER_DIR} && \
  source venv/bin/activate && \
  python manage.py shell << 'PYTHON_EOF'
from django.contrib.auth import get_user_model
from backend.support.models import SupportTicket

User = get_user_model()

email = 'admin@proconnectsa.co.za'
user = User.objects.filter(email=email).first()

if user:
    print(f'✅ Found admin user: {email}')
    print(f'   User Type: {user.user_type}')
    print(f'   Is Staff: {user.is_staff}')
    print(f'   Is Superuser: {user.is_superuser}')
    print(f'   Is Active: {user.is_active}')
    
    # Fix permissions if needed
    needs_fix = False
    if user.user_type != 'admin':
        print(f'⚠️  User type is {user.user_type}, should be admin')
        user.user_type = 'admin'
        needs_fix = True
    
    if not user.is_staff:
        print(f'⚠️  is_staff is False, should be True')
        user.is_staff = True
        needs_fix = True
    
    if not user.is_superuser:
        print(f'⚠️  is_superuser is False, should be True')
        user.is_superuser = True
        needs_fix = True
    
    if needs_fix:
        user.save()
        print(f'✅ Fixed admin user permissions!')
    else:
        print(f'✅ Admin user permissions are correct!')
    
    # Check ticket access
    print(f'\\n📊 Checking ticket access:')
    all_tickets = SupportTicket.objects.all()
    print(f'   Total tickets in database: {all_tickets.count()}')
    
    # Test queryset filtering
    if user.is_staff or user.user_type in ['admin', 'support']:
        accessible_tickets = SupportTicket.objects.all()
        print(f'   Tickets accessible to admin: {accessible_tickets.count()}')
    else:
        accessible_tickets = SupportTicket.objects.filter(user=user)
        print(f'   Tickets accessible to admin: {accessible_tickets.count()}')
    
    if accessible_tickets.count() > 0:
        print(f'   First ticket: {accessible_tickets.first().title}')
        print(f'   First ticket user: {accessible_tickets.first().user.email}')
else:
    print(f'❌ Admin user not found: {email}')
    print(f'   Please run create_admin_user.py to create the admin user')
PYTHON_EOF
"

echo ""
echo "✅ Admin permissions check complete!"
echo ""

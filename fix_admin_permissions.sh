#!/bin/bash
# Fix admin user permissions on Hetzner server

HETZNER_IP="128.140.123.48"
HETZNER_DIR="/opt/proconnectsa"

echo "🔧 Fixing Admin User Permissions on Hetzner Server"
echo "=================================================="

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
    print(f'   Current User Type: {user.user_type}')
    print(f'   Current Is Staff: {user.is_staff}')
    print(f'   Current Is Superuser: {user.is_superuser}')
    
    # Fix permissions
    user.user_type = 'admin'
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.save()
    
    print(f'\\n✅ Fixed admin user permissions:')
    print(f'   User Type: {user.user_type}')
    print(f'   Is Staff: {user.is_staff}')
    print(f'   Is Superuser: {user.is_superuser}')
    
    # Check ticket access
    print(f'\\n📊 Ticket Access Test:')
    all_tickets = SupportTicket.objects.all()
    print(f'   Total tickets in database: {all_tickets.count()}')
    
    # Test queryset filtering (same logic as in views.py)
    if user.is_staff or getattr(user, 'user_type', None) in ['admin', 'support']:
        accessible_tickets = SupportTicket.objects.all().order_by('-created_at')
        print(f'   ✅ Tickets accessible to admin: {accessible_tickets.count()}')
        if accessible_tickets.count() > 0:
            print(f'   First ticket: {accessible_tickets.first().title}')
            print(f'   First ticket user: {accessible_tickets.first().user.email}')
            print(f'   First ticket created: {accessible_tickets.first().created_at}')
    else:
        accessible_tickets = SupportTicket.objects.filter(user=user)
        print(f'   ❌ Tickets accessible to admin: {accessible_tickets.count()} (WRONG - should see all)')
else:
    print(f'❌ Admin user not found: {email}')
    print(f'   Creating admin user...')
    user = User.objects.create_user(
        email=email,
        username='admin',
        password='Admin123!',
        first_name='Admin',
        last_name='User',
        user_type='admin',
        is_staff=True,
        is_superuser=True,
        is_active=True
    )
    print(f'✅ Created admin user: {email}')
PYTHON_EOF
"

echo ""
echo "✅ Admin permissions fix complete!"
echo ""

#!/bin/bash
# Create admin user on Hetzner server

HETZNER_IP="128.140.123.48"
HETZNER_DIR="/opt/proconnectsa"

echo "🔐 Creating Admin User on Hetzner Server"
echo "=========================================="

ssh root@${HETZNER_IP} "cd ${HETZNER_DIR} && \
  source venv/bin/activate && \
  python manage.py shell << 'PYTHON_EOF'
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

email = 'admin@proconnectsa.co.za'
username = 'admin'
password = 'Admin123!'

try:
    with transaction.atomic():
        user = User.objects.filter(email=email).first()
        
        if user:
            user.username = username
            user.set_password(password)
            user.user_type = 'admin'
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.save()
            print(f'✅ Updated existing admin user: {email}')
        else:
            user = User.objects.create_user(
                email=email,
                username=username,
                password=password,
                first_name='Admin',
                last_name='User',
                user_type='admin',
                is_staff=True,
                is_superuser=True,
                is_active=True
            )
            print(f'✅ Created new admin user: {email}')
        
        if user.check_password(password):
            print(f'✅ Password verified successfully!')
        
        print(f'\\n📋 Admin Credentials:')
        print(f'   Email: {email}')
        print(f'   Username: {username}')
        print(f'   Password: {password}')
        print(f'   User Type: {user.user_type}')
        print(f'   Is Staff: {user.is_staff}')
        print(f'   Is Superuser: {user.is_superuser}')
        print(f'   Is Active: {user.is_active}')
except Exception as e:
    print(f'❌ Error: {str(e)}')
    import traceback
    traceback.print_exc()
PYTHON_EOF
"

echo ""
echo "✅ Admin user creation complete!"
echo ""
echo "🌐 Login URL: https://proconnectsa.co.za/admin"
echo "📧 Email: admin@proconnectsa.co.za"
echo "🔑 Password: Admin123!"

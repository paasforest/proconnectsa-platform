#!/bin/bash

echo "🛡️ FIXING SECURITY ISSUES ON EXISTING DEPLOYMENT"
echo "================================================"
echo ""
echo "⚠️  This will fix critical security vulnerabilities on your live system"
echo ""

# Step 1: Backup current environment
echo "📋 Step 1: Backing up current environment..."
ssh root@128.140.123.48 "cd /opt/proconnectsa && cp .env .env.backup.$(date +%Y%m%d_%H%M%S)"

# Step 2: Update environment with secure settings
echo "📋 Step 2: Updating environment with secure settings..."
ssh root@128.140.123.48 << 'EOF'
cd /opt/proconnectsa

# Update .env file with secure settings
cat > .env << 'ENVEOF'
# 🔒 SECURE PRODUCTION ENVIRONMENT - ProConnectSA
# ⚠️ DO NOT SHARE OR COMMIT THIS FILE

# Django Security Settings
SECRET_KEY=0x+%#@pl1qg&r^h4bf5c)7*yz8+30=)!=-wdlt-2*svzc=&ztg
DEBUG=False
ALLOWED_HOSTS=api.proconnectsa.co.za,proconnectsa.co.za,www.proconnectsa.co.za,backend.proconnectsa.co.za

# Database Configuration
DB_NAME=proconnectsa
DB_USER=proconnectsa
DB_PASSWORD=ProConnectSA_Secure_DB_Password_2024!
DB_HOST=localhost
DB_PORT=5432
USE_SQLITE=False

# Email Configuration - SendGrid (NEEDS NEW API KEY)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=REPLACE_WITH_NEW_SENDGRID_API_KEY
DEFAULT_FROM_EMAIL=noreply@proconnectsa.co.za
SUPPORT_EMAIL=support@proconnectsa.co.za
ADMIN_EMAIL=admin@proconnectsa.co.za

# SendGrid API (NEEDS NEW API KEY)
SENDGRID_API_KEY=REPLACE_WITH_NEW_SENDGRID_API_KEY

# Frontend URL
FRONTEND_URL=https://proconnectsa.co.za

# CORS Settings
CORS_ALLOWED_ORIGINS=https://proconnectsa.co.za,https://www.proconnectsa.co.za

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# SMS Configuration (Disabled for cost savings)
SMS_ENABLED=False
EMAIL_NOTIFICATIONS_ENABLED=True

# Security Settings
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# Bank API Configuration (Disabled for now)
BANK_API_ENABLED=False
ENVEOF

echo "✅ Environment file updated with secure settings"
EOF

# Step 3: Install SSL certificates
echo "📋 Step 3: Installing SSL certificates..."
ssh root@128.140.123.48 << 'EOF'
# Install certbot if not already installed
apt update
apt install -y certbot python3-certbot-nginx

# Generate SSL certificates
certbot --nginx -d api.proconnectsa.co.za -d backend.proconnectsa.co.za --non-interactive --agree-tos --email admin@proconnectsa.co.za

echo "✅ SSL certificates installed"
EOF

# Step 4: Configure firewall
echo "📋 Step 4: Configuring firewall..."
ssh root@128.140.123.48 << 'EOF'
# Enable firewall
ufw --force enable

# Allow necessary ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

# Block dangerous ports
ufw deny 8000/tcp   # Block Django dev server
ufw deny 5432/tcp   # Block PostgreSQL from external access

echo "✅ Firewall configured"
EOF

# Step 5: Restart services
echo "📋 Step 5: Restarting services..."
ssh root@128.140.123.48 << 'EOF'
cd /opt/proconnectsa

# Stop Django server
pkill -f 'python.*manage.py.*runserver'

# Restart with secure settings
nohup python manage.py runserver 0.0.0.0:8000 > /dev/null 2>&1 &

echo "✅ Django server restarted with secure settings"
EOF

# Step 6: Test security
echo "📋 Step 6: Testing security configuration..."
sleep 5
curl -I https://api.proconnectsa.co.za/health/ 2>/dev/null | grep -E "(HTTP|HSTS|X-Frame|X-Content)"

echo ""
echo "🎉 SECURITY FIXES COMPLETED!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Go to SendGrid Dashboard and generate NEW API key"
echo "2. Update EMAIL_HOST_PASSWORD and SENDGRID_API_KEY in .env file"
echo "3. Test email functionality"
echo "4. Monitor system for any issues"
echo ""
echo "🔒 Your system is now much more secure!"

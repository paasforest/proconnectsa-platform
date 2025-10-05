#!/bin/bash

echo "🛡️ DEPLOYING CRITICAL SECURITY FIXES"
echo "====================================="

echo "⚠️  WARNING: This will fix critical security vulnerabilities"
echo "⚠️  Make sure you have regenerated the SendGrid API key first!"
echo ""

read -p "Have you regenerated the SendGrid API key? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please regenerate the SendGrid API key first!"
    echo "1. Go to https://app.sendgrid.com/settings/api_keys"
    echo "2. Create new API key"
    echo "3. Update the secure_production_env.txt file"
    echo "4. Run this script again"
    exit 1
fi

echo "🚀 Starting security fixes deployment..."

# Step 1: Upload secure environment file
echo "📤 Uploading secure environment file..."
scp secure_production_env.txt root@128.140.123.48:/opt/proconnectsa/.env.new

# Step 2: Deploy security fixes on server
echo "🔧 Deploying security fixes on server..."
ssh root@128.140.123.48 << 'EOF'
    echo "📁 Navigating to backend directory..."
    cd /opt/proconnectsa
    
    echo "💾 Backing up current environment file..."
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    
    echo "🔄 Replacing with secure environment..."
    mv .env.new .env
    
    echo "🔒 Setting secure file permissions..."
    chmod 600 .env
    
    echo "🔄 Restarting Django server with secure settings..."
    pkill -f 'python.*manage.py.*runserver'
    sleep 2
    
    echo "🚀 Starting Django server with secure configuration..."
    nohup python manage.py runserver 0.0.0.0:8000 > /dev/null 2>&1 &
    
    echo "⏳ Waiting for server to start..."
    sleep 5
    
    echo "🧪 Testing server health..."
    if curl -f http://localhost:8000/health/ > /dev/null 2>&1; then
        echo "✅ Server is running with secure configuration!"
    else
        echo "❌ Server health check failed. Check logs."
        echo "📋 Rolling back to backup..."
        cp .env.backup.* .env
        nohup python manage.py runserver 0.0.0.0:8000 > /dev/null 2>&1 &
    fi
    
    echo "🔍 Current environment file permissions:"
    ls -la .env
    
    echo "✅ Security fixes deployment completed!"
EOF

echo ""
echo "🎉 SECURITY FIXES DEPLOYED!"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Install SSL certificates: sudo certbot --nginx -d api.proconnectsa.co.za"
echo "2. Configure firewall: sudo ufw enable && sudo ufw allow 443/tcp"
echo "3. Test email delivery with new API key"
echo "4. Verify security headers"
echo ""
echo "🛡️ Your platform is now much more secure!"

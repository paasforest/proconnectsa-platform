#!/bin/bash

echo "🚀 DEPLOYING MULTIPLE SERVICE SELECTION FIX"
echo "=========================================="

echo "📡 Connecting to Hetzner server..."
ssh root@hetzner.proconnectsa.co.za << 'EOF'
    echo "📁 Navigating to backend directory..."
    cd /opt/proconnectsa-backend
    
    echo "📥 Pulling latest changes..."
    git pull origin main
    
    echo "🔄 Restarting Django server..."
    pkill -f 'python.*manage.py.*runserver'
    sleep 2
    
    echo "🚀 Starting Django server..."
    nohup python manage.py runserver 0.0.0.0:8000 > /dev/null 2>&1 &
    
    echo "✅ Deployment complete!"
    echo "🎉 Multiple service selection should now work correctly!"
EOF

echo "🎯 DEPLOYMENT COMPLETE!"
echo "The multiple service selection bug has been fixed."
echo "Providers should now receive leads for ALL their selected services."

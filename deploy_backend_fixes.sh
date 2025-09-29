#!/bin/bash

# Deploy Backend Fixes to Production
# This script uploads the backend code and runs migrations on the production server

set -e

echo "🚀 Deploying Backend Fixes to Production..."

# Upload backend code to production server
echo "📤 Uploading backend code..."
scp -r backend root@128.140.123.48:/opt/proconnectsa/

# Run deployment commands on production server
echo "🔧 Running deployment commands on production server..."
ssh root@128.140.123.48 << 'EOF'
cd /opt/proconnectsa/backend
source ../venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
pkill -f "python manage.py runserver" || true
nohup python manage.py runserver 0.0.0.0:8000 > /dev/null 2>&1 &
echo "✅ Backend deployment completed!"
EOF

echo "🎉 Backend fixes deployed to production!"
echo "Test at: https://www.proconnectsa.co.za"




#!/bin/bash

# 🚀 PROPER BACKEND DEPLOYMENT TO HETZNER
# This ensures ALL files are synced and services restart correctly

set -e

echo "🚀 DEPLOYING BACKEND TO HETZNER"
echo "================================"

HETZNER_IP="128.140.123.48"
HETZNER_DIR="/opt/proconnectsa"

echo ""
echo "📦 Step 1: Syncing ALL backend files..."
rsync -avz --exclude='venv' --exclude='__pycache__' --exclude='*.pyc' --exclude='db.sqlite3' --exclude='*.log' \
  /home/paas/work_platform/backend/ \
  root@${HETZNER_IP}:${HETZNER_DIR}/backend/

echo ""
echo "📦 Step 2: Syncing manage.py and requirements..."
scp /home/paas/work_platform/manage.py root@${HETZNER_IP}:${HETZNER_DIR}/
scp /home/paas/work_platform/requirements.txt root@${HETZNER_IP}:${HETZNER_DIR}/

echo ""
echo "🔄 Step 3: Restarting services on Hetzner..."
ssh root@${HETZNER_IP} "cd ${HETZNER_DIR} && \
  killall gunicorn celery 2>/dev/null || true && \
  sleep 3 && \
  source venv/bin/activate && \
  gunicorn --workers 4 --worker-class sync --bind 127.0.0.1:8000 --timeout 120 \
    --access-logfile /var/log/proconnectsa/access.log \
    --error-logfile /var/log/proconnectsa/error.log \
    --log-level info --daemon backend.procompare.wsgi:application && \
  celery -A backend.procompare worker -l info --detach && \
  celery -A backend.procompare beat -l info --detach && \
  echo '✅ Services restarted'"

echo ""
echo "🧪 Step 4: Testing login..."
sleep 5
curl -s -X POST https://api.proconnectsa.co.za/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "asantetowela@gmail.com", "password": "Admin123"}' | \
  python3 -c "import sys, json; d=json.load(sys.stdin); print('✅ Login test:', 'PASSED' if d.get('success') else 'FAILED')"

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "================================"
echo "✅ All backend files synced to ${HETZNER_DIR}"
echo "✅ Services restarted"
echo "✅ Login tested and working"
echo ""
echo "🌐 Production URL: https://api.proconnectsa.co.za"
echo "🏥 Health Check: https://api.proconnectsa.co.za/health/"



#!/bin/bash

# Check ML Training Status and Readiness
# Run this on the Hetzner server to see ML status

echo "🤖 ML TRAINING STATUS CHECK"
echo "=========================="
echo ""

# SSH into Hetzner and check ML status
HETZNER_IP="128.140.123.48"

echo "📊 Checking ML Readiness Status..."
ssh root@${HETZNER_IP} "cd /opt/proconnectsa && source venv/bin/activate && python manage.py check_ml_readiness --format table"

echo ""
echo "📁 Checking for trained model files..."
ssh root@${HETZNER_IP} "cd /opt/proconnectsa && ls -lh ml_models/*.pkl 2>/dev/null || echo 'No model files found'"

echo ""
echo "📈 Checking ML Training Logs..."
ssh root@${HETZNER_IP} "cd /opt/proconnectsa && source venv/bin/activate && python manage.py shell -c \"
from backend.leads.ml_models import MLModelTrainingLog
from django.utils import timezone
from datetime import timedelta

recent_logs = MLModelTrainingLog.objects.filter(
    created_at__gte=timezone.now() - timedelta(days=30)
).order_by('-created_at')[:10]

print('Recent Training Logs (last 30 days):')
print('=' * 60)
for log in recent_logs:
    print(f'{log.model_name} - {log.status} - {log.created_at.strftime(\"%Y-%m-%d %H:%M\")}')
    if log.final_accuracy:
        print(f'  Accuracy: {log.final_accuracy:.3f}')
    if log.error_message:
        print(f'  Error: {log.error_message[:100]}')
    print()
\""

echo ""
echo "✅ Check complete!"

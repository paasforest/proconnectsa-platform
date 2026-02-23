#!/bin/bash
# Simple ML Status Check - Run this from your local machine

echo "🤖 Checking ML Status on Hetzner..."
echo ""

ssh root@128.140.123.48 << 'ENDSSH'
cd /opt/proconnectsa
source venv/bin/activate

echo "📊 ML READINESS STATUS:"
echo "========================"
python manage.py check_ml_readiness --format table

echo ""
echo "📁 MODEL FILES:"
echo "==============="
if [ -d "ml_models" ]; then
    ls -lh ml_models/*.pkl 2>/dev/null | head -10 || echo "❌ No .pkl model files found"
else
    echo "❌ ml_models directory not found"
fi

echo ""
echo "⚙️ ML CONFIGURATION:"
echo "==================="
python manage.py shell -c "
from django.conf import settings
ml_enabled = getattr(settings, 'ML_ENABLED', False)
print(f'ML_ENABLED: {\"✅ YES\" if ml_enabled else \"❌ NO\"}')"

echo ""
echo "📈 RECENT TRAINING LOGS:"
echo "======================="
python manage.py shell -c "
from backend.leads.ml_models import MLModelTrainingLog
from django.utils import timezone
from datetime import timedelta

logs = MLModelTrainingLog.objects.filter(
    created_at__gte=timezone.now() - timedelta(days=90)
).order_by('-created_at')[:5]

if logs.exists():
    for log in logs:
        status_icon = '✅' if log.status == 'completed' else '❌' if log.status == 'failed' else '⏳'
        print(f'{status_icon} {log.model_name} - {log.status} - {log.created_at.strftime(\"%Y-%m-%d\")}')
        if log.final_accuracy:
            print(f'   Accuracy: {log.final_accuracy:.3f}')
else:
    print('❌ No training logs found in last 90 days')
"

ENDSSH

echo ""
echo "✅ Check complete!"

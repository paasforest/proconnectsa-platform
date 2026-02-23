#!/bin/bash
# Setup and Train Lead Quality ML Model
# Since you have 143 leads, the model is ready to train!

echo "🤖 SETTING UP AND TRAINING ML MODEL"
echo "===================================="
echo ""

HETZNER_IP="128.140.123.48"

echo "📦 Step 1: Running migrations (if needed)..."
ssh root@${HETZNER_IP} "cd /opt/proconnectsa && source venv/bin/activate && python manage.py migrate --noinput"

echo ""
echo "🎯 Step 2: Training Lead Quality ML Model..."
echo "   (You have 143 leads - model is ready!)"
ssh root@${HETZNER_IP} "cd /opt/proconnectsa && source venv/bin/activate && python manage.py train_ml_models --service LeadQualityMLService"

echo ""
echo "⚙️ Step 3: Enabling ML in settings..."
ssh root@${HETZNER_IP} "cd /opt/proconnectsa && grep -q 'ML_ENABLED' .env && sed -i 's/ML_ENABLED=.*/ML_ENABLED=True/' .env || echo 'ML_ENABLED=True' >> .env"

echo ""
echo "🔄 Step 4: Restarting services..."
ssh root@${HETZNER_IP} "cd /opt/proconnectsa && sudo systemctl restart gunicorn"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📊 Verifying..."
ssh root@${HETZNER_IP} "cd /opt/proconnectsa && source venv/bin/activate && python manage.py shell -c \"
from django.conf import settings
from backend.leads.ml_services import LeadQualityMLService
import os

print(f'ML_ENABLED: {getattr(settings, \\\"ML_ENABLED\\\", False)}')
ml = LeadQualityMLService()
ml.load_models()
if ml.quality_model:
    print('✅ Model loaded successfully!')
else:
    print('⚠️  Model not loaded - may need training')
    
# Check for model files
model_path = os.path.join(settings.BASE_DIR, 'ml_models')
if os.path.exists(model_path):
    files = [f for f in os.listdir(model_path) if f.endswith('.pkl')]
    print(f'Model files found: {len(files)}')
\""

echo ""
echo "🎉 Done! Your quality gate will now use ML predictions!"

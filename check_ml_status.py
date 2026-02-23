#!/usr/bin/env python3
"""
Check ML Training Status
Run this to see if ML models are trained and ready
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.procompare.settings')
django.setup()

from backend.leads.ml_monitoring import MLReadinessMonitor
from backend.leads.ml_models import MLModelTrainingLog, MLModelPerformance
from django.utils import timezone
from datetime import timedelta
import os
from django.conf import settings

print("🤖 ML TRAINING STATUS CHECK")
print("=" * 80)
print()

# 1. Check ML Readiness
print("📊 ML READINESS STATUS:")
print("-" * 80)
dashboard_data = MLReadinessMonitor.get_dashboard_data()

print(f"Overall Readiness: {dashboard_data['overall_readiness']}%")
print(f"Services Ready: {dashboard_data['services_ready']}/{dashboard_data['total_services']}")
print()

for service_name, service in dashboard_data['services'].items():
    status = "✅ READY" if service['ready'] else "❌ NOT READY"
    print(f"{service_name:<35} {status:<12} {service['progress']:<25} ({service['completion_rate']:.1%})")

print()
print("💡 RECOMMENDATIONS:")
for rec in dashboard_data['recommendations']:
    print(f"   • {rec}")

print()
print("=" * 80)

# 2. Check for trained model files
print()
print("📁 CHECKING FOR TRAINED MODEL FILES:")
print("-" * 80)
model_path = os.path.join(settings.BASE_DIR, 'ml_models')
if os.path.exists(model_path):
    model_files = [f for f in os.listdir(model_path) if f.endswith('.pkl')]
    if model_files:
        print(f"✅ Found {len(model_files)} model files:")
        for f in sorted(model_files):
            file_path = os.path.join(model_path, f)
            size = os.path.getsize(file_path) / 1024  # KB
            mtime = os.path.getmtime(file_path)
            from datetime import datetime
            mod_time = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d %H:%M')
            print(f"   • {f} ({size:.1f} KB, modified: {mod_time})")
    else:
        print("❌ No model files found in ml_models/")
else:
    print(f"❌ Model directory not found: {model_path}")

print()
print("=" * 80)

# 3. Check training logs
print()
print("📈 RECENT TRAINING LOGS (Last 30 days):")
print("-" * 80)
recent_logs = MLModelTrainingLog.objects.filter(
    created_at__gte=timezone.now() - timedelta(days=30)
).order_by('-created_at')[:10]

if recent_logs.exists():
    for log in recent_logs:
        status_icon = "✅" if log.status == 'completed' else "❌" if log.status == 'failed' else "⏳"
        print(f"{status_icon} {log.model_name} - {log.status}")
        print(f"   Date: {log.created_at.strftime('%Y-%m-%d %H:%M')}")
        if log.final_accuracy:
            print(f"   Accuracy: {log.final_accuracy:.3f}")
        if log.error_message:
            print(f"   Error: {log.error_message[:100]}...")
        print()
else:
    print("❌ No training logs found in last 30 days")
    print("   → Models may not have been trained yet")

print()
print("=" * 80)

# 4. Check if ML is enabled
print()
print("⚙️ ML CONFIGURATION:")
print("-" * 80)
ml_enabled = getattr(settings, 'ML_ENABLED', False)
print(f"ML_ENABLED: {'✅ YES' if ml_enabled else '❌ NO'}")
if not ml_enabled:
    print("   ⚠️  ML is disabled in settings - models won't be used even if trained")

print()
print("=" * 80)
print()
print("✅ Check complete!")
print()
print("💡 NEXT STEPS:")
print("   1. If models are not ready, collect more data")
print("   2. If models are ready but not trained, run: python manage.py train_ml_models")
print("   3. If ML_ENABLED is False, enable it in settings or .env")

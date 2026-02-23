# 🤖 How to Check ML Training Status

Since your platform has been active since October, you should have enough data. Here's how to check:

---

## ✅ Quick Check Methods

### **Method 1: Via API Endpoint (Easiest)**

```bash
# Check ML readiness status
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  https://api.proconnectsa.co.za/api/leads/ml-readiness/
```

This returns JSON with:
- Overall readiness percentage
- Which services are ready
- Progress for each service
- Recommendations

---

### **Method 2: Via Django Management Command**

```bash
# SSH into Hetzner
ssh root@128.140.123.48

# Navigate to project
cd /opt/proconnectsa
source venv/bin/activate

# Check ML readiness
python manage.py check_ml_readiness --format table
```

This shows a nice table with all ML services and their status.

---

### **Method 3: Check Model Files Directly**

```bash
# SSH into Hetzner
ssh root@128.140.123.48

# Check if model files exist
ls -lh /opt/proconnectsa/ml_models/*.pkl

# If files exist, models are trained
# If no files, models need training
```

---

## 📊 What to Look For

### **ML Readiness Requirements:**

| Service | Minimum Data Needed | Priority |
|---------|-------------------|----------|
| **LeadQualityMLService** | 100 leads | HIGH |
| **LeadConversionMLService** | 50 conversions + 20 providers | HIGH |
| **DynamicPricingMLService** | 100 transactions | MEDIUM |
| **GeographicalMLService** | 50 locations + 30 completed jobs | MEDIUM |
| **LeadAccessControlMLService** | 200 access events + 30 providers | HIGH |

### **If You Have:**
- **100+ leads** → Lead Quality ML can be trained ✅
- **50+ lead assignments** → Conversion ML can be trained ✅
- **100+ transactions** → Pricing ML can be trained ✅

---

## 🚀 How to Train Models (If Ready)

### **Option 1: Automatic Training (Recommended)**

The system should auto-train when enough data is available. Check if Celery Beat is running:

```bash
# Check Celery Beat status
ps aux | grep celery

# Check training task logs
tail -f /var/log/proconnectsa/error.log | grep "ML\|training"
```

### **Option 2: Manual Training**

```bash
# SSH into Hetzner
ssh root@128.140.123.48
cd /opt/proconnectsa
source venv/bin/activate

# Train all ready models
python manage.py train_ml_models

# Or train specific service
python manage.py train_ml_models --service LeadQualityMLService
```

---

## 🔍 Check if ML is Actually Being Used

### **In Quality Gate:**
The quality gate in `lead_router.py` uses ML if available:

```python
# This code tries to use ML, falls back to rules if not trained
ml_score = ml_service.predict_lead_quality(lead_data)
if ml_score < 40:
    return False, f"ml_quality_score_too_low:{ml_score:.1f}"
```

**If ML model is not trained:**
- It falls back to rule-based scoring
- No error, just uses rules instead

**If ML model is trained:**
- Uses ML predictions
- More accurate quality scores

---

## 📈 Check Training History

```bash
# SSH into Hetzner
ssh root@128.140.123.48
cd /opt/proconnectsa
source venv/bin/activate

# Check training logs
python manage.py shell -c "
from backend.leads.ml_models import MLModelTrainingLog
from django.utils import timezone
from datetime import timedelta

logs = MLModelTrainingLog.objects.filter(
    created_at__gte=timezone.now() - timedelta(days=90)
).order_by('-created_at')

for log in logs:
    print(f'{log.model_name} - {log.status} - {log.created_at}')
    if log.final_accuracy:
        print(f'  Accuracy: {log.final_accuracy:.3f}')
"
```

---

## ⚙️ Enable ML (If Disabled)

Check if ML is enabled:

```bash
# Check .env file
grep ML_ENABLED /opt/proconnectsa/.env

# Or check Django settings
python manage.py shell -c "
from django.conf import settings
print(f'ML_ENABLED: {getattr(settings, \"ML_ENABLED\", False)}')
"
```

**To enable:**
```bash
# Edit .env file
echo "ML_ENABLED=True" >> /opt/proconnectsa/.env

# Restart services
sudo systemctl restart gunicorn
```

---

## 🎯 Expected Status (Since October)

If you've been active since October, you likely have:

- ✅ **100+ leads** → Lead Quality ML should be ready
- ✅ **50+ assignments** → Conversion ML should be ready
- ✅ **Model files** → Should exist in `/opt/proconnectsa/ml_models/`

**If models aren't trained yet:**
1. Check if enough data exists (use `check_ml_readiness`)
2. If ready, run `train_ml_models` command
3. Enable ML in settings if disabled

---

## 🔧 Quick Fix Script

I've created `check_ml_status.sh` - run it to see everything:

```bash
./check_ml_status.sh
```

Or use the Python script:
```bash
python check_ml_status.py
```

---

## 💡 What This Means for Quality Gate

**Current Quality Gate Behavior:**

1. **If ML is trained:**
   - Uses ML quality score (0-100)
   - Blocks leads with score < 40
   - More accurate filtering

2. **If ML is NOT trained:**
   - Falls back to rule-based checks
   - Still works, just less accurate
   - No errors, graceful degradation

**The quality gate works either way** - ML just makes it better!

---

**Next Step:** Run the check command to see your actual status! 🚀

# 🚀 ML Setup Instructions

## Current Status

✅ **LeadQualityMLService is READY** (143/100 leads - 100% ready!)
❌ **ML is DISABLED** (ML_ENABLED=False)
❌ **Model NOT TRAINED** (no model files found)

---

## What This Means

Your **quality gate currently works** using rule-based checks, but it will work **much better** once ML is trained and enabled!

---

## Quick Setup (3 Steps)

### **Option 1: Run the Automated Script**

```bash
./setup_and_train_ml.sh
```

This will:
1. Run migrations (if needed)
2. Train the Lead Quality ML model
3. Enable ML in settings
4. Restart services
5. Verify everything works

---

### **Option 2: Manual Setup**

```bash
# 1. SSH into server
ssh root@128.140.123.48
cd /opt/proconnectsa
source venv/bin/activate

# 2. Run migrations (create ML tables)
python manage.py migrate --noinput

# 3. Train the Lead Quality ML model
python manage.py train_ml_models --service LeadQualityMLService

# 4. Enable ML
echo "ML_ENABLED=True" >> .env
# Or edit .env and set ML_ENABLED=True

# 5. Restart services
sudo systemctl restart gunicorn

# 6. Verify
python manage.py shell -c "
from backend.leads.ml_services import LeadQualityMLService
ml = LeadQualityMLService()
ml.load_models()
print('✅ Model loaded!' if ml.quality_model else '❌ Model not loaded')
"
```

---

## What Happens After Setup

### **Before (Current):**
- Quality gate uses **rule-based checks only**
- Works, but less accurate
- ML score check is skipped

### **After (With ML Trained):**
- Quality gate uses **ML predictions** (0-100 score)
- More accurate spam/gibberish detection
- Better quality filtering
- Blocks leads with ML score < 40

---

## Expected Results

After training, you should see:
- ✅ Model file: `ml_models/lead_quality_model.pkl`
- ✅ ML_ENABLED: True
- ✅ Quality gate uses ML predictions
- ✅ Better lead filtering

---

## Troubleshooting

### **If training fails:**
```bash
# Check logs
tail -f /var/log/proconnectsa/error.log | grep ML

# Try training again
python manage.py train_ml_models --service LeadQualityMLService
```

### **If model doesn't load:**
```bash
# Check if file exists
ls -lh ml_models/lead_quality_model.pkl

# Check permissions
chmod 644 ml_models/*.pkl
```

### **If ML still disabled:**
```bash
# Check .env file
grep ML_ENABLED .env

# Restart services after changing .env
sudo systemctl restart gunicorn
```

---

## Impact on Quality Gate

**Current behavior:**
```python
# Quality gate tries ML, falls back to rules
ml_score = ml_service.predict_lead_quality(lead_data)
if ml_score < 40:
    return False, f"ml_quality_score_too_low:{ml_score:.1f}"
```

**If ML not trained:**
- `predict_lead_quality()` returns rule-based score
- Still works, just less accurate

**If ML trained:**
- `predict_lead_quality()` returns ML prediction
- Much more accurate spam/gibberish detection
- Better quality filtering

---

## Next Steps

1. **Run the setup script** → `./setup_and_train_ml.sh`
2. **Verify it works** → Check logs for "Model loaded successfully"
3. **Monitor quality gate** → Check logs for ML predictions

---

**Ready to train? Run `./setup_and_train_ml.sh`!** 🚀

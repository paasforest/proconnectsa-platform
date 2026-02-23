# Quick ML Status Check

## Option 1: Run the Script (Easiest)

From your local machine:
```bash
./check_ml_simple.sh
```

This will SSH in, run all checks, and show you the results.

---

## Option 2: Manual SSH Commands

If you prefer to do it manually:

```bash
# 1. SSH into server
ssh root@128.140.123.48

# 2. Navigate and activate
cd /opt/proconnectsa
source venv/bin/activate

# 3. Check ML readiness
python manage.py check_ml_readiness --format table

# 4. Check if model files exist
ls -lh ml_models/*.pkl

# 5. Check if ML is enabled
python manage.py shell -c "from django.conf import settings; print(f'ML_ENABLED: {getattr(settings, \"ML_ENABLED\", False)}')"
```

---

## Option 3: One-Liner (Copy & Paste)

```bash
ssh root@128.140.123.48 "cd /opt/proconnectsa && source venv/bin/activate && python manage.py check_ml_readiness --format table"
```

---

## What You're Looking For

### ✅ Good Signs:
- Services show "✅ READY"
- Model files exist in `ml_models/` directory
- Training logs show "completed" status
- `ML_ENABLED: ✅ YES`

### ⚠️ Needs Attention:
- Services show "❌ NOT READY" → Need more data
- No model files → Need to train models
- No training logs → Models haven't been trained yet
- `ML_ENABLED: ❌ NO` → Need to enable ML

---

## If Models Need Training

```bash
ssh root@128.140.123.48
cd /opt/proconnectsa
source venv/bin/activate

# Train all ready models
python manage.py train_ml_models
```

---

## Important Note

**The quality gate works even if ML isn't trained!**

- If ML is trained → Uses ML predictions (better accuracy)
- If ML is NOT trained → Uses rule-based checks (still works)

No errors either way - it gracefully falls back to rules.

---

**Try running `./check_ml_simple.sh` to see your current status!** 🚀

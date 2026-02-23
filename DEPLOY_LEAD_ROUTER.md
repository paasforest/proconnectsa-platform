# Deploy Lead Router - Step by Step Guide

## ✅ Files Created/Modified

### **New Files:**
- `backend/leads/services/__init__.py`
- `backend/leads/services/lead_router.py`

### **Modified Files:**
- `backend/leads/signals.py` (added route_verified_lead signal)
- `backend/leads/admin.py` (fixed mark_as_verified to trigger signals)

---

## 📋 Deployment Steps

### **Step 1: Commit to Git**

```bash
cd /home/immigrant/work_platform

# Add the new files
git add backend/leads/services/
git add backend/leads/signals.py
git add backend/leads/admin.py

# Commit
git commit -m "feat: Add lead router for automatic provider notifications

- Created lead_router.py with match_providers and notify_providers
- Added route_verified_lead signal handler  
- Fixed admin mark_as_verified to use individual saves (triggers signals)
- Router automatically notifies matching providers when leads are verified
- Sends email + in-app notifications to top 10 matching providers
- Zero cost solution to replace expensive Meta ads"

# Push to GitHub
git push origin main
```

---

### **Step 2: Deploy to Hetzner**

**Option A: Use the deploy script (Recommended)**
```bash
cd /home/immigrant/work_platform
chmod +x deploy_backend_to_hetzner.sh
./deploy_backend_to_hetzner.sh
```

**Option B: Manual deployment**
```bash
# SSH into Hetzner
ssh root@128.140.123.48

# Navigate to project
cd /opt/proconnectsa

# Pull latest changes
git pull origin main

# No migrations needed (no new models)

# Restart services
sudo systemctl restart gunicorn
# Or if using the script's method:
killall gunicorn celery 2>/dev/null || true
sleep 3
source venv/bin/activate
gunicorn --workers 4 --worker-class sync --bind 127.0.0.1:8000 --timeout 120 \
  --access-logfile /var/log/proconnectsa/access.log \
  --error-logfile /var/log/proconnectsa/error.log \
  --log-level info --daemon backend.procompare.wsgi:application
celery -A backend.procompare worker -l info --detach
celery -A backend.procompare beat -l info --detach
```

---

### **Step 3: Verify Deployment**

**Check logs:**
```bash
# On Hetzner server
tail -f /var/log/proconnectsa/error.log | grep LeadRouter
```

**Test in Django shell:**
```bash
# On Hetzner server
cd /opt/proconnectsa
source venv/bin/activate
python manage.py shell

# In shell:
>>> from backend.leads.models import Lead
>>> from backend.leads.services.lead_router import route_lead
>>> lead = Lead.objects.filter(status='verified').first()
>>> if lead:
...     route_lead(lead)
...     print("✅ Router test complete - check logs for results")
```

**Create a test lead:**
```bash
# Create a verified lead via API or admin
# Check logs for router activity
# Check provider email inboxes
```

---

## ✅ What to Expect

### **After Deployment:**

1. **New verified leads** → Providers get email + in-app notification
2. **Admin bulk-verify** → Each lead triggers router
3. **Logs show:**
   ```
   [Signal] Lead {id} is verified — starting routing
   [LeadRouter] Lead {id} ({category}, {city}): matched {N} providers
   [LeadRouter] Notified provider {email} about lead {id}
   ```

---

## 🎯 Confirmation: Web App Only

**Good news:** Since you only have a web app (no mobile app), the implementation is perfect:
- ✅ Email notifications work for all providers
- ✅ In-app notifications work in web dashboard
- ✅ No push notifications needed
- ✅ No mobile app integration needed

**The router sends:**
- Email (works for everyone)
- In-app notification (shows in web dashboard notification bell)

**This is exactly what you need!** 🎉

---

## 📝 Summary

**Files to commit:**
- `backend/leads/services/` (new directory)
- `backend/leads/signals.py` (modified)
- `backend/leads/admin.py` (modified)

**Deployment:**
- Commit & push to git
- Run `deploy_backend_to_hetzner.sh` OR manual deploy
- Restart gunicorn
- Test with a verified lead

**No migrations needed** - Just code changes!

---

**Ready to deploy?** Run the commands above! 🚀

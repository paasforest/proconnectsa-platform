# ProConnectSA Monitoring System

## Overview
Comprehensive monitoring to track ALL system activity including:
- ✅ New user registrations (providers & clients)
- ✅ Login problems and failures  
- ✅ Payment deposits and issues
- ✅ New leads created
- ✅ System errors and problems
- ✅ Real-time email alerts

---

## Quick Check (Run Anytime)

### Option 1: Simple Script (Recommended)
```bash
bash check_status.sh
```

### Option 2: Direct SSH
```bash
ssh root@128.140.123.48 "cd /opt/proconnectsa && source venv/bin/activate && python monitor_system.py"
```

### What You'll See:
- 📊 New registrations in last 24 hours
- ⚠️  Users who registered but never logged in (potential login problems)
- 💰 Payment activity and pending deposits
- 📋 New leads created
- 👥 Provider status (verified, with credits, etc.)
- ⚡ Recent activity in last hour
- 🚨 Where to check error logs

---

## API Endpoints (For Dashboard/App)

All endpoints require admin authentication.

### 1. Full Monitoring Dashboard
```bash
GET https://api.proconnectsa.co.za/api/users/admin/monitoring/dashboard/?hours=24
```
Returns: Registrations, logins, payments, leads, attention needed, system health

### 2. Activity Feed
```bash
GET https://api.proconnectsa.co.za/api/users/admin/monitoring/activity/?limit=50
```
Returns: Real-time feed of all recent actions (registrations, deposits, leads)

### 3. Problem Detection
```bash
GET https://api.proconnectsa.co.za/api/users/admin/monitoring/problems/
```
Returns: Detected problems with severity levels and recommended actions

Example:
```bash
curl -H "Authorization: Token YOUR_ADMIN_TOKEN" \
  "https://api.proconnectsa.co.za/api/users/admin/monitoring/problems/"
```

---

## Real-Time Email Alerts

You'll automatically receive emails when:
- 🆕 New user registers (provider or client)
- 💰 New deposit is made
- 🚫 Multiple failed login attempts (coming soon)

**To change alert email:**
Edit `backend/users/monitoring_signals.py` and change:
```python
ADMIN_EMAIL = 'admin@proconnectsa.co.za'  # Change to your email
```

---

## What Problems Are Detected?

### 1. Login Issues
- Users who registered >24h ago but NEVER logged in
- Multiple failed login attempts (suspicious activity)

### 2. Payment Issues
- Pending deposits waiting >2 hours
- Deposits stuck in processing

### 3. Verification Issues
- Providers with credits but not verified (can't use platform!)
- Long verification delays

### 4. Business Opportunities
- Active providers with 0 credits (potential buyers)
- Repeat customers

---

## Checking Logs Manually

If you see errors in the monitoring, check these logs:

```bash
# Django application errors
ssh root@128.140.123.48 "tail -100 /opt/proconnectsa/backend/logs/django.log"

# Gunicorn web server logs
ssh root@128.140.123.48 "tail -100 /var/log/gunicorn.log"

# System errors (if log directory exists)
ssh root@128.140.123.48 "tail -100 /var/log/proconnectsa/error.log"
```

---

## Setting Up Automatic Monitoring

### Option 1: Cron Job (Run Every Hour)
```bash
# Add to crontab on Hetzner server
0 * * * * cd /opt/proconnectsa && source venv/bin/activate && python monitor_system.py > /tmp/monitor_output.txt 2>&1
```

### Option 2: Slack/Telegram Integration (Future)
Can integrate with Slack or Telegram for instant notifications.

---

## Example Output

```
🔍 PROCONNECTSA SYSTEM MONITOR
======================================================================
Time: 2025-10-08 03:52:55
======================================================================

📊 NEW REGISTRATIONS (Last 24 Hours)
----------------------------------------------------------------------
Total: 2
  10:23 - john@example.com (provider) - ✅ Logged in
  14:45 - jane@example.com (client) - ⚠️  Never logged in

⚠️  POTENTIAL LOGIN PROBLEMS
----------------------------------------------------------------------
Users who registered >24h ago but NEVER logged in: 3
  ⚠️  test@example.com - Registered 2 days ago, never logged in

💰 PAYMENT ACTIVITY (Last 24 Hours)
----------------------------------------------------------------------
New deposits: 1
  05:28 - asantetowela@gmail.com: R160.00 - verified
  ✅ No pending deposits

👥 PROVIDER STATUS
----------------------------------------------------------------------
Total Providers: 5
Verified: 5
With Credits: 1
```

---

## Troubleshooting

### "No activity" showing but I know there are new users
- Check if time zone is correct
- Run with different hours: `?hours=48` or `?hours=168` (week)

### API returns 401 Unauthorized
- You need admin authentication token
- Create admin token or use Django admin login

### Email alerts not working
- Check `ADMIN_EMAIL` in `monitoring_signals.py`
- Verify SendGrid/email settings in `settings.py`
- Check Django logs for email errors

---

## Next Steps

1. ✅ Run `bash check_status.sh` daily to check system health
2. ✅ Set up your admin email to receive alerts
3. ✅ Create admin dashboard (frontend) using API endpoints
4. ✅ Set up automated daily reports (cron job)

---

**Questions? Problems?**
Check the monitoring endpoints first - they'll tell you what's wrong!


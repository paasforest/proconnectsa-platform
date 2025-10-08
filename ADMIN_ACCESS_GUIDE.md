# 🎯 Admin Access & Monitoring Guide

## ✅ **LOGIN IS WORKING!**

### Correct Login Endpoint:
```
POST https://api.proconnectsa.co.za/api/login/
```

**NOT** `/api/users/login/` ❌

### Test Login:
```bash
curl -X POST https://api.proconnectsa.co.za/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"asantetowela@gmail.com","password":"Admin123"}'
```

**Response:**
```json
{
    "success": true,
    "user": {...},
    "token": "YOUR_TOKEN_HERE",
    "message": "Login successful"
}
```

---

## 📊 Accessing Monitoring Dashboard

### 1. **Via Command Line (Quick Check)**
```bash
bash check_status.sh
```

This shows:
- New registrations
- Login problems
- Payment activity
- Provider status
- Recent activity

### 2. **Via API (For Admin Dashboard)**

**Note:** These endpoints require admin authentication.

#### Get Your Admin Token:
```bash
# Login as admin
curl -X POST https://api.proconnectsa.co.za/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_ADMIN_EMAIL","password":"YOUR_PASSWORD"}'

# Copy the "token" from response
```

#### Monitoring Endpoints:

**1. Full Dashboard**
```bash
curl -H "Authorization: Token YOUR_ADMIN_TOKEN" \
  "https://api.proconnectsa.co.za/api/admin/monitoring/dashboard/?hours=24"
```

**2. Activity Feed**
```bash
curl -H "Authorization: Token YOUR_ADMIN_TOKEN" \
  "https://api.proconnectsa.co.za/api/admin/monitoring/activity/?limit=50"
```

**3. Problem Detection**
```bash
curl -H "Authorization: Token YOUR_ADMIN_TOKEN" \
  "https://api.proconnectsa.co.za/api/admin/monitoring/problems/"
```

---

## 🔧 If Login Ever Breaks After Deployment

**This is THE FIX:**

```bash
# SSH to server
ssh root@128.140.123.48

# 1. Check if port 8000 is blocked
lsof -i :8000

# 2. If you see a process, kill it
kill -9 PROCESS_ID

# 3. Restart the service
systemctl stop proconnectsa.service
systemctl start proconnectsa.service

# 4. Check status
systemctl status proconnectsa.service

# 5. Test login
curl -X POST http://127.0.0.1:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"asantetowela@gmail.com","password":"Admin123"}'
```

---

## 🚨 Common Issues & Fixes

### Issue: "Connection in use: ('127.0.0.1', 8000)"
**Fix:**
```bash
ssh root@128.140.123.48
lsof -i :8000
kill -9 PROCESS_ID
systemctl restart proconnectsa.service
```

### Issue: Login returns 404
**Fix:** Check you're using `/api/login/` not `/api/users/login/`

### Issue: Service keeps restarting
**Fix:**
```bash
# Check logs
journalctl -u proconnectsa.service -n 50

# Check error log
tail -50 /var/log/proconnectsa/error.log
```

---

## 📁 Important Files & Locations

| What | Location |
|------|----------|
| **Production Directory** | `/opt/proconnectsa` (✅ correct one) |
| **Wrong Directory** | `/opt/proconnectsa-backend` (❌ don't use) |
| **Service File** | `/etc/systemd/system/proconnectsa.service` |
| **Nginx Config** | `/etc/nginx/sites-available/api.proconnectsa.co.za` |
| **Error Logs** | `/var/log/proconnectsa/error.log` |
| **Access Logs** | `/var/log/proconnectsa/access.log` |
| **Monitoring Script** | `/opt/proconnectsa/monitor_system.py` |

---

## 📞 Quick Commands

| Task | Command |
|------|---------|
| **Check system status** | `bash check_status.sh` |
| **Test login works** | `curl -X POST https://api.proconnectsa.co.za/api/login/ -H "Content-Type: application/json" -d '{"email":"asantetowela@gmail.com","password":"Admin123"}'` |
| **Check service status** | `ssh root@128.140.123.48 "systemctl status proconnectsa.service"` |
| **Restart service** | `ssh root@128.140.123.48 "systemctl restart proconnectsa.service"` |
| **View error logs** | `ssh root@128.140.123.48 "tail -50 /var/log/proconnectsa/error.log"` |
| **Check port 8000** | `ssh root@128.140.123.48 "lsof -i :8000"` |

---

## ✅ CURRENT STATUS

- ✅ Login working (`/api/login/`)
- ✅ Service running (proconnectsa.service)
- ✅ Monitoring system deployed
- ✅ Health endpoint working (`/health/`)
- ✅ Nginx forwarding correctly
- ✅ All authentication working

---

## 🎯 To Access Monitoring in Browser/App

1. Login as admin to get token
2. Use token to call monitoring endpoints
3. Build a simple dashboard that shows:
   - New registrations (from `/api/admin/monitoring/dashboard/`)
   - Problems (from `/api/admin/monitoring/problems/`)
   - Activity feed (from `/api/admin/monitoring/activity/`)

**That's it! Login and monitoring are both working now!** 🎉


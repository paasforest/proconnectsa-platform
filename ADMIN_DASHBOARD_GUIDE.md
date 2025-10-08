# 🎯 Admin Dashboard Access Guide

## 🔐 **Admin Login Credentials**

```
Email: admin@proconnectsa.co.za
Password: Admin123
```

**Login URL:** `https://api.proconnectsa.co.za/api/login/`

---

## 📱 **How to Login (Step by Step)**

### Method 1: Using API (For Custom Dashboard)

```bash
# Step 1: Login and get your admin token
curl -X POST https://api.proconnectsa.co.za/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@proconnectsa.co.za","password":"Admin123"}'
```

**Response will include:**
```json
{
    "success": true,
    "user": {...},
    "token": "YOUR_ADMIN_TOKEN_HERE",
    "message": "Login successful"
}
```

**Step 2: Copy the token and use it for all admin requests**

---

## 📊 **Available Admin Endpoints**

Once you have your token, you can access these admin features:

### 1. **Monitoring Dashboard** (NEW!)
```bash
curl -H "Authorization: Token YOUR_TOKEN" \
  "https://api.proconnectsa.co.za/api/admin/monitoring/dashboard/?hours=24"
```

**Shows:**
- New registrations (last 24 hours)
- Login issues (users who can't login)
- Payment activity & pending deposits
- New leads created
- System health status

### 2. **Activity Feed** (Real-time)
```bash
curl -H "Authorization: Token YOUR_TOKEN" \
  "https://api.proconnectsa.co.za/api/admin/monitoring/activity/?limit=50"
```

**Shows:**
- All recent registrations
- All recent deposits
- All recent leads
- Timeline of activity

### 3. **Problem Detection** (Smart Alerts)
```bash
curl -H "Authorization: Token YOUR_TOKEN" \
  "https://api.proconnectsa.co.za/api/admin/monitoring/problems/"
```

**Automatically detects:**
- Users who registered but can't login
- Pending deposits >2 hours old
- Unverified providers with credits
- Active providers with 0 credits (potential sales)

### 4. **User Management**
```bash
# List all users
curl -H "Authorization: Token YOUR_TOKEN" \
  "https://api.proconnectsa.co.za/api/users/"

# Get specific user details
curl -H "Authorization: Token YOUR_TOKEN" \
  "https://api.proconnectsa.co.za/api/users/{user_id}/"
```

### 5. **Lead Management**
```bash
# List all leads
curl -H "Authorization: Token YOUR_TOKEN" \
  "https://api.proconnectsa.co.za/api/leads/"

# Lead statistics
curl -H "Authorization: Token YOUR_TOKEN" \
  "https://api.proconnectsa.co.za/api/leads/stats/"
```

### 6. **Payment Management**
```bash
# Approve deposit
curl -X POST -H "Authorization: Token YOUR_TOKEN" \
  "https://api.proconnectsa.co.za/api/payments/deposits/{deposit_id}/approve/"

# List pending deposits
curl -H "Authorization: Token YOUR_TOKEN" \
  "https://api.proconnectsa.co.za/api/payments/deposits/?status=pending"
```

### 7. **Manual Credit Addition**
```bash
curl -X POST -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.proconnectsa.co.za/api/wallet/add-credits/" \
  -d '{"user_id": "USER_ID", "credits": 5, "reason": "Manual addition"}'
```

### 8. **Provider Verification**
```bash
# Verify a provider
curl -X POST -H "Authorization: Token YOUR_TOKEN" \
  "https://api.proconnectsa.co.za/api/providers/{provider_id}/verify/"
```

---

## 🖥️ **Building Your Admin Dashboard (Frontend)**

### Simple HTML Example:

```html
<!DOCTYPE html>
<html>
<head>
    <title>ProConnectSA Admin</title>
    <style>
        body { font-family: Arial; padding: 20px; }
        .card { border: 1px solid #ddd; padding: 20px; margin: 10px 0; }
        button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
    </style>
</head>
<body>
    <h1>ProConnectSA Admin Dashboard</h1>
    
    <div class="card">
        <h2>Login</h2>
        <input type="email" id="email" placeholder="Email" value="admin@proconnectsa.co.za">
        <input type="password" id="password" placeholder="Password" value="Admin123">
        <button onclick="login()">Login</button>
    </div>

    <div id="dashboard" style="display:none;">
        <div class="card">
            <h2>Monitoring Dashboard</h2>
            <button onclick="loadDashboard()">Load Stats</button>
            <pre id="stats"></pre>
        </div>

        <div class="card">
            <h2>Problems Detected</h2>
            <button onclick="loadProblems()">Check Problems</button>
            <pre id="problems"></pre>
        </div>

        <div class="card">
            <h2>Recent Activity</h2>
            <button onclick="loadActivity()">Load Activity</button>
            <pre id="activity"></pre>
        </div>
    </div>

    <script>
        let adminToken = '';

        async function login() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const response = await fetch('https://api.proconnectsa.co.za/api/login/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            });

            const data = await response.json();
            
            if (data.success) {
                adminToken = data.token;
                alert('Login successful!');
                document.getElementById('dashboard').style.display = 'block';
            } else {
                alert('Login failed: ' + data.message);
            }
        }

        async function loadDashboard() {
            const response = await fetch('https://api.proconnectsa.co.za/api/admin/monitoring/dashboard/', {
                headers: {'Authorization': 'Token ' + adminToken}
            });
            const data = await response.json();
            document.getElementById('stats').textContent = JSON.stringify(data, null, 2);
        }

        async function loadProblems() {
            const response = await fetch('https://api.proconnectsa.co.za/api/admin/monitoring/problems/', {
                headers: {'Authorization': 'Token ' + adminToken}
            });
            const data = await response.json();
            document.getElementById('problems').textContent = JSON.stringify(data, null, 2);
        }

        async function loadActivity() {
            const response = await fetch('https://api.proconnectsa.co.za/api/admin/monitoring/activity/', {
                headers: {'Authorization': 'Token ' + adminToken}
            });
            const data = await response.json();
            document.getElementById('activity').textContent = JSON.stringify(data, null, 2);
        }
    </script>
</body>
</html>
```

Save this as `admin.html` and open in your browser!

---

## 📊 **Quick Dashboard via Command Line**

```bash
# Set your token
export ADMIN_TOKEN="YOUR_TOKEN_HERE"

# Get monitoring dashboard
curl -H "Authorization: Token $ADMIN_TOKEN" \
  "https://api.proconnectsa.co.za/api/admin/monitoring/dashboard/" \
  | python3 -m json.tool

# Check for problems
curl -H "Authorization: Token $ADMIN_TOKEN" \
  "https://api.proconnectsa.co.za/api/admin/monitoring/problems/" \
  | python3 -m json.tool
```

---

## 🔄 **Complete Admin Workflow**

### Daily Morning Check:
```bash
# 1. Login
TOKEN=$(curl -s -X POST https://api.proconnectsa.co.za/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@proconnectsa.co.za","password":"Admin123"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

# 2. Check dashboard
curl -s -H "Authorization: Token $TOKEN" \
  "https://api.proconnectsa.co.za/api/admin/monitoring/dashboard/" \
  | python3 -m json.tool

# 3. Check problems
curl -s -H "Authorization: Token $TOKEN" \
  "https://api.proconnectsa.co.za/api/admin/monitoring/problems/" \
  | python3 -m json.tool
```

### Approve a Deposit:
```bash
# List pending deposits
curl -H "Authorization: Token $TOKEN" \
  "https://api.proconnectsa.co.za/api/payments/deposits/?status=pending"

# Approve deposit
curl -X POST -H "Authorization: Token $TOKEN" \
  "https://api.proconnectsa.co.za/api/payments/deposits/{deposit_id}/approve/"
```

### Add Credits Manually:
```bash
curl -X POST -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.proconnectsa.co.za/api/wallet/add-credits/" \
  -d '{
    "user_id": "USER_ID_HERE",
    "credits": 5,
    "reason": "Promotional credits"
  }'
```

---

## 🎯 **What Each Dashboard Shows**

### Monitoring Dashboard:
- **Registrations**: New users in last X hours
- **Logins**: Users who logged in recently, users who can't login
- **Payments**: New deposits, pending deposits, total deposited
- **Leads**: New leads, active leads
- **Attention Needed**: Items requiring manual action
- **System Health**: Overall platform status

### Problem Detection:
- **Login Issues**: Users registered >24h but never logged in
- **Payment Issues**: Deposits pending >2 hours
- **Verification Issues**: Providers with credits but unverified
- **Business Opportunities**: Active providers with 0 credits

### Activity Feed:
- Real-time chronological list of all actions
- Registrations, deposits, leads in one timeline
- Great for tracking what's happening right now

---

## 📞 **Admin Quick Commands**

| Task | Command |
|------|---------|
| **Login as admin** | See "Step 1" above |
| **View dashboard** | `bash check_status.sh` (command line) |
| **Check problems** | Use Problem Detection endpoint |
| **Approve deposit** | Use Payment Management endpoint |
| **Add credits** | Use Manual Credit Addition endpoint |
| **Verify provider** | Use Provider Verification endpoint |

---

## ✅ **You're Now Set Up!**

**Admin Email:** `admin@proconnectsa.co.za`  
**Admin Password:** `Admin123`

**Next Steps:**
1. Login using the API endpoint
2. Save your token
3. Use token to access monitoring endpoints
4. Build a proper frontend dashboard (or use the HTML example above)

**🎉 You now have full admin access to monitor and manage your platform!**


# 📋 How to Check New Provider Sign-ups (Admin Guide)

## ✅ **Simple Method: Django Admin Interface**

New provider sign-ups are **automatically recorded** and visible in the Django admin!

### **Step 1: Login to Admin**
1. Go to: `https://api.proconnectsa.co.za/admin/`
2. Login with:
   - **Email:** `admin@proconnectsa.co.za`
   - **Password:** `Admin123`

### **Step 2: View New Providers**
1. Click on **"Provider Profiles"** in the admin sidebar
2. **Providers are automatically sorted by newest first** (`-created_at`)
3. You'll see:
   - Business Name
   - User Email
   - Verification Status
   - Subscription Tier
   - Credit Balance
   - **Created At** (shows when they signed up)

### **Step 3: Filter New Providers**
- Use the **"Created At"** filter on the right sidebar
- Select **"Today"** or **"Past 7 days"** to see recent sign-ups
- Or use **"Verification Status"** filter to see pending verifications

---

## 🎯 **Alternative: Admin Monitoring Dashboard API**

### **Via API (For Custom Dashboard)**

1. **Login and get admin token:**
   ```bash
   curl -X POST https://api.proconnectsa.co.za/api/login/ \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@proconnectsa.co.za","password":"Admin123"}'
   ```

2. **Check new providers (last 7 days):**
   ```bash
   curl -H "Authorization: Token YOUR_TOKEN" \
     "https://api.proconnectsa.co.za/api/users/admin/monitoring/dashboard/?hours=168"
   ```

   **Response includes:**
   ```json
   {
     "registrations": {
       "total": 5,
       "providers": 3,
       "clients": 2,
       "details": [
         {
           "email": "provider@example.com",
           "name": "John Doe",
           "type": "provider",
           "registered_at": "2026-02-16T10:30:00Z",
           "is_active": true,
           "has_logged_in": true
         }
       ]
     }
   }
   ```

---

## 📊 **What You'll See in Admin**

### **Provider Profiles List:**
- ✅ **Business Name** - The provider's business name
- ✅ **User** - Email address
- ✅ **Verification Status** - pending/verified/rejected
- ✅ **Subscription Tier** - pay_as_you_go/basic/advanced/pro
- ✅ **Credit Balance** - Current credits
- ✅ **Created At** - **When they signed up** (newest first!)

### **Click on any provider to see:**
- Full business details
- Contact information
- Service categories
- Verification documents
- Payment history
- Lead activity

---

## 🔍 **Quick Check Methods**

### **Method 1: Django Admin (Easiest)**
1. Login: `https://api.proconnectsa.co.za/admin/`
2. Click: **Provider Profiles**
3. Done! Newest providers are at the top

### **Method 2: Verification Page**
1. Login: `https://api.proconnectsa.co.za/admin/`
2. Go to: **Verifications** (shows pending providers)
3. See all providers waiting for verification

### **Method 3: Monitoring Dashboard**
1. Use API endpoint: `/api/users/admin/monitoring/dashboard/?hours=168`
2. See all new registrations with details

---

## 💡 **Pro Tips**

1. **Bookmark the admin page** for quick access
2. **Check daily** - New providers appear automatically
3. **Filter by "Pending"** - See providers needing verification
4. **Sort by "Created At"** - Already sorted newest first by default!

---

## ✅ **Summary**

**New provider sign-ups are automatically recorded!**

- ✅ Django Admin shows all providers (newest first)
- ✅ No manual checking needed
- ✅ Just login and view Provider Profiles
- ✅ Filter by date or verification status
- ✅ All details visible in one place

**That's it! Simple and automatic.** 🎯

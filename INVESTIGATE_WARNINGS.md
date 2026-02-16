# 🔍 Investigate Admin Dashboard Warnings

## ⚠️ **Current Warnings:**

1. **37 users registered >24h ago but never logged in**
2. **10 deposits pending >2 hours**

---

## ✅ **These Warnings Are REAL Database Queries**

The warnings come from actual database checks:
- ✅ Users who registered >24 hours ago AND have `last_login = NULL`
- ✅ Deposits with `status = 'pending'` AND created >2 hours ago

**So the numbers are accurate!** But we need to check if they're **legitimate issues** or **false positives**.

---

## 🔍 **How to Investigate**

### **Option 1: Check in Admin Dashboard (Easiest)**

The admin dashboard now shows:
- **User emails** for users who never logged in
- **Deposit details** for pending deposits

Look at the warning details to see:
- Are these real users or test accounts?
- Are these real deposits or test data?

### **Option 2: Check via API**

1. **Get admin token:**
   ```bash
   curl -X POST https://api.proconnectsa.co.za/api/login/ \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@proconnectsa.co.za","password":"Admin123!"}'
   ```

2. **Get problem details:**
   ```bash
   curl -H "Authorization: Token YOUR_TOKEN" \
     "https://api.proconnectsa.co.za/api/users/admin/monitoring/problems/"
   ```

   Response includes:
   - `users`: List of emails for users who never logged in
   - `details`: List of deposit details with user, amount, age

### **Option 3: Check via Server (Most Detailed)**

SSH into server:
```bash
ssh root@128.140.123.48
cd /opt/proconnectsa
source venv/bin/activate
python manage.py shell
```

Then run:
```python
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from backend.payments.models import DepositRequest

User = get_user_model()

# Check users
day_ago = timezone.now() - timedelta(hours=24)
never_logged = User.objects.filter(date_joined__lt=day_ago, last_login__isnull=True)
print(f"Users never logged in: {never_logged.count()}")

# Show first 10
for u in never_logged[:10]:
    print(f"{u.email} - {u.user_type} - Registered {(timezone.now() - u.date_joined).days} days ago")

# Check deposits
two_hours_ago = timezone.now() - timedelta(hours=2)
old_deposits = DepositRequest.objects.filter(status='pending', created_at__lt=two_hours_ago)
print(f"\nPending deposits: {old_deposits.count()}")

for d in old_deposits[:10]:
    hours = (timezone.now() - d.created_at).total_seconds() / 3600
    print(f"{d.account.user.email}: R{d.amount} - {hours:.1f}h ago - Ref: {d.reference_number}")
```

---

## 🎯 **What to Look For**

### **Users Who Never Logged In:**

**Likely Issues:**
- Real users who can't login (password issues, email verification, etc.)
- Users who forgot their password
- Users experiencing login errors

**Not Issues (Can Ignore):**
- Test accounts (emails with "test", "admin", "example")
- Staff/admin accounts
- Very old inactive accounts

**Action:**
- If real users → Send welcome emails, check login system
- If test accounts → Can be cleaned up

### **Pending Deposits:**

**Likely Issues:**
- Real deposits waiting for bank reconciliation
- Bank reconciliation not running
- Deposits that need manual approval

**Not Issues:**
- Test deposits
- Very old deposits (might be cancelled)

**Action:**
- Check if bank reconciliation is working
- Manually approve valid deposits
- Verify bank references

---

## 📊 **Expected Results**

### **If Warnings Are Legitimate:**

1. **37 users never logged in:**
   - Some might be real users needing help
   - Some might be test accounts
   - Action: Review list, send emails to real users

2. **10 deposits pending:**
   - Real deposits waiting for approval
   - Bank reconciliation might not be working
   - Action: Check reconciliation, approve deposits

### **If Warnings Are False Positives:**

- Adjust problem detection thresholds
- Filter out test accounts
- Mark old deposits as cancelled

---

## ✅ **Next Steps**

1. **Check the warning details** in admin dashboard (now shows user emails and deposit info)
2. **Review the list** to see if they're real issues
3. **Take action** based on what you find:
   - Send welcome emails to real users
   - Approve valid deposits
   - Clean up test accounts

---

## 💡 **Quick Fixes**

### **If Most Are Test Accounts:**

You can clean them up:
```python
# In Django shell
from django.contrib.auth import get_user_model
User = get_user_model()

# Find test accounts
test_users = User.objects.filter(
    email__icontains='test'
) | User.objects.filter(
    email__icontains='example'
)

# Delete them (be careful!)
# test_users.delete()
```

### **If Deposits Need Approval:**

Check Finance Dashboard → Pending Deposits → Approve manually

---

## 📋 **Summary**

✅ **Warnings are accurate** - They're real database queries  
🔍 **Investigate** - Check if they're legitimate issues  
🎯 **Take action** - Based on what you find  

The enhanced admin dashboard now shows more details to help you investigate! 🚀

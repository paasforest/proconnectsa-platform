# 🔍 Verify Admin Dashboard Warnings Guide

## ⚠️ **Warnings You're Seeing:**

1. **37 users registered >24h ago but never logged in**
2. **10 deposits pending >2 hours**

---

## ✅ **How to Verify These Warnings**

### **Method 1: Check via Admin Dashboard API**

1. **Get your admin token** (if you don't have it):
   ```bash
   curl -X POST https://api.proconnectsa.co.za/api/login/ \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@proconnectsa.co.za","password":"Admin123!"}'
   ```

2. **Check problem details:**
   ```bash
   curl -H "Authorization: Token YOUR_TOKEN" \
     "https://api.proconnectsa.co.za/api/users/admin/monitoring/problems/"
   ```

   This will show:
   - List of users who never logged in
   - List of pending deposits with details
   - Age of each item

---

### **Method 2: Check via Server (Most Accurate)**

SSH into your server and run:

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

# 1. Check users who never logged in
day_ago = timezone.now() - timedelta(hours=24)
never_logged_in = User.objects.filter(
    date_joined__lt=day_ago,
    last_login__isnull=True
).order_by('-date_joined')

print(f"Users never logged in: {never_logged_in.count()}")
print("\nFirst 10 users:")
for user in never_logged_in[:10]:
    days = (timezone.now() - user.date_joined).days
    print(f"  - {user.email} ({user.user_type}) - Registered {days} days ago")

# 2. Check pending deposits
two_hours_ago = timezone.now() - timedelta(hours=2)
old_deposits = DepositRequest.objects.filter(
    status='pending',
    created_at__lt=two_hours_ago
).select_related('account__user')

print(f"\nPending deposits >2h: {old_deposits.count()}")
print("\nDeposit details:")
for dep in old_deposits[:10]:
    hours = (timezone.now() - dep.created_at).total_seconds() / 3600
    print(f"  - {dep.account.user.email}: R{dep.amount} ({hours:.1f}h ago)")
    print(f"    Reference: {dep.reference_number}")
```

---

## 🔍 **What to Look For**

### **Users Who Never Logged In:**

**Legitimate Issues:**
- ✅ Real users who registered but can't login
- ✅ Users who forgot their password
- ✅ Users experiencing login errors

**Not Issues (Can Ignore):**
- ❌ Test accounts (emails with "test", "admin", etc.)
- ❌ Staff/admin accounts
- ❌ Inactive accounts from old testing

**Action Needed:**
- Send welcome emails to real users
- Check if login system is working
- Clean up test accounts

### **Pending Deposits:**

**Legitimate Issues:**
- ✅ Real deposits waiting for approval
- ✅ Bank reconciliation not working
- ✅ Deposits that need manual review

**Not Issues (Can Ignore):**
- ❌ Test deposits
- ❌ Very old deposits (might be cancelled)

**Action Needed:**
- Check bank reconciliation is running
- Manually approve deposits if valid
- Verify bank references match

---

## 📋 **Quick Check Commands**

### **Check Users Never Logged In:**
```python
# In Django shell
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()
day_ago = timezone.now() - timedelta(hours=24)
count = User.objects.filter(date_joined__lt=day_ago, last_login__isnull=True).count()
print(f"Users never logged in: {count}")
```

### **Check Pending Deposits:**
```python
# In Django shell
from backend.payments.models import DepositRequest
from django.utils import timezone
from datetime import timedelta

two_hours_ago = timezone.now() - timedelta(hours=2)
count = DepositRequest.objects.filter(status='pending', created_at__lt=two_hours_ago).count()
print(f"Pending deposits >2h: {count}")
```

---

## ✅ **After Verification**

### **If Warnings Are True:**

1. **For Users Never Logged In:**
   - Send welcome emails
   - Check login system
   - Clean up test accounts

2. **For Pending Deposits:**
   - Check bank reconciliation
   - Approve valid deposits
   - Investigate why deposits aren't auto-approved

### **If Warnings Are False:**

- Check if the problem detection logic needs adjustment
- Some users might be legitimate inactive accounts
- Some deposits might be test data

---

## 🎯 **Summary**

The warnings are **real database queries**, so they're likely accurate. However:

1. **37 users never logged in** - Could include test accounts
2. **10 deposits pending** - Need to check if bank reconciliation is working

**Next Step:** Run the verification script above to see the actual data and decide what action is needed!

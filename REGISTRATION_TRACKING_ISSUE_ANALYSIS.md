# 🔍 Registration Tracking Issue - Analysis

## 📅 **Timeline**

- **Registration Date**: 17 Feb 2026, 13:30 (when premium was requested)
- **Current Date**: ~17-18 Feb 2026
- **Time Window**: Last 24 hours (default)
- **Expected**: Should show in admin dashboard
- **Actual**: Shows 0 new registrations ❌

---

## 🔍 **Root Cause Analysis**

### **Issue 1: Field Mismatch**

**Current Code:**
```python
# backend/users/admin_monitoring.py line 65
new_users = User.objects.filter(date_joined__gte=time_window)
```

**Problem:**
- Uses `date_joined` (from Django's AbstractUser)
- But User model also has `created_at` field
- User model orders by `created_at`, not `date_joined`
- This suggests inconsistency

**User Model:**
```python
class User(AbstractUser):
    # date_joined comes from AbstractUser (auto-set by Django)
    created_at = models.DateTimeField(auto_now_add=True)  # Also auto-set
    
    class Meta:
        ordering = ['-created_at']  # Orders by created_at, not date_joined!
```

**Registration Flow:**
```python
# backend/users/serializers.py line 195
user = User.objects.create_user(password=password, **validated_data)
```

**Django's `create_user()` should:**
- ✅ Set `date_joined` automatically (from AbstractUser)
- ✅ Set `created_at` automatically (from User model)

**But:**
- ⚠️ If `date_joined` is not set correctly, filtering fails
- ⚠️ `created_at` is more reliable (explicitly defined)

---

### **Issue 2: Timezone Mismatch**

**Current Code:**
```python
time_window = timezone.now() - timedelta(hours=hours)
new_users = User.objects.filter(date_joined__gte=time_window)
```

**Potential Issues:**
1. **Server Timezone**: What timezone is the server in?
2. **Database Timezone**: What timezone is the database storing?
3. **Comparison**: Is `date_joined` in the same timezone as `timezone.now()`?

**Example:**
- User registered: 17 Feb 2026, 13:30 (SAST - UTC+2)
- Server time: 17 Feb 2026, 11:30 (UTC)
- Time window: 24 hours ago = 16 Feb 2026, 11:30 (UTC)
- `date_joined` stored: 17 Feb 2026, 13:30 (SAST) = 17 Feb 2026, 11:30 (UTC)
- Should match, but if timezone conversion is wrong, it won't.

---

### **Issue 3: Field Not Set**

**Possible Scenario:**
- `date_joined` might not be set during registration
- Django's `create_user()` should set it, but maybe it's not?
- `created_at` is definitely set (auto_now_add=True)

**Evidence:**
- User model orders by `created_at`, not `date_joined`
- This suggests `created_at` is more reliable

---

## 💡 **Solutions (Discussion Only)**

### **Solution 1: Use `created_at` Instead of `date_joined`**

**Why:**
- ✅ `created_at` is explicitly defined in User model
- ✅ `auto_now_add=True` ensures it's always set
- ✅ User model already orders by `created_at`
- ✅ More consistent with other models (DepositRequest, Lead use `created_at`)

**Change:**
```python
# FROM:
new_users = User.objects.filter(date_joined__gte=time_window)

# TO:
new_users = User.objects.filter(created_at__gte=time_window)
```

**Pros:**
- ✅ More reliable
- ✅ Consistent with other models
- ✅ Explicitly defined

**Cons:**
- ⚠️ `date_joined` is Django standard (but not critical)

---

### **Solution 2: Use Both Fields (Fallback)**

**Why:**
- Covers both cases
- More robust

**Change:**
```python
from django.db.models import Q

new_users = User.objects.filter(
    Q(date_joined__gte=time_window) | Q(created_at__gte=time_window)
).distinct()
```

**Pros:**
- ✅ Catches users regardless of which field is set
- ✅ Most robust

**Cons:**
- ⚠️ Slightly more complex
- ⚠️ Might show duplicates (but distinct() handles this)

---

### **Solution 3: Debug Current Issue**

**Steps:**
1. Check if `date_joined` is actually set for "Terzen plumbing"
2. Check timezone settings
3. Check time window calculation
4. Add logging to see what's happening

**Query to Check:**
```python
# In Django shell:
from backend.users.models import User
from django.utils import timezone
from datetime import timedelta

user = User.objects.get(email='terence@terzenplumbing.co.za')
print(f"date_joined: {user.date_joined}")
print(f"created_at: {user.created_at}")
print(f"Now: {timezone.now()}")
print(f"24h ago: {timezone.now() - timedelta(hours=24)}")
print(f"date_joined >= 24h ago: {user.date_joined >= timezone.now() - timedelta(hours=24)}")
```

---

## 🎯 **Recommended Solution**

### **Use `created_at` Instead of `date_joined`**

**Reasons:**
1. ✅ More reliable (explicitly defined)
2. ✅ Consistent with other models
3. ✅ User model already orders by `created_at`
4. ✅ Less likely to have timezone issues

**Implementation:**
```python
# backend/users/admin_monitoring.py line 65
# Change from:
new_users = User.objects.filter(date_joined__gte=time_window).order_by('-date_joined')

# To:
new_users = User.objects.filter(created_at__gte=time_window).order_by('-created_at')
```

**Also Update:**
```python
# Line 107 - registered_at field
'registered_at': u.created_at.isoformat(),  # Instead of u.date_joined.isoformat()
```

---

## 🔧 **Additional Improvements**

### **1. Add Time Window Options**

**Current:**
- Default: 24 hours
- No way to change it

**Improvement:**
- Add filter: "Last 24h", "Last 7 days", "Last 30 days", "All time"
- Let admin choose time window

### **2. Show Registration Details**

**Current:**
- Only shows count
- No details

**Improvement:**
- Show list of new registrations
- Show email, name, type, registration time
- Click to view full details

### **3. Add Debugging**

**Current:**
- No logging
- Hard to debug

**Improvement:**
- Add logging to see:
  - Time window calculation
  - Number of users found
  - Field values

---

## 📊 **Current State**

### **What Works:**
- ✅ Registration creates User with both `date_joined` and `created_at`
- ✅ Admin monitoring API exists
- ✅ Frontend displays the count

### **What Doesn't Work:**
- ❌ New registrations not showing (count = 0)
- ❌ Possible field mismatch (`date_joined` vs `created_at`)
- ❌ Possible timezone issue

### **What Needs Fixing:**
- 🔧 Use `created_at` instead of `date_joined`
- 🔧 Verify timezone settings
- 🔧 Add better error handling

---

## ❓ **Questions to Answer**

1. **Is `date_joined` actually set for "Terzen plumbing"?**
   - Check database directly
   - Compare with `created_at`

2. **Is there a timezone issue?**
   - Check server timezone
   - Check database timezone
   - Check time window calculation

3. **Should we use `created_at` instead?**
   - More reliable
   - Consistent with other models
   - Already used for ordering

---

## 🎯 **Next Steps (Discussion Only)**

1. **Check Database:**
   - Query "Terzen plumbing" user
   - Check `date_joined` vs `created_at`
   - Check timezone

2. **Test API:**
   - Call monitoring API directly
   - Check response
   - Check time window calculation

3. **Fix Based on Findings:**
   - If `date_joined` not set → Use `created_at`
   - If timezone issue → Fix timezone
   - If API broken → Fix API

---

## 💬 **What Do You Think?**

1. Should we use `created_at` instead of `date_joined`?
2. Should we check the database first to see what's actually stored?
3. Should we add time window options (24h, 7d, 30d, all time)?
4. Should we add debugging/logging to see what's happening?

**Let's discuss before making any changes!**

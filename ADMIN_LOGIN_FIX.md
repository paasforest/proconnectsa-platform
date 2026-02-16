# 🔐 Admin Login Password Fix

## ⚠️ **Password Issue Found**

The password might be **`Admin123!`** (with exclamation mark) instead of `Admin123`.

---

## 🔑 **Try These Passwords:**

### **Option 1: With Exclamation Mark**
```
Email: admin@proconnectsa.co.za
Password: Admin123!
```

### **Option 2: Without Exclamation Mark**
```
Email: admin@proconnectsa.co.za
Password: Admin123
```

---

## 🔧 **If Neither Works - Reset Admin Password**

The admin user might not exist or password might be different. Let's reset it:

### **Method 1: Via Server (Recommended)**

SSH into your Hetzner server and run:

```bash
ssh root@128.140.123.48
cd /opt/proconnectsa
source venv/bin/activate
python manage.py shell
```

Then run:
```python
from django.contrib.auth import get_user_model
User = get_user_model()

email = 'admin@proconnectsa.co.za'
password = 'Admin123!'

# Get or create admin user
user, created = User.objects.get_or_create(
    email=email,
    defaults={
        'username': 'admin',
        'first_name': 'Admin',
        'last_name': 'User',
        'user_type': 'admin',
        'is_staff': True,
        'is_superuser': True,
        'is_active': True
    }
)

# Set password
user.set_password(password)
user.user_type = 'admin'
user.is_staff = True
user.is_superuser = True
user.is_active = True
user.save()

# Verify password
if user.check_password(password):
    print(f'✅ Admin user ready!')
    print(f'   Email: {email}')
    print(f'   Password: {password}')
else:
    print('❌ Password verification failed')
```

### **Method 2: Use Existing Script**

If you have access to the server, run:
```bash
cd /opt/proconnectsa
source venv/bin/activate
python create_admin_user.py
```

---

## ✅ **After Reset, Try Login:**

1. Go to: `https://www.proconnectsa.co.za/admin`
2. Email: `admin@proconnectsa.co.za`
3. Password: `Admin123!` (with exclamation mark)

---

## 🧪 **Test Login via API**

Test if credentials work:
```bash
curl -X POST https://api.proconnectsa.co.za/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@proconnectsa.co.za","password":"Admin123!"}'
```

Should return: `"success": true` with `"user_type": "admin"`

---

## 📋 **Summary**

**Most Likely Password:** `Admin123!` (with exclamation mark)

If that doesn't work, reset the admin user using the methods above.

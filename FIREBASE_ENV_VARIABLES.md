# 🔥 Firebase Environment Variables

## 📱 Frontend (Vercel) Environment Variables

Add these to your Vercel project settings:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCYRMOM4QlFvF2Aiz0b_S9OlDC6kt0Ey00
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=proconnectsa-c521c.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=proconnectsa-c521c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=proconnectsa-c521c.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=547788454489
NEXT_PUBLIC_FIREBASE_APP_ID=1:547788454489:web:82af90777fda0224d04f48
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BE6QY39MVold1j2s98d5xmGSYcRIKIKaCfe6phiVGc5c4m9F9Wxgeyf6QraRBPYJKwwMHySL9ZuT41JHbHHOITY
```

## 🔧 Backend (Hetzner) Environment Variables

Add these to your `/opt/proconnectsa/.env` file on the server:

```bash
FIREBASE_PROJECT_ID=proconnectsa-c521c
FIREBASE_CREDENTIALS_PATH=/opt/proconnectsa/firebase-credentials.json
```

**Note:** You still need to upload `firebase-credentials.json` (service account key) to the server.

---

## 📋 How to Add to Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable above (one by one)
4. Make sure they're set for **Production**, **Preview**, and **Development**
5. Redeploy your frontend

---

## 📋 How to Add to Hetzner

```bash
# SSH into server
ssh root@128.140.123.48

# Edit .env file
nano /opt/proconnectsa/.env

# Add the Firebase variables
FIREBASE_PROJECT_ID=proconnectsa-c521c
FIREBASE_CREDENTIALS_PATH=/opt/proconnectsa/firebase-credentials.json

# Save and exit (Ctrl+X, then Y, then Enter)
```

---

## ✅ Verification

After adding variables, verify they're loaded:

**Frontend (in browser console):**
```javascript
console.log(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
// Should output: proconnectsa-c521c
```

**Backend (on server):**
```bash
cd /opt/proconnectsa
source venv/bin/activate
python manage.py shell
>>> import os
>>> from django.conf import settings
>>> print(os.getenv('FIREBASE_PROJECT_ID'))
# Should output: proconnectsa-c521c
```

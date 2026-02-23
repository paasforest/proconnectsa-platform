# 🔧 Vercel Environment Variables - Fixed Names

## ✅ Use These Variable Names (Without "KEY" at the end)

If `NEXT_PUBLIC_FIREBASE_API_KEY` gives an error, use these names instead:

```
NEXT_PUBLIC_FIREBASE_API
AIzaSyCYRMOM4QlFvF2Aiz0b_S9OlDC6kt0Ey00

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
proconnectsa-c521c.firebaseapp.com

NEXT_PUBLIC_FIREBASE_PROJECT_ID
proconnectsa-c521c

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
proconnectsa-c521c.firebasestorage.app

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
547788454489

NEXT_PUBLIC_FIREBASE_APP_ID
1:547788454489:web:82af90777fda0224d04f48

NEXT_PUBLIC_FIREBASE_VAPID_KEY
BE6QY39MVold1j2s98d5xmGSYcRIKIKaCfe6phiVGc5c4m9F9Wxgeyf6QraRBPYJKwwMHySL9ZuT41JHbHHOITY
```

**Note:** Changed `NEXT_PUBLIC_FIREBASE_API_KEY` → `NEXT_PUBLIC_FIREBASE_API`

The code will check both names, so either will work!

---

## 📋 How to Add in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click **Add New**
3. For each variable:
   - **Name:** (use the names above)
   - **Value:** (use the values above)
   - **Environment:** Select all (Production, Preview, Development)
4. Click **Save**

---

**The code is updated to support both naming conventions!** ✅

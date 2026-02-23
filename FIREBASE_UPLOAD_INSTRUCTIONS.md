# 📤 Firebase Credentials Upload - Simple Instructions

## 📁 File to Upload

**File name:** `firebase-credentials.json.json`  
**Location:** On your local machine (wherever you downloaded it from Firebase)

---

## 🚀 Upload Command

Run this from your **local machine** (where the file is located):

```bash
scp firebase-credentials.json.json root@128.140.123.48:/opt/proconnectsa/
```

**That's it!** Just one command.

---

## ✅ After Upload

Once uploaded, I can:
1. Set proper permissions
2. Test Firebase connection
3. Verify everything works

---

## 📋 What This File Is

This is the **Firebase Service Account Key** that you downloaded from:
- Firebase Console → Project Settings → Service Accounts → "Generate New Private Key"

It contains credentials needed for the backend to send push notifications.

---

**Just run that one `scp` command and let me know when it's done!** 🚀

# 🔥 Firebase Cloud Messaging (FCM) Setup Guide

## 📋 Prerequisites
- ✅ Firebase account created
- ✅ Firebase project created
- ✅ Web app added to Firebase project

---

## 🔑 Step 1: Get Firebase Credentials

### **Option A: Service Account Key (Recommended for Backend)**

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Click **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the JSON file as `firebase-credentials.json`

**This file contains:**
- `project_id`
- `private_key`
- `client_email`
- Other credentials needed for server-side push

---

### **Option B: Web App Config (For Frontend)**

1. Go to Firebase Console
2. Select your project
3. Go to **Project Settings**
4. Scroll to **Your apps** section
5. Click on your web app (or create one)
6. Copy the config object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

**We'll need this for the frontend!**

---

## 🚀 Step 2: Upload Credentials to Server

### **From Your Local Machine:**

```bash
# Upload service account key to Hetzner server
scp firebase-credentials.json root@128.140.123.48:/opt/proconnectsa/

# SSH in and verify it's there
ssh root@128.140.123.48
cd /opt/proconnectsa
ls -la firebase-credentials.json

# Set proper permissions (important for security)
chmod 600 firebase-credentials.json
chown root:root firebase-credentials.json
```

---

## 🔐 Step 3: Add to Environment Variables

### **On Hetzner Server:**

```bash
# Edit your .env file
nano /opt/proconnectsa/.env

# Add these lines:
FIREBASE_CREDENTIALS_PATH=/opt/proconnectsa/firebase-credentials.json
FIREBASE_PROJECT_ID=your-project-id
```

**Or if you prefer to store credentials in environment variables directly:**

```bash
# Read the JSON file and extract values
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

---

## 📦 Step 4: Install Firebase Admin SDK

### **On Hetzner Server:**

```bash
cd /opt/proconnectsa
source venv/bin/activate
pip install firebase-admin
```

---

## ✅ Step 5: Verify Setup

### **Test Script (Create on Server):**

```bash
# Create test file
cat > /opt/proconnectsa/test_firebase.py << 'EOF'
import os
import firebase_admin
from firebase_admin import credentials, messaging

# Initialize Firebase
cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', '/opt/proconnectsa/firebase-credentials.json')
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

print("✅ Firebase initialized successfully!")
print(f"Project ID: {firebase_admin.get_app().project_id}")
EOF

# Run test
python test_firebase.py
```

---

## 📱 Step 6: Get Frontend Config

### **For Frontend (Next.js):**

You'll need to add these to your Vercel environment variables:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## 🎯 Next Steps

Once credentials are uploaded:

1. ✅ **Backend:** Initialize Firebase Admin SDK
2. ✅ **Backend:** Create push notification service
3. ✅ **Frontend:** Initialize Firebase SDK
4. ✅ **Frontend:** Request notification permission
5. ✅ **Frontend:** Subscribe to FCM
6. ✅ **Backend:** Send push notifications
7. ✅ **Service Worker:** Handle push events

---

## 🔒 Security Notes

1. **Never commit `firebase-credentials.json` to Git**
   - Add to `.gitignore`
   - Keep it secure on server only

2. **Set proper file permissions:**
   ```bash
   chmod 600 firebase-credentials.json
   ```

3. **Use environment variables when possible:**
   - More secure than file-based credentials
   - Easier to manage in production

4. **Rotate keys periodically:**
   - Generate new keys every 6-12 months
   - Update on server

---

## 📝 Checklist

- [ ] Firebase project created
- [ ] Service account key downloaded
- [ ] Credentials uploaded to server
- [ ] File permissions set (600)
- [ ] Environment variables added
- [ ] Firebase Admin SDK installed
- [ ] Test script runs successfully
- [ ] Frontend config ready

---

**Once you've uploaded the credentials, let me know and we'll proceed with the implementation!** 🚀

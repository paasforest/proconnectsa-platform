#!/bin/bash

# 🔥 Upload Firebase Credentials to Hetzner Server
# Run this from your local machine (where firebase-credentials.json is located)

set -e

echo "🔥 Uploading Firebase Credentials to Hetzner Server..."
echo "=================================================="

# Server details
HETZNER_IP="128.140.123.48"
HETZNER_USER="root"
SERVER_PATH="/opt/proconnectsa"
CREDENTIALS_FILE="firebase-credentials.json.json"
# Also try without double extension
CREDENTIALS_FILE_ALT="firebase-credentials.json"

# Check if credentials file exists locally (try both names)
if [ ! -f "$CREDENTIALS_FILE" ] && [ ! -f "$CREDENTIALS_FILE_ALT" ]; then
    echo "❌ Error: Neither $CREDENTIALS_FILE nor $CREDENTIALS_FILE_ALT found in current directory"
    echo ""
    echo "Please:"
    echo "1. Download firebase-credentials.json from Firebase Console"
    echo "2. Place it in the same directory as this script"
    echo "3. Run this script again"
    exit 1
fi

# Use whichever file exists
if [ -f "$CREDENTIALS_FILE" ]; then
    UPLOAD_FILE="$CREDENTIALS_FILE"
elif [ -f "$CREDENTIALS_FILE_ALT" ]; then
    UPLOAD_FILE="$CREDENTIALS_FILE_ALT"
fi

echo ""
echo "📤 Step 1: Uploading credentials file..."
scp "$UPLOAD_FILE" ${HETZNER_USER}@${HETZNER_IP}:${SERVER_PATH}/firebase-credentials.json.json

echo ""
echo "🔐 Step 2: Setting proper permissions..."
ssh ${HETZNER_USER}@${HETZNER_IP} "cd ${SERVER_PATH} && \
    chmod 600 ${CREDENTIALS_FILE} && \
    chown root:root ${CREDENTIALS_FILE} && \
    ls -la ${CREDENTIALS_FILE}"

echo ""
echo "✅ Step 3: Verifying file..."
ssh ${HETZNER_USER}@${HETZNER_IP} "cd ${SERVER_PATH} && \
    if [ -f ${CREDENTIALS_FILE} ]; then
        echo '✅ File exists and is readable'
        echo '📄 File size:' \$(wc -c < ${CREDENTIALS_FILE}) 'bytes'
    else
        echo '❌ File not found!'
        exit 1
    fi"

echo ""
echo "📦 Step 4: Installing Firebase Admin SDK..."
ssh ${HETZNER_USER}@${HETZNER_IP} "cd ${SERVER_PATH} && \
    source venv/bin/activate && \
    pip install firebase-admin --quiet && \
    echo '✅ Firebase Admin SDK installed'"

echo ""
echo "🧪 Step 5: Testing Firebase connection..."
ssh ${HETZNER_USER}@${HETZNER_IP} "cd ${SERVER_PATH} && \
    source venv/bin/activate && \
    python3 << 'PYTHON_SCRIPT'
import os
import sys
import json

try:
    import firebase_admin
    from firebase_admin import credentials
    
    cred_path = '${SERVER_PATH}/${CREDENTIALS_FILE}'
    
    if not os.path.exists(cred_path):
        print('❌ Credentials file not found')
        sys.exit(1)
    
    # Try to load credentials
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    
    print('✅ Firebase initialized successfully!')
    print(f'📋 Project ID: {firebase_admin.get_app().project_id}')
    
except ImportError:
    print('❌ firebase-admin not installed. Run: pip install firebase-admin')
    sys.exit(1)
except Exception as e:
    print(f'❌ Error: {e}')
    sys.exit(1)
PYTHON_SCRIPT"

echo ""
echo "🎉 Firebase credentials uploaded and verified!"
echo "=================================================="
echo ""
echo "📝 Next steps:"
echo "1. Add FIREBASE_CREDENTIALS_PATH to your .env file:"
echo "   FIREBASE_CREDENTIALS_PATH=${SERVER_PATH}/${CREDENTIALS_FILE}"
echo ""
echo "2. Let me know when ready, and I'll implement FCM push notifications!"
echo ""

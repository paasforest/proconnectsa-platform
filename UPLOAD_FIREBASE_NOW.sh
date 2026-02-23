#!/bin/bash
# Simple script to upload Firebase credentials
# Run this from your local machine where firebase-credentials.json.json is located

echo "📤 Uploading Firebase credentials..."
echo ""
echo "Make sure you're in the directory with firebase-credentials.json.json"
echo ""

scp firebase-credentials.json.json root@128.140.123.48:/opt/proconnectsa/

echo ""
echo "✅ Upload complete!"
echo ""
echo "Now I'll set permissions and test it..."

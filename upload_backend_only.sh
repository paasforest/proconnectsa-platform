#!/bin/bash

# 🚀 Upload ONLY backend code to Hetzner
# This uploads only the necessary backend files

echo "🚀 Uploading ONLY backend code to Hetzner..."

# Create a temporary directory with only backend files
mkdir -p /tmp/proconnectsa_backend

# Copy only backend files
cp -r backend/ /tmp/proconnectsa_backend/
cp manage.py /tmp/proconnectsa_backend/
cp requirements.txt /tmp/proconnectsa_backend/
cp .env /tmp/proconnectsa_backend/
cp docker-compose.yml /tmp/proconnectsa_backend/
cp nginx.conf /tmp/proconnectsa_backend/
cp *.sh /tmp/proconnectsa_backend/

# Show what we're uploading
echo "📦 Files to upload:"
ls -la /tmp/proconnectsa_backend/

echo ""
echo "📊 Size:"
du -sh /tmp/proconnectsa_backend/

echo ""
echo "🚀 Upload command:"
echo "scp -r /tmp/proconnectsa_backend/* root@128.140.123.48:/opt/proconnectsa/"

echo ""
echo "✅ This uploads ONLY the backend code (much smaller and faster!)"



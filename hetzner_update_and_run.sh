#!/bin/bash

# 🚀 Hetzner Update and Run Script
# This script pulls the latest code and starts Django on Hetzner

set -e

echo "🚀 Updating ProConnectSA on Hetzner..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Commands to run on Hetzner server
echo "📋 Commands to run on your Hetzner server (128.140.123.48):"
echo ""
echo "1. SSH into your Hetzner server:"
echo "   ssh root@128.140.123.48"
echo ""
echo "2. Run these commands on the Hetzner server:"
echo ""
echo "   # Navigate to project directory"
echo "   cd /opt/proconnectsa || mkdir -p /opt/proconnectsa && cd /opt/proconnectsa"
echo ""
echo "   # Pull latest code from git"
echo "   git clone https://github.com/paasforest/proconnectsa-platform.git . || git pull"
echo ""
echo "   # Activate virtual environment"
echo "   python3 -m venv venv"
echo "   source venv/bin/activate"
echo ""
echo "   # Install dependencies"
echo "   pip install -r requirements.txt"
echo ""
echo "   # Stop any existing Django process on port 8000"
echo "   pkill -f 'python.*manage.py.*runserver.*8000' || true"
echo ""
echo "   # Start Django server"
echo "   python manage.py runserver 0.0.0.0:8000 &"
echo ""
echo "   # Test the server"
echo "   sleep 5"
echo "   curl http://localhost:8000/health/"
echo ""
print_status "🎯 Your Hetzner server IP: 128.140.123.48"
print_status "✅ Commands ready to run on Hetzner!"

#!/bin/bash
# ProConnectSA - Deploy Anywhere with Docker
# This script can run on any server with Docker

echo "🚀 ProConnectSA Universal Deployment"
echo "===================================="

# Update system
sudo apt update -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo apt install docker-compose -y
fi

# Create project directory
sudo mkdir -p /opt/proconnectsa
cd /opt/proconnectsa

# Download project (you'll need to upload this somehow)
echo "📥 Project files should be uploaded to this directory"

# Start services
echo "🚀 Starting ProConnectSA services..."
sudo docker-compose up -d

echo "✅ Deployment completed!"
echo "🌐 Backend: http://YOUR_SERVER_IP:8000"
echo "🔧 Admin: http://YOUR_SERVER_IP:8000/admin/"


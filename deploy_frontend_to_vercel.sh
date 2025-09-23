#!/bin/bash

# 🚀 Deploy Frontend to Vercel Script
# This script will deploy your frontend to Vercel

set -e

echo "🚀 Deploying ProConnectSA Frontend to Vercel..."

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the frontend directory?"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_warning "You need to login to Vercel first:"
    echo "vercel login"
    echo ""
    print_warning "Please run 'vercel login' first, then run this script again."
    exit 1
fi

print_status "Step 1: Building the frontend..."
npm run build

print_status "Step 2: Deploying to Vercel..."
vercel --prod

print_status "Step 3: Setting up environment variables..."
print_warning "You need to set these environment variables in your Vercel dashboard:"
echo ""
echo "NEXT_PUBLIC_API_URL=https://api.proconnectsa.co.za"
echo "NEXT_PUBLIC_FRONTEND_URL=https://www.proconnectsa.co.za"
echo "NEXTAUTH_SECRET=proconnectsa-nextauth-secret-key-2024-production-at-least-32-chars-long"
echo "NEXTAUTH_URL=https://www.proconnectsa.co.za"
echo ""

print_status "Step 4: Domain configuration..."
print_warning "In your Vercel dashboard:"
echo "1. Go to your project settings"
echo "2. Add custom domain: proconnectsa.co.za"
echo "3. Add custom domain: www.proconnectsa.co.za"
echo "4. Update DNS records to point to Vercel"
echo ""

print_status "🎉 Frontend deployment completed!"
print_status "Your frontend will be available at your Vercel URL"
print_warning "Don't forget to:"
echo "1. Set the environment variables in Vercel dashboard"
echo "2. Configure your domain DNS"
echo "3. Make sure your Hetzner backend is running"

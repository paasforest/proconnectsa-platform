#!/bin/bash

# 🚀 Deploy Immigration AI Landing Page to Vercel Script
# This script will deploy the Immigration AI landing page to Vercel

set -e

echo "🚀 Deploying Immigration AI Landing Page to Vercel..."

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

# Navigate to Immigration AI directory
cd immigrationai_landing_page

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the immigrationai_landing_page directory?"
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

print_status "Step 1: Installing dependencies..."
npm install

print_status "Step 2: Building the Immigration AI landing page..."
npm run build

print_status "Step 3: Deploying to Vercel..."
vercel --prod

print_status "Step 4: Setting up environment variables..."
print_warning "You may need to set these environment variables in your Vercel dashboard if using Supabase:"
echo ""
echo "VITE_SUPABASE_URL=your-supabase-url"
echo "VITE_SUPABASE_ANON_KEY=your-supabase-anon-key"
echo ""

print_status "Step 5: Domain configuration..."
print_warning "In your Vercel dashboard:"
echo "1. Go to your project settings"
echo "2. Add custom domain: immigrationai.proconnectsa.co.za"
echo "3. Update DNS records to point to Vercel"
echo ""

print_status "🎉 Immigration AI Landing Page deployment completed!"
print_status "Your landing page will be available at your Vercel URL"
print_warning "Don't forget to:"
echo "1. Set the environment variables in Vercel dashboard (if using Supabase)"
echo "2. Configure your domain DNS"
echo "3. Test the landing page functionality"

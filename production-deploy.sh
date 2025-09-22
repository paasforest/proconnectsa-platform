#!/bin/bash

# 🚀 PERMANENT PRODUCTION DEPLOYMENT SCRIPT
# This script sets up ProConnectSA on Hetzner with proper domain and SSL

set -e

echo "🚀 Starting ProConnectSA Production Deployment..."

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

# Check if running on Hetzner server
if [ ! -f /etc/hostname ] || ! grep -q "hetzner" /etc/hostname 2>/dev/null; then
    print_warning "This script should be run on your Hetzner server"
    print_status "To deploy: scp -r . root@YOUR_HETZNER_IP:/opt/proconnectsa/"
fi

# Step 1: System Setup
print_status "Setting up system dependencies..."
apt update && apt upgrade -y
apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx postgresql postgresql-contrib redis-server

# Step 2: Configure PostgreSQL
print_status "Setting up PostgreSQL..."
if [ -f "./setup_postgresql_hetzner.sh" ]; then
    chmod +x ./setup_postgresql_hetzner.sh
    ./setup_postgresql_hetzner.sh
else
    print_error "PostgreSQL setup script not found"
    exit 1
fi

# Step 3: Create production environment
print_status "Creating production environment file..."
if [ ! -f .env ]; then
    cp env.example .env
    
    # Update with production values
    sed -i 's/DEBUG=True/DEBUG=False/' .env
    sed -i 's/SECRET_KEY=your-secret-key-here/SECRET_KEY=proconnectsa-super-secret-production-key-2024/' .env
    sed -i 's/DB_PASSWORD=your-database-password/DB_PASSWORD=ProCompare2024!Secure/' .env
    sed -i 's/DB_NAME=procompare/DB_NAME=procompare_db/' .env
    sed -i 's/DB_USER=procompare/DB_USER=procompare_user/' .env
    
    # Add production settings
    echo "" >> .env
    echo "# Production Settings" >> .env
    echo "DJANGO_SETTINGS_MODULE=backend.procompare.settings_production" >> .env
    echo "ALLOWED_HOSTS=proconnectsa.co.za,www.proconnectsa.co.za,api.proconnectsa.co.za" >> .env
    echo "FRONTEND_URL=https://proconnectsa.co.za" >> .env
    echo "USE_SQLITE=False" >> .env
    
    print_status "Production .env file created"
fi

# Step 4: Configure Nginx with SSL
print_status "Configuring Nginx..."
if [ -f "./nginx.conf" ]; then
    cp ./nginx.conf /etc/nginx/nginx.conf
    nginx -t
    systemctl reload nginx
    print_status "Nginx configured successfully"
else
    print_error "nginx.conf not found"
    exit 1
fi

# Step 5: Get SSL Certificate
print_status "Getting SSL certificate..."
print_warning "Make sure your domain DNS is pointing to this server first!"
read -p "Have you configured DNS for proconnectsa.co.za to point here? (y/n): " dns_ready

if [ "$dns_ready" = "y" ] || [ "$dns_ready" = "Y" ]; then
    certbot --nginx -d proconnectsa.co.za -d www.proconnectsa.co.za -d api.proconnectsa.co.za --non-interactive --agree-tos --email admin@proconnectsa.co.za
    print_status "SSL certificate obtained!"
else
    print_warning "Skipping SSL certificate. Configure DNS first, then run: certbot --nginx -d proconnectsa.co.za -d www.proconnectsa.co.za -d api.proconnectsa.co.za"
fi

# Step 6: Deploy with Docker
print_status "Deploying application with Docker..."
if [ -f "./docker-compose.yml" ]; then
    docker-compose down || true
    docker-compose build --no-cache
    docker-compose up -d
    
    # Wait for services
    sleep 30
    
    # Run migrations
    docker-compose exec backend python manage.py migrate
    docker-compose exec backend python manage.py collectstatic --noinput
    
    print_status "Application deployed successfully!"
else
    print_error "docker-compose.yml not found"
    exit 1
fi

# Step 7: Test deployment
print_status "Testing deployment..."
if curl -f http://localhost:8000/health/ > /dev/null 2>&1; then
    print_status "Backend health check: ✅ PASSED"
else
    print_error "Backend health check: ❌ FAILED"
fi

if curl -f https://api.proconnectsa.co.za/health/ > /dev/null 2>&1; then
    print_status "SSL endpoint check: ✅ PASSED"
else
    print_warning "SSL endpoint check: ⚠️  PENDING (DNS/SSL setup needed)"
fi

print_status "🎉 PRODUCTION DEPLOYMENT COMPLETED!"
echo ""
echo "📋 NEXT STEPS:"
echo "=============="
echo "1. Configure DNS records:"
echo "   api.proconnectsa.co.za    A    $(curl -s ifconfig.me)"
echo ""
echo "2. Deploy frontend to Vercel:"
echo "   cd procompare-frontend && vercel --prod"
echo ""  
echo "3. Update Vercel environment variables:"
echo "   NEXT_PUBLIC_API_URL=https://api.proconnectsa.co.za"
echo ""
echo "4. Test your application:"
echo "   Backend:  https://api.proconnectsa.co.za/health/"
echo "   Admin:    https://api.proconnectsa.co.za/admin/"
echo "   Frontend: https://proconnectsa.co.za"
echo ""


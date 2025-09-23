#!/bin/bash

# 🚀 Quick Hetzner Deployment Script for ProConnectSA
# This script will deploy your backend to Hetzner

set -e

echo "🚀 Deploying ProConnectSA Backend to Hetzner..."

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

# Check if we have the necessary files
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Are you in the right directory?"
    exit 1
fi

if [ ! -f ".env" ]; then
    print_warning "No .env file found. Creating from example..."
    cp env.example .env
    print_status "Created .env file. Please update it with your production values."
fi

print_status "Current server IP: $(curl -s ifconfig.me)"
print_warning "Make sure your Hetzner server is running and accessible!"

# Step 1: Upload to Hetzner
print_status "Step 1: Uploading code to Hetzner server..."
print_warning "You need to run this command manually:"
echo "scp -r /home/paas/work_platform root@YOUR_HETZNER_IP:/opt/proconnectsa/"
echo ""
print_warning "Replace YOUR_HETZNER_IP with your actual Hetzner server IP address"
echo ""

# Step 2: Create deployment commands for Hetzner
print_status "Step 2: Creating deployment commands for Hetzner..."

cat > hetzner_deploy_commands.sh << 'EOF'
#!/bin/bash

# Commands to run on your Hetzner server
echo "🚀 Setting up ProConnectSA on Hetzner..."

# Navigate to project directory
cd /opt/proconnectsa

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << 'ENVEOF'
DEBUG=False
SECRET_KEY=proconnectsa-super-secret-production-key-2024-change-this
DB_PASSWORD=ProCompare2024!Secure
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
SMS_API_KEY=your-sms-api-key
SMS_SENDER_ID=ProConnectSA
ENVEOF
    echo "Please update the .env file with your actual values!"
fi

# Stop any existing containers
echo "Stopping existing containers..."
docker-compose down || true

# Build and start services
echo "Building and starting services..."
docker-compose up -d --build

# Wait for services to start
echo "Waiting for services to start..."
sleep 30

# Run migrations
echo "Running database migrations..."
docker-compose exec backend python manage.py migrate

# Collect static files
echo "Collecting static files..."
docker-compose exec backend python manage.py collectstatic --noinput

# Create superuser (optional)
echo "Creating superuser..."
docker-compose exec backend python manage.py createsuperuser --noinput --username admin --email admin@proconnectsa.co.za || echo "Superuser already exists"

# Test the deployment
echo "Testing deployment..."
if curl -f http://localhost:8000/health/ > /dev/null 2>&1; then
    echo "✅ Backend is running successfully!"
    echo "🌐 Your API is available at: http://$(curl -s ifconfig.me):8000"
    echo "🏥 Health check: http://$(curl -s ifconfig.me):8000/health/"
    echo "👤 Admin panel: http://$(curl -s ifconfig.me):8000/admin/"
else
    echo "❌ Backend health check failed. Check the logs:"
    echo "docker-compose logs backend"
fi

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "Next steps:"
echo "1. Configure your domain DNS to point to $(curl -s ifconfig.me)"
echo "2. Set up SSL certificate with: certbot --nginx -d api.proconnectsa.co.za"
echo "3. Deploy frontend to Vercel"
echo "4. Update Vercel environment variables with your Hetzner IP"
EOF

chmod +x hetzner_deploy_commands.sh

print_status "Created hetzner_deploy_commands.sh"
print_status "Step 3: Run these commands on your Hetzner server:"
echo ""
echo "1. Upload the code:"
echo "   scp -r /home/paas/work_platform root@YOUR_HETZNER_IP:/opt/proconnectsa/"
echo ""
echo "2. SSH into your Hetzner server:"
echo "   ssh root@YOUR_HETZNER_IP"
echo ""
echo "3. Run the deployment script:"
echo "   cd /opt/proconnectsa"
echo "   chmod +x hetzner_deploy_commands.sh"
echo "   ./hetzner_deploy_commands.sh"
echo ""

print_status "🎯 Your Hetzner server IP should be: $(curl -s ifconfig.me)"
print_warning "Make sure to replace YOUR_HETZNER_IP with your actual server IP address!"

echo ""
print_status "🚀 Ready to deploy! Follow the steps above to get your backend running on Hetzner."

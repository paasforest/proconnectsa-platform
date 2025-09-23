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

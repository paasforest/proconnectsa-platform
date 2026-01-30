#!/bin/bash

# ProCompare Deployment Script
# This script handles the deployment of the ProCompare application

set -e  # Exit on any error

echo "🚀 Starting ProCompare deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found. Please copy env.example to .env and configure it."
    exit 1
fi

# Load environment variables
source .env

# Check required environment variables
required_vars=("SECRET_KEY" "DB_PASSWORD" "EMAIL_HOST_USER" "EMAIL_HOST_PASSWORD" "SMS_API_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set in .env file"
        exit 1
    fi
done

print_status "Environment variables validated"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Docker and Docker Compose are available"

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p ssl
mkdir -p media
mkdir -p staticfiles

# Generate SSL certificates (self-signed for development)
if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
    print_warning "SSL certificates not found. Generating self-signed certificates..."
    openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=ZA/ST=Western Cape/L=Cape Town/O=ProConnectSA/CN=proconnectsa.co.za"
    print_status "SSL certificates generated"
fi

# Build and start services
print_status "Building and starting services..."
docker-compose down  # Stop any existing containers
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check if services are running
print_status "Checking service health..."

# Check database
if docker-compose exec -T db pg_isready -U procompare; then
    print_status "Database is ready"
else
    print_error "Database is not ready"
    exit 1
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
    print_status "Redis is ready"
else
    print_error "Redis is not ready"
    exit 1
fi

# Check backend
if curl -f http://localhost:8000/health/ > /dev/null 2>&1; then
    print_status "Backend is ready"
else
    print_error "Backend is not ready"
    exit 1
fi

# Run database migrations
print_status "Running database migrations..."
docker-compose exec backend python manage.py migrate

# Create superuser if it doesn't exist
print_status "Creating superuser..."
docker-compose exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser(
        username='admin@proconnectsa.co.za',
        email='admin@proconnectsa.co.za',
        password='admin123',
        first_name='Admin',
        last_name='User',
        phone='+27812345678',
        user_type='admin',
        city='Cape Town',
        suburb='Sea Point'
    )
    print('Superuser created')
else:
    print('Superuser already exists')
"

# Collect static files
print_status "Collecting static files..."
docker-compose exec backend python manage.py collectstatic --noinput

# Set up Celery periodic tasks
print_status "Setting up Celery periodic tasks..."
docker-compose exec backend python manage.py shell -c "
from django_celery_beat.models import PeriodicTask, CrontabSchedule
import json

# Create schedule for cleanup task (daily at 2 AM)
schedule, created = CrontabSchedule.objects.get_or_create(
    minute=0,
    hour=2,
    day_of_week='*',
    day_of_month='*',
    month_of_year='*',
)

# Create cleanup task
task, created = PeriodicTask.objects.get_or_create(
    name='Cleanup Old Notifications',
    defaults={
        'crontab': schedule,
        'task': 'notifications.tasks.cleanup_old_notifications',
        'enabled': True,
    }
)

# Create schedule for manual deposit expiration (every hour)
schedule2, created = CrontabSchedule.objects.get_or_create(
    minute=0,
    hour='*',
    day_of_week='*',
    day_of_month='*',
    month_of_year='*',
)

# Create expiration task
task2, created = PeriodicTask.objects.get_or_create(
    name='Expire Manual Deposits',
    defaults={
        'crontab': schedule2,
        'task': 'payments.tasks.expire_manual_deposits',
        'enabled': True,
    }
)

print('Periodic tasks created')
"

print_status "Deployment completed successfully! 🎉"

echo ""
echo "📋 Deployment Summary:"
echo "======================"
echo "✅ Database: PostgreSQL running on port 5432"
echo "✅ Redis: Running on port 6379"
echo "✅ Backend: Django API running on port 8000"
echo "✅ Celery Worker: Background job processing"
echo "✅ Celery Beat: Scheduled task management"
echo "✅ Nginx: Reverse proxy running on port 80/443"
echo ""
echo "🔗 Access URLs:"
echo "==============="
echo "🌐 Frontend: https://proconnectsa.co.za (Vercel deployment)"
echo "🔧 API: http://localhost:8000/api/"
echo "👨‍💼 Admin: http://localhost:8000/admin/"
echo "❤️ Health: http://localhost:8000/health/"
echo "📊 Metrics: http://localhost:8000/metrics/"
echo ""
echo "🔑 Admin Credentials:"
echo "===================="
echo "Email: admin@proconnectsa.co.za"
echo "Password: admin123"
echo ""
echo "📝 Next Steps:"
echo "=============="
echo "1. Update DNS records to point to your server"
echo "2. Configure SSL certificates for production"
echo "3. Set up monitoring and logging"
echo "4. Configure Pace SMS API credentials"
echo "5. Test all functionality"
echo ""
echo "🐳 Docker Commands:"
echo "==================="
echo "View logs: docker-compose logs -f"
echo "Stop services: docker-compose down"
echo "Restart services: docker-compose restart"
echo "Update services: docker-compose pull && docker-compose up -d"
echo ""










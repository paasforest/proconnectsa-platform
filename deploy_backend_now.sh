#!/bin/bash

# 🚀 Quick Backend Deployment to Hetzner
# This script will deploy your backend to Hetzner right now

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

# Step 1: Upload code to Hetzner
print_status "Step 1: Uploading code to Hetzner server..."
print_warning "Run this command to upload your code:"
echo "scp -r /home/paas/work_platform root@128.140.123.48:/opt/proconnectsa/"
echo ""

# Step 2: Create deployment commands
print_status "Step 2: Creating deployment commands for Hetzner..."

cat > hetzner_quick_deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 Quick Backend Deployment on Hetzner..."

# Navigate to project directory
cd /opt/proconnectsa

# Install Python and dependencies
apt update
apt install -y python3 python3-pip python3-venv postgresql postgresql-contrib nginx

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
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
ALLOWED_HOSTS=128.140.123.48,api.proconnectsa.co.za,proconnectsa.co.za
ENVEOF

# Run migrations
python manage.py migrate

# Create superuser
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@proconnectsa.co.za', 'admin123') if not User.objects.filter(email='admin@proconnectsa.co.za').exists() else None" | python manage.py shell

# Start Django server
python manage.py runserver 0.0.0.0:8000 &

echo "✅ Backend deployed and running on port 8000"
echo "🌐 API available at: http://128.140.123.48:8000"
echo "🏥 Health check: http://128.140.123.48:8000/health/"
echo "👤 Admin panel: http://128.140.123.48:8000/admin/"
echo "📧 Admin login: admin@proconnectsa.co.za / admin123"
EOF

chmod +x hetzner_quick_deploy.sh

print_status "Created hetzner_quick_deploy.sh"
print_status "Step 3: Run these commands on your Hetzner server:"
echo ""
echo "1. Upload the code:"
echo "   scp -r /home/paas/work_platform root@128.140.123.48:/opt/proconnectsa/"
echo ""
echo "2. SSH into your Hetzner server:"
echo "   ssh root@128.140.123.48"
echo ""
echo "3. Run the deployment script:"
echo "   cd /opt/proconnectsa"
echo "   chmod +x hetzner_quick_deploy.sh"
echo "   ./hetzner_quick_deploy.sh"
echo ""

print_status "🎯 Your Hetzner server IP is: 128.140.123.48"
print_warning "This will deploy your backend and make it accessible for testing!"

echo ""
print_status "🚀 Ready to deploy! Follow the steps above to get your backend running on Hetzner."



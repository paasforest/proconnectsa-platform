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

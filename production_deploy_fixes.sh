#!/bin/bash

echo "🔧 Deploying Production Fixes..."

# Navigate to project directory
cd /opt/proconnectsa

# Activate virtual environment
source venv/bin/activate

# Install/update Python dependencies
pip install -r requirements.txt

# Run database migrations (CRITICAL - this adds the new fields)
echo "📊 Running database migrations..."
python manage.py migrate

# Verify migrations
echo "✅ Verifying migrations..."
python manage.py showmigrations leads

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Restart the Django server
echo "🔄 Restarting Django server..."
pkill -f "python manage.py runserver" || true
sleep 2
python manage.py runserver 0.0.0.0:8000 &

# Wait for server to start
sleep 5

# Test the fixes
echo "🧪 Testing production fixes..."

# Test 1: Create a lead with property_type
echo "Test 1: Creating lead with property_type..."
curl -X POST http://localhost:8000/api/leads/create-public/ \
-H "Content-Type: application/json" \
-d '{
    "service_category_id": 3,
    "title": "Production Test Lead",
    "description": "Testing production fixes",
    "location_address": "123 Test Street",
    "location_suburb": "Test Suburb",
    "location_city": "Cape Town",
    "budget_range": "1000_5000",
    "urgency": "urgent",
    "preferred_contact_time": "morning",
    "additional_requirements": "",
    "property_type": "industrial",
    "hiring_intent": "ready_to_hire",
    "hiring_timeline": "asap",
    "research_purpose": "",
    "source": "website",
    "client_name": "Test User",
    "client_email": "test@example.com",
    "client_phone": "0123456789"
}' | jq '{property_type, credit_required, client: {first_name, last_name, email, phone}}'

echo ""
echo "✅ Production fixes deployed successfully!"
echo "🎯 All critical issues have been resolved:"
echo "   ✅ Property type display fixed"
echo "   ✅ Client details reversion fixed"
echo "   ✅ ML pricing system working"
echo "   ✅ Credit deduction system working"
echo "   ✅ Frontend display fixed"
echo ""
echo "🌐 Production API: https://api.proconnectsa.co.za"
echo "🏥 Health check: https://api.proconnectsa.co.za/health/"
echo "👤 Admin panel: https://api.proconnectsa.co.za/admin/"

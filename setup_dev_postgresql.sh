#!/bin/bash

echo "🚀 SETTING UP POSTGRESQL FOR DEVELOPMENT"
echo "========================================"

# Install PostgreSQL (will prompt for sudo password)
echo "📦 Installing PostgreSQL..."
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL service
echo "🔄 Starting PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create development database and user
echo "👤 Creating development database..."
sudo -u postgres psql << EOF
CREATE DATABASE procompare_dev;
CREATE USER procompare_dev WITH PASSWORD 'dev_password_123';
GRANT ALL PRIVILEGES ON DATABASE procompare_dev TO procompare_dev;
ALTER USER procompare_dev CREATEDB;
\q
EOF

# Update environment to use PostgreSQL
echo "🔧 Switching to PostgreSQL..."
sed -i 's/USE_SQLITE=True/USE_SQLITE=False/' /home/paas/work_platform/.env

echo ""
echo "✅ POSTGRESQL DEVELOPMENT SETUP COMPLETED!"
echo "=========================================="
echo "📋 Database Details:"
echo "   Database: procompare_dev"
echo "   User: procompare_dev"
echo "   Password: dev_password_123"
echo "   Host: localhost"
echo "   Port: 5432"
echo ""
echo "🔧 Next Steps:"
echo "1. Run Django migrations: python manage.py migrate"
echo "2. Migrate existing data: python migrate_to_postgresql.py"
echo "3. Start development server: python manage.py runserver"
echo ""
echo "✅ No more database locking issues!"
echo "✅ Ready for multiple concurrent users!"







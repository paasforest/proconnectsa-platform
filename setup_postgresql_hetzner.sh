#!/bin/bash

echo "🚀 SETTING UP POSTGRESQL ON HETZNER SERVER"
echo "=========================================="

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install PostgreSQL
echo "🗄️ Installing PostgreSQL..."
sudo apt install postgresql postgresql-contrib -y

# Start and enable PostgreSQL
echo "🔄 Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
echo "👤 Creating database and user..."
sudo -u postgres psql << EOF
CREATE DATABASE procompare_db;
CREATE USER procompare_user WITH PASSWORD 'ProCompare2024!Secure';
GRANT ALL PRIVILEGES ON DATABASE procompare_db TO procompare_user;
ALTER USER procompare_user CREATEDB;
\q
EOF

# Configure PostgreSQL for remote connections (if needed)
echo "🔧 Configuring PostgreSQL..."
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf

# Add authentication for the user
echo "host procompare_db procompare_user 127.0.0.1/32 md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf

# Restart PostgreSQL
echo "🔄 Restarting PostgreSQL..."
sudo systemctl restart postgresql

# Test connection
echo "🧪 Testing PostgreSQL connection..."
sudo -u postgres psql -d procompare_db -c "SELECT version();"

echo ""
echo "✅ POSTGRESQL SETUP COMPLETED!"
echo "================================"
echo "📋 Database Details:"
echo "   Database: procompare_db"
echo "   User: procompare_user"
echo "   Password: ProCompare2024!Secure"
echo "   Host: localhost"
echo "   Port: 5432"
echo ""
echo "🔧 Next Steps:"
echo "1. Create .env file with database credentials"
echo "2. Run Django migrations"
echo "3. Run data migration script"
echo ""
echo "⚠️  SECURITY NOTE:"
echo "Change the default password in production!"










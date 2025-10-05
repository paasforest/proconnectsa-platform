#!/usr/bin/env python3
"""
Security Improvements Script for ProConnectSA
This script implements additional security measures
"""

import os
import secrets
import string
from datetime import datetime

def generate_secure_api_keys():
    """Generate secure API keys for production"""
    
    print("🔐 Generating Secure API Keys...")
    print("=" * 40)
    
    # Generate secure random keys
    def generate_key(length=32):
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(length))
    
    api_keys = {
        'public': f"pc_public_{generate_key(24)}",
        'lead_creation': f"pc_lead_{generate_key(24)}",
        'webhook': f"pc_webhook_{generate_key(24)}",
        'admin': f"pc_admin_{generate_key(24)}"
    }
    
    print("Generated API Keys:")
    for name, key in api_keys.items():
        print(f"   {name}: {key}")
    
    print("\n📝 Add these to your .env file:")
    print("=" * 40)
    for name, key in api_keys.items():
        print(f"API_KEY_{name.upper()}={key}")
    
    return api_keys

def create_security_checklist():
    """Create a security checklist for production deployment"""
    
    checklist = """
🔒 PRODUCTION SECURITY CHECKLIST
================================

✅ AUTHENTICATION & AUTHORIZATION
   [ ] Change default admin password
   [ ] Enable 2FA for admin accounts
   [ ] Rotate API keys regularly
   [ ] Implement session timeout
   [ ] Enable password complexity requirements

✅ DATABASE SECURITY
   [ ] Use strong database passwords
   [ ] Enable database encryption at rest
   [ ] Regular database backups
   [ ] Database access logging
   [ ] Remove test data (run cleanup script)

✅ API SECURITY
   [ ] Rate limiting enabled
   [ ] Input validation on all endpoints
   [ ] API key rotation schedule
   [ ] Request/response logging
   [ ] CORS properly configured

✅ INFRASTRUCTURE SECURITY
   [ ] SSL/TLS certificates installed
   [ ] Firewall rules configured
   [ ] Regular security updates
   [ ] Monitoring and alerting setup
   [ ] Backup and recovery tested

✅ APPLICATION SECURITY
   [ ] Security headers configured
   [ ] XSS protection enabled
   [ ] CSRF protection enabled
   [ ] SQL injection prevention
   [ ] File upload restrictions

✅ MONITORING & LOGGING
   [ ] Security event logging
   [ ] Failed login attempt monitoring
   [ ] Unusual activity alerts
   [ ] Regular security audits
   [ ] Incident response plan

✅ COMPLIANCE
   [ ] GDPR compliance (if applicable)
   [ ] Data retention policies
   [ ] Privacy policy updated
   [ ] Terms of service updated
   [ ] Cookie consent implemented

🔧 IMMEDIATE ACTIONS NEEDED:
   1. Run database cleanup script
   2. Update API keys in environment
   3. Enable HTTPS/SSL
   4. Set up monitoring
   5. Create admin user with strong password
"""
    
    print(checklist)
    
    # Save to file
    with open('security_checklist.txt', 'w') as f:
        f.write(checklist)
    
    print("📄 Security checklist saved to 'security_checklist.txt'")

def create_production_env_template():
    """Create a production environment template"""
    
    env_template = """# ProConnectSA Production Environment Variables
# Generated on: {date}

# Django Settings
DEBUG=False
SECRET_KEY={secret_key}
ALLOWED_HOSTS=api.proconnectsa.co.za,proconnectsa.co.za,www.proconnectsa.co.za

# Database Configuration
DB_NAME=proconnectsa
DB_USER=proconnectsa
DB_PASSWORD={db_password}
DB_HOST=db
DB_PORT=5432

# Redis Configuration
REDIS_URL=redis://redis:6379/0

# Email Configuration
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_HOST_USER=your_sendgrid_username
EMAIL_HOST_PASSWORD=your_sendgrid_password
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=noreply@proconnectsa.co.za

# SMS Configuration
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=ProConnectSA

# API Keys (Generated)
API_KEY_PUBLIC={api_key_public}
API_KEY_LEAD_CREATION={api_key_lead_creation}
API_KEY_WEBHOOK={api_key_webhook}
API_KEY_ADMIN={api_key_admin}

# Security Settings
CORS_ALLOWED_ORIGINS=https://proconnectsa.co.za,https://www.proconnectsa.co.za,https://proconnectsa.vercel.app
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SECURE_CONTENT_TYPE_NOSNIFF=True
SECURE_BROWSER_XSS_FILTER=True
X_FRAME_OPTIONS=DENY

# Logging
LOG_LEVEL=INFO
SENTRY_DSN=your_sentry_dsn

# File Storage
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_STORAGE_BUCKET_NAME=proconnectsa-storage
AWS_S3_REGION_NAME=us-east-1
"""
    
    # Generate secure values
    secret_key = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(50))
    db_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
    api_keys = generate_secure_api_keys()
    
    env_content = env_template.format(
        date=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        secret_key=secret_key,
        db_password=db_password,
        api_key_public=api_keys['public'],
        api_key_lead_creation=api_keys['lead_creation'],
        api_key_webhook=api_keys['webhook'],
        api_key_admin=api_keys['admin']
    )
    
    with open('.env.production', 'w') as f:
        f.write(env_content)
    
    print("📄 Production environment template saved to '.env.production'")
    print("⚠️  Remember to update the placeholder values with your actual credentials!")

if __name__ == "__main__":
    print("🔒 ProConnectSA Security Improvements")
    print("=" * 40)
    
    # Generate API keys
    generate_secure_api_keys()
    
    print("\n" + "=" * 40)
    
    # Create security checklist
    create_security_checklist()
    
    print("\n" + "=" * 40)
    
    # Create production env template
    create_production_env_template()
    
    print("\n✅ Security improvement scripts completed!")
    print("📋 Next steps:")
    print("   1. Review the security checklist")
    print("   2. Update your .env file with the new API keys")
    print("   3. Run the database cleanup script")
    print("   4. Deploy with the production environment template")





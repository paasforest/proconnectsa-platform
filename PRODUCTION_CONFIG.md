# 🚀 Production Configuration Guide

## Environment Variables

Create a `.env` file in your production environment with these variables:

```bash
# Django Settings
DEBUG=False
SECRET_KEY=your-super-secret-production-key-here-make-it-long-and-random
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,your-server-ip

# Database (PostgreSQL for production)
DATABASE_URL=postgresql://username:password@localhost:5432/proconnectsa_prod

# Email Settings (for notifications)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@proconnectsa.co.za

# File Storage (AWS S3 for production)
USE_S3=True
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=proconnectsa-files
AWS_S3_REGION_NAME=us-east-1

# Security
SECURE_SSL_REDIRECT=True
SECURE_BROWSER_XSS_FILTER=True
SECURE_CONTENT_TYPE_NOSNIFF=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# API URLs
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

## Production Deployment Steps

### 1. Server Setup
```bash
# Install dependencies
sudo apt update
sudo apt install python3-pip python3-venv postgresql nginx

# Create database
sudo -u postgres createdb proconnectsa_prod
sudo -u postgres createuser --interactive
```

### 2. Application Deployment
```bash
# Clone repository
git clone your-repo-url
cd proconnectsa

# Set up virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install django-storages boto3  # For S3 storage

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic

# Create superuser
python manage.py createsuperuser
```

### 3. Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /admin/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Process Management (systemd)

Create `/etc/systemd/system/proconnectsa-django.service`:
```ini
[Unit]
Description=ProConnectSA Django App
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/proconnectsa
Environment=PATH=/path/to/proconnectsa/venv/bin
EnvironmentFile=/path/to/proconnectsa/.env
ExecStart=/path/to/proconnectsa/venv/bin/python manage.py runserver 127.0.0.1:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/proconnectsa-nextjs.service`:
```ini
[Unit]
Description=ProConnectSA Next.js App
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/proconnectsa/procompare-frontend
Environment=PATH=/usr/bin:/bin
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start
Restart=always

[Install]
WantedBy=multi-user.target
```

### 5. SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Quick Launch Checklist

- [ ] Server provisioned with Python, Node.js, PostgreSQL
- [ ] Environment variables configured
- [ ] Database created and migrated
- [ ] Static files collected
- [ ] SSL certificate installed
- [ ] Nginx configured and running
- [ ] Services enabled and started
- [ ] DNS pointing to server
- [ ] Email settings tested
- [ ] File upload tested (S3 or local)
- [ ] Payment flow tested
- [ ] Admin interface accessible

## Security Recommendations

1. **Firewall**: Only allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
2. **SSH**: Use key-based authentication, disable root login
3. **Database**: Use strong passwords, limit connections
4. **Backups**: Set up automated database and file backups
5. **Monitoring**: Set up error logging and monitoring
6. **Updates**: Keep system and dependencies updated

## Monitoring

Set up monitoring for:
- Server resources (CPU, memory, disk)
- Application errors
- Database performance
- Email delivery
- File upload success rates
- Payment processing

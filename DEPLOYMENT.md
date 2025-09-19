# 🚀 ProCompare Deployment Guide

This guide covers the complete deployment process for the ProCompare platform.

## 📋 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 20GB free space
- **CPU**: 2+ cores recommended

### Software Requirements
- Docker 20.10+
- Docker Compose 2.0+
- Git
- OpenSSL (for SSL certificates)

## 🔧 Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd work_platform
```

### 2. Configure Environment Variables
```bash
cp env.example .env
nano .env
```

**Required Environment Variables:**
```env
# Django Settings
SECRET_KEY=your-super-secret-key-here
DEBUG=False

# Database Configuration
DB_NAME=procompare
DB_USER=procompare
DB_PASSWORD=your-secure-database-password
DB_HOST=localhost
DB_PORT=5432

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@procompare.co.za

# SMS Configuration (Pace SMS API)
SMS_API_KEY=your-pace-sms-api-key
SMS_SENDER_ID=ProCompare

# Frontend URL
FRONTEND_URL=https://procompare.co.za

# CORS Settings
CORS_ALLOW_ALL_ORIGINS=False
```

## 🐳 Docker Deployment

### 1. Quick Deployment
```bash
./deploy.sh
```

### 2. Manual Deployment
```bash
# Build and start services
docker-compose up -d --build

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

## 🔒 SSL Certificate Setup

### Development (Self-signed)
```bash
mkdir ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=ZA/ST=Western Cape/L=Cape Town/O=ProCompare/CN=procompare.co.za"
```

### Production (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot

# Generate certificates
sudo certbot certonly --standalone -d procompare.co.za -d www.procompare.co.za

# Copy certificates
sudo cp /etc/letsencrypt/live/procompare.co.za/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/procompare.co.za/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*.pem
```

## 📊 Monitoring Setup

### Health Checks
- **Health Check**: `http://localhost:8000/health/`
- **Readiness Check**: `http://localhost:8000/ready/`
- **Liveness Check**: `http://localhost:8000/live/`
- **Metrics**: `http://localhost:8000/metrics/`

### Log Monitoring
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f celery
docker-compose logs -f nginx
```

## 🔄 Maintenance

### Database Backup
```bash
# Create backup
docker-compose exec db pg_dump -U procompare procompare > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose exec -T db psql -U procompare procompare < backup_file.sql
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Run migrations
docker-compose exec backend python manage.py migrate
```

### Scale Services
```bash
# Scale Celery workers
docker-compose up -d --scale celery=3

# Scale backend (with load balancer)
docker-compose up -d --scale backend=2
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check database status
docker-compose exec db pg_isready -U procompare

# Check logs
docker-compose logs db
```

#### 2. Redis Connection Failed
```bash
# Check Redis status
docker-compose exec redis redis-cli ping

# Check logs
docker-compose logs redis
```

#### 3. Backend Not Starting
```bash
# Check logs
docker-compose logs backend

# Check environment variables
docker-compose exec backend env | grep -E "(DB_|REDIS_|SECRET_)"
```

#### 4. SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in ssl/cert.pem -text -noout

# Test SSL connection
openssl s_client -connect procompare.co.za:443
```

### Performance Optimization

#### 1. Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_lead_status ON leads_lead(status);
CREATE INDEX idx_lead_created_at ON leads_lead(created_at);
CREATE INDEX idx_user_type ON users_user(user_type);
```

#### 2. Redis Optimization
```bash
# Configure Redis memory policy
docker-compose exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

#### 3. Nginx Optimization
```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;

# Enable gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

## 📱 Pace SMS Integration

### 1. Get API Credentials
- Sign up at Pace SMS
- Get your API key
- Update `SMS_API_KEY` in `.env`

### 2. Test SMS Service
```bash
# Test SMS service
docker-compose exec backend python manage.py shell -c "
from notifications.sms_service import send_sms
result = send_sms('+27812345678', 'Test message from ProCompare')
print(result)
"
```

### 3. Configure SMS Templates
Update SMS templates in `backend/notifications/sms_service.py`:
- Lead verification SMS
- Provider notification SMS
- Deposit reminder SMS

## 🔐 Security Checklist

- [ ] SSL certificates installed and valid
- [ ] Environment variables secured
- [ ] Database passwords strong
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Regular security updates
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting set up

## 📈 Performance Monitoring

### Key Metrics to Monitor
- Response time < 200ms
- Database connection pool usage
- Redis memory usage
- Celery queue length
- Error rate < 1%
- Uptime > 99.9%

### Monitoring Tools
- **Health Checks**: Built-in endpoints
- **Logs**: Docker logs + file logging
- **Metrics**: Custom metrics endpoint
- **External**: Consider DataDog, New Relic, or similar

## 🆘 Support

For deployment issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Test individual services
4. Check network connectivity
5. Review security settings

## 📞 Contact

- **Technical Support**: tech@procompare.co.za
- **Documentation**: [GitHub Wiki]
- **Issues**: [GitHub Issues]










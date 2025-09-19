# 🚀 ProConnectSA Deployment: Hetzner + Vercel Architecture

## 🏗️ **Architecture Overview**

- **Domain**: `proconnectsa.co.za` ✅
- **Backend**: Django on Hetzner Cloud Server
- **Frontend**: Next.js on Vercel 
- **Database**: PostgreSQL on Hetzner
- **Cache/Queue**: Redis on Hetzner
- **Email**: SendGrid ✅
- **DNS**: Domain routing configuration

## 📋 **DNS Configuration Required**

### **Domain Records to Set Up:**

```dns
# Main domain (Vercel frontend)
proconnectsa.co.za        A/CNAME → Vercel
www.proconnectsa.co.za    CNAME   → Vercel

# API subdomain (Hetzner backend)
api.proconnectsa.co.za    A       → YOUR_HETZNER_IP
backend.proconnectsa.co.za A      → YOUR_HETZNER_IP
```

## 🖥️ **Hetzner Server Setup**

### **1. Server Requirements:**
- **CPU**: 2+ cores
- **RAM**: 4GB+ (8GB recommended)
- **Storage**: 40GB+ SSD
- **OS**: Ubuntu 20.04/22.04 LTS

### **2. Production Environment Variables:**

Create `/home/user/.env` on your Hetzner server:

```bash
# Django Production Settings
SECRET_KEY=your-super-secure-secret-key-for-production
DEBUG=False
DJANGO_SETTINGS_MODULE=backend.procompare.settings_production

# Domain Configuration  
ALLOWED_HOSTS=proconnectsa.co.za,www.proconnectsa.co.za,api.proconnectsa.co.za,backend.proconnectsa.co.za

# Database Configuration
USE_SQLITE=False
DB_NAME=proconnectsa
DB_USER=proconnectsa
DB_PASSWORD=your-secure-database-password-here
DB_HOST=localhost
DB_PORT=5432

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# SendGrid Email (READY TO USE)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key-here
DEFAULT_FROM_EMAIL=noreply@proconnectsa.co.za
SUPPORT_EMAIL=support@proconnectsa.co.za
ADMIN_EMAIL=admin@proconnectsa.co.za
SENDGRID_API_KEY=your-sendgrid-api-key-here

# Frontend URL (Vercel)
FRONTEND_URL=https://proconnectsa.co.za

# CORS Settings (Allow Vercel)
CORS_ALLOWED_ORIGINS=https://proconnectsa.co.za,https://www.proconnectsa.co.za,https://proconnectsa.vercel.app

# SMS (Disabled to save costs)
SMS_ENABLED=False
EMAIL_NOTIFICATIONS_ENABLED=True
```

### **3. Hetzner Deployment Commands:**

```bash
# 1. Upload your code to Hetzner server
scp -r /path/to/work_platform root@YOUR_HETZNER_IP:/opt/proconnectsa/

# 2. SSH into server
ssh root@YOUR_HETZNER_IP

# 3. Setup PostgreSQL
cd /opt/proconnectsa
chmod +x setup_postgresql_hetzner.sh
./setup_postgresql_hetzner.sh

# 4. Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo apt install docker-compose-plugin -y

# 5. Create production .env file
cp .env.example .env
nano .env  # Add the production environment variables above

# 6. Deploy the application
chmod +x deploy.sh
./deploy.sh
```

## 🌐 **Vercel Frontend Setup**

### **1. Vercel Configuration**

Create `vercel.json` in your frontend directory:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.proconnectsa.co.za",
    "NEXT_PUBLIC_FRONTEND_URL": "https://proconnectsa.co.za"
  }
}
```

### **2. Environment Variables in Vercel Dashboard:**

```bash
NEXT_PUBLIC_API_URL=https://api.proconnectsa.co.za
NEXT_PUBLIC_FRONTEND_URL=https://proconnectsa.co.za
NEXTAUTH_URL=https://proconnectsa.co.za
NEXTAUTH_SECRET=your-nextauth-secret-key
```

### **3. Deploy to Vercel:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
cd procompare-frontend
vercel --prod

# Add custom domain in Vercel dashboard:
# proconnectsa.co.za
# www.proconnectsa.co.za
```

## 🔧 **Frontend API Configuration**

Update your frontend API configuration to point to Hetzner backend:

```typescript
// procompare-frontend/src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'

export const api = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: '/api/auth/',
    leads: '/api/leads/',
    users: '/api/users/',
    // ... other endpoints
  }
}
```

## 🔒 **SSL Certificates**

### **For Hetzner (Let's Encrypt):**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Generate certificates
sudo certbot --nginx -d api.proconnectsa.co.za -d backend.proconnectsa.co.za

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **For Vercel:**
- SSL certificates are automatic
- Custom domains get free SSL

## 🧪 **Testing the Setup**

### **1. Test Backend API:**
```bash
curl https://api.proconnectsa.co.za/health/
curl https://api.proconnectsa.co.za/api/auth/login/
```

### **2. Test Frontend:**
```bash
curl https://proconnectsa.co.za
```

### **3. Test Email System:**
```bash
# On Hetzner server
cd /opt/proconnectsa
source venv/bin/activate
python test_sendgrid_email.py
```

## 📊 **Monitoring & Maintenance**

### **Health Check URLs:**
- **Backend**: `https://api.proconnectsa.co.za/health/`
- **Frontend**: `https://proconnectsa.co.za`
- **Admin**: `https://api.proconnectsa.co.za/admin/`

### **Log Monitoring:**
```bash
# Hetzner server logs
docker-compose logs -f backend
docker-compose logs -f celery
tail -f logs/django.log

# Vercel logs
vercel logs --follow
```

### **Database Backup:**
```bash
# Daily backup script
docker-compose exec db pg_dump -U proconnectsa proconnectsa > backup_$(date +%Y%m%d).sql
```

## 🚨 **Important Security Notes**

1. **Change default passwords** in production
2. **Enable firewall** on Hetzner server
3. **Regular security updates**
4. **Monitor logs** for suspicious activity
5. **Backup database** regularly

## 📞 **Deployment Checklist**

- [ ] Hetzner server provisioned
- [ ] Domain DNS configured
- [ ] PostgreSQL setup completed
- [ ] Docker deployment successful
- [ ] SSL certificates installed
- [ ] Frontend deployed to Vercel
- [ ] API endpoints tested
- [ ] Email system tested
- [ ] Admin user created
- [ ] Monitoring configured

## 🎯 **Next Steps After Deployment**

1. **Test all user flows** (registration, login, lead generation)
2. **Verify email delivery** (welcome, notifications)
3. **Check payment processing** (if applicable)
4. **Monitor performance** and optimize
5. **Set up monitoring alerts**

Your **ProConnectSA** platform will be running on a robust, scalable architecture! 🚀





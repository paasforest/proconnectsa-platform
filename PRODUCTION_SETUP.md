# Production Setup Guide

## SMS API Configuration

To ensure SMS notifications work in production, update your environment variables:

```bash
# SMS Configuration (Production)
PANACEA_SMS_API_KEY=your-production-sms-api-key-here
PANACEA_SMS_API_URL=https://api.panaceamobile.com/sms/send
SMS_SENDER_ID=ProConnectSA
SMS_TIMEOUT=30
SMS_RETRY_ATTEMPTS=3
```

## Environment Variables for Production

Create a `.env` file with these production settings:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/proconnectsa_prod

# Secret Key (generate a new one for production)
SECRET_KEY=your-super-secret-production-key-here

# Debug Mode (ALWAYS False in production)
DEBUG=False

# Allowed Hosts (add your production domain)
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com

# SMS Configuration (Production)
PANACEA_SMS_API_KEY=your-production-sms-api-key-here
PANACEA_SMS_API_URL=https://api.panaceamobile.com/sms/send
SMS_SENDER_ID=ProConnectSA
SMS_TIMEOUT=30
SMS_RETRY_ATTEMPTS=3

# Email Configuration (Production)
EMAIL_HOST=smtp.your-email-provider.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@yourdomain.com
EMAIL_HOST_PASSWORD=your-email-password

# Frontend URL (Production)
FRONTEND_URL=https://yourdomain.com

# Redis Configuration (Production)
REDIS_URL=redis://localhost:6379/0

# Celery Configuration (Production)
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Security Settings (Production)
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SECURE_CONTENT_TYPE_NOSNIFF=True
SECURE_BROWSER_XSS_FILTER=True
X_FRAME_OPTIONS=DENY

# Logging (Production)
LOG_LEVEL=INFO
```

## SMS API Testing

The SMS service is now production-ready with:

✅ **Robust Error Handling**: Handles both JSON and non-JSON responses
✅ **Production Configuration**: Environment-based settings
✅ **Retry Logic**: Configurable retry attempts
✅ **Timeout Management**: Configurable timeouts
✅ **Logging**: Comprehensive logging for debugging

## Current Status

- ✅ **Geographical Bug**: Fixed
- ✅ **SMS Error Handling**: Fixed
- ✅ **Production Configuration**: Ready
- ✅ **API Integration**: Ready for your production API key

## Next Steps

1. Update your `.env` file with production values
2. Set your real SMS API key: `PANACEA_SMS_API_KEY=your-real-api-key`
3. Deploy to production
4. Test SMS notifications with real phone numbers

The system is now production-ready for SMS notifications!




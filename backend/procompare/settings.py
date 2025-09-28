"""
Django settings for ProCompare project.
"""

import os
from pathlib import Path
from decouple import config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-me-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

# ML Services Configuration
USE_ML_PRICING = config('USE_ML_PRICING', default=False, cast=bool)  # Only enable in production

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=lambda v: [s.strip() for s in v.split(',')])

# Application definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django_filters',
    'channels',
    'django_ratelimit',
    'django_celery_beat',
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
]

LOCAL_APPS = [
    'backend.users',
    'backend.leads',
    'backend.reviews',
    'backend.notifications',
    'backend.payments',
    'backend.support',
    'backend.chat',
    'backend.business',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'backend.procompare.cors_middleware.CustomCorsMiddleware',  # Custom CORS middleware
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django_ratelimit.middleware.RatelimitMiddleware',
]

ROOT_URLCONF = 'backend.procompare.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.procompare.wsgi.application'
ASGI_APPLICATION = 'backend.procompare.asgi.application'

# Database
import os
from decouple import config

# Load environment variables
from pathlib import Path
import environ

env = environ.Env(
    DEBUG=(bool, True),
    USE_SQLITE=(bool, True)
)

# Read .env file from project root
environ.Env.read_env(os.path.join(Path(__file__).resolve().parent.parent.parent, '.env'))

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME', default='procompare_dev'),
        'USER': env('DB_USER', default='procompare_dev'),
        'PASSWORD': env('DB_PASSWORD', default='dev_password_123'),
        'HOST': env('DB_HOST', default='localhost'),
        'PORT': env('DB_PORT', default='5432'),
        'OPTIONS': {
            'connect_timeout': 60,
        },
    }
}

# Fallback to SQLite for development if PostgreSQL not available
if env('USE_SQLITE', default=True):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Johannesburg'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Production file storage settings
if os.environ.get('USE_S3') == 'True':
    # AWS S3 settings for production
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME', 'us-east-1')
    AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
    AWS_DEFAULT_ACL = 'private'
    AWS_S3_OBJECT_PARAMETERS = {
        'CacheControl': 'max-age=86400',
    }
    
    # Use S3 for media files
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'

# File upload settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
}

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://proconnectsa.co.za",
    "https://www.proconnectsa.co.za",
    "https://proconnectsa.vercel.app",
    "https://proconnectsa-platform.vercel.app",  # Actual Vercel URL
    "https://proconnectsa-git-main-your-username.vercel.app",  # Replace with your actual Vercel URL
    "https://proconnectsa-your-username.vercel.app",  # Replace with your actual Vercel URL
    "https://proconnectsa-git-main.vercel.app",  # Common Vercel pattern
    "https://proconnectsa-git-develop.vercel.app",  # Common Vercel pattern
    "https://proconnectsa-git-staging.vercel.app",  # Common Vercel pattern
]

CORS_ALLOW_CREDENTIALS = True

# Additional CORS settings for Vercel deployment
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://proconnectsa.*\.vercel\.app$",
    r"^https://.*\.vercel\.app$",  # Allow all Vercel preview deployments
    r"^https://.*-proconnectsa.*\.vercel\.app$",  # Vercel branch deployments
]

# SECURITY: Only allow specific origins
CORS_ALLOW_ALL_ORIGINS = False

# CORS headers
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Rate limiting configuration
RATELIMIT_USE_CACHE = 'default'
RATELIMIT_VIEW = 'backend.procompare.views.rate_limit_exceeded'

# Rate limiting settings for different endpoints
RATELIMIT_SETTINGS = {
    'api/auth/login/': '10/m',  # 10 login attempts per minute
    'api/auth/register/': '5/m',  # 5 registrations per minute
    'api/leads/create-public/': '20/h',  # 20 lead creations per hour
    'api/leads/': '100/h',  # 100 lead requests per hour
    'api/wallet/': '200/h',  # 200 wallet requests per hour
    'default': '1000/h',  # Default: 1000 requests per hour per IP
}

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Rate limiting
RATELIMIT_ENABLE = True
RATELIMIT_USE_CACHE = 'default'

# Channels configuration
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}

# Cache configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Session configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# Email settings
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_USE_SSL = config('EMAIL_USE_SSL', default=False, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@proconnectsa.co.za')
SUPPORT_EMAIL = config('SUPPORT_EMAIL', default='support@proconnectsa.co.za')
ADMIN_EMAIL = config('ADMIN_EMAIL', default='admin@proconnectsa.co.za')

# Frontend URL for email links
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:3000')

# Bank API Configuration for automatic reconciliation
BANK_API_CONFIG = {
    'enabled': config('BANK_API_ENABLED', default=False, cast=bool),
    'api_url': config('BANK_API_URL', default=''),
    'api_key': config('BANK_API_KEY', default=''),
    'account_id': config('BANK_ACCOUNT_ID', default=''),
    'bank_name': config('BANK_NAME', default='Nedbank'),
    'webhook_secret': config('BANK_WEBHOOK_SECRET', default=''),
}

# Site ID for django-allauth
SITE_ID = 1

# Authentication backends
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

# Django Allauth settings
ACCOUNT_LOGIN_METHODS = {'email'}
ACCOUNT_SIGNUP_FIELDS = ['email*', 'password1*', 'password2*']
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USER_MODEL_USERNAME_FIELD = None
ACCOUNT_USER_MODEL_EMAIL_FIELD = 'email'

# Social account settings
SOCIALACCOUNT_EMAIL_REQUIRED = True
SOCIALACCOUNT_EMAIL_VERIFICATION = 'mandatory'
SOCIALACCOUNT_QUERY_EMAIL = True

# Google OAuth settings
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        },
        'OAUTH_PKCE_ENABLED': True,
    }
}

# Google OAuth credentials
GOOGLE_OAUTH2_CLIENT_ID = config('GOOGLE_OAUTH2_CLIENT_ID', default='')
GOOGLE_OAUTH2_CLIENT_SECRET = config('GOOGLE_OAUTH2_CLIENT_SECRET', default='')

# Custom adapters
ACCOUNT_ADAPTER = 'backend.users.adapters.CustomAccountAdapter'
SOCIALACCOUNT_ADAPTER = 'backend.users.adapters.CustomSocialAccountAdapter'

# SMS Configuration for Production
PANACEA_SMS_USERNAME = config('PANACEA_SMS_USERNAME', default='isn_sms')
PANACEA_SMS_PASSWORD = config('PANACEA_SMS_PASSWORD', default='CellF@12346')
PANACEA_SMS_API_URL = config('PANACEA_SMS_API_URL', default='https://api.panaceamobile.com/json?action=message_send')
SMS_SENDER_ID = config('SMS_SENDER_ID', default='ProConnectSA')
SMS_TIMEOUT = config('SMS_TIMEOUT', default=30, cast=int)
SMS_RETRY_ATTEMPTS = config('SMS_RETRY_ATTEMPTS', default=3, cast=int)

# Frontend URL
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:3000')

# Celery settings
CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='redis://127.0.0.1:6379/0')
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default='redis://127.0.0.1:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

# Celery Beat Schedule
CELERY_BEAT_SCHEDULE = {
    'reconcile-bank-deposits': {
        'task': 'backend.users.tasks.run_bank_reconciliation',
        'schedule': 300.0,  # Every 5 minutes (300 seconds)
    },
    'sync-redis-counters': {
        'task': 'backend.leads.tasks.sync_redis_counters_to_database',
        'schedule': 60.0,  # Every 1 minute (60 seconds)
    },
    'monitor-unassigned-leads': {
        'task': 'backend.leads.tasks.monitor_and_fix_unassigned_leads',
        'schedule': 900.0,  # Every 15 minutes (900 seconds) - PRODUCTION SAFETY
    },
    'bulletproof-flow-check': {
        'task': 'backend.leads.tasks.bulletproof_flow_check',
        'schedule': 3600.0,  # Every hour (3600 seconds) - SYSTEM INTEGRITY
    },
}

# ML training thresholds
ML_MIN_QUALITY_TRAINING_LEADS = int(config('ML_MIN_QUALITY_TRAINING_LEADS', default=50))
ML_MIN_CONVERSION_TRAINING_ASSIGNMENTS = int(config('ML_MIN_CONVERSION_TRAINING_ASSIGNMENTS', default=30))
ML_MIN_GEOGRAPHICAL_TRAINING_ASSIGNMENTS = int(config('ML_MIN_GEOGRAPHICAL_TRAINING_ASSIGNMENTS', default=30))

# PayPal Settings
PAYPAL_MODE = config('PAYPAL_MODE', default='sandbox')  # 'sandbox' or 'live'
PAYPAL_CLIENT_ID = config('PAYPAL_CLIENT_ID', default='')
PAYPAL_CLIENT_SECRET = config('PAYPAL_CLIENT_SECRET', default='')
PAYPAL_WEBHOOK_ID = config('PAYPAL_WEBHOOK_ID', default='')

# Company Information for Invoices
COMPANY_NAME = 'ProConnectSA (Pty) Ltd'
COMPANY_REGISTRATION = '2023/123456/07'
COMPANY_VAT_NUMBER = '4123456789'
COMPANY_ADDRESS = '123 Business Street, Cape Town, 8001, South Africa'
COMPANY_PHONE = '+27 21 123 4567'
COMPANY_EMAIL = 'billing@proconnectsa.co.za'
COMPANY_WEBSITE = 'https://proconnectsa.co.za'
COMPANY_BANK_DETAILS = {
    'bank_name': 'Nedbank',
    'branch_code': '198765',
    'account_number': '1313872032',
    'account_holder': 'ProConnectSA (Pty) Ltd',
    'swift_code': 'NEDSZAJJ'
}

# Cache settings
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Session settings
SESSION_ENGINE = 'django.contrib.sessions.backends.db'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'backend': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

if not DEBUG:
    SECURE_SSL_REDIRECT = False  # Disabled for development
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

# =============================================================================
# ML & AI CONFIGURATION
# =============================================================================

# ML Configuration
ML_ENABLED = config('ML_ENABLED', default=False, cast=bool)  # Start disabled, auto-enable when ready
ML_MIN_LEADS = config('ML_MIN_LEADS', default=1000, cast=int)  # Minimum leads before ML kicks in
ML_MIN_TRANSACTIONS = config('ML_MIN_TRANSACTIONS', default=500, cast=int)
ML_MIN_CONVERSIONS = config('ML_MIN_CONVERSIONS', default=300, cast=int)

# A/B Testing Configuration
AB_TESTING_ENABLED = config('AB_TESTING_ENABLED', default=True, cast=bool)
AB_TEST_MIN_SAMPLE_SIZE = config('AB_TEST_MIN_SAMPLE_SIZE', default=100, cast=int)  # Minimum users per group

# =============================================================================
# SOUTH AFRICAN CONTEXT SETTINGS
# =============================================================================

# Premium areas for enhanced lead scoring
SA_PREMIUM_AREAS = [
    'sandton', 'rosebank', 'camps bay', 'constantia', 
    'ballito', 'umhlanga', 'stellenbosch', 'franschhoek',
    'clifton', 'bishops court', 'fresnaye', 'sea point',
    'green point', 'v&a waterfront', 'waterfront'
]

# Load shedding related keywords for lead scoring
SA_LOADSHEDDING_KEYWORDS = [
    'loadshedding', 'load shedding', 'generator', 'inverter', 
    'ups', 'backup power', 'solar', 'battery', 'backup',
    'power backup', 'emergency power', 'standby generator'
]

# South African payment preferences
SA_PREFERRED_PAYMENT_METHODS = ['eft', 'card', 'electronic', 'bank transfer']
SA_RISKY_PAYMENT_INDICATORS = ['cash only', 'cash payment', 'cash upfront']

# =============================================================================
# CREDIT PRICING CONFIGURATION
# =============================================================================

# Credit pricing settings
DEFAULT_CREDIT_PRICE = config('DEFAULT_CREDIT_PRICE', default=70, cast=int)  # R70 per credit
CREDIT_PRICE_RANGE = (50, 120)  # Min/max credit prices (R50 - R120)

# Dynamic pricing multipliers
CREDIT_PRICE_MULTIPLIERS = {
    'demand': (0.8, 1.5),      # 80% to 150% based on demand
    'quality': (0.9, 1.3),     # 90% to 130% based on lead quality
    'urgency': (1.0, 1.4),     # 100% to 140% based on urgency
    'competition': (0.7, 1.2), # 70% to 120% based on competition
    'time': (0.8, 1.1),        # 80% to 110% based on time of day
}

# =============================================================================
# ML MODEL CONFIGURATION
# =============================================================================

# Model training settings
ML_MODEL_RETRAIN_FREQUENCY = config('ML_MODEL_RETRAIN_FREQUENCY', default=7, cast=int)  # Days
ML_MODEL_MIN_ACCURACY_THRESHOLD = 0.7  # Minimum accuracy to use model
ML_MODEL_CONFIDENCE_THRESHOLD = 0.6    # Minimum confidence for predictions

# Model storage paths
ML_MODELS_DIR = os.path.join(BASE_DIR, 'ml_models')
ML_DATA_DIR = os.path.join(BASE_DIR, 'ml_data')

# Ensure directories exist
os.makedirs(ML_MODELS_DIR, exist_ok=True)
os.makedirs(ML_DATA_DIR, exist_ok=True)

# =============================================================================
# BUSINESS INTELLIGENCE SETTINGS
# =============================================================================

# Dashboard refresh intervals (in minutes)
BI_DASHBOARD_REFRESH_INTERVAL = 5
BI_ALERT_CHECK_INTERVAL = 10

# Alert thresholds
ALERT_CHURN_RISK_THRESHOLD = 0.1  # 10% of providers
ALERT_QUALITY_DECLINE_THRESHOLD = 0.3  # 30% low quality leads
ALERT_RESPONSE_TIME_THRESHOLD = 24  # 24 hours

# ML Pricing Configuration - DISABLE for testing/production
USE_ML_PRICING = False  # Use simple fixed pricing (1 credit = R50 per lead)



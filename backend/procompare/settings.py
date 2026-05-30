"""
Django settings for ProConnectSA.
Stripped to essentials — no Redis, Celery, ML, or WebSockets.
"""

import os
from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

# ============================================================
# CORE
# ============================================================

SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-me-in-production')
DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS',
    default='localhost,127.0.0.1',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

# ============================================================
# APPS
# ============================================================

DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django_filters',
    'django_ratelimit',
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
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ============================================================
# MIDDLEWARE
# ============================================================

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.procompare.urls'
WSGI_APPLICATION = 'backend.procompare.wsgi.application'

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

# ============================================================
# DATABASE — PostgreSQL on Railway, SQLite for local dev
# ============================================================

DATABASE_URL = config('DATABASE_URL', default='')

if DATABASE_URL:
    import dj_database_url
    DATABASES = {'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)}
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME', default='procompare_dev'),
            'USER': config('DB_USER', default='postgres'),
            'PASSWORD': config('DB_PASSWORD', default=''),
            'HOST': config('DB_HOST', default='localhost'),
            'PORT': config('DB_PORT', default='5432'),
        }
    }

AUTH_USER_MODEL = 'users.User'

# ============================================================
# CACHE — simple DB cache, no Redis needed
# ============================================================

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
        'LOCATION': 'cache_table',
    }
}

SESSION_ENGINE = 'django.contrib.sessions.backends.db'

# ============================================================
# STATIC & MEDIA
# ============================================================

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024   # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB

# ============================================================
# AUTH & PASSWORDS
# ============================================================

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

SITE_ID = 1

ACCOUNT_AUTHENTICATION_METHOD = "username_email"
ACCOUNT_EMAIL_VERIFICATION = 'optional'
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_ADAPTER = 'backend.users.adapters.CustomAccountAdapter'

SOCIALACCOUNT_EMAIL_REQUIRED = True
SOCIALACCOUNT_EMAIL_VERIFICATION = 'mandatory'
SOCIALACCOUNT_QUERY_EMAIL = True
SOCIALACCOUNT_ADAPTER = 'backend.users.adapters.CustomSocialAccountAdapter'

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
        'OAUTH_PKCE_ENABLED': True,
    }
}

GOOGLE_OAUTH2_CLIENT_ID = config('GOOGLE_OAUTH2_CLIENT_ID', default='')
GOOGLE_OAUTH2_CLIENT_SECRET = config('GOOGLE_OAUTH2_CLIENT_SECRET', default='')

# ============================================================
# REST FRAMEWORK
# ============================================================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'backend.users.expiring_token_auth.ExpiringTokenAuthentication',
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

# ============================================================
# CORS
# ============================================================

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://proconnectsa.co.za",
    "https://www.proconnectsa.co.za",
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False

CORS_ALLOW_HEADERS = [
    'accept', 'accept-encoding', 'authorization',
    'content-type', 'dnt', 'origin',
    'user-agent', 'x-csrftoken', 'x-requested-with',
]

# ============================================================
# EMAIL — Resend
# ============================================================

EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
RESEND_API_KEY = config('RESEND_API_KEY', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@proconnectsa.co.za')
SUPPORT_EMAIL = config('SUPPORT_EMAIL', default='support@proconnectsa.co.za')
ADMIN_EMAIL = config('ADMIN_EMAIL', default='admin@proconnectsa.co.za')
FRONTEND_URL = config('FRONTEND_URL', default='https://www.proconnectsa.co.za')

# ============================================================
# SMS — Panacea Mobile
# ============================================================

PANACEA_SMS_USERNAME = config('PANACEA_SMS_USERNAME', default='')
PANACEA_SMS_PASSWORD = config('PANACEA_SMS_PASSWORD', default='')
PANACEA_SMS_API_URL = config('PANACEA_SMS_API_URL', default='https://api.panaceamobile.com/json?action=message_send')
SMS_SENDER_ID = config('SMS_SENDER_ID', default='ProConnectSA')

# ============================================================
# PAYMENTS
# ============================================================

PAYPAL_MODE = config('PAYPAL_MODE', default='sandbox')
PAYPAL_CLIENT_ID = config('PAYPAL_CLIENT_ID', default='')
PAYPAL_CLIENT_SECRET = config('PAYPAL_CLIENT_SECRET', default='')

DEFAULT_CREDIT_PRICE = config('DEFAULT_CREDIT_PRICE', default=70, cast=int)

COMPANY_NAME = 'ProConnectSA (Pty) Ltd'
COMPANY_REGISTRATION = '2023/123456/07'
COMPANY_ADDRESS = 'Cape Town, South Africa'
COMPANY_PHONE = '077 438 8845'
COMPANY_EMAIL = 'billing@proconnectsa.co.za'
COMPANY_WEBSITE = 'https://proconnectsa.co.za'
COMPANY_BANK_DETAILS = {
    'bank_name': 'Nedbank',
    'branch_code': '198765',
    'account_number': '1313872032',
    'account_holder': 'ProConnectSA (Pty) Ltd',
    'swift_code': 'NEDSZAJJ',
}

# ============================================================
# LEAD SETTINGS
# ============================================================

UNLOCK_MODE = config('UNLOCK_MODE', default='hybrid')
RESERVATION_EXPIRY_HOURS = config('RESERVATION_EXPIRY_HOURS', default=24, cast=int)

SA_PREMIUM_AREAS = [
    'sandton', 'rosebank', 'camps bay', 'constantia',
    'ballito', 'umhlanga', 'stellenbosch', 'franschhoek',
    'clifton', 'sea point', 'green point', 'waterfront',
]

# ============================================================
# RATE LIMITING
# ============================================================

RATELIMIT_ENABLE = True
RATELIMIT_USE_CACHE = 'default'
RATELIMIT_VIEW = 'backend.procompare.views.rate_limit_exceeded'

# ============================================================
# MONITORING
# ============================================================

SENTRY_DSN = config('SENTRY_DSN', default='')

if SENTRY_DSN:
    import sentry_sdk
    sentry_sdk.init(dsn=SENTRY_DSN, traces_sample_rate=0.2)

# ============================================================
# INTERNATIONALISATION
# ============================================================

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Johannesburg'
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ============================================================
# SECURITY
# ============================================================

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

if not DEBUG:
    SECURE_SSL_REDIRECT = False  # Railway handles SSL termination
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# ============================================================
# LOGGING
# ============================================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'backend': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

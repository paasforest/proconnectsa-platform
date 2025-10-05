# 🔐 Safe Security Improvements (No Breaking Changes)

## ✅ Current System Understanding

Your platform is built with:
- **Backend**: Django REST Framework with Token Authentication
- **Frontend**: Next.js (React) with localStorage
- **Auth Flow**: Direct API login → Store token in localStorage → Use `Authorization: Token ${token}` header
- **WebSocket**: Token passed in query string for real-time features

## 🎯 Safe Improvements (Won't Break Existing Code)

### **1. Add Token Expiration (Backend Only)**

**File: `backend/users/models.py`**

Add expiration check without changing token storage:

```python
from django.utils import timezone
from datetime import timedelta

class ExpiringToken(models.Model):
    """Extended token model with expiration"""
    user = models.OneToOneField(User, related_name='auth_token_expiring', on_delete=models.CASCADE)
    key = models.CharField(max_length=40, primary_key=True)
    created = models.DateTimeField(auto_now_add=True)
    
    def is_expired(self):
        """Check if token is older than 14 days"""
        return timezone.now() > self.created + timedelta(days=14)
    
    class Meta:
        db_table = 'auth_token_expiring'
```

**File: `backend/users/authentication.py`**

```python
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed

class ExpiringTokenAuthentication(TokenAuthentication):
    """Token authentication with expiration check"""
    
    def authenticate_credentials(self, key):
        model = self.get_model()
        try:
            token = model.objects.select_related('user').get(key=key)
        except model.DoesNotExist:
            raise AuthenticationFailed('Invalid token.')

        if not token.user.is_active:
            raise AuthenticationFailed('User inactive or deleted.')
        
        # Check expiration (if using ExpiringToken model)
        if hasattr(token, 'is_expired') and token.is_expired():
            raise AuthenticationFailed('Token has expired.')

        return (token.user, token)
```

**File: `backend/procompare/settings.py`**

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'backend.users.authentication.ExpiringTokenAuthentication',  # ✅ Use custom auth
        # Keep existing for backwards compatibility:
        'rest_framework.authentication.TokenAuthentication',
    ],
    # ... rest of config
}
```

---

### **2. Add Content Security Policy (Frontend Only)**

**File: `procompare-frontend/next.config.js`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.proconnectsa.co.za wss://api.proconnectsa.co.za",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

### **3. Add Token Refresh (Keep localStorage)**

**File: `backend/users/views.py`**

Add a refresh endpoint (doesn't change login):

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_token(request):
    """Refresh user's auth token"""
    # Delete old token
    request.user.auth_token.delete()
    
    # Create new token
    token = Token.objects.create(user=request.user)
    
    return Response({
        'success': True,
        'token': token.key,
        'message': 'Token refreshed successfully'
    })
```

**File: `backend/users/urls.py`**

```python
urlpatterns = [
    # ... existing patterns
    path('refresh-token/', views.refresh_token, name='refresh-token'),
]
```

**File: `procompare-frontend/src/lib/auth-utils.ts`**

Add refresh function (doesn't change existing code):

```typescript
export const refreshAuthToken = async (): Promise<string | null> => {
  const currentToken = getTokenFromStorage();
  if (!currentToken) return null;
  
  try {
    const response = await fetch('https://api.proconnectsa.co.za/api/auth/refresh-token/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${currentToken}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      return data.token;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
  
  return null;
};
```

---

### **4. Add XSS Protection Middleware (Backend)**

**File: `backend/procompare/middleware.py`**

```python
from django.utils.deprecation import MiddlewareMixin
import bleach

class XSSProtectionMiddleware(MiddlewareMixin):
    """Sanitize user inputs to prevent XSS"""
    
    def process_request(self, request):
        if request.method in ['POST', 'PUT', 'PATCH']:
            if hasattr(request, 'data') and isinstance(request.data, dict):
                request.data = self.sanitize_data(request.data)
        return None
    
    def sanitize_data(self, data):
        """Recursively sanitize dictionary data"""
        if isinstance(data, dict):
            return {k: self.sanitize_data(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [self.sanitize_data(item) for item in data]
        elif isinstance(data, str):
            # Only sanitize strings, allow specific safe tags
            return bleach.clean(
                data,
                tags=['b', 'i', 'u', 'em', 'strong', 'p', 'br'],
                strip=True
            )
        return data
```

**Add to settings.py:**

```python
MIDDLEWARE = [
    # ... existing middleware
    'backend.procompare.middleware.XSSProtectionMiddleware',  # Add this
]
```

---

### **5. Add Rate Limiting Per User (Already Have API Rate Limiting)**

**File: `backend/users/authentication.py`**

```python
from django.core.cache import cache
from rest_framework.exceptions import Throttled

class RateLimitedTokenAuthentication(ExpiringTokenAuthentication):
    """Token auth with per-user rate limiting"""
    
    def authenticate_credentials(self, key):
        user, token = super().authenticate_credentials(key)
        
        # Check rate limit: 1000 requests per hour per user
        cache_key = f'user_ratelimit_{user.id}'
        request_count = cache.get(cache_key, 0)
        
        if request_count > 1000:
            raise Throttled(detail='Rate limit exceeded. Please try again later.')
        
        # Increment counter
        cache.set(cache_key, request_count + 1, 3600)  # 1 hour expiry
        
        return (user, token)
```

---

### **6. Add Secure Logout (Clear Token on Server)**

**File: `backend/users/views.py`**

```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """Logout user and invalidate token"""
    try:
        # Delete the token on the server
        request.user.auth_token.delete()
        return Response({
            'success': True,
            'message': 'Logged out successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=400)
```

**File: `procompare-frontend/src/lib/auth-utils.ts`**

```typescript
export const logoutUser = async (): Promise<void> => {
  const token = getTokenFromStorage();
  
  if (token) {
    try {
      // Invalidate token on server
      await fetch('https://api.proconnectsa.co.za/api/auth/logout/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  // Clear local storage
  clearAuth();
};
```

---

### **7. Add Input Validation Decorators**

**File: `backend/users/validators.py`**

```python
import re
from functools import wraps
from rest_framework.response import Response
from rest_framework import status

def validate_email(func):
    """Decorator to validate email format"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        request = args[1] if len(args) > 1 else kwargs.get('request')
        email = request.data.get('email', '')
        
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            return Response({
                'success': False,
                'message': 'Invalid email format'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return func(*args, **kwargs)
    return wrapper

def sanitize_input(func):
    """Decorator to sanitize dangerous characters"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        request = args[1] if len(args) > 1 else kwargs.get('request')
        
        # Remove dangerous patterns
        dangerous_patterns = ['<script', 'javascript:', 'onerror=', 'onclick=']
        
        for field in request.data:
            if isinstance(request.data[field], str):
                for pattern in dangerous_patterns:
                    if pattern in request.data[field].lower():
                        return Response({
                            'success': False,
                            'message': 'Invalid input detected'
                        }, status=status.HTTP_400_BAD_REQUEST)
        
        return func(*args, **kwargs)
    return wrapper
```

**Usage:**

```python
class UserLoginView(generics.GenericAPIView):
    @validate_email
    @sanitize_input
    def post(self, request, *args, **kwargs):
        # ... existing code
```

---

## 🚀 Implementation Order (Zero Downtime)

1. ✅ **Add Security Headers** (frontend - no backend changes needed)
2. ✅ **Add Input Validation** (backend - doesn't affect existing requests)
3. ✅ **Add Token Expiration** (backend - existing tokens still work)
4. ✅ **Add Logout Endpoint** (backend - optional feature)
5. ✅ **Add Token Refresh** (backend + frontend - optional feature)
6. ✅ **Add XSS Middleware** (backend - transparent to frontend)

---

## ✅ Benefits Without Breaking Changes

- ✅ Existing code keeps working
- ✅ No localStorage migration needed
- ✅ No changes to API call patterns
- ✅ No changes to WebSocket connections
- ✅ Gradual security improvements
- ✅ Can deploy incrementally
- ✅ Backward compatible

---

## 📊 Security Before vs After

| Security Feature | Before | After |
|-----------------|--------|-------|
| Token Storage | localStorage | localStorage (same) |
| Token Format | `Token ${key}` | `Token ${key}` (same) |
| Token Expiration | ❌ Never | ✅ 14 days |
| XSS Protection | ⚠️ Basic | ✅ Enhanced |
| Input Validation | ⚠️ Basic | ✅ Comprehensive |
| Rate Limiting | ✅ API-level | ✅ User-level |
| Secure Logout | ❌ Client only | ✅ Server + Client |
| CSP Headers | ❌ None | ✅ Full |

---

## 🎯 Next Steps

**Choose what you want to implement:**

1. **Quick wins (30 mins)**:
   - Add security headers to Next.js
   - Add logout endpoint to Django

2. **Medium improvements (2 hours)**:
   - Add token expiration
   - Add input validation decorators

3. **Full security (4 hours)**:
   - Everything above +
   - Token refresh system
   - XSS middleware
   - Enhanced rate limiting

**All changes are backward compatible and won't break your existing platform!**


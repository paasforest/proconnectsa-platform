# 📚 ProCompare API Documentation

## 🔗 Base URL
- **Development**: `http://localhost:8000/api/`
- **Production**: `https://api.procompare.co.za/api/`

## 🔐 Authentication

All protected endpoints require authentication using Django Token Authentication.

### Headers
```
Authorization: Token <your-token>
Content-Type: application/json
```

### Get Token
```http
POST /api/auth/login/
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "user": {
        "id": "uuid",
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "user_type": "client"
    },
    "token": "your-auth-token"
}
```

## 👥 User Management

### Register User
```http
POST /api/auth/register/
Content-Type: application/json

{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+27812345678",
    "password": "password123",
    "confirmPassword": "password123",
    "user_type": "client",
    "city": "Cape Town",
    "suburb": "Sea Point"
}
```

### Get User Profile
```http
GET /api/auth/profile/
Authorization: Token <your-token>
```

### Update User Profile
```http
PUT /api/auth/profile/
Authorization: Token <your-token>
Content-Type: application/json

{
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+27812345678",
    "city": "Cape Town",
    "suburb": "Sea Point"
}
```

## 🏢 Service Categories

### List Categories
```http
GET /api/leads/categories/
```

**Response:**
```json
{
    "count": 13,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "name": "Plumbing",
            "slug": "plumbing",
            "description": "Pipes, faucets, toilets, water heaters",
            "icon": "wrench",
            "is_active": true,
            "created_at": "2025-09-08T22:12:48.467140+02:00",
            "subcategories": []
        }
    ]
}
```

## 📋 Leads Management

### Create Lead
```http
POST /api/leads/create/
Authorization: Token <your-token>
Content-Type: application/json

{
    "service_category": 1,
    "title": "Fix leaking tap",
    "description": "Kitchen tap is leaking and needs repair",
    "location_city": "Cape Town",
    "location_suburb": "Sea Point",
    "budget_range": "500-1000",
    "urgency": "medium",
    "preferred_contact_time": "morning"
}
```

### Get Available Leads (Providers)
```http
GET /api/leads/available/
Authorization: Token <your-token>
```

### Get Lead Details
```http
GET /api/leads/{lead_id}/
Authorization: Token <your-token>
```

### Verify Lead SMS
```http
POST /api/leads/{lead_id}/verify-sms/
Authorization: Token <your-token>
Content-Type: application/json

{
    "verification_code": "123456"
}
```

## 💳 Payments & Credits

### Get Credit Balance
```http
GET /api/payments/balance/
Authorization: Token <your-token>
```

### Purchase Credits
```http
POST /api/payments/purchase/
Authorization: Token <your-token>
Content-Type: application/json

{
    "amount": 100.00,
    "payment_method": "card",
    "payment_reference": "txn_123456"
}
```

### Get Transaction History
```http
GET /api/payments/transactions/
Authorization: Token <your-token>
```

## 💰 Manual Deposits

### Create Manual Deposit
```http
POST /api/payments/manual-deposits/create/
Authorization: Token <your-token>
Content-Type: application/json

{
    "amount": 500.00,
    "credits_to_activate": 5
}
```

**Response:**
```json
{
    "id": "uuid",
    "reference_number": "MD12345678",
    "amount": "500.00",
    "credits_to_activate": 5,
    "status": "pending",
    "created_at": "2025-09-09T05:32:41+02:00",
    "expires_at": "2025-09-16T05:32:41+02:00"
}
```

### Upload Deposit Slip
```http
POST /api/payments/manual-deposits/{deposit_id}/upload-slip/
Authorization: Token <your-token>
Content-Type: multipart/form-data

deposit_slip: <file>
```

### List Manual Deposits
```http
GET /api/payments/manual-deposits/
Authorization: Token <your-token>
```

### Get Manual Deposit Details
```http
GET /api/payments/manual-deposits/{deposit_id}/
Authorization: Token <your-token>
```

## 🔔 Notifications

### Get Notifications
```http
GET /api/notifications/
Authorization: Token <your-token>
```

### Mark Notification as Read
```http
PUT /api/notifications/{notification_id}/
Authorization: Token <your-token>
Content-Type: application/json

{
    "is_read": true
}
```

### Mark All Notifications as Read
```http
POST /api/notifications/mark-all-read/
Authorization: Token <your-token>
```

## ⭐ Reviews

### Create Review
```http
POST /api/reviews/
Authorization: Token <your-token>
Content-Type: application/json

{
    "provider": "provider-uuid",
    "lead_assignment": "assignment-uuid",
    "rating": 5,
    "communication_rating": 5,
    "quality_rating": 5,
    "timeliness_rating": 4,
    "value_rating": 5,
    "comment": "Excellent service!",
    "is_public": true
}
```

### Get Provider Reviews
```http
GET /api/reviews/?provider={provider_id}
Authorization: Token <your-token>
```

## 🏢 Provider Profile

### Get Provider Profile
```http
GET /api/auth/provider-profile/
Authorization: Token <your-token>
```

### Create/Update Provider Profile
```http
POST /api/auth/provider-profile/create/
Authorization: Token <your-token>
Content-Type: application/json

{
    "business_name": "ABC Plumbing",
    "business_registration": "2023/123456/07",
    "license_number": "PL12345",
    "vat_number": "4123456789",
    "business_phone": "+27812345678",
    "business_email": "info@abcplumbing.co.za",
    "business_address": "123 Main Street, Cape Town",
    "bio": "Professional plumbing services",
    "years_experience": 10,
    "hourly_rate_min": 200.00,
    "hourly_rate_max": 400.00,
    "service_areas": ["Cape Town", "Stellenbosch"],
    "service_categories": [1, 2, 3]
}
```

## 🔍 Search & Filtering

### Search Leads
```http
GET /api/leads/?search=plumbing&city=Cape Town&budget_range=500-1000
Authorization: Token <your-token>
```

### Filter by Category
```http
GET /api/leads/?service_category=1
Authorization: Token <your-token>
```

### Filter by Status
```http
GET /api/leads/?status=active
Authorization: Token <your-token>
```

## 📊 Statistics

### Get User Stats
```http
GET /api/auth/stats/
Authorization: Token <your-token>
```

### Get Credit Transaction Stats
```http
GET /api/payments/stats/
Authorization: Token <your-token>
```

## 🏥 Health & Monitoring

### Health Check
```http
GET /health/
```

### Metrics
```http
GET /metrics/
```

### Readiness Check
```http
GET /ready/
```

### Liveness Check
```http
GET /live/
```

## ❌ Error Responses

### 400 Bad Request
```json
{
    "error": "Validation error",
    "details": {
        "field_name": ["Error message"]
    }
}
```

### 401 Unauthorized
```json
{
    "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
    "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
    "detail": "Not found."
}
```

### 429 Too Many Requests
```json
{
    "detail": "Request was throttled. Expected available in 60 seconds."
}
```

### 500 Internal Server Error
```json
{
    "error": "Internal server error"
}
```

## 🔄 WebSocket Endpoints

### Real-time Notifications
```
ws://localhost:8000/ws/notifications/
```

**Authentication:**
```json
{
    "type": "auth",
    "token": "your-auth-token"
}
```

**Message Format:**
```json
{
    "type": "notification",
    "notification": {
        "id": "uuid",
        "type": "lead_assigned",
        "title": "New Lead Available",
        "message": "You have a new plumbing lead in Cape Town",
        "is_read": false,
        "created_at": "2025-09-09T05:32:41+02:00"
    }
}
```

## 📝 Rate Limiting

- **API Endpoints**: 10 requests per second per IP
- **Login Endpoint**: 5 requests per minute per IP
- **Registration Endpoint**: 3 requests per minute per IP

## 🔒 Security Headers

All responses include security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

## 📱 Mobile App Support

The API is designed to work seamlessly with mobile applications:
- RESTful design
- JSON responses
- Token-based authentication
- WebSocket support for real-time features
- File upload support for images and documents










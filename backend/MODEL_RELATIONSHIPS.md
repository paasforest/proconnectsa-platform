# Model Relationships Diagram

## Core Entity Relationships

```
User (AbstractUser)
├── OneToOne → ProviderProfile
├── OneToMany → Lead (as client)
├── OneToMany → LeadAssignment (as provider)
├── OneToMany → Review (as client_given)
├── OneToMany → Review (as provider_received)
├── OneToMany → Notification
└── OneToMany → CreditTransaction

ProviderProfile
├── ManyToMany → ServiceCategory
└── OneToOne → User

ServiceCategory
├── ForeignKey → ServiceCategory (parent)
├── ManyToMany → ProviderProfile
└── OneToMany → Lead

Lead
├── ForeignKey → User (client)
├── ForeignKey → ServiceCategory
├── OneToMany → LeadAssignment
├── OneToMany → Notification
└── OneToMany → CreditTransaction (via LeadAssignment)

LeadAssignment
├── ForeignKey → Lead
├── ForeignKey → User (provider)
├── OneToOne → Review
├── OneToMany → Notification
└── OneToMany → CreditTransaction

Review
├── OneToOne → LeadAssignment
├── ForeignKey → User (client)
└── ForeignKey → User (provider)

Notification
├── ForeignKey → User
├── ForeignKey → Lead (optional)
├── ForeignKey → LeadAssignment (optional)
└── ForeignKey → Review (optional)

CreditTransaction
├── ForeignKey → User (provider)
└── ForeignKey → LeadAssignment (optional)
```

## Data Flow Architecture

```
Client Request → Lead Creation → Verification → Provider Matching → Assignment → Notification → Tracking → Review
     ↓              ↓              ↓              ↓              ↓           ↓          ↓         ↓
   User          Lead          SMS/Email      ServiceCategory  LeadAssignment  Notification  Review  CreditTransaction
```

## App Dependencies

```
users (core)
├── leads (depends on users)
├── reviews (depends on users, leads)
├── notifications (depends on users, leads, reviews)
└── payments (depends on users, leads)

utils (shared services)
├── sms_service (used by leads, notifications)
└── email_service (used by leads, notifications)
```

## Key Relationships Explained

### User ↔ ProviderProfile
- **Relationship**: OneToOne
- **Purpose**: Extended profile for service providers
- **Access**: `user.provider_profile` or `provider_profile.user`

### User ↔ Lead
- **Relationship**: OneToMany (User as client)
- **Purpose**: Track leads created by clients
- **Access**: `user.leads_created.all()`

### Lead ↔ LeadAssignment
- **Relationship**: OneToMany
- **Purpose**: Track which providers are assigned to each lead
- **Access**: `lead.assignments.all()` or `assignment.lead`

### LeadAssignment ↔ Review
- **Relationship**: OneToOne
- **Purpose**: Link reviews to specific job assignments
- **Access**: `assignment.review` or `review.lead_assignment`

### User ↔ Notification
- **Relationship**: OneToMany
- **Purpose**: Send notifications to users
- **Access**: `user.notifications.all()`

### User ↔ CreditTransaction
- **Relationship**: OneToMany (User as provider)
- **Purpose**: Track all credit movements for providers
- **Access**: `user.credit_transactions.all()`

## Database Indexes

### Primary Indexes
- All models have UUID primary keys
- Foreign key fields are automatically indexed

### Custom Indexes
- **User**: `['user_type', 'created_at']`, `['phone']`, `['city', 'suburb']`
- **ProviderProfile**: `['verification_status', 'subscription_tier']`, `['average_rating', 'total_reviews']`
- **Lead**: `['status', 'created_at']`, `['service_category', 'location_city']`, `['verification_score', 'status']`
- **LeadAssignment**: `['provider', 'assigned_at']`, `['lead', 'status']`, `['status', 'assigned_at']`
- **Review**: `['provider', 'is_public', 'created_at']`, `['rating', 'is_public']`
- **Notification**: `['user', 'is_read', 'created_at']`, `['notification_type', 'created_at']`
- **CreditTransaction**: `['provider', 'created_at']`, `['transaction_type', 'created_at']`

## Query Optimization Examples

### Efficient Lead Assignment Query
```python
# Get matching providers with related data
providers = ProviderProfile.objects.filter(
    service_categories=lead.service_category,
    verification_status='verified'
).select_related('user').prefetch_related('service_categories')
```

### Efficient Notification Query
```python
# Get unread notifications for user
notifications = Notification.objects.filter(
    user=user,
    is_read=False
).select_related('lead', 'lead_assignment').order_by('-created_at')
```

### Efficient Review Query
```python
# Get public reviews for provider
reviews = Review.objects.filter(
    provider=provider,
    is_public=True
).select_related('client', 'lead_assignment__lead').order_by('-created_at')
```

This structure ensures optimal performance while maintaining clear separation of concerns and scalability.



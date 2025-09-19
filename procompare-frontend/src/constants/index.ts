// User types
export const USER_TYPES = {
  CLIENT: 'client',
  PROVIDER: 'provider',
  ADMIN: 'admin',
} as const

// Lead statuses
export const LEAD_STATUS = {
  PENDING: 'pending',
  VERIFYING: 'verifying',
  VERIFIED: 'verified',
  ASSIGNED: 'assigned',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const

// Lead urgency levels
export const URGENCY_LEVELS = {
  URGENT: 'urgent',
  THIS_WEEK: 'this_week',
  THIS_MONTH: 'this_month',
  FLEXIBLE: 'flexible',
} as const

// Budget ranges
export const BUDGET_RANGES = {
  UNDER_1000: 'under_1000',
  R1000_5000: '1000_5000',
  R5000_15000: '5000_15000',
  R15000_50000: '15000_50000',
  OVER_50000: 'over_50000',
  NO_BUDGET: 'no_budget',
} as const

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  BASIC: 'basic',
  ADVANCED: 'advanced',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const

// Subscription Packages - Lead-Based System
export const SUBSCRIPTION_PACKAGES = {
  BASIC: {
    id: 'basic',
    name: 'Basic Package',
    price: 299,
    currency: 'ZAR',
    leads: 10, // 10 leads per month
    free_leads: 0, // No free leads
    features: [
      '10 leads per month',
      'Contact & send quotes to 10 clients',
      'In-app chat with clients',
      'Basic dashboard analytics',
      'Email notifications',
      'Standard support',
      'R29.90 per lead (40% savings)',
      'R50 per additional lead after limit'
    ],
    savings: 40, // 40% savings vs pay-per-lead (R29.90 vs R50)
    popular: false
  },
  ADVANCED: {
    id: 'advanced',
    name: 'Advanced Package',
    price: 599,
    currency: 'ZAR',
    leads: 25, // 25 leads per month
    free_leads: 0, // No free leads
    features: [
      '25 leads per month',
      'Contact & send quotes to 25 clients',
      'In-app chat + Video calls',
      'Advanced analytics + Lead insights',
      'Priority lead matching',
      'SMS notifications',
      'Priority support',
      'R23.96 per lead (52% savings)',
      'R50 per additional lead after limit'
    ],
    savings: 52, // 52% savings vs pay-per-lead (R23.96 vs R50)
    popular: true
  },
  PRO: {
    id: 'pro',
    name: 'Pro Package',
    price: 999,
    currency: 'ZAR',
    leads: 50, // 50 leads per month
    free_leads: 0, // No free leads
    features: [
      '50 leads per month',
      'Contact & send quotes to 50 clients',
      'All communication tools',
      'Premium analytics + Custom reports',
      'Top priority in lead matching',
      'Multi-channel notifications',
      'Dedicated account manager',
      'R19.98 per lead (60% savings)',
      'R50 per additional lead after limit'
    ],
    savings: 60, // 60% savings vs pay-per-lead (R19.98 vs R50)
    popular: false
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise Package',
    price: 1000,
    currency: 'ZAR',
    leads: 50, // 50 leads per month (capped)
    free_leads: 0, // No free leads
    features: [
      '50 leads per month',
      'Contact & send quotes to 50 clients',
      'White-label options',
      'API access',
      'Custom integrations',
      '24/7 dedicated support',
      'Custom reporting',
      'Multi-user accounts',
      'R20.00 per lead (60% savings)',
      'R50 per additional lead after limit'
    ],
    savings: 60, // 60% savings vs pay-per-lead (R20.00 vs R50)
    popular: false
  }
} as const

// Pay-per-lead pricing (discouraged - drives subscriptions)
export const PAY_PER_LEAD_PRICE = 50
export const PAY_PER_LEAD_CURRENCY = 'ZAR'

// Verification statuses
export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
} as const

// Notification types
export const NOTIFICATION_TYPES = {
  NEW_LEAD: 'new_lead',
  LEAD_ASSIGNED: 'lead_assigned',
  CLIENT_RESPONSE: 'client_response',
  REVIEW_RECEIVED: 'review_received',
  CREDIT_LOW: 'credit_low',
  SUBSCRIPTION_EXPIRING: 'subscription_expiring',
  VERIFICATION_APPROVED: 'verification_approved',
  VERIFICATION_REJECTED: 'verification_rejected',
  SYSTEM_UPDATE: 'system_update',
  PAYMENT_RECEIVED: 'payment_received',
  LEAD_EXPIRED: 'lead_expired',
} as const

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const

// Transaction types
export const TRANSACTION_TYPES = {
  PURCHASE: 'purchase',
  DEDUCTION: 'deduction',
  REFUND: 'refund',
  BONUS: 'bonus',
  SUBSCRIPTION: 'subscription',
  ADMIN_ADJUSTMENT: 'admin_adjustment',
  EXPIRED_LEAD: 'expired_lead',
} as const

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login/',
    REGISTER: '/api/auth/register/',
    LOGOUT: '/api/auth/logout/',
    PROFILE: '/api/auth/profile/',
    PROVIDER_PROFILE: '/api/auth/provider-profile/',
  },
  LEADS: {
    CATEGORIES: '/api/leads/categories/',
    CREATE: '/api/leads/create/',
    LIST: '/api/leads/',
    DETAIL: '/api/leads/',
    ASSIGNMENTS: '/api/leads/assignments/',
  },
  REVIEWS: {
    LIST: '/api/reviews/',
    CREATE: '/api/reviews/create/',
    DETAIL: '/api/reviews/',
  },
  NOTIFICATIONS: {
    LIST: '/api/notifications/',
    UNREAD_COUNT: '/api/notifications/unread-count/',
  },
  PAYMENTS: {
    BALANCE: '/api/payments/balance/',
    TRANSACTIONS: '/api/payments/transactions/',
    PURCHASE: '/api/payments/purchase/',
  },
} as const

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY: '/verify',
  DASHBOARD: {
    PROVIDER: '/provider',
    ADMIN: '/admin',
    CLIENT: '/client',
  },
  LEADS: {
    LIST: '/leads',
    CREATE: '/leads/create',
    DETAIL: '/leads',
  },
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const

// Form validation
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+27[0-9]{9}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 1000,
} as const

// UI constants
export const UI_CONSTANTS = {
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  PAGINATION_SIZE: 20,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const

// Service areas (Cape Town focused)
export const SERVICE_AREAS = [
  'Cape Town CBD',
  'Bellville',
  'Goodwood',
  'Parow',
  'Durbanville',
  'Stellenbosch',
  'Paarl',
  'Somerset West',
  'Constantia',
  'Sea Point',
  'Green Point',
  'Claremont',
  'Rondebosch',
  'Newlands',
  'Observatory',
  'Woodstock',
  'Salt River',
  'Gardens',
  'Vredehoek',
  'Oranjezicht',
] as const

// Service categories
export const SERVICE_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Painting',
  'Carpentry',
  'Cleaning',
  'Gardening',
  'Roofing',
  'Flooring',
  'Kitchen Renovation',
  'Bathroom Renovation',
  'General Maintenance',
  'Appliance Repair',
  'HVAC',
  'Security',
  'Pool Maintenance',
] as const




// User types
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  user_type: 'client' | 'provider' | 'admin'
  phone: string
  city: string
  suburb: string
  is_phone_verified: boolean
  is_email_verified: boolean
  created_at: string
  last_active: string
}

export interface ProviderProfile {
  id: string
  user: string
  business_name: string
  business_registration: string
  license_number: string
  vat_number: string
  business_phone: string
  business_email: string
  business_address: string
  service_areas: string[]
  max_travel_distance: number
  hourly_rate_min: number
  hourly_rate_max: number
  minimum_job_value: number
  subscription_tier: 'basic' | 'premium' | 'enterprise'
  subscription_start_date: string
  subscription_end_date: string
  credit_balance: number
  monthly_lead_limit: number
  leads_used_this_month: number
  verification_status: 'pending' | 'verified' | 'rejected' | 'suspended'
  verification_documents: Record<string, any>
  insurance_valid_until: string
  average_rating: number
  total_reviews: number
  response_time_hours: number
  job_completion_rate: number
  bio: string
  years_experience: number
  profile_image: string
  portfolio_images: string[]
  receives_lead_notifications: boolean
  notification_methods: string[]
  created_at: string
  updated_at: string
}

// Lead types
export interface ServiceCategory {
  id: string
  name: string
  slug: string
  description: string
  parent: string | null
  icon: string
  is_active: boolean
  created_at: string
}

export interface Lead {
  id: string
  client: string
  service_category: string
  title: string
  description: string
  location_address: string
  location_suburb: string
  location_city: string
  latitude: number
  longitude: number
  budget_range: string
  urgency: string
  preferred_contact_time: string
  additional_requirements: string
  verification_score: number
  verification_notes: string
  is_sms_verified: boolean
  sms_verification_code: string
  sms_verification_attempts: number
  status: string
  assigned_providers_count: number
  total_provider_contacts: number
  // Bark-style competition stats
  views_count?: number
  responses_count?: number
  source: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  created_at: string
  updated_at: string
  verified_at: string
  expires_at: string
  // Client contact details (credit-gated for pay-as-you-go)
  client_phone?: string
  client_email?: string
  client_name?: string
  // Visibility control
  is_contact_details_visible: boolean
  contact_details_unlocked: boolean
  credit_required: number
  credit_cost: number
  // Bark-style lead flow fields
  max_providers?: number
  is_available?: boolean
  claimed_at?: string
  claim_status?: string
  remaining_slots?: number
  assigned_count?: number
  can_claim?: boolean
  pricing_reasoning?: string
  access_reason?: string
  // Legacy fields for compatibility
  location?: string
  category?: string
  budget?: string
}

export interface LeadAssignment {
  id: string
  lead: string
  provider: string
  assigned_at: string
  viewed_at: string
  contacted_at: string
  quote_provided_at: string
  provider_notes: string
  quote_amount: number
  estimated_duration: string
  status: string
  won_job: boolean
  client_feedback: string
  provider_rating: number
  credit_cost: number
  credit_refunded: boolean
  refund_reason: string
  updated_at: string
}

// Review types
export interface Review {
  id: string
  lead_assignment: string
  client: string
  provider: string
  rating: number
  title: string
  comment: string
  quality_rating: number
  communication_rating: number
  timeliness_rating: number
  value_rating: number
  job_completed: boolean
  final_price: number
  would_recommend: boolean
  is_verified: boolean
  is_public: boolean
  is_moderated: boolean
  moderation_notes: string
  created_at: string
  updated_at: string
}

// Notification types
export interface Notification {
  id: string
  user: string
  notification_type: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  message: string
  lead: string | null
  lead_assignment: string | null
  review: string | null
  is_read: boolean
  is_sent_via_sms: boolean
  is_sent_via_email: boolean
  is_sent_via_push: boolean
  action_url: string
  action_text: string
  created_at: string
  read_at: string
  sent_at: string
}

// Payment types
export interface CreditTransaction {
  id: string
  provider: string
  transaction_type: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  amount: number
  balance_after: number
  lead_assignment: string | null
  payment_reference: string
  description: string
  admin_notes: string
  created_at: string
  processed_at: string
}

// API Response types
export interface ApiResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface AuthResponse {
  user: User
  token: string
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  first_name: string
  last_name: string
  phone: string
  user_type: 'client' | 'provider'
  city: string
  suburb: string
}

export interface LeadForm {
  service_category: string
  title: string
  description: string
  location_address: string
  location_suburb: string
  location_city: string
  budget_range: string
  urgency: string
  preferred_contact_time: string
  additional_requirements: string
}

// Lead Visibility System types
export interface LeadVisibility {
  can_view_contact_details: boolean
  credit_required: number
  subscription_tier?: string
  has_sufficient_credits: boolean
  upgrade_prompt?: string
}

export interface CreditPurchase {
  lead_id: string
  credit_cost: number
  payment_method: string
  transaction_reference?: string
}

export interface LeadAccessLevel {
  level: 'public' | 'subscription' | 'credit_required'
  description: string
  features: string[]
  upgrade_required: boolean
}






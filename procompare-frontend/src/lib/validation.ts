import { z } from 'zod'

// Common validation schemas
export const phoneRegex = /^\+27[0-9]{9}$/
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

// User registration validation
export const userRegistrationSchema = z.object({
  first_name: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  
  last_name: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  
  phone: z.string()
    .regex(phoneRegex, 'Please enter a valid South African phone number (+27XXXXXXXXX)'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  confirmPassword: z.string(),
  
  user_type: z.enum(['client', 'provider'], {
    required_error: 'Please select an account type',
  }),
  
  city: z.string()
    .min(2, 'City is required')
    .max(100, 'City name must be less than 100 characters'),
  
  suburb: z.string()
    .min(2, 'Suburb is required')
    .max(100, 'Suburb name must be less than 100 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Lead creation validation
export const leadCreationSchema = z.object({
  service_category: z.string()
    .min(1, 'Service category is required'),
  
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  
  location_city: z.string()
    .min(2, 'City is required')
    .max(100, 'City name must be less than 100 characters'),
  
  location_suburb: z.string()
    .min(2, 'Suburb is required')
    .max(100, 'Suburb name must be less than 100 characters'),
  
  budget_range: z.string()
    .min(1, 'Budget range is required'),
  
  urgency: z.enum(['low', 'medium', 'high'], {
    required_error: 'Please select urgency level',
  }),
  
  preferred_contact_time: z.string()
    .min(1, 'Preferred contact time is required'),
})

// Provider profile validation
export const providerProfileSchema = z.object({
  business_name: z.string()
    .min(2, 'Business name must be at least 2 characters')
    .max(200, 'Business name must be less than 200 characters'),
  
  business_registration: z.string()
    .optional()
    .refine((val) => !val || val.length >= 10, 'Business registration must be at least 10 characters'),
  
  license_number: z.string()
    .optional()
    .refine((val) => !val || val.length >= 5, 'License number must be at least 5 characters'),
  
  vat_number: z.string()
    .optional()
    .refine((val) => !val || val.length >= 10, 'VAT number must be at least 10 characters'),
  
  business_phone: z.string()
    .optional()
    .refine((val) => !val || phoneRegex.test(val), 'Please enter a valid South African phone number'),
  
  business_email: z.string()
    .optional()
    .refine((val) => !val || emailRegex.test(val), 'Please enter a valid email address'),
  
  business_address: z.string()
    .min(10, 'Business address must be at least 10 characters')
    .max(500, 'Business address must be less than 500 characters'),
  
  bio: z.string()
    .optional()
    .refine((val) => !val || val.length >= 20, 'Bio must be at least 20 characters if provided')
    .refine((val) => !val || val.length <= 1000, 'Bio must be less than 1000 characters'),
  
  years_experience: z.number()
    .min(0, 'Years of experience cannot be negative')
    .max(50, 'Years of experience cannot exceed 50'),
  
  hourly_rate_min: z.number()
    .min(0, 'Minimum hourly rate cannot be negative')
    .max(10000, 'Minimum hourly rate cannot exceed R10,000'),
  
  hourly_rate_max: z.number()
    .min(0, 'Maximum hourly rate cannot be negative')
    .max(10000, 'Maximum hourly rate cannot exceed R10,000'),
}).refine((data) => {
  if (data.hourly_rate_min && data.hourly_rate_max) {
    return data.hourly_rate_max >= data.hourly_rate_min
  }
  return true
}, {
  message: "Maximum hourly rate must be greater than or equal to minimum hourly rate",
  path: ["hourly_rate_max"],
})

// Review validation
export const reviewSchema = z.object({
  rating: z.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  
  communication_rating: z.number()
    .min(1, 'Communication rating must be at least 1')
    .max(5, 'Communication rating cannot exceed 5'),
  
  quality_rating: z.number()
    .min(1, 'Quality rating must be at least 1')
    .max(5, 'Quality rating cannot exceed 5'),
  
  timeliness_rating: z.number()
    .min(1, 'Timeliness rating must be at least 1')
    .max(5, 'Timeliness rating cannot exceed 5'),
  
  value_rating: z.number()
    .min(1, 'Value rating must be at least 1')
    .max(5, 'Value rating cannot exceed 5'),
  
  comment: z.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment must be less than 1000 characters'),
  
  is_public: z.boolean().default(true),
})

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type),
      'File must be a JPEG, PNG, or PDF'
    ),
})

// Credit purchase validation
export const creditPurchaseSchema = z.object({
  amount: z.number()
    .min(1, 'Must purchase at least 1 credit')
    .max(1000, 'Cannot purchase more than 1000 credits at once'),
  
  payment_method: z.enum(['card', 'eft', 'paypal', 'manual'], {
    required_error: 'Please select a payment method',
  }),
  
  payment_reference: z.string().optional(),
})

// Manual deposit validation
export const manualDepositSchema = z.object({
  amount: z.number()
    .min(1, 'Deposit amount must be at least R1')
    .max(10000, 'Deposit amount cannot exceed R10,000'),
  
  credits_to_activate: z.number()
    .min(1, 'Must activate at least 1 credit')
    .max(1000, 'Cannot activate more than 1000 credits at once'),
})

// Utility functions
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

export function validateFileSize(file: File, maxSizeMB: number): boolean {
  return file.size <= maxSizeMB * 1024 * 1024
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}










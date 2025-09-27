// Modern Lead Generation Form - Fixed for Backend Compatibility
'use client'
import { useState, useCallback, useMemo } from 'react'
import { ChevronRight, ChevronLeft, MapPin, Calendar, DollarSign, Phone, Mail, CheckCircle, Star, Shield, Users } from 'lucide-react'

// Lead form data structure - Compatible with backend
interface LeadFormData {
  // Step 1: Service & Location
  service_category: string
  service_type: string
  location: string
  urgency: string
  
  // Step 2: Project Details & Budget
  project_title: string
  project_description: string
  budget_range: string
  preferred_start_date: string
  special_requirements: string
  
  // Step 3: Contact & Preferences
  contact_name: string
  contact_phone: string
  contact_email: string
  preferred_contact_method: string
  marketing_consent: boolean
}

// Service categories with backend mapping
const SERVICE_CATEGORIES = {
  'home-improvement': {
    name: 'Home Improvement',
    icon: '🏠',
    backendId: 1, // Map to actual backend category ID
    types: ['Plumbing', 'Electrical', 'Painting', 'Flooring', 'Roofing', 'Kitchen Renovation', 'Bathroom Renovation', 'Garden Landscaping']
  },
  'cleaning': {
    name: 'Cleaning Services', 
    icon: '🧹',
    backendId: 2,
    types: ['House Cleaning', 'Carpet Cleaning', 'Window Cleaning', 'Deep Cleaning', 'Move-in/out Cleaning', 'Office Cleaning']
  },
  'automotive': {
    name: 'Automotive',
    icon: '🚗', 
    backendId: 3,
    types: ['Car Repair', 'Car Wash', 'Towing', 'Mobile Mechanic', 'Car Inspection', 'Tire Service']
  },
  'wellness': {
    name: 'Wellness & Beauty',
    icon: '💄',
    backendId: 4,
    types: ['Personal Trainer', 'Massage Therapy', 'Hair Styling', 'Makeup Artist', 'Nutrition Counseling', 'Spa Services']
  },
  'business': {
    name: 'Business Services',
    icon: '💼',
    backendId: 5,
    types: ['Legal Advice', 'Accounting', 'Marketing', 'Web Design', 'Photography', 'Event Planning']
  },
  'tutoring': {
    name: 'Tutoring & Training',
    icon: '📚',
    backendId: 6,
    types: ['Academic Tutoring', 'Music Lessons', 'Language Learning', 'Driving Lessons', 'Computer Training', 'Fitness Training']
  }
}

const BUDGET_RANGES = [
  'Under R500', 'R500 - R1,500', 'R1,500 - R5,000', 'R5,000 - R15,000', 'R15,000 - R50,000', 'Over R50,000'
]

const URGENCY_OPTIONS = [
  { value: 'urgent', label: 'ASAP (Within 24 hours)', color: 'bg-red-500' },
  { value: 'this-week', label: 'This week', color: 'bg-amber-500' },
  { value: 'this-month', label: 'Within a month', color: 'bg-emerald-500' },
  { value: 'flexible', label: "I'm flexible", color: 'bg-blue-500' }
]

interface LeadGenerationFormProps {
  onComplete?: (data: any) => void
  onCancel?: () => void
  preselectedCategory?: string | null
}

export default function LeadGenerationForm({ onComplete, onCancel, preselectedCategory }: LeadGenerationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<LeadFormData>({
    service_category: preselectedCategory || '',
    service_type: '',
    location: '',
    urgency: '',
    project_title: '',
    project_description: '',
    budget_range: '',
    preferred_start_date: '',
    special_requirements: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    preferred_contact_method: '',
    marketing_consent: false
  })

  // Update form data
  const updateFormData = useCallback((field: keyof LeadFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Step validation
  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return formData.service_category && formData.service_type && formData.location && formData.urgency
      case 2:
        return formData.project_title && formData.project_description && formData.budget_range
      case 3:
        return formData.contact_name && formData.contact_phone && formData.contact_email
      default:
        return false
    }
  }, [currentStep, formData])

  // Navigation
  const nextStep = () => {
    if (isStepValid && currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Transform form data to Django backend format
  const transformToBackendFormat = (data: LeadFormData) => {
    const selectedCategory = SERVICE_CATEGORIES[data.service_category as keyof typeof SERVICE_CATEGORIES]
    
    // Map urgency to Flask server format
    const urgencyMapping: { [key: string]: string } = {
      'urgent': 'urgent',
      'this-week': 'this_week',
      'this-month': 'this_month',
      'flexible': 'flexible'
    }

    // Map budget to Flask server format
    const budgetMapping: { [key: string]: string } = {
      'Under R500': 'Under R500',
      'R500 - R1,500': 'R500 - R1,500',
      'R1,500 - R5,000': 'R1,500 - R5,000',
      'R5,000 - R15,000': 'R5,000 - R15,000',
      'R15,000 - R50,000': 'R15,000 - R50,000',
      'Over R50,000': 'Over R50,000'
    }
    
    return {
      // Required Flask server fields
      service_category: data.service_category,
      service_type: data.service_type,
      location: data.location,
      urgency: urgencyMapping[data.urgency] || 'flexible',
      project_title: data.project_title,
      project_description: data.project_description,
      budget_range: budgetMapping[data.budget_range] || 'No budget specified',
      contact_name: data.contact_name,
      contact_phone: data.contact_phone,
      contact_email: data.contact_email,
      
      // Optional fields (Django format)
      hiring_intent: data.hiring_intent || 'ready_to_hire',
      hiring_timeline: data.hiring_timeline || 'this_month',
      research_purpose: '',
      
      // Metadata
      source: 'website',
      status: 'verified', // Auto-verify for now
      verification_score: 85 // Default score
    }
  }

  // Form submission
  const handleSubmit = async () => {
    if (!isStepValid) return

    setIsSubmitting(true)
    try {
      // Transform data to backend format
      const backendData = transformToBackendFormat(formData)
      
      console.log('📤 Submitting lead (backend format):', JSON.stringify(backendData, null, 2))
      console.log('🔍 Form data being sent:', JSON.stringify(formData, null, 2))
      
        // Submit to Next.js API route (which proxies to Django backend)
        console.log('🌐 Making request to /api/leads/create-public/')
        const response = await fetch('/api/leads/create-public/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(backendData)
        })
        
        console.log('📡 Response received:', response.status, response.statusText)

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Lead created successfully:', result)
        
        // Call the onComplete callback if provided
        if (onComplete) {
          onComplete(result)
        }
        
        // Success! Show confirmation or redirect
        alert('Thank you! We\'re connecting you with qualified professionals.')
        
        // Reset form
        setCurrentStep(1)
        setFormData({
          service_category: preselectedCategory || '',
          service_type: '',
          location: '',
          urgency: '',
          project_title: '',
          project_description: '',
          budget_range: '',
          preferred_start_date: '',
          special_requirements: '',
          contact_name: '',
          contact_phone: '',
          contact_email: '',
          preferred_contact_method: '',
          marketing_consent: false
        })
      } else {
        const errorData = await response.json()
        console.error('❌ Submission failed:', JSON.stringify(errorData, null, 2))
        console.error('❌ Response status:', response.status)
        console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()))
        throw new Error(`Submission failed: ${response.status} - ${errorData.error || errorData.message || errorData.detail || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Lead scoring algorithm
  const calculateLeadScore = (data: LeadFormData) => {
    let score = 50 // Base score
    
    // Urgency scoring
    if (data.urgency === 'urgent') score += 20
    else if (data.urgency === 'this-week') score += 15
    else if (data.urgency === 'this-month') score += 10
    
    // Budget scoring  
    if (data.budget_range.includes('50,000')) score += 15
    else if (data.budget_range.includes('15,000')) score += 10
    else if (data.budget_range.includes('5,000')) score += 5
    
    // Description quality
    if (data.project_description.length > 100) score += 10
    if (data.project_description.length > 200) score += 5
    
    // Contact completeness
    if (data.contact_phone && data.contact_email) score += 5
    
    return Math.min(100, score)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Get Multiple Quotes in Minutes
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Tell us what you need, we'll connect you with top-rated professionals
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-1 text-emerald-600" />
              Vetted Professionals
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-emerald-600" />
              Top Rated
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1 text-emerald-600" />
              Multiple Quotes
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Step {currentStep} of 3</span>
            <span>{Math.round((currentStep / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-emerald-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Step 1: Service & Location */}
          {currentStep === 1 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What service do you need?</h2>
              
              {/* Service Categories */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">Service Category</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(SERVICE_CATEGORIES).map(([key, category]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        updateFormData('service_category', key)
                        updateFormData('service_type', '') // Reset service type
                      }}
                      className={`p-4 rounded-lg border-2 text-left hover:border-emerald-300 transition-all ${
                        formData.service_category === key
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <div className="font-medium">{category.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Types */}
              {formData.service_category && (
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-4">Specific Service</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {SERVICE_CATEGORIES[formData.service_category as keyof typeof SERVICE_CATEGORIES]?.types.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateFormData('service_type', type)}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                          formData.service_type === type
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter your suburb or postal code"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Urgency */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  How urgent is this?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {URGENCY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateFormData('urgency', option.value)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.urgency === option.value
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${option.color} mr-3`}></div>
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Project Details */}
          {currentStep === 2 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell us about your project</h2>
              
              {/* Project Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g., Kitchen renovation needed"
                  value={formData.project_title}
                  onChange={(e) => updateFormData('project_title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Project Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description
                  <span className="text-xs text-gray-500 ml-2">(Be specific to get better quotes)</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe what you need done, any specific requirements, materials, timeline, etc."
                  value={formData.project_description}
                  onChange={(e) => updateFormData('project_description', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.project_description.length}/500 characters
                </div>
              </div>

              {/* Budget Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  <DollarSign className="inline w-4 h-4 mr-1" />
                  What's your budget range?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {BUDGET_RANGES.map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => updateFormData('budget_range', range)}
                      className={`p-3 rounded-lg border text-center font-medium transition-all ${
                        formData.budget_range === range
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Start Date */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Start Date (Optional)</label>
                <input
                  type="date"
                  value={formData.preferred_start_date}
                  onChange={(e) => updateFormData('preferred_start_date', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Special Requirements */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Any special requirements, access issues, materials preferences, etc."
                  value={formData.special_requirements}
                  onChange={(e) => updateFormData('special_requirements', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Contact Information */}
          {currentStep === 3 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost done! How can professionals reach you?</h2>
              <p className="text-gray-600 mb-6">We'll only share your details with qualified professionals who can help with your project.</p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.contact_name}
                    onChange={(e) => updateFormData('contact_name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline w-4 h-4 mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g., 082 123 4567"
                    value={formData.contact_phone}
                    onChange={(e) => updateFormData('contact_phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-1" />
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.contact_email}
                  onChange={(e) => updateFormData('contact_email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Preferred Contact Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">How would you prefer to be contacted?</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['Phone', 'Email', 'WhatsApp'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => updateFormData('preferred_contact_method', method)}
                      className={`p-3 rounded-lg border text-center font-medium transition-all ${
                        formData.preferred_contact_method === method
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Marketing Consent */}
              <div className="mb-6">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.marketing_consent}
                    onChange={(e) => updateFormData('marketing_consent', e.target.checked)}
                    className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-600">
                    I agree to receive marketing communications about relevant services. You can unsubscribe at any time.
                  </span>
                </label>
              </div>

              {/* Summary Box */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Project Summary</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Service:</strong> {formData.service_type}</div>
                  <div><strong>Location:</strong> {formData.location}</div>
                  <div><strong>Budget:</strong> {formData.budget_range}</div>
                  <div><strong>Urgency:</strong> {URGENCY_OPTIONS.find(opt => opt.value === formData.urgency)?.label}</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="bg-gray-50 px-8 py-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
            </div>

            <div className="text-sm text-gray-500">
              Step {currentStep} of 3
            </div>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid}
                className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
              >
                Next Step
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isStepValid || isSubmitting}
                className="flex items-center px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Get My Quotes
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-1 text-emerald-600" />
              Secure & Private
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1 text-emerald-600" />
              Free Service
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1 text-emerald-600" />
              1000+ Happy Customers
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            By submitting this form, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}

// Modern Lead Generation Form - Fixed for Backend Compatibility
'use client'
import { useState, useCallback, useMemo } from 'react'
import { ChevronRight, ChevronLeft, MapPin, Calendar, DollarSign, Phone, Mail, CheckCircle, Star, Shield, Users } from 'lucide-react'

// Lead form data structure - Compatible with ML services
interface LeadFormData {
  // Step 1: Service & Location
  service_category: string
  service_type: string
  location: string
  location_address: string
  location_suburb: string
  location_city: string
  latitude: number | null
  longitude: number | null
  urgency: string
  
  // Step 2: Project Details & Budget
  project_title: string
  project_description: string
  budget_range: string
  preferred_start_date: string
  special_requirements: string
  additional_requirements: string
  
  // Step 3: Intent & Timeline (ML Critical)
  hiring_intent: string
  hiring_timeline: string
  research_purpose: string
  
  // Step 4: Contact & Preferences
  contact_name: string
  contact_phone: string
  contact_email: string
  preferred_contact_method: string
  marketing_consent: boolean
}

// Service categories with correct backend mapping
const SERVICE_CATEGORIES = {
  'cleaning': {
    name: 'Cleaning Services', 
    icon: '🧹',
    backendId: 1, // Correct backend ID
    types: ['House Cleaning', 'Carpet Cleaning', 'Window Cleaning', 'Deep Cleaning', 'Move-in/out Cleaning', 'Office Cleaning']
  },
  'plumbing': {
    name: 'Plumbing Services',
    icon: '🔧',
    backendId: 2,
    types: ['Pipe Repair', 'Drain Cleaning', 'Toilet Repair', 'Water Heater', 'Leak Detection', 'Bathroom Installation']
  },
  'electrical': {
    name: 'Electrical Services',
    icon: '⚡',
    backendId: 3,
    types: ['Wiring', 'Outlet Installation', 'Light Fixtures', 'Electrical Panel', 'Generator Installation', 'Smart Home Setup']
  },
  'hvac': {
    name: 'HVAC Services',
    icon: '🌡️',
    backendId: 4,
    types: ['AC Repair', 'Heating Repair', 'Duct Cleaning', 'Installation', 'Maintenance', 'Thermostat Setup']
  },
  'carpentry': {
    name: 'Carpentry Services',
    icon: '🔨',
    backendId: 5,
    types: ['Furniture Repair', 'Cabinet Installation', 'Door Repair', 'Window Installation', 'Custom Woodwork', 'Deck Building']
  },
  'painting': {
    name: 'Painting Services',
    icon: '🎨',
    backendId: 6,
    types: ['Interior Painting', 'Exterior Painting', 'Wallpaper Removal', 'Color Consultation', 'Touch-ups', 'Priming']
  },
  'roofing': {
    name: 'Roofing Services',
    icon: '🏠',
    backendId: 7,
    types: ['Roof Repair', 'Roof Replacement', 'Gutter Cleaning', 'Leak Repair', 'Roof Inspection', 'Shingle Installation']
  },
  'flooring': {
    name: 'Flooring Services',
    icon: '🏠',
    backendId: 8,
    types: ['Tile Installation', 'Carpet Installation', 'Hardwood Flooring', 'Laminate Flooring', 'Floor Repair', 'Floor Sanding']
  },
  'landscaping': {
    name: 'Landscaping Services',
    icon: '🌱',
    backendId: 9,
    types: ['Garden Design', 'Lawn Care', 'Tree Trimming', 'Hedge Cutting', 'Irrigation', 'Paving']
  },
  'moving': {
    name: 'Moving Services',
    icon: '📦',
    backendId: 10,
    types: ['Local Moving', 'Long Distance Moving', 'Packing Services', 'Storage', 'Furniture Assembly', 'Office Relocation']
  },
  'appliance-repair': {
    name: 'Appliance Repair',
    icon: '🔧',
    backendId: 11,
    types: ['Refrigerator Repair', 'Washing Machine Repair', 'Dishwasher Repair', 'Oven Repair', 'Microwave Repair', 'Dryer Repair']
  },
  'handyman': {
    name: 'Handyman Services',
    icon: '🔨',
    backendId: 12,
    types: ['General Repairs', 'Assembly', 'Mounting', 'Hanging', 'Minor Renovations', 'Maintenance']
  },
  'pool-maintenance': {
    name: 'Pool Maintenance',
    icon: '🏊',
    backendId: 13,
    types: ['Pool Cleaning', 'Chemical Balancing', 'Equipment Repair', 'Pool Opening', 'Pool Closing', 'Water Testing']
  },
  'security': {
    name: 'Security Services',
    icon: '🔒',
    backendId: 14,
    types: ['Alarm Installation', 'CCTV Setup', 'Access Control', 'Security Consultation', 'Monitoring', 'Emergency Response']
  },
  'it-support': {
    name: 'IT Support',
    icon: '💻',
    backendId: 15,
    types: ['Computer Repair', 'Network Setup', 'Software Installation', 'Data Recovery', 'Virus Removal', 'Tech Support']
  },
  'web-design': {
    name: 'Web Design',
    icon: '🌐',
    backendId: 16,
    types: ['Website Design', 'E-commerce', 'Mobile Apps', 'SEO', 'Maintenance', 'Hosting']
  },
  'marketing': {
    name: 'Marketing Services',
    icon: '📈',
    backendId: 17,
    types: ['Digital Marketing', 'Social Media', 'Content Creation', 'Advertising', 'Branding', 'Analytics']
  },
  'accounting': {
    name: 'Accounting Services',
    icon: '📊',
    backendId: 18,
    types: ['Bookkeeping', 'Tax Preparation', 'Financial Planning', 'Payroll', 'Auditing', 'Consulting']
  },
  'legal': {
    name: 'Legal Services',
    icon: '⚖️',
    backendId: 19,
    types: ['Legal Consultation', 'Document Review', 'Contract Drafting', 'Litigation', 'Compliance', 'Notary']
  },
  'consulting': {
    name: 'Consulting Services',
    icon: '💼',
    backendId: 20,
    types: ['Business Consulting', 'Management Consulting', 'Strategy Consulting', 'Operations Consulting', 'Financial Consulting', 'HR Consulting']
  },
  'other': {
    name: 'Other Services',
    icon: '🔧',
    backendId: 21,
    types: ['Custom Service', 'Specialized Service', 'Unique Request', 'One-off Service', 'Emergency Service', 'Specialized Repair']
  }
}

const BUDGET_RANGES = [
  { label: 'Under R1,000', value: 'under_1000' },
  { label: 'R1,000 - R5,000', value: '1000_5000' },
  { label: 'R5,000 - R15,000', value: '5000_15000' },
  { label: 'R15,000 - R50,000', value: '15000_50000' },
  { label: 'Over R50,000', value: 'over_50000' }
]

const URGENCY_OPTIONS = [
  { label: 'Urgent (ASAP)', value: 'urgent' },
  { label: 'This Week', value: 'this_week' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Flexible', value: 'flexible' }
]

const HIRING_INTENT_OPTIONS = [
  { label: 'Ready to Hire', value: 'ready_to_hire' },
  { label: 'Planning to Hire', value: 'planning_to_hire' },
  { label: 'Comparing Quotes', value: 'comparing_quotes' },
  { label: 'Just Researching', value: 'researching' }
]

const HIRING_TIMELINE_OPTIONS = [
  { label: 'ASAP', value: 'asap' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Next Month', value: 'next_month' },
  { label: 'Flexible', value: 'flexible' }
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
    location_address: '',
    location_suburb: '',
    location_city: '',
    latitude: null,
    longitude: null,
    urgency: '',
    project_title: '',
    project_description: '',
    budget_range: '',
    preferred_start_date: '',
    special_requirements: '',
    additional_requirements: '',
    hiring_intent: '',
    hiring_timeline: '',
    research_purpose: '',
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
        return formData.hiring_intent && formData.hiring_timeline
      case 4:
        return formData.contact_name && formData.contact_phone && formData.contact_email
      default:
        return false
    }
  }, [currentStep, formData])

  // Navigation
  const nextStep = () => {
    if (isStepValid && currentStep < 4) {
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
    
    return {
      // Service information
      service_category_id: selectedCategory?.backendId || 1,
      title: data.project_title,
      description: data.project_description,
      
      // Location information (ML Critical)
      location_address: data.location_address || data.location,
      location_suburb: data.location_suburb || 'Suburb not specified',
      location_city: data.location_city || data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      
      // Budget and urgency
      budget_range: data.budget_range,
      urgency: data.urgency,
      preferred_contact_time: 'morning',
      
      // Intent and timeline (ML Critical)
      hiring_intent: data.hiring_intent,
      hiring_timeline: data.hiring_timeline,
      research_purpose: data.research_purpose || '',
      
      // Additional requirements
      additional_requirements: data.additional_requirements || data.special_requirements || '',
      
      // Client contact information
      client_name: data.contact_name,
      client_email: data.contact_email,
      client_phone: data.contact_phone,
      
      // Metadata
      source: 'website',
      status: 'verified',
      verification_score: 85
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
      console.log('🔍 Raw form data keys:', Object.keys(formData))
      console.log('🔍 Backend data keys:', Object.keys(backendData))
      
        // Submit directly to Django backend using API client
        console.log('🌐 Making request to Django backend via API client')
        const { apiClient } = await import('@/lib/api-simple')
        const result = await apiClient.createPublicLead(backendData)
        
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
          location_address: '',
          location_suburb: '',
          location_city: '',
          latitude: null,
          longitude: null,
          urgency: '',
          project_title: '',
          project_description: '',
          budget_range: '',
          preferred_start_date: '',
          special_requirements: '',
          additional_requirements: '',
          hiring_intent: '',
          hiring_timeline: '',
          research_purpose: '',
          contact_name: '',
          contact_phone: '',
          contact_email: '',
          preferred_contact_method: '',
          marketing_consent: false
        })
    } catch (error: any) {
      console.error('❌ Submission error:', error)
      console.error('❌ Error details:', error.response?.data || error.message)
      
      let errorMessage = 'Failed to submit lead. Please try again.';
      if (error.response?.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      alert(`Submission failed: ${errorMessage}`);
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
            <span>Step {currentStep} of 4</span>
            <span>{Math.round((currentStep / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-emerald-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / 4) * 100}%` }}
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
                      key={range.value}
                      type="button"
                      onClick={() => updateFormData('budget_range', range.value)}
                      className={`p-3 rounded-lg border text-center font-medium transition-all ${
                        formData.budget_range === range.value
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {range.label}
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

          {/* Step 3: Intent & Timeline (ML Critical) */}
          {currentStep === 3 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Help us match you with the right professionals</h2>
              <p className="text-gray-600 mb-6">This information helps us prioritize your request and match you with the most suitable providers.</p>
              
              {/* Hiring Intent */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  How ready are you to hire someone?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {HIRING_INTENT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateFormData('hiring_intent', option.value)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        formData.hiring_intent === option.value
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hiring Timeline */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  When do you need this completed?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {HIRING_TIMELINE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateFormData('hiring_timeline', option.value)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        formData.hiring_timeline === option.value
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Research Purpose */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Research Purpose (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Are you researching prices, comparing options, or just getting ideas? This helps us understand your needs better."
                  value={formData.research_purpose}
                  onChange={(e) => updateFormData('research_purpose', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Additional Requirements */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Requirements (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Any additional requirements, preferences, or special considerations for this project."
                  value={formData.additional_requirements}
                  onChange={(e) => updateFormData('additional_requirements', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Step 4: Contact Information */}
          {currentStep === 4 && (
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
              Step {currentStep} of 4
            </div>

            {currentStep < 4 ? (
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

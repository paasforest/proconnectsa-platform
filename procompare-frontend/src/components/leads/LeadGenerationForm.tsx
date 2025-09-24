'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Home,
  Building,
  Car,
  Wrench,
  Paintbrush,
  Zap,
  Droplets,
  TreePine
} from 'lucide-react'
import { toast } from 'sonner'
import { FraudPreventionService } from '@/lib/fraudPrevention'
import LeadVerification from './LeadVerification'

// Lead generation schema with comprehensive validation
const leadGenerationSchema = z.object({
  // Step 1: Service Category & Type
  service_category: z.string().min(1, 'Please select a service category'),
  service_type: z.string().min(1, 'Please select a service type'),
  property_type: z.string().min(1, 'Please select property type'),
  
  // Step 2: Job Details
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  urgency: z.string().min(1, 'Please select urgency level'),
  preferred_start_date: z.string().min(1, 'Please select preferred start date'),
  preferred_time: z.string().min(1, 'Please select preferred time'),
  
  // Step 3: Location
  address: z.string().min(10, 'Please provide a complete address'),
  suburb: z.string().min(2, 'Please provide suburb'),
  city: z.string().min(2, 'Please provide city'),
  postal_code: z.string().min(4, 'Please provide postal code'),
  access_instructions: z.string().optional(),
  
  // Step 4: Budget & Requirements
  budget_range: z.string().min(1, 'Please select budget range'),
  specific_budget: z.union([z.number(), z.undefined()]).optional(),
  materials_provided: z.boolean(),
  permits_required: z.boolean(),
  insurance_required: z.boolean(),
  
  // Step 5: Additional Requirements
  special_requirements: z.string().optional(),
  preferred_communication: z.string().min(1, 'Please select communication preference'),
  photos_attached: z.boolean(),
  previous_quotes: z.boolean(),
  
  // Step 6: Client Intent & Hiring Timeline
  hiring_intent: z.string().min(1, 'Please select your hiring intent'),
  hiring_timeline: z.string().min(1, 'Please select your hiring timeline'),
  research_purpose: z.string().optional(),
  
  // Step 7: Contact Information
  contact_name: z.string().min(2, 'Please provide your name'),
  contact_phone: z.string().min(10, 'Please provide a valid phone number'),
  contact_email: z.string().email('Please provide a valid email address'),
  preferred_contact_time: z.string().min(1, 'Please select preferred contact time'),
  sms_updates: z.boolean(),
  email_updates: z.boolean(),
})

type LeadGenerationForm = z.infer<typeof leadGenerationSchema>

interface LeadGenerationFormProps {
  onComplete: (data: LeadGenerationForm) => void
  onCancel: () => void
  preselectedCategory?: string | null
}

const serviceCategories = [
  { id: 'plumbing', name: 'Plumbing', icon: Droplets, description: 'Pipes, faucets, toilets, water heaters', backendId: 2 },
  { id: 'electrical', name: 'Electrical', icon: Zap, description: 'Wiring, outlets, lighting, electrical repairs', backendId: 3 },
  { id: 'hvac', name: 'HVAC', icon: Home, description: 'Heating, ventilation, air conditioning', backendId: 3 }, // Map to electrical for now
  { id: 'cleaning', name: 'Cleaning', icon: Wrench, description: 'House cleaning, office cleaning, deep cleaning', backendId: 1 },
  { id: 'painting', name: 'Painting', icon: Paintbrush, description: 'Interior, exterior, decorative painting', backendId: 5 },
  { id: 'landscaping', name: 'Landscaping', icon: TreePine, description: 'Garden design, lawn care, tree services', backendId: 6 },
  { id: 'renovation', name: 'Renovation', icon: Building, description: 'Kitchen, bathroom, home renovations', backendId: 4 }, // Map to handyman
  { id: 'automotive', name: 'Automotive', icon: Car, description: 'Car repairs, maintenance, detailing', backendId: 4 } // Map to handyman
]

// Helper function to get backend service category ID
const getServiceCategoryId = (serviceCategory: string): number => {
  const category = serviceCategories.find(cat => cat.id === serviceCategory)
  return category?.backendId || 2 // Default to plumbing (backend ID 2) if not found
}

const serviceTypes = {
  plumbing: [
    'Leak repairs', 'Pipe installation', 'Drain cleaning', 'Water heater service',
    'Toilet repair/installation', 'Faucet installation', 'Pipe replacement', 'Emergency repairs'
  ],
  electrical: [
    'Outlet installation', 'Light fixture repair', 'Circuit breaker service', 'Wiring upgrades',
    'Electrical panel upgrade', 'GFCI installation', 'Ceiling fan installation', 'Emergency electrical'
  ],
  hvac: [
    'AC repair', 'Heating system repair', 'Duct cleaning', 'Thermostat installation',
    'HVAC maintenance', 'Air quality testing', 'System replacement', 'Emergency service'
  ],
  cleaning: [
    'House cleaning', 'Office cleaning', 'Deep cleaning', 'Move-in/out cleaning',
    'Carpet cleaning', 'Window cleaning', 'Post-construction cleanup', 'Regular maintenance'
  ],
  painting: [
    'Interior painting', 'Exterior painting', 'Cabinet refinishing', 'Color consultation',
    'Wallpaper removal', 'Priming', 'Touch-ups', 'Commercial painting'
  ],
  landscaping: [
    'Garden design', 'Lawn maintenance', 'Tree trimming', 'Irrigation installation',
    'Landscape lighting', 'Patio installation', 'Planting', 'Seasonal cleanup'
  ],
  renovation: [
    'Kitchen renovation', 'Bathroom renovation', 'Basement finishing', 'Room addition',
    'Flooring installation', 'Tile work', 'Carpentry', 'Complete home renovation'
  ],
  automotive: [
    'Engine repair', 'Brake service', 'Oil change', 'Tire replacement',
    'Transmission service', 'Electrical diagnostics', 'Body work', 'Regular maintenance'
  ]
}

const propertyTypes = [
  { id: 'residential', name: 'Residential', description: 'House, apartment, townhouse' },
  { id: 'commercial', name: 'Commercial', description: 'Office, retail, warehouse' },
  { id: 'industrial', name: 'Industrial', description: 'Factory, manufacturing facility' },
  { id: 'other', name: 'Other', description: 'Special property type' }
]

const urgencyLevels = [
  { id: 'urgent', name: 'Urgent (ASAP)', description: 'Need service within 24 hours', color: 'bg-red-500' },
  { id: 'this_week', name: 'This Week', description: 'Need service within 7 days', color: 'bg-orange-500' },
  { id: 'this_month', name: 'This Month', description: 'Need service within 30 days', color: 'bg-yellow-500' },
  { id: 'flexible', name: 'Flexible', description: 'No specific timeline', color: 'bg-green-500' }
]

const budgetRanges = [
  { id: 'under_1000', name: 'Under R1,000', description: 'Small repairs, minor work' },
  { id: '1000_5000', name: 'R1,000 - R5,000', description: 'Medium projects, standard work' },
  { id: '5000_15000', name: 'R5,000 - R15,000', description: 'Large projects, major work' },
  { id: '15000_50000', name: 'R15,000 - R50,000', description: 'Major renovations, complex work' },
  { id: 'over_50000', name: 'Over R50,000', description: 'Large-scale projects, custom work' },
  { id: 'no_budget', name: 'Need Quote First', description: 'Want to see pricing options' }
]

const timeSlots = [
  'Early Morning (6am - 9am)',
  'Morning (9am - 12pm)',
  'Afternoon (12pm - 5pm)',
  'Evening (5pm - 8pm)',
  'Weekend',
  'Flexible'
]

const communicationMethods = [
  'Phone calls',
  'SMS/WhatsApp',
  'Email',
  'In-app messaging',
  'Any method'
]

export default function LeadGenerationForm({ onComplete, onCancel, preselectedCategory }: LeadGenerationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 7
  const [showVerification, setShowVerification] = useState(false)
  const [leadData, setLeadData] = useState<LeadGenerationForm | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const form = useForm<LeadGenerationForm>({
    resolver: zodResolver(leadGenerationSchema),
    mode: 'onChange',
    defaultValues: {
      // Only set essential defaults, no auto-filled data
      sms_updates: true,
      email_updates: true,
      materials_provided: false,
      permits_required: false,
      insurance_required: false,
      photos_attached: false,
      previous_quotes: false
    }
  })

  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = form

  // Handle preselected category
  useEffect(() => {
    if (preselectedCategory) {
      // Find the category ID from the name
      const category = serviceCategories.find(cat => cat.name === preselectedCategory)
      if (category) {
        setValue('service_category', category.id)
        // Auto-advance to next step after a short delay
        setTimeout(() => {
          setCurrentStep(2)
        }, 500)
      }
    }
  }, [preselectedCategory, setValue])

  // Check if current step is valid
  const isCurrentStepValid = () => {
    const currentValues = watch()
    
    try {
      switch (currentStep) {
        case 1:
          return !!(currentValues?.service_category && currentValues?.service_type && currentValues?.property_type)
        case 2:
          return !!(currentValues?.title && currentValues.title.length >= 10 && 
                   currentValues?.description && currentValues.description.length >= 50 &&
                   currentValues?.urgency && currentValues?.preferred_start_date && currentValues?.preferred_time)
        case 3:
          return !!(currentValues?.address && currentValues.address.length >= 10 &&
                   currentValues?.suburb && currentValues.suburb.length >= 2 &&
                   currentValues?.city && currentValues.city.length >= 2 &&
                   currentValues?.postal_code && currentValues.postal_code.length >= 4)
        case 4:
          return !!(currentValues?.budget_range)
        case 5:
          return !!(currentValues?.preferred_communication)
        case 6:
          return !!(currentValues?.hiring_intent && currentValues?.hiring_timeline)
        case 7:
          return !!(currentValues?.contact_name && currentValues.contact_name.length >= 2 &&
                   currentValues?.contact_phone && currentValues.contact_phone.length >= 10 &&
                   currentValues?.contact_email && currentValues.contact_email.includes('@') &&
                   currentValues?.preferred_contact_time)
        default:
          return false
      }
    } catch (error) {
      console.error('Validation error:', error)
      return false
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps && isCurrentStepValid()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: LeadGenerationForm) => {
    setIsSubmitting(true)
    
    try {
      const enrichedData = {
        ...data,
        // Convert service_category string to service_category_id integer
        service_category_id: getServiceCategoryId(data.service_category),
        lead_score: calculateLeadScore(data),
        verification_score: 85,
        created_at: new Date().toISOString(),
        status: 'active'
      }
      
      // Show immediate feedback
      toast.loading('Submitting your quote request...', { id: 'submit-toast' })
      
      // Call the parent component's onComplete function
      await onComplete(enrichedData)
      
      // Mark as submitted
      setIsSubmitted(true)
      
      // Update the loading toast to success
      toast.success('Quote request submitted successfully! 🎉', { 
        id: 'submit-toast',
        description: 'You\'ll receive quotes from verified professionals within 24 hours.'
      })
      
    } catch (error) {
      console.error('Error in form submission:', error)
      toast.error('Submission failed', {
        id: 'submit-toast',
        description: 'There was an error submitting your request. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateLeadScore = (data: LeadGenerationForm): number => {
    let score = 0
    
    // Enhanced scoring with ML-inspired features
    
    // Basic information quality (40 points)
    if (data.title.length > 20) score += 10
    if (data.description.length > 100) score += 15
    if (data.address.length > 20) score += 10
    if (data.contact_phone.length >= 10) score += 5
    
    // Intent and urgency (25 points)
    const intentScore = {
      'ready_to_hire': 20,
      'planning_to_hire': 15,
      'comparing_quotes': 10,
      'researching': 5
    }[data.hiring_intent] || 5
    score += intentScore
    
    const urgencyScore = {
      'urgent': 5,
      'this_week': 4,
      'this_month': 3,
      'flexible': 1
    }[data.urgency] || 1
    score += urgencyScore
    
    // Budget clarity (20 points)
    if (data.budget_range !== 'no_budget') score += 15
    if (data.specific_budget && data.specific_budget > 0) score += 5
    
    // Additional details and quality indicators (15 points)
    if (data.special_requirements) score += 5
    if (data.access_instructions) score += 3
    if (data.photos_attached) score += 3
    if (data.previous_quotes) score += 2
    if (data.research_purpose && data.research_purpose.length > 20) score += 2
    
    // Text quality indicators
    if (data.title.includes('?')) score += 2  // Questions show engagement
    if (data.description.includes('urgent') || data.description.includes('asap')) score += 3
    if (data.description.length > 200) score += 2  // Detailed descriptions
    
    // Contact quality
    if (data.contact_email.includes('@') && data.contact_email.includes('.')) score += 2
    if (data.contact_phone.startsWith('+27')) score += 2  // SA format
    
    return Math.min(score, 100)
  }

  const renderStep1 = () => {
    const selectedCategory = watch('service_category')
    const availableServiceTypes = selectedCategory ? serviceTypes[selectedCategory as keyof typeof serviceTypes] : []
    
    return (
      <div className="space-y-8 pb-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">What service do you need?</h3>
          <p className="text-gray-600 mb-4">Select the category that best describes your project</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {serviceCategories.map((category) => {
            const Icon = category.icon
            return (
              <label
                key={category.id}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                  watch('service_category') === category.id
                    ? 'border-emerald-500 bg-emerald-50 shadow-md'
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
              >
                <input
                  type="radio"
                  {...register('service_category')}
                  value={category.id}
                  className="sr-only"
                />
                <div className="text-center">
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${
                    watch('service_category') === category.id ? 'text-emerald-600' : 'text-gray-600'
                  }`} />
                  <div className={`font-medium text-sm ${
                    watch('service_category') === category.id ? 'text-emerald-900' : 'text-gray-900'
                  }`}>{category.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                </div>
              </label>
            )
          })}
        </div>
        
        {errors.service_category && (
          <p className="text-red-500 text-sm">{errors.service_category.message}</p>
        )}
        
        {selectedCategory && availableServiceTypes.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-3">What type of {serviceCategories.find(c => c.id === selectedCategory)?.name.toLowerCase()} service?</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableServiceTypes.map((serviceType) => (
                <label
                  key={serviceType}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
                    watch('service_type') === serviceType
                      ? 'border-green-500 bg-green-50 shadow-sm'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <input
                    type="radio"
                    {...register('service_type')}
                    value={serviceType}
                    className="sr-only"
                  />
                  <div className={`text-sm font-medium ${
                    watch('service_type') === serviceType ? 'text-green-900' : 'text-gray-900'
                  }`}>
                    {serviceType}
                  </div>
                </label>
              ))}
            </div>
            {errors.service_type && (
              <p className="text-red-500 text-sm mt-1">{errors.service_type.message}</p>
            )}
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Property Type</label>
          <Select onValueChange={(value) => setValue('property_type', value)} value={watch('property_type')}>
            <SelectTrigger className="h-12 border-2 rounded-lg hover:border-emerald-300 focus:border-emerald-500 transition-colors">
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-2 shadow-lg z-[60] bg-white max-h-60 overflow-y-auto">
              {propertyTypes.map((type) => (
                <SelectItem key={type.id} value={type.id} className="py-3">
                  <div>
                    <div className="font-medium">{type.name}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.property_type && (
            <p className="text-red-500 text-sm mt-2">{errors.property_type.message}</p>
          )}
        </div>
      </div>
    )
  }

  const renderStep2 = () => (
    <div className="space-y-8 pb-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Tell us about your project</h3>
        <p className="text-gray-600 mb-4">Provide details to help providers understand your needs</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Project Title
          <span className="text-xs text-gray-500 ml-2">
            ({watch('title')?.length || 0}/10 characters minimum)
          </span>
        </label>
        <Input
          {...register('title')}
          placeholder="e.g., Fix leaking kitchen sink and install new faucet"
          className="w-full"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Detailed Description
          <span className="text-xs text-gray-500 ml-2">
            ({watch('description')?.length || 0}/50 characters minimum)
          </span>
        </label>
        <Textarea
          {...register('description')}
          placeholder="Describe your project in detail. Include any specific requirements, materials, or special considerations..."
          className="w-full min-h-[120px]"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">How urgent is this project?</label>
        <div className="grid grid-cols-2 gap-3">
          {urgencyLevels.map((urgency) => (
            <label
              key={urgency.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                watch('urgency') === urgency.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                {...register('urgency')}
                value={urgency.id}
                className="sr-only"
              />
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  urgency.color === 'bg-red-500' ? 'bg-red-500' :
                  urgency.color === 'bg-orange-500' ? 'bg-orange-500' :
                  urgency.color === 'bg-yellow-500' ? 'bg-yellow-500' :
                  urgency.color === 'bg-green-500' ? 'bg-green-500' :
                  'bg-gray-500'
                }`}></div>
                <div>
                  <div className="font-medium text-sm">{urgency.name}</div>
                  <div className="text-xs text-gray-500">{urgency.description}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
        {errors.urgency && (
          <p className="text-red-500 text-sm mt-1">{errors.urgency.message}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Preferred Start Date</label>
          <Input
            type="date"
            {...register('preferred_start_date')}
            className="w-full"
          />
          {errors.preferred_start_date && (
            <p className="text-red-500 text-sm mt-1">{errors.preferred_start_date.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Preferred Time</label>
          <Select onValueChange={(value) => setValue('preferred_time', value)} value={watch('preferred_time')}>
            <SelectTrigger className="h-12 border-2 rounded-lg hover:border-emerald-300 focus:border-emerald-500 transition-colors">
              <SelectValue placeholder="Select time preference" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-2 shadow-lg z-[60] bg-white max-h-60 overflow-y-auto">
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time} className="py-3">{time}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.preferred_time && (
            <p className="text-red-500 text-sm mt-1">{errors.preferred_time.message}</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-8 pb-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Where is the work needed?</h3>
        <p className="text-gray-600 mb-4">Provide the exact location for the service</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Full Address</label>
        <Input
          {...register('address')}
          placeholder="e.g., 123 Main Street, Apartment 4B"
          className="w-full"
        />
        {errors.address && (
          <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Suburb</label>
          <Input
            {...register('suburb')}
            placeholder="e.g., Sea Point"
            className="w-full"
          />
          {errors.suburb && (
            <p className="text-red-500 text-sm mt-1">{errors.suburb.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">City</label>
          <Input
            {...register('city')}
            placeholder="e.g., Cape Town"
            className="w-full"
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Postal Code</label>
          <Input
            {...register('postal_code')}
            placeholder="e.g., 8001"
            className="w-full"
          />
          {errors.postal_code && (
            <p className="text-red-500 text-sm mt-1">{errors.postal_code.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Access Instructions (Optional)</label>
        <Textarea
          {...register('access_instructions')}
          placeholder="e.g., Ring doorbell twice, use side entrance, gate code is 1234..."
          className="w-full"
        />
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-8 pb-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Budget & Requirements</h3>
        <p className="text-gray-600 mb-4">Help providers give you accurate quotes</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Budget Range</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {budgetRanges.map((range) => (
            <label
              key={range.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                watch('budget_range') === range.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                {...register('budget_range')}
                value={range.id}
                className="sr-only"
              />
              <div>
                <div className="font-medium text-sm">{range.name}</div>
                <div className="text-xs text-gray-500">{range.description}</div>
              </div>
            </label>
          ))}
        </div>
        {errors.budget_range && (
          <p className="text-red-500 text-sm mt-1">{errors.budget_range.message}</p>
        )}
      </div>
      
      {watch('budget_range') !== 'no_budget' && (
        <div>
          <label className="block text-sm font-medium mb-2">Specific Budget (Optional)</label>
          <Input
            type="number"
            {...register('specific_budget', { valueAsNumber: true })}
            placeholder="e.g., 5000"
            className="w-full"
          />
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-2">Project Requirements</label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="materials_provided"
              {...register('materials_provided')}
            />
            <label htmlFor="materials_provided" className="text-sm">
              I will provide materials
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="permits_required"
              {...register('permits_required')}
            />
            <label htmlFor="permits_required" className="text-sm">
              Permits may be required
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="insurance_required"
              {...register('insurance_required')}
            />
            <label htmlFor="insurance_required" className="text-sm">
              Insurance required
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-8 pb-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
        <p className="text-gray-600 mb-4">Help us match you with the right providers</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Special Requirements</label>
        <Textarea
          {...register('special_requirements')}
          placeholder="Any special requirements, preferences, or additional information..."
          className="w-full"
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">Preferred Communication Method</label>
        <Select onValueChange={(value) => setValue('preferred_communication', value)} value={watch('preferred_communication')}>
          <SelectTrigger className="h-12 border-2 rounded-lg hover:border-emerald-300 focus:border-emerald-500 transition-colors">
            <SelectValue placeholder="Select communication preference" />
          </SelectTrigger>
          <SelectContent className="rounded-lg border-2 shadow-lg z-[60] bg-white max-h-60 overflow-y-auto">
            {communicationMethods.map((method) => (
              <SelectItem key={method} value={method} className="py-3">{method}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.preferred_communication && (
          <p className="text-red-500 text-sm mt-2">{errors.preferred_communication.message}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Additional Information</label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="photos_attached"
              {...register('photos_attached')}
            />
            <label htmlFor="photos_attached" className="text-sm">
              I have photos to share
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="previous_quotes"
              {...register('previous_quotes')}
            />
            <label htmlFor="previous_quotes" className="text-sm">
              I have previous quotes for comparison
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep6 = () => (
    <div className="space-y-8 pb-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Hiring Intent</h3>
        <p className="text-gray-600 mb-4">Help providers understand your hiring timeline and intent</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-3">Are you ready to hire someone for this project?</label>
        <RadioGroup onValueChange={(value) => setValue('hiring_intent', value)} value={watch('hiring_intent')} className="space-y-3">
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="ready_to_hire" id="ready_to_hire" />
            <label htmlFor="ready_to_hire" className="flex-1 cursor-pointer">
              <div className="font-medium">Yes, I'm ready to hire</div>
              <div className="text-sm text-gray-600">I have the budget and timeline confirmed</div>
            </label>
          </div>
          
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="planning_to_hire" id="planning_to_hire" />
            <label htmlFor="planning_to_hire" className="flex-1 cursor-pointer">
              <div className="font-medium">Planning to hire soon</div>
              <div className="text-sm text-gray-600">I'm in the planning phase but will hire within a few weeks</div>
            </label>
          </div>
          
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="researching" id="researching" />
            <label htmlFor="researching" className="flex-1 cursor-pointer">
              <div className="font-medium">Just researching/exploring</div>
              <div className="text-sm text-gray-600">I want to understand options and pricing first</div>
            </label>
          </div>
          
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="comparing_quotes" id="comparing_quotes" />
            <label htmlFor="comparing_quotes" className="flex-1 cursor-pointer">
              <div className="font-medium">Comparing quotes</div>
              <div className="text-sm text-gray-600">I already have some quotes and want to compare more</div>
            </label>
          </div>
        </RadioGroup>
        {errors.hiring_intent && (
          <p className="text-red-500 text-sm mt-1">{errors.hiring_intent.message}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-3">When do you plan to start this project?</label>
        <RadioGroup onValueChange={(value) => setValue('hiring_timeline', value)} value={watch('hiring_timeline')} className="space-y-3">
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="asap" id="asap" />
            <label htmlFor="asap" className="flex-1 cursor-pointer">
              <div className="font-medium">ASAP (within 1 week)</div>
              <div className="text-sm text-gray-600">Urgent project that needs immediate attention</div>
            </label>
          </div>
          
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="this_month" id="this_month" />
            <label htmlFor="this_month" className="flex-1 cursor-pointer">
              <div className="font-medium">This month</div>
              <div className="text-sm text-gray-600">Within the next 2-4 weeks</div>
            </label>
          </div>
          
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="next_month" id="next_month" />
            <label htmlFor="next_month" className="flex-1 cursor-pointer">
              <div className="font-medium">Next month</div>
              <div className="text-sm text-gray-600">Within 1-2 months</div>
            </label>
          </div>
          
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="flexible" id="flexible" />
            <label htmlFor="flexible" className="flex-1 cursor-pointer">
              <div className="font-medium">Flexible timing</div>
              <div className="text-sm text-gray-600">No specific timeline, just exploring options</div>
            </label>
          </div>
        </RadioGroup>
        {errors.hiring_timeline && (
          <p className="text-red-500 text-sm mt-1">{errors.hiring_timeline.message}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Additional context (optional)</label>
        <Textarea
          {...register('research_purpose')}
          placeholder="Tell us more about your project goals, any specific requirements, or what you're looking for in a provider..."
          className="w-full h-24"
        />
        <p className="text-sm text-gray-500 mt-1">This helps providers give you more relevant quotes</p>
      </div>
    </div>
  )

  const renderStep7 = () => (
    <div className="space-y-8 pb-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
        <p className="text-gray-600 mb-4">How should providers reach you?</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Full Name
            <span className="text-xs text-gray-500 ml-2">
              ({watch('contact_name')?.length || 0}/2 characters minimum)
            </span>
          </label>
          <Input
            {...register('contact_name')}
            placeholder="e.g., John Smith"
            className="w-full"
          />
          {errors.contact_name && (
            <p className="text-red-500 text-sm mt-1">{errors.contact_name.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-3">
            Phone Number
            <span className="text-xs text-gray-500 ml-2">
              ({watch('contact_phone')?.length || 0}/10 characters minimum)
            </span>
          </label>
          <Input
            {...register('contact_phone')}
            placeholder="e.g., +27 82 123 4567"
            className="w-full h-12 border-2 rounded-lg hover:border-emerald-300 focus:border-emerald-500 transition-colors"
            type="tel"
          />
          {errors.contact_phone && (
            <p className="text-red-500 text-sm mt-2">{errors.contact_phone.message}</p>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">
          Email Address
          <span className="text-xs text-gray-500 ml-2">
            (must contain @)
          </span>
        </label>
        <Input
          type="email"
          {...register('contact_email')}
          placeholder="e.g., john@email.com"
          className="w-full h-12 border-2 rounded-lg hover:border-emerald-300 focus:border-emerald-500 transition-colors"
        />
        {errors.contact_email && (
          <p className="text-red-500 text-sm mt-2">{errors.contact_email.message}</p>
        )}
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">
          Preferred Contact Time
          <span className="text-red-500 ml-1">*</span>
          <span className="text-xs text-gray-500 ml-2">
            (required)
          </span>
        </label>
        <Select onValueChange={(value) => setValue('preferred_contact_time', value)} value={watch('preferred_contact_time')}>
          <SelectTrigger className="h-12 border-2 rounded-lg hover:border-emerald-300 focus:border-emerald-500 transition-colors">
            <SelectValue placeholder="Select preferred contact time" />
          </SelectTrigger>
          <SelectContent className="rounded-lg border-2 shadow-lg z-[60] bg-white max-h-60 overflow-y-auto">
            {timeSlots.map((time) => (
              <SelectItem key={time} value={time} className="py-3">{time}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.preferred_contact_time && (
          <p className="text-red-500 text-sm mt-2">{errors.preferred_contact_time.message}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Update Preferences</label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sms_updates"
              {...register('sms_updates')}
            />
            <label htmlFor="sms_updates" className="text-sm">
              Receive SMS updates about my request
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="email_updates"
              {...register('email_updates')}
            />
            <label htmlFor="email_updates" className="text-sm">
              Receive email updates about my request
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      case 5: return renderStep5()
      case 6: return renderStep6()
      case 7: return renderStep7()
      default: return renderStep1()
    }
  }

  // Show verification if required
  if (showVerification && leadData) {
    return (
      <LeadVerification
        leadId="temp"
        onVerificationComplete={(verified) => {
          if (verified) {
            onComplete(leadData)
            toast.success('Lead verified and submitted successfully!')
          } else {
            setShowVerification(false)
            setLeadData(null)
          }
        }}
        onCancel={() => {
          setShowVerification(false)
          setLeadData(null)
        }}
      />
    )
  }

  // Show success state if submitted
  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-16">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Quote Request Submitted! 🎉
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Thank you for choosing ProConnectSA. We're now matching you with verified professionals.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-green-800 mb-2">What happens next?</h3>
              <ul className="text-left text-green-700 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  You'll receive quotes within 24 hours
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  All providers are verified and insured
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Compare quotes and choose the best fit
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Get your project completed professionally
                </li>
              </ul>
            </div>
            <Button
              onClick={onCancel}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Back to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Request a Quote</CardTitle>
              <CardDescription>
                Tell us about your project and we'll match you with the best providers
              </CardDescription>
            </div>
            <Badge variant="outline">Step {currentStep} of {totalSteps}</Badge>
          </div>
          
          <div className="mt-4">
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {renderCurrentStep()}
            
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isCurrentStepValid()}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!isCurrentStepValid() || isSubmitting}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


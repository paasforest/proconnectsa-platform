'use client'

import { useState } from 'react'
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
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Upload,
  MapPin,
  Phone,
  Mail,
  User,
  Building,
  Wrench,
  Shield,
  Star,
  Clock,
  DollarSign,
  Camera,
  FileText,
  AlertCircle,
  Code,
  Server,
  Lightbulb
} from 'lucide-react'
import { toast } from 'sonner'
import { CITIES, CITY_NAMES, getCityAreas, MAJOR_METROS } from '@/constants/locations'

// Provider registration schema
const providerRegistrationSchema = z.object({
  // Step 1: Basic Information
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email address'),
  phone: z.string().min(10, 'Please provide a valid phone number'),
  business_name: z.string().min(2, 'Business name is required'),
  business_type: z.string().min(1, 'Please select business type'),
  
  // Business Services
  business_services: z.object({
    company_registration: z.boolean().default(false),
    website_design: z.boolean().default(false),
    hosting_maintenance: z.boolean().default(false),
    complete_package: z.boolean().default(false)
  }),
  
  // Step 2: Service Categories
  primary_service: z.string().min(1, 'Please select a primary service'),
  secondary_services: z.array(z.string()).min(1, 'Please select at least one service'),
  specializations: z.array(z.string()).optional(),
  
  // Step 3: Location & Service Areas
  business_address: z.string().min(10, 'Please provide a complete business address'),
  suburb: z.string().min(2, 'Please provide suburb'),
  city: z.string().min(2, 'Please provide city'),
  postal_code: z.string().min(4, 'Please provide postal code'),
  service_areas: z.array(z.string()).min(1, 'Please select at least one service area'),
  travel_radius: z.string().min(1, 'Please select travel radius'),
  
  // Step 4: Experience & Skills
  years_experience: z.string().min(1, 'Please select years of experience'),
  qualifications: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  
  // Step 5: Business Details
  business_hours: z.object({
    monday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    tuesday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    wednesday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    thursday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    friday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    saturday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    sunday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() })
  }),
  emergency_services: z.boolean().default(false),
  insurance_covered: z.boolean().default(false),
  warranty_provided: z.boolean().default(false),
  
  // Step 6: Verification & Documents
  id_number: z.string().min(13, 'Please provide a valid ID number'),
  tax_number: z.string().optional(),
  bank_account: z.string().optional(),
  bank_name: z.string().optional(),
  id_document: z.string().min(1, 'Please upload ID document'),
  business_license: z.string().min(1, 'Please upload business license'),
  insurance_certificate: z.string().optional(),
  company_registration: z.string().min(1, 'Company registration document is required'),
  
  // Step 7: Pricing & Availability
  hourly_rate: z.number().min(0, 'Hourly rate must be positive'),
  call_out_fee: z.number().min(0, 'Call out fee must be positive'),
  minimum_job_value: z.number().min(0, 'Minimum job value must be positive'),
  response_time_hours: z.string().min(1, 'Please select response time'),
  availability: z.string().min(1, 'Please select availability'),
  
  // Step 8: Terms & Conditions
  terms_accepted: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  privacy_accepted: z.boolean().refine(val => val === true, 'You must accept the privacy policy'),
  marketing_consent: z.boolean().default(false)
})

type ProviderRegistrationForm = z.infer<typeof providerRegistrationSchema>

interface ProviderRegistrationFormProps {
  onComplete: (data: ProviderRegistrationForm) => void
  onCancel: () => void
}

const serviceCategories = [
  { id: 'plumbing', name: 'Plumbing', icon: '🔧', description: 'Pipes, faucets, toilets, water heaters' },
  { id: 'electrical', name: 'Electrical', icon: '⚡', description: 'Wiring, outlets, lighting, electrical repairs' },
  { id: 'hvac', name: 'HVAC', icon: '🌡️', description: 'Heating, ventilation, air conditioning' },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹', description: 'House cleaning, office cleaning, deep cleaning' },
  { id: 'painting', name: 'Painting', icon: '🎨', description: 'Interior, exterior, decorative painting' },
  { id: 'landscaping', name: 'Landscaping', icon: '🌳', description: 'Garden design, lawn care, tree services' },
  { id: 'renovation', name: 'Renovation', icon: '🏠', description: 'Kitchen, bathroom, home renovations' },
  { id: 'handyman', name: 'Handyman', icon: '🔨', description: 'General repairs, maintenance, installations' },
  { id: 'automotive', name: 'Automotive', icon: '🚗', description: 'Car repairs, maintenance, detailing' },
  { id: 'security', name: 'Security', icon: '🔒', description: 'Alarms, cameras, access control' },
  { id: 'pool', name: 'Pool Services', icon: '🏊', description: 'Pool cleaning, maintenance, repairs' },
  { id: 'appliance', name: 'Appliance Repair', icon: '🔌', description: 'Washing machines, fridges, ovens' }
]

const handymanSpecializations = [
  'Furniture Assembly', 'TV Mounting', 'Picture Hanging', 'Shelf Installation',
  'Door Repairs', 'Window Repairs', 'Cabinet Installation', 'Light Fixture Installation',
  'Faucet Installation', 'Toilet Repairs', 'Drywall Patching', 'Tile Work',
  'Carpentry', 'Basic Plumbing', 'Basic Electrical', 'General Maintenance'
]

const businessTypes = [
  'Sole Proprietor', 'Partnership', 'Private Company', 'Close Corporation',
  'Trust', 'Individual Contractor', 'Freelancer'
]

// Nationwide location data imported above

const experienceLevels = [
  'Less than 1 year', '1-2 years', '3-5 years', '6-10 years', '11-20 years', '20+ years'
]

const responseTimes = [
  'Within 1 hour', 'Within 2 hours', 'Within 4 hours', 'Within 8 hours', 'Within 24 hours', 'Next day'
]

const availabilityOptions = [
  'Monday to Friday (9am-5pm)', 'Monday to Friday (8am-6pm)', 'Monday to Saturday (9am-5pm)',
  '7 days a week', 'Weekends only', 'Evenings only', 'Flexible hours'
]

export default function ProviderRegistrationForm({ onComplete, onCancel }: ProviderRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedCity, setSelectedCity] = useState<string>('')
  const totalSteps = 9
  
  const form = useForm<ProviderRegistrationForm>({
    resolver: zodResolver(providerRegistrationSchema),
    defaultValues: {
      city: '',
      business_hours: {
        monday: { open: '08:00', close: '17:00', closed: false },
        tuesday: { open: '08:00', close: '17:00', closed: false },
        wednesday: { open: '08:00', close: '17:00', closed: false },
        thursday: { open: '08:00', close: '17:00', closed: false },
        friday: { open: '08:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '13:00', closed: false },
        sunday: { open: '09:00', close: '13:00', closed: true }
      },
      emergency_services: false,
      insurance_covered: false,
      warranty_provided: false,
      marketing_consent: false
    }
  })

  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = form

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = (data: ProviderRegistrationForm) => {
    // Add verification status
    const enrichedData = {
      ...data,
      verification_status: 'pending',
      created_at: new Date().toISOString(),
      status: 'pending_verification'
    }
    
    onComplete(enrichedData)
    toast.success('Registration submitted! We\'ll review your application within 24 hours.')
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
        <p className="text-gray-600 mb-4">Tell us about yourself and your business</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">First Name</label>
          <Input {...register('first_name')} placeholder="John" />
          {errors.first_name && (
            <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Last Name</label>
          <Input {...register('last_name')} placeholder="Smith" />
          {errors.last_name && (
            <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <Input type="email" {...register('email')} placeholder="john@example.com" />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Phone Number</label>
          <Input {...register('phone')} placeholder="+27 82 123 4567" />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Business Name</label>
        <Input {...register('business_name')} placeholder="Smith Plumbing Services" />
        {errors.business_name && (
          <p className="text-red-500 text-sm mt-1">{errors.business_name.message}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Business Type</label>
        <Select onValueChange={(value) => setValue('business_type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            {businessTypes.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.business_type && (
          <p className="text-red-500 text-sm mt-1">{errors.business_type.message}</p>
        )}
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Service Categories</h3>
        <p className="text-gray-600 mb-4">What services do you provide?</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Primary Service</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {serviceCategories.map((category) => (
            <label
              key={category.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                watch('primary_service') === category.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                {...register('primary_service')}
                value={category.id}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="font-medium text-sm">{category.name}</div>
                <div className="text-xs text-gray-500 mt-1">{category.description}</div>
              </div>
            </label>
          ))}
        </div>
        {errors.primary_service && (
          <p className="text-red-500 text-sm mt-1">{errors.primary_service.message}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Additional Services</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {serviceCategories.map((category) => (
            <label
              key={category.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                watch('secondary_services')?.includes(category.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                {...register('secondary_services')}
                value={category.id}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="font-medium text-sm">{category.name}</div>
              </div>
            </label>
          ))}
        </div>
        {errors.secondary_services && (
          <p className="text-red-500 text-sm mt-1">{errors.secondary_services.message}</p>
        )}
      </div>
      
      {watch('primary_service') === 'handyman' && (
        <div>
          <label className="block text-sm font-medium mb-2">Handyman Specializations</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {handymanSpecializations.map((specialization) => (
              <label
                key={specialization}
                className={`p-2 border rounded cursor-pointer transition-colors ${
                  watch('specializations')?.includes(specialization)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  {...register('specializations')}
                  value={specialization}
                  className="sr-only"
                />
                <div className="text-sm">{specialization}</div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Location & Service Areas</h3>
        <p className="text-gray-600 mb-4">Where is your business located and where do you serve?</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Business Address</label>
        <Input {...register('business_address')} placeholder="123 Main Street, Cape Town" />
        {errors.business_address && (
          <p className="text-red-500 text-sm mt-1">{errors.business_address.message}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Suburb</label>
          <Input {...register('suburb')} placeholder="Sea Point" />
          {errors.suburb && (
            <p className="text-red-500 text-sm mt-1">{errors.suburb.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">City</label>
          <Input {...register('city')} placeholder="Cape Town" />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Postal Code</label>
          <Input {...register('postal_code')} placeholder="8001" />
          {errors.postal_code && (
            <p className="text-red-500 text-sm mt-1">{errors.postal_code.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Service Areas</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {serviceAreas.map((area) => (
            <label
              key={area}
              className={`p-2 border rounded cursor-pointer transition-colors ${
                watch('service_areas')?.includes(area)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                {...register('service_areas')}
                value={area}
                className="sr-only"
              />
              <div className="text-sm">{area}</div>
            </label>
          ))}
        </div>
        {errors.service_areas && (
          <p className="text-red-500 text-sm mt-1">{errors.service_areas.message}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Travel Radius</label>
        <Select onValueChange={(value) => setValue('travel_radius', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select travel radius" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5km">Within 5km</SelectItem>
            <SelectItem value="10km">Within 10km</SelectItem>
            <SelectItem value="15km">Within 15km</SelectItem>
            <SelectItem value="20km">Within 20km</SelectItem>
            <SelectItem value="30km">Within 30km</SelectItem>
            <SelectItem value="50km">Within 50km</SelectItem>
            <SelectItem value="unlimited">No limit</SelectItem>
          </SelectContent>
        </Select>
        {errors.travel_radius && (
          <p className="text-red-500 text-sm mt-1">{errors.travel_radius.message}</p>
        )}
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Experience & Skills</h3>
        <p className="text-gray-600 mb-4">Tell us about your experience and qualifications</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Years of Experience</label>
        <Select onValueChange={(value) => setValue('years_experience', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select years of experience" />
          </SelectTrigger>
          <SelectContent>
            {experienceLevels.map((level) => (
              <SelectItem key={level} value={level}>{level}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.years_experience && (
          <p className="text-red-500 text-sm mt-1">{errors.years_experience.message}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Qualifications (Optional)</label>
        <Textarea
          {...register('qualifications')}
          placeholder="List your qualifications, certifications, and training..."
          className="min-h-[100px]"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Languages Spoken</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {['English', 'Afrikaans', 'Xhosa', 'Zulu', 'French', 'German', 'Portuguese', 'Spanish'].map((language) => (
            <label
              key={language}
              className={`p-2 border rounded cursor-pointer transition-colors ${
                watch('languages')?.includes(language)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                {...register('languages')}
                value={language}
                className="sr-only"
              />
              <div className="text-sm">{language}</div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Business Details</h3>
        <p className="text-gray-600 mb-4">Set your business hours and policies</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Business Hours</label>
        <div className="space-y-3">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
            <div key={day} className="flex items-center space-x-4">
              <div className="w-20 text-sm font-medium capitalize">{day}</div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  {...register(`business_hours.${day}.closed`)}
                />
                <span className="text-sm">Closed</span>
              </div>
              {!watch(`business_hours.${day}.closed`) && (
                <div className="flex items-center space-x-2">
                  <Input
                    type="time"
                    {...register(`business_hours.${day}.open`)}
                    className="w-24"
                  />
                  <span>to</span>
                  <Input
                    type="time"
                    {...register(`business_hours.${day}.close`)}
                    className="w-24"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Business Policies</label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox {...register('emergency_services')} />
            <span className="text-sm">I provide emergency services</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox {...register('insurance_covered')} />
            <span className="text-sm">I have business insurance</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox {...register('warranty_provided')} />
            <span className="text-sm">I provide work warranties</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep6 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Verification & Documents</h3>
        <p className="text-gray-600 mb-4">Upload required documents for verification</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">ID Number</label>
          <Input {...register('id_number')} placeholder="1234567890123" />
          {errors.id_number && (
            <p className="text-red-500 text-sm mt-1">{errors.id_number.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Tax Number <span className="text-gray-500 text-sm">(Optional)</span>
          </label>
          <Input {...register('tax_number')} placeholder="1234567890" />
          <p className="text-xs text-gray-500 mt-1">Tax compliance is optional but recommended for business operations</p>
          {errors.tax_number && (
            <p className="text-red-500 text-sm mt-1">{errors.tax_number.message}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Payment Options</h4>
          <p className="text-sm text-blue-700 mb-3">
            Choose how you'd like to pay for credits and receive payments. Bank account is optional - you can use manual deposits instead.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Bank Account <span className="text-gray-500 text-sm">(Optional)</span>
              </label>
              <Input {...register('bank_account')} placeholder="1234567890" />
              <p className="text-xs text-gray-500 mt-1">Leave blank if you prefer manual deposits</p>
              {errors.bank_account && (
                <p className="text-red-500 text-sm mt-1">{errors.bank_account.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Bank Name <span className="text-gray-500 text-sm">(Optional)</span>
              </label>
              <Input {...register('bank_name')} placeholder="Standard Bank" />
              {errors.bank_name && (
                <p className="text-red-500 text-sm mt-1">{errors.bank_name.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">ID Document</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Upload your ID document (PDF, JPG, PNG)</p>
            <input type="file" className="hidden" {...register('id_document')} />
          </div>
          {errors.id_document && (
            <p className="text-red-500 text-sm mt-1">{errors.id_document.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Business License</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Upload your business license (PDF, JPG, PNG)</p>
            <input type="file" className="hidden" {...register('business_license')} />
          </div>
          {errors.business_license && (
            <p className="text-red-500 text-sm mt-1">{errors.business_license.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Insurance Certificate <span className="text-gray-500 text-sm">(Optional)</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Upload your insurance certificate (PDF, JPG, PNG)</p>
            <p className="text-xs text-gray-500 mt-1">Insurance is optional but recommended for professional services</p>
            <input type="file" className="hidden" {...register('insurance_certificate')} />
          </div>
          {errors.insurance_certificate && (
            <p className="text-red-500 text-sm mt-1">{errors.insurance_certificate.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Company Registration</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Building className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Upload your company registration document (PDF, JPG, PNG)</p>
            <input type="file" className="hidden" {...register('company_registration')} />
          </div>
          {errors.company_registration && (
            <p className="text-red-500 text-sm mt-1">{errors.company_registration.message}</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep7 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Pricing & Availability</h3>
        <p className="text-gray-600 mb-4">Set your rates and availability</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Hourly Rate (R)</label>
          <Input
            type="number"
            {...register('hourly_rate', { valueAsNumber: true })}
            placeholder="500"
          />
          {errors.hourly_rate && (
            <p className="text-red-500 text-sm mt-1">{errors.hourly_rate.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Call Out Fee (R)</label>
          <Input
            type="number"
            {...register('call_out_fee', { valueAsNumber: true })}
            placeholder="200"
          />
          {errors.call_out_fee && (
            <p className="text-red-500 text-sm mt-1">{errors.call_out_fee.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Minimum Job Value (R)</label>
          <Input
            type="number"
            {...register('minimum_job_value', { valueAsNumber: true })}
            placeholder="1000"
          />
          {errors.minimum_job_value && (
            <p className="text-red-500 text-sm mt-1">{errors.minimum_job_value.message}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Response Time</label>
          <Select onValueChange={(value) => setValue('response_time_hours', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select response time" />
            </SelectTrigger>
            <SelectContent>
              {responseTimes.map((time) => (
                <SelectItem key={time} value={time}>{time}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.response_time_hours && (
            <p className="text-red-500 text-sm mt-1">{errors.response_time_hours.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Availability</label>
          <Select onValueChange={(value) => setValue('availability', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select availability" />
            </SelectTrigger>
            <SelectContent>
              {availabilityOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.availability && (
            <p className="text-red-500 text-sm mt-1">{errors.availability.message}</p>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep8 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Business Services</h3>
        <p className="text-gray-600 mb-4">Choose additional business services to help you succeed</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className={`cursor-pointer transition-all duration-200 ${
          watch('business_services.complete_package') ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
        }`} onClick={() => setValue('business_services.complete_package', !watch('business_services.complete_package'))}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building className="h-6 w-6 text-orange-500" />
                <CardTitle className="text-lg">Complete Package</CardTitle>
              </div>
              <Checkbox checked={watch('business_services.complete_package')} />
            </div>
            <div className="text-2xl font-bold text-orange-600">R3,999</div>
            <CardDescription>Everything you need to start your business</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Company Registration (R1,350 value)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Website Design (R2,500 value)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>1 Year Hosting (R3,588 value)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>ProConnectSA Verification</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className={`cursor-pointer transition-all duration-200 ${
          watch('business_services.company_registration') ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
        }`} onClick={() => setValue('business_services.company_registration', !watch('business_services.company_registration'))}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-blue-500" />
                <CardTitle className="text-lg">Company Registration</CardTitle>
              </div>
              <Checkbox checked={watch('business_services.company_registration')} />
            </div>
            <div className="text-2xl font-bold text-blue-600">R1,350</div>
            <CardDescription>Complete business registration</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>CIPC Registration</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>SARS Tax Number</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>BEE Certificate</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Legal Compliance</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className={`cursor-pointer transition-all duration-200 ${
          watch('business_services.website_design') ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
        }`} onClick={() => setValue('business_services.website_design', !watch('business_services.website_design'))}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code className="h-6 w-6 text-green-500" />
                <CardTitle className="text-lg">Website Design</CardTitle>
              </div>
              <Checkbox checked={watch('business_services.website_design')} />
            </div>
            <div className="text-2xl font-bold text-green-600">R2,500</div>
            <CardDescription>Professional website design</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Responsive Design</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>SEO Optimized</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Contact Forms</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Mobile Friendly</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className={`cursor-pointer transition-all duration-200 ${
          watch('business_services.hosting_maintenance') ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
        }`} onClick={() => setValue('business_services.hosting_maintenance', !watch('business_services.hosting_maintenance'))}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="h-6 w-6 text-purple-500" />
                <CardTitle className="text-lg">Hosting & Maintenance</CardTitle>
              </div>
              <Checkbox checked={watch('business_services.hosting_maintenance')} />
            </div>
            <div className="text-2xl font-bold text-purple-600">R299/month</div>
            <CardDescription>Reliable hosting with maintenance</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>99.9% Uptime</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>SSL Certificate</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Regular Backups</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>24/7 Support</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Lightbulb className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-green-900 mb-1">Special Offer</h4>
            <p className="text-sm text-green-700">
              Get your company registered (R1,350) and receive a FREE website design 
              for your first 3 clients as a marketing strategy!
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep9 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Terms & Conditions</h3>
        <p className="text-gray-600 mb-4">Please review and accept our terms</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox {...register('terms_accepted')} />
          <div className="text-sm">
            <span>I accept the </span>
            <a href="/terms" className="text-blue-600 hover:underline">Terms and Conditions</a>
            <span> and agree to be bound by them</span>
          </div>
        </div>
        {errors.terms_accepted && (
          <p className="text-red-500 text-sm mt-1">{errors.terms_accepted.message}</p>
        )}
        
        <div className="flex items-start space-x-2">
          <Checkbox {...register('privacy_accepted')} />
          <div className="text-sm">
            <span>I accept the </span>
            <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
            <span> and consent to the processing of my personal data</span>
          </div>
        </div>
        {errors.privacy_accepted && (
          <p className="text-red-500 text-sm mt-1">{errors.privacy_accepted.message}</p>
        )}
        
        <div className="flex items-start space-x-2">
          <Checkbox {...register('marketing_consent')} />
          <div className="text-sm">
            <span>I consent to receive marketing communications and updates about new features</span>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Verification Process</h4>
            <p className="text-sm text-blue-700">
              Your application will be reviewed within 24 hours. We'll verify your documents and 
              contact you if we need any additional information.
            </p>
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
      case 8: return renderStep8()
      case 9: return renderStep9()
      default: return renderStep1()
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Service Provider Registration</CardTitle>
              <CardDescription>
                Join our network of verified professionals and start getting quality leads
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
                    disabled={!isValid}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!isValid}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Submit Application
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


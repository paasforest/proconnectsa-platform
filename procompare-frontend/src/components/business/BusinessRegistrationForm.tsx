'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, ArrowRight, CheckCircle, Building, FileText, Globe, Shield, Calendar, Phone, Mail, MapPin, User, CreditCard, Copy, Banknote, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

// CIPC Business Registration Schema
const businessRegistrationSchema = z.object({
  // Step 1: Personal Information
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  nationality: z.string().min(1, 'Please select your nationality'),
  id_type: z.string().min(1, 'Please select ID type'),
  id_number: z.string().min(6, 'Please provide a valid ID/Passport number'),
  id_document: z.string().min(1, 'Please upload certified copy of ID/Passport'),
  email: z.string().email('Please provide a valid email address'),
  phone: z.string().min(10, 'Please provide a valid phone number'),
  
  // Step 2: Business Information
  business_name: z.string().min(2, 'First choice business name is required'),
  business_name_alternative: z.string().min(2, 'Second choice business name is required'),
  business_type: z.string().min(1, 'Please select a business type'),
  business_category: z.string().min(1, 'Please select a business category'),
  business_description: z.string().min(10, 'Please provide a brief business description'),
  
  // Step 3: Business Address
  street_address: z.string().min(5, 'Please provide a complete street address'),
  suburb: z.string().min(2, 'Please provide suburb'),
  city: z.string().min(2, 'Please provide city'),
  province: z.string().min(1, 'Please select province'),
  postal_code: z.string().min(4, 'Please provide postal code'),
  
  // Step 4: Directors/Members Information
  directors: z.array(z.object({
    name: z.string().min(2, 'Director name is required'),
    nationality: z.string().min(1, 'Nationality is required'),
    id_type: z.string().min(1, 'ID type is required'),
    id_number: z.string().min(6, 'Valid ID/Passport number required'),
    id_document: z.string().min(1, 'Please upload certified copy of ID/Passport'),
    email: z.string().email('Valid email required'),
    phone: z.string().min(10, 'Valid phone number required'),
    address: z.string().min(5, 'Complete address required'),
    shareholding: z.number().min(1, 'Shareholding percentage required').max(100)
  })).min(1, 'At least one director is required'),
  
  // Step 5: Website Requirements
  website_required: z.boolean().default(true),
  website_type: z.string().optional(),
  website_features: z.array(z.string()).optional(),
  domain_preference: z.string().optional(),
  
  // Step 6: Registration Timeline
  registration_urgency: z.string().min(1, 'Please select registration timeline'),
  preferred_start_date: z.string().min(1, 'Please select preferred start date'),
  
  // Step 7: Payment & Terms
  payment_method: z.string().min(1, 'Please select payment method'),
  terms_accepted: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  privacy_accepted: z.boolean().refine(val => val === true, 'You must accept the privacy policy'),
  marketing_consent: z.boolean().default(false)
})

type BusinessRegistrationForm = z.infer<typeof businessRegistrationSchema>

const nationalities = [
  'South African',
  'Botswana',
  'Namibia',
  'Zimbabwe',
  'Zambia',
  'Mozambique',
  'Lesotho',
  'Swaziland',
  'United Kingdom',
  'United States',
  'Germany',
  'Netherlands',
  'Australia',
  'Canada',
  'India',
  'Pakistan',
  'Bangladesh',
  'Nigeria',
  'Kenya',
  'Ghana',
  'Other'
]

const idTypes = [
  'South African ID',
  'Passport'
]

const businessTypes = [
  'Private Company (Pty Ltd)',
  'Public Company (Ltd)',
  'Close Corporation (CC)',
  'Sole Proprietorship',
  'Partnership',
  'Non-Profit Company (NPC)',
  'Personal Liability Company (Inc)'
]

const businessCategories = [
  'Construction & Building',
  'Home Services',
  'Professional Services',
  'Health & Wellness',
  'Technology',
  'Retail & E-commerce',
  'Food & Beverage',
  'Transportation',
  'Education & Training',
  'Entertainment',
  'Manufacturing',
  'Agriculture',
  'Other'
]

const provinces = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape'
]

const websiteTypes = [
  'Basic Business Website (5 pages)',
  'E-commerce Website',
  'Portfolio/Gallery Website',
  'Blog/Content Website',
  'Booking/Appointment Website',
  'Custom Website'
]

const websiteFeatures = [
  'Contact Forms',
  'Online Booking',
  'E-commerce/Shop',
  'Photo Gallery',
  'Blog/News',
  'Customer Reviews',
  'Social Media Integration',
  'Google Maps Integration',
  'Live Chat',
  'Mobile App'
]

const urgencyOptions = [
  'Standard (7-14 days) - R1,350',
  'Express (3-7 days) - R1,850',
  'Rush (1-3 days) - R2,350'
]

interface BusinessRegistrationFormProps {
  onComplete: (data: BusinessRegistrationForm) => void
  onCancel: () => void
}

export default function BusinessRegistrationForm({ onComplete, onCancel }: BusinessRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [registrationData, setRegistrationData] = useState<BusinessRegistrationForm | null>(null)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: File}>({})
  const totalSteps = 7

  const form = useForm({
    resolver: zodResolver(businessRegistrationSchema),
    defaultValues: {
      directors: [{
        name: '',
        nationality: '',
        id_type: '',
        id_number: '',
        id_document: '',
        email: '',
        phone: '',
        address: '',
        shareholding: 100
      }],
      website_required: true,
      website_features: [],
      marketing_consent: false
    }
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form

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

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      console.log('Submitting Business Registration Data:', data)
      
      // Call the backend API
      const response = await fetch('/api/business-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to submit registration')
      }

      const result = await response.json()
      console.log('Registration submitted successfully:', result)
      
      // Show payment modal after successful submission
      setShowPaymentModal(true)
      setRegistrationData(data)
      toast.success('Registration submitted successfully! Please complete payment to finalize.')
    } catch (error) {
      console.error('Registration submission error:', error)
      toast.error('Failed to submit registration. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addDirector = () => {
    const currentDirectors = watch('directors')
    setValue('directors', [...currentDirectors, {
      name: '',
      nationality: '',
      id_type: '',
      id_number: '',
      id_document: '',
      email: '',
      phone: '',
      address: '',
      shareholding: 0
    }])
  }

  const removeDirector = (index: number) => {
    const currentDirectors = watch('directors')
    if (currentDirectors.length > 1) {
      setValue('directors', currentDirectors.filter((_, i) => i !== index))
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF, JPG, or PNG file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }

      // Store file and update form
      setUploadedFiles(prev => ({ ...prev, [fieldName]: file }))
      setValue(fieldName as any, file.name)
      toast.success('Document uploaded successfully')
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <User className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
        <p className="text-gray-600">Tell us about yourself as the business owner</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name</Label>
          <Input {...register('first_name')} placeholder="John" />
          {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="last_name">Last Name</Label>
          <Input {...register('last_name')} placeholder="Smith" />
          {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>}
        </div>
      </div>

      <div>
        <Label>Nationality</Label>
        <Select onValueChange={(value) => setValue('nationality', value)} value={watch('nationality')}>
          <SelectTrigger>
            <SelectValue placeholder="Select nationality" />
          </SelectTrigger>
          <SelectContent className="z-[9999] max-h-[200px] overflow-auto bg-white border shadow-lg">
            {nationalities.map((nationality) => (
              <SelectItem key={nationality} value={nationality}>{nationality}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>ID Type</Label>
          <Select onValueChange={(value) => setValue('id_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select ID type" />
            </SelectTrigger>
            <SelectContent className="z-[9999] max-h-[200px] overflow-auto bg-white border shadow-lg">
              {idTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.id_type && <p className="text-red-500 text-sm mt-1">{errors.id_type.message}</p>}
        </div>

        <div>
          <Label htmlFor="id_number">
            {watch('id_type') === 'South African ID' ? 'ID Number' : 'Passport Number'}
          </Label>
          <Input 
            {...register('id_number')} 
            placeholder={watch('id_type') === 'South African ID' ? '8001015009087' : 'A12345678'} 
            maxLength={watch('id_type') === 'South African ID' ? 13 : 20}
          />
          {errors.id_number && <p className="text-red-500 text-sm mt-1">{errors.id_number.message}</p>}
        </div>
      </div>

      {/* Document Upload Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Required Document Upload
        </h4>
        
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">Important Document Requirements:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Upload a <strong>certified copy</strong> of your ID or passport</li>
                  <li>• Document must be <strong>certified by a commissioner of oaths</strong></li>
                  <li>• Certification must be <strong>not older than 3 months</strong></li>
                  <li>• Accepted formats: PDF, JPG, PNG (max 5MB)</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="id_document">
              Certified Copy of {watch('id_type') === 'South African ID' ? 'ID Document' : 'Passport'}
            </Label>
            <div className="mt-2">
              <input
                type="file"
                id="id_document"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e, 'id_document')}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              {uploadedFiles['id_document'] && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Uploaded: {uploadedFiles['id_document'].name}</span>
                </div>
              )}
              {errors.id_document && <p className="text-red-500 text-sm mt-1">{errors.id_document.message}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input type="email" {...register('email')} placeholder="john@example.com" />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input {...register('phone')} placeholder="+27 82 123 4567" />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Building className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900">Business Information</h3>
        <p className="text-gray-600">Tell us about your business</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
          <Building className="w-5 h-5 mr-2" />
          Business Name Choices
        </h4>
        <p className="text-sm text-blue-700 mb-4">
          CIPC requires alternative names in case your first choice is already taken. Please provide 2 business name options:
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="business_name">1st Choice Business Name</Label>
            <Input {...register('business_name')} placeholder="Smith Construction Services" />
            {errors.business_name && <p className="text-red-500 text-sm mt-1">{errors.business_name.message}</p>}
          </div>

          <div>
            <Label htmlFor="business_name_alternative">2nd Choice Business Name</Label>
            <Input {...register('business_name_alternative')} placeholder="Smith Building Solutions" />
            {errors.business_name_alternative && <p className="text-red-500 text-sm mt-1">{errors.business_name_alternative.message}</p>}
            <p className="text-xs text-blue-600 mt-1">
              This will be used if your first choice is not available
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Business Type</Label>
          <Select onValueChange={(value) => setValue('business_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent className="z-[9999] max-h-[200px] overflow-auto bg-white border shadow-lg">
              {businessTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.business_type && <p className="text-red-500 text-sm mt-1">{errors.business_type.message}</p>}
        </div>

        <div>
          <Label>Business Category</Label>
          <Select onValueChange={(value) => setValue('business_category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="z-[9999] max-h-[200px] overflow-auto bg-white border shadow-lg">
              {businessCategories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.business_category && <p className="text-red-500 text-sm mt-1">{errors.business_category.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="business_description">Business Description</Label>
        <Textarea 
          {...register('business_description')} 
          placeholder="Describe what your business does..."
          rows={4}
        />
        {errors.business_description && <p className="text-red-500 text-sm mt-1">{errors.business_description.message}</p>}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <MapPin className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900">Business Address</h3>
        <p className="text-gray-600">Where will your business be located?</p>
      </div>

      <div>
        <Label htmlFor="street_address">Street Address</Label>
        <Input {...register('street_address')} placeholder="123 Main Street" />
        {errors.street_address && <p className="text-red-500 text-sm mt-1">{errors.street_address.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="suburb">Suburb</Label>
          <Input {...register('suburb')} placeholder="Sandton" />
          {errors.suburb && <p className="text-red-500 text-sm mt-1">{errors.suburb.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="city">City</Label>
          <Input {...register('city')} placeholder="Johannesburg" />
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Province</Label>
          <Select onValueChange={(value) => setValue('province', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select province" />
            </SelectTrigger>
          <SelectContent className="z-[9999] max-h-[200px] overflow-auto bg-white border shadow-lg">
            {provinces.map((province) => (
              <SelectItem key={province} value={province}>{province}</SelectItem>
            ))}
          </SelectContent>
          </Select>
          {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province.message}</p>}
        </div>

        <div>
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input {...register('postal_code')} placeholder="2196" />
          {errors.postal_code && <p className="text-red-500 text-sm mt-1">{errors.postal_code.message}</p>}
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FileText className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900">Directors Information</h3>
        <p className="text-gray-600">Add information for all company directors</p>
      </div>

      {/* Document Requirements Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h4 className="font-bold text-red-900 mb-3 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Required Documents for Each Director
        </h4>
        <div className="text-sm text-red-800 space-y-2">
          <p><strong>Each director must provide:</strong></p>
          <ul className="space-y-1 ml-4">
            <li>• <strong>Certified copy</strong> of ID document or passport</li>
            <li>• Document must be <strong>certified by a commissioner of oaths</strong></li>
            <li>• Certification must be <strong>not older than 3 months</strong></li>
            <li>• Acceptable formats: PDF, JPG, PNG (maximum 5MB per file)</li>
          </ul>
          <p className="mt-2 font-medium">
            💡 Tip: You can get documents certified at any police station, bank, or attorney's office
          </p>
        </div>
      </div>

      {watch('directors').map((director, index) => (
        <Card key={index} className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">Director {index + 1}</h4>
            {watch('directors').length > 1 && (
              <Button variant="outline" size="sm" onClick={() => removeDirector(index)}>
                Remove
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input 
                {...register(`directors.${index}.name`)} 
                placeholder="John Smith" 
              />
            </div>
            
            <div>
              <Label>Nationality</Label>
              <Select onValueChange={(value) => setValue(`directors.${index}.nationality`, value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent className="z-[9999] max-h-[200px] overflow-auto bg-white border shadow-lg">
                  {nationalities.map((nationality) => (
                    <SelectItem key={nationality} value={nationality}>{nationality}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>ID Type</Label>
              <Select onValueChange={(value) => setValue(`directors.${index}.id_type`, value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent className="z-[9999] max-h-[200px] overflow-auto bg-white border shadow-lg">
                  {idTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>
                {watch(`directors.${index}.id_type`) === 'South African ID' ? 'ID Number' : 'Passport Number'}
              </Label>
              <Input 
                {...register(`directors.${index}.id_number`)} 
                placeholder={watch(`directors.${index}.id_type`) === 'South African ID' ? '8001015009087' : 'A12345678'} 
                maxLength={watch(`directors.${index}.id_type`) === 'South African ID' ? 13 : 20}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input 
                type="email"
                {...register(`directors.${index}.email`)} 
                placeholder="john@example.com" 
              />
            </div>
            
            <div>
              <Label>Phone</Label>
              <Input 
                {...register(`directors.${index}.phone`)} 
                placeholder="+27 82 123 4567" 
              />
            </div>

            <div>
              <Label>Address</Label>
              <Input 
                {...register(`directors.${index}.address`)} 
                placeholder="123 Main St, City" 
              />
            </div>
            
            <div>
              <Label>Shareholding %</Label>
              <Input 
                type="number"
                {...register(`directors.${index}.shareholding`, { valueAsNumber: true })} 
                placeholder="50" 
                min="1" 
                max="100"
              />
            </div>
          </div>

          {/* Director Document Upload */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-4">
            <Label className="text-sm font-medium text-blue-800 mb-2 block">
              Certified Copy of {watch(`directors.${index}.id_type`) === 'South African ID' ? 'ID Document' : 'Passport'}
            </Label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e, `directors.${index}.id_document`)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
            {uploadedFiles[`directors.${index}.id_document`] && (
              <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Uploaded: {uploadedFiles[`directors.${index}.id_document`].name}</span>
              </div>
            )}
            <p className="text-xs text-blue-600 mt-1">
              Must be certified and not older than 3 months
            </p>
          </div>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={addDirector} className="w-full">
        Add Another Director
      </Button>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Globe className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900">FREE Professional Website</h3>
        <p className="text-gray-600">Customize your included website (R3,500 value)</p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Checkbox 
            checked={watch('website_required')} 
            onCheckedChange={(checked) => setValue('website_required', checked as boolean)}
          />
          <Label className="text-emerald-700 font-medium">
            Yes, I want my FREE professional website (Recommended)
          </Label>
        </div>
        <p className="text-sm text-emerald-600 ml-6">
          Save R3,500 - Professional website included at no extra cost
        </p>
      </div>

      {watch('website_required') && (
        <>
          <div>
            <Label>Website Type</Label>
            <Select onValueChange={(value) => setValue('website_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select website type" />
              </SelectTrigger>
              <SelectContent className="z-[9999] max-h-[200px] overflow-auto bg-white border shadow-lg">
                {websiteTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Website Features (Select all that apply)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {websiteFeatures.map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox
                    checked={watch('website_features')?.includes(feature)}
                    onCheckedChange={(checked) => {
                      const current = watch('website_features') || []
                      if (checked) {
                        setValue('website_features', [...current, feature])
                      } else {
                        setValue('website_features', current.filter(f => f !== feature))
                      }
                    }}
                  />
                  <Label className="text-sm">{feature}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="domain_preference">Preferred Domain Name (Optional)</Label>
            <Input 
              {...register('domain_preference')} 
              placeholder="yourcompany.co.za" 
            />
            <p className="text-sm text-gray-500 mt-1">We'll check availability and suggest alternatives if needed</p>
          </div>
        </>
      )}
    </div>
  )

  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Calendar className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900">Registration Timeline</h3>
        <p className="text-gray-600">When do you need your business registered?</p>
      </div>

      <div>
        <Label>Registration Speed</Label>
        <Select onValueChange={(value) => setValue('registration_urgency', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select timeline" />
          </SelectTrigger>
          <SelectContent className="z-[9999] max-h-[200px] overflow-auto bg-white border shadow-lg">
            {urgencyOptions.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.registration_urgency && <p className="text-red-500 text-sm mt-1">{errors.registration_urgency.message}</p>}
      </div>

      <div>
        <Label htmlFor="preferred_start_date">Preferred Start Date</Label>
        <Input 
          type="date"
          {...register('preferred_start_date')} 
          min={new Date().toISOString().split('T')[0]}
        />
        {errors.preferred_start_date && <p className="text-red-500 text-sm mt-1">{errors.preferred_start_date.message}</p>}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• We'll review your application within 24 hours</li>
          <li>• Our team will contact you to confirm details</li>
          <li>• We'll start the CIPC registration process</li>
          <li>• Your website development begins immediately</li>
          <li>• You'll receive regular updates on progress</li>
        </ul>
      </div>
    </div>
  )

  const renderStep7 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CreditCard className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900">Payment & Final Steps</h3>
        <p className="text-gray-600">Complete your registration</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Order Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Company Registration</span>
            <span>R1,350</span>
          </div>
          <div className="flex justify-between text-emerald-600">
            <span>Professional Website</span>
            <span>FREE (R3,500 value)</span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>R1,350</span>
          </div>
        </div>
      </div>

      <div>
        <Label>Payment Method</Label>
        <Select onValueChange={(value) => setValue('payment_method', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent className="z-[9999] max-h-[200px] overflow-auto bg-white border shadow-lg">
            <SelectItem value="card">Credit/Debit Card</SelectItem>
            <SelectItem value="eft">EFT/Bank Transfer</SelectItem>
            <SelectItem value="payfast">PayFast</SelectItem>
          </SelectContent>
        </Select>
        {errors.payment_method && <p className="text-red-500 text-sm mt-1">{errors.payment_method.message}</p>}
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox 
            checked={watch('terms_accepted')} 
            onCheckedChange={(checked) => setValue('terms_accepted', checked as boolean)}
          />
          <Label className="text-sm">
            I accept the <a href="#" className="text-emerald-600 underline">Terms and Conditions</a>
          </Label>
        </div>
        {errors.terms_accepted && <p className="text-red-500 text-sm">{errors.terms_accepted.message}</p>}

        <div className="flex items-start space-x-2">
          <Checkbox 
            checked={watch('privacy_accepted')} 
            onCheckedChange={(checked) => setValue('privacy_accepted', checked as boolean)}
          />
          <Label className="text-sm">
            I accept the <a href="#" className="text-emerald-600 underline">Privacy Policy</a>
          </Label>
        </div>
        {errors.privacy_accepted && <p className="text-red-500 text-sm">{errors.privacy_accepted.message}</p>}

        <div className="flex items-start space-x-2">
          <Checkbox 
            checked={watch('marketing_consent')} 
            onCheckedChange={(checked) => setValue('marketing_consent', checked as boolean)}
          />
          <Label className="text-sm">
            I'd like to receive updates about my registration and business tips (Optional)
          </Label>
        </div>
      </div>
    </div>
  )

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const handlePaymentConfirmed = () => {
    setPaymentConfirmed(true)
    setShowPaymentModal(false)
    if (registrationData) {
      onComplete(registrationData)
    }
  }

  const getPaymentReference = () => {
    if (!registrationData) return ''
    // Use phone number as reference (remove spaces and special characters)
    return registrationData.phone.replace(/[^\d]/g, '')
  }

  const getSelectedPrice = () => {
    if (!registrationData) return 'R1,350'
    const urgency = registrationData.registration_urgency
    if (urgency.includes('Express')) return 'R1,850'
    if (urgency.includes('Rush')) return 'R2,350'
    return 'R1,350'
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 relative">
          <Card className="shadow-lg relative overflow-visible">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">Business Registration</CardTitle>
                  <p className="text-emerald-100">Step {currentStep} of {totalSteps}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={onCancel} className="text-white hover:bg-emerald-800">
                  ×
                </Button>
              </div>
              <Progress value={(currentStep / totalSteps) * 100} className="mt-4" />
            </CardHeader>

            <CardContent className="p-8 space-y-6 overflow-visible">
              <form onSubmit={handleSubmit(onSubmit, (errors) => {
                console.log('Form validation errors:', errors)
                toast.error('Please fill in all required fields')
              })}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
                {currentStep === 5 && renderStep5()}
                {currentStep === 6 && renderStep6()}
                {currentStep === 7 && renderStep7()}

                <div className="flex justify-between mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Button>

                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-emerald-600 hover:bg-emerald-700 flex items-center space-x-2"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      onClick={() => console.log('Complete Registration button clicked, current step:', currentStep)}
                      className="bg-emerald-600 hover:bg-emerald-700 flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Complete Registration</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto z-[10000]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-emerald-600">
              Complete Your Payment
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <h3 className="font-bold text-emerald-900 mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Company Registration</span>
                  <span>{getSelectedPrice()}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Professional Website</span>
                  <span>FREE (R3,500 value)</span>
                </div>
                <div className="border-t border-emerald-200 pt-2 mt-2 flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span className="text-emerald-600">{getSelectedPrice()}</span>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-blue-900 mb-4 flex items-center">
                <Banknote className="w-5 h-5 mr-2" />
                Bank Transfer Details
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-blue-800">Bank Name</Label>
                    <div className="flex items-center justify-between bg-white border border-blue-200 rounded p-3">
                      <span className="font-mono">Nedbank</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard('Nedbank', 'Bank name')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-blue-800">Account Name</Label>
                    <div className="flex items-center justify-between bg-white border border-blue-200 rounded p-3">
                      <span className="font-mono">ProConnectSA (Pty) Ltd</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard('ProConnectSA (Pty) Ltd', 'Account name')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-blue-800">Account Number</Label>
                    <div className="flex items-center justify-between bg-white border border-blue-200 rounded p-3">
                      <span className="font-mono">1313872032</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard('1313872032', 'Account number')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-blue-800">Branch Code</Label>
                    <div className="flex items-center justify-between bg-white border border-blue-200 rounded p-3">
                      <span className="font-mono">198765</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard('198765', 'Branch code')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-blue-800">Payment Reference</Label>
                  <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded p-3">
                    <span className="font-mono font-bold text-lg">{getPaymentReference()}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(getPaymentReference(), 'Payment reference')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">
                    ⚠️ Important: Use your phone number ({registrationData?.phone}) as the payment reference
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-blue-800">Amount</Label>
                  <div className="flex items-center justify-between bg-white border border-blue-200 rounded p-3">
                    <span className="font-mono font-bold text-xl text-emerald-600">{getSelectedPrice()}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(getSelectedPrice().replace('R', ''), 'Amount')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Important Payment Instructions
              </h4>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• Use your phone number <strong>{registrationData?.phone}</strong> as the payment reference</li>
                <li>• Transfer the exact amount: <strong>{getSelectedPrice()}</strong></li>
                <li>• We'll verify payment within 2-4 hours during business hours</li>
                <li>• You'll receive email confirmation once payment is verified</li>
                <li>• CIPC registration process begins immediately after payment</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handlePaymentConfirmed}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                I've Made the Payment
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowPaymentModal(false)}
                className="flex-1"
              >
                <Clock className="w-4 h-4 mr-2" />
                Pay Later
              </Button>
            </div>

            <p className="text-center text-xs text-gray-500">
              Need help? Contact us at <strong>support@proconnectsa.co.za</strong> or <strong>+27 67 951 8124</strong>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

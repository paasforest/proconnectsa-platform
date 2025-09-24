'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, AlertCircle, CheckCircle, Building2, User, ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import RegistrationSteps from '@/components/auth/RegistrationSteps'

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Basic Info
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    userType: 'client' as 'client' | 'provider',
    
    // Location Info (for both clients and providers)
    city: '',
    town: '',
    suburb: '',
    postalCode: '',
    
    // Business Info (for providers)
    businessName: '',
    businessPhone: '',
    businessEmail: '',
    businessAddress: '',
    businessRegistration: '',
    vatNumber: '',
    licenseNumber: '',
    
    // Service Info (for providers)
    serviceCategories: [] as string[],
    serviceAreas: [] as string[],
    maxTravelDistance: 30,
    hourlyRateMin: 0,
    hourlyRateMax: 0,
    minimumJobValue: 0,
    yearsExperience: 0,
    bio: '',
    
    // Preferences
    receivesLeadNotifications: true,
    notificationMethods: ['email'] as string[]
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const serviceCategories = [
    'plumbing', 'electrical', 'hvac', 'carpentry', 'painting', 'flooring',
    'roofing', 'landscaping', 'cleaning', 'appliance_repair', 'water_heater_repair',
    'pool_maintenance', 'security_systems', 'solar_installation', 'other'
  ]

  const totalSteps = formData.userType === 'provider' ? 4 : 2

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submitted!', {
      currentStep,
      totalSteps,
      shouldSubmit: currentStep === totalSteps,
      formData: {
        email: formData.email,
        userType: formData.userType,
        serviceCategories: formData.serviceCategories
      }
    })
    
    // Prevent submission if not on final step
    if (currentStep !== totalSteps) {
      console.log('Preventing form submission - not on final step')
      setIsLoading(false)
      return
    }
    
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.userType === 'provider' && formData.serviceCategories.length === 0) {
      setError('Please select at least one service category')
      setIsLoading(false)
      return
    }

    try {
      // Prepare registration data for Django API
      const registrationData = {
        username: formData.email, // Use email as username
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        user_type: formData.userType,
        phone: formData.phone,
        city: formData.city,
        suburb: formData.suburb,
        ...(formData.userType === 'provider' && {
          businessName: formData.businessName,
          businessPhone: formData.businessPhone,
          businessEmail: formData.businessEmail,
          businessAddress: formData.businessAddress,
          businessRegistration: formData.businessRegistration,
          vatNumber: formData.vatNumber,
          licenseNumber: formData.licenseNumber,
          serviceCategories: formData.serviceCategories,
          serviceAreas: formData.serviceAreas,
          maxTravelDistance: formData.maxTravelDistance,
          hourlyRateMin: formData.hourlyRateMin,
          hourlyRateMax: formData.hourlyRateMax,
          minimumJobValue: formData.minimumJobValue,
          yearsExperience: formData.yearsExperience,
          bio: formData.bio,
          receivesLeadNotifications: formData.receivesLeadNotifications,
          notificationMethods: formData.notificationMethods
        })
      }

      // Call the Django backend registration API
      const response = await fetch('https://api.proconnectsa.co.za/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess('Registration successful! Please check your email to verify your account.')
        setTimeout(() => {
          router.push('/login?message=Please verify your email and then sign in')
        }, 2000)
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (error) {
      setError('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      
      if (name === 'serviceCategories') {
        // Handle service categories array
        const newCategories = checked
          ? [...formData.serviceCategories, value]
          : formData.serviceCategories.filter(c => c !== value)
        
        console.log('Service categories updated:', {
          checked,
          value,
          currentCategories: formData.serviceCategories,
          newCategories
        })
        
        setFormData({
          ...formData,
          serviceCategories: newCategories
        })
      } else {
        // Handle other checkboxes
        setFormData({
          ...formData,
          [name]: checked
        })
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleServiceAreaAdd = (area: string) => {
    if (area.trim() && !formData.serviceAreas.includes(area.trim())) {
      setFormData({
        ...formData,
        serviceAreas: [...formData.serviceAreas, area.trim()]
      })
    }
  }

  const handleServiceAreaRemove = (area: string) => {
    setFormData({
      ...formData,
      serviceAreas: formData.serviceAreas.filter(a => a !== area)
    })
  }

  const nextStep = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    const stepValid = isStepValid(currentStep)
    console.log('Next step clicked:', {
      currentStep,
      totalSteps,
      stepValid,
      canProceed: currentStep < totalSteps && stepValid
    })
    
    if (currentStep < totalSteps && stepValid) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.password && formData.confirmPassword && formData.city && formData.suburb && formData.postalCode
      case 2:
        if (formData.userType === 'client') {
          return true // Client review step is always valid
        }
        return formData.businessName && formData.businessPhone
      case 3:
        if (formData.userType === 'client') {
          return true // Client doesn't have step 3
        }
        const isValid = Array.isArray(formData.serviceCategories) && formData.serviceCategories.length > 0
        console.log('Step 3 validation:', {
          userType: formData.userType,
          serviceCategories: formData.serviceCategories,
          isArray: Array.isArray(formData.serviceCategories),
          length: formData.serviceCategories?.length,
          isValid,
          timestamp: new Date().toISOString()
        })
        return isValid
      case 4:
        return true // Final step is always valid
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="font-bold text-2xl">
              <span className="text-emerald-600">ProConnect</span>
              <span className="text-gray-900">SA</span>
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            {formData.userType === 'provider' 
              ? 'Join as a service provider and start getting leads' 
              : 'Find trusted service providers in your area'
            }
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="text-center text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {formData.userType === 'provider' ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
              {formData.userType === 'provider' ? 'Service Provider Registration' : 'Client Registration'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Start with your basic information'}
              {currentStep === 2 && formData.userType === 'provider' && 'Tell us about your business'}
              {currentStep === 2 && formData.userType === 'client' && 'Review your information'}
              {currentStep === 3 && 'What services do you offer?'}
              {currentStep === 4 && 'Set your rates and experience'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {success && (
                <Alert className="border-green-200 bg-green-50 mb-4">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <RegistrationSteps
                currentStep={currentStep}
                formData={formData}
                onInputChange={handleInputChange}
                onServiceAreaAdd={handleServiceAreaAdd}
                onServiceAreaRemove={handleServiceAreaRemove}
              />

              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={(e) => nextStep(e)}
                    disabled={!isStepValid(currentStep)}
                    className="flex items-center gap-2"
                    title={`Step ${currentStep} valid: ${isStepValid(currentStep)}`}
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading || !isStepValid(currentStep)}
                    className="flex items-center gap-2"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-emerald-600 hover:text-emerald-500 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
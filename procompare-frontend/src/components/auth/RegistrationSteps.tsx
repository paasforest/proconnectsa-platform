'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CheckCircle, User, Building2, Wrench, MapPin } from 'lucide-react'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  userType: 'client' | 'provider'
  businessName: string
  businessPhone: string
  businessEmail: string
  businessAddress: string
  businessRegistration: string
  vatNumber: string
  licenseNumber: string
  serviceCategories: string[]
  serviceAreas: string[]
  maxTravelDistance: number
  hourlyRateMin: number
  hourlyRateMax: number
  minimumJobValue: number
  yearsExperience: number
  bio: string
  receivesLeadNotifications: boolean
  notificationMethods: string[]
}

interface RegistrationStepsProps {
  currentStep: number
  formData: FormData
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  onServiceAreaAdd: (area: string) => void
  onServiceAreaRemove: (area: string) => void
}

const serviceCategories = [
  'plumbing', 'electrical', 'hvac', 'carpentry', 'painting', 'flooring',
  'roofing', 'landscaping', 'cleaning', 'appliance_repair', 'water_heater_repair',
  'pool_maintenance', 'security_systems', 'solar_installation', 'other'
]

export default function RegistrationSteps({ 
  currentStep, 
  formData, 
  onInputChange, 
  onServiceAreaAdd, 
  onServiceAreaRemove 
}: RegistrationStepsProps) {
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Basic Information</h3>
              <p className="text-gray-600">Tell us about yourself</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={onInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={onInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={onInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+27 12 345 6789"
                value={formData.phone}
                onChange={onInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userType">Account Type</Label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="client">Client - Looking for services</option>
                <option value="provider">Provider - Offering services</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a secure password"
                value={formData.password}
                onChange={onInputChange}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={onInputChange}
                required
                minLength={8}
              />
            </div>
          </div>
        )

      case 2:
        if (formData.userType === 'client') {
          return (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Ready to Register!</h3>
                <p className="text-gray-600">Review your information and create your account</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Phone:</strong> {formData.phone || 'Not provided'}</p>
                <p><strong>Account Type:</strong> Client</p>
              </div>
            </div>
          )
        }

        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Building2 className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Business Information</h3>
              <p className="text-gray-600">Tell us about your business</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                name="businessName"
                type="text"
                placeholder="ABC Plumbing Services"
                value={formData.businessName}
                onChange={onInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessPhone">Business Phone *</Label>
              <Input
                id="businessPhone"
                name="businessPhone"
                type="tel"
                placeholder="+27 11 123 4567"
                value={formData.businessPhone}
                onChange={onInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessEmail">Business Email</Label>
              <Input
                id="businessEmail"
                name="businessEmail"
                type="email"
                placeholder="info@abcplumbing.co.za"
                value={formData.businessEmail}
                onChange={onInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessAddress">Business Address *</Label>
              <Textarea
                id="businessAddress"
                name="businessAddress"
                placeholder="123 Main Street, Sandton, Johannesburg, 2196"
                value={formData.businessAddress}
                onChange={onInputChange}
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessRegistration">Business Registration</Label>
                <Input
                  id="businessRegistration"
                  name="businessRegistration"
                  type="text"
                  placeholder="2023/123456/07"
                  value={formData.businessRegistration}
                  onChange={onInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vatNumber">VAT Number</Label>
                <Input
                  id="vatNumber"
                  name="vatNumber"
                  type="text"
                  placeholder="4123456789"
                  value={formData.vatNumber}
                  onChange={onInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                type="text"
                placeholder="PLB123456"
                value={formData.licenseNumber}
                onChange={onInputChange}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Wrench className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Services & Areas</h3>
              <p className="text-gray-600">What services do you offer and where?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Service Categories *</Label>
                <p className="text-sm text-gray-600 mb-3">Select all that apply</p>
                <div className="grid grid-cols-2 gap-2">
                  {serviceCategories.map((category) => (
                    <label key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="serviceCategories"
                        value={category}
                        checked={formData.serviceCategories.includes(category)}
                        onChange={onInputChange}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm capitalize">{category.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Service Areas</Label>
                <p className="text-sm text-gray-600 mb-3">Add areas where you provide services</p>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g., Sandton, Rosebank"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        onServiceAreaAdd(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder*="Sandton"]') as HTMLInputElement
                      if (input?.value) {
                        onServiceAreaAdd(input.value)
                        input.value = ''
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.serviceAreas.map((area) => (
                    <span
                      key={area}
                      className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {area}
                      <button
                        type="button"
                        onClick={() => onServiceAreaRemove(area)}
                        className="text-emerald-600 hover:text-emerald-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTravelDistance">Maximum Travel Distance (km)</Label>
                <Input
                  id="maxTravelDistance"
                  name="maxTravelDistance"
                  type="number"
                  min="1"
                  max="200"
                  value={formData.maxTravelDistance}
                  onChange={onInputChange}
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <MapPin className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Pricing & Experience</h3>
              <p className="text-gray-600">Help clients understand your rates and experience</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hourlyRateMin">Min Hourly Rate (R)</Label>
                <Input
                  id="hourlyRateMin"
                  name="hourlyRateMin"
                  type="number"
                  min="0"
                  placeholder="150"
                  value={formData.hourlyRateMin}
                  onChange={onInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourlyRateMax">Max Hourly Rate (R)</Label>
                <Input
                  id="hourlyRateMax"
                  name="hourlyRateMax"
                  type="number"
                  min="0"
                  placeholder="300"
                  value={formData.hourlyRateMax}
                  onChange={onInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumJobValue">Minimum Job Value (R)</Label>
              <Input
                id="minimumJobValue"
                name="minimumJobValue"
                type="number"
                min="0"
                placeholder="500"
                value={formData.minimumJobValue}
                onChange={onInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Years of Experience</Label>
              <Input
                id="yearsExperience"
                name="yearsExperience"
                type="number"
                min="0"
                max="50"
                placeholder="5"
                value={formData.yearsExperience}
                onChange={onInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Business Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell clients about your business, experience, and what makes you unique..."
                value={formData.bio}
                onChange={onInputChange}
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="receivesLeadNotifications"
                  name="receivesLeadNotifications"
                  checked={formData.receivesLeadNotifications}
                  onChange={onInputChange}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="receivesLeadNotifications">Receive lead notifications</Label>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return <div className="min-h-[400px]">{renderStep()}</div>
}

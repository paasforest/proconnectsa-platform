'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, Building, Globe, Shield } from 'lucide-react'
import Link from 'next/link'
import BusinessRegistrationForm from '@/components/business/BusinessRegistrationForm'
import { toast } from 'sonner'

export default function RegisterBusinessPage() {
  const [showForm, setShowForm] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [registrationData, setRegistrationData] = useState<any>(null)

  const handleFormComplete = async (data: any) => {
    console.log('Business Registration Submitted:', data)
    
    // Here you would send to your backend API
    try {
      // Simulate API call to backend
      const response = await fetch('/api/business-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setRegistrationData(data)
        setRegistrationComplete(true)
        toast.success('Business registration submitted successfully!')
      } else {
        throw new Error('Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Registration failed. Please try again.')
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
  }

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center py-20">
        <Card className="max-w-2xl mx-auto text-center shadow-2xl">
          <CardContent className="p-12">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Registration Submitted Successfully! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Thank you, <strong>{registrationData?.first_name}</strong>! We've received your business registration for <strong>{registrationData?.business_name}</strong>.
            </p>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-emerald-900 mb-3">What happens next?</h3>
              <div className="text-left space-y-2 text-emerald-700">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Our team will review your application within 24 hours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>We'll contact you at <strong>{registrationData?.email}</strong> to confirm details</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>CIPC registration process begins immediately</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Your FREE website development starts within 2 business days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>You'll receive regular progress updates</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-blue-800 text-sm">
                📧 A confirmation email has been sent to <strong>{registrationData?.email}</strong> with your reference number and next steps.
              </p>
            </div>
            
            <div className="space-y-4">
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Link href="/">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Back to Homepage
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/services">Browse Our Services</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showForm) {
    return (
      <BusinessRegistrationForm 
        onComplete={handleFormComplete}
        onCancel={handleFormCancel}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Register Your Company & Get a FREE Website
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Complete CIPC registration with professional website included. 
            Everything you need to start your business legally in South Africa.
          </p>
        </div>

        {/* Value Proposition */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Complete CIPC Registration</h3>
            <p className="text-gray-600">Full company registration including SARS tax number, legal compliance, and all required documentation.</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">FREE Professional Website</h3>
            <p className="text-gray-600">Modern, responsive website with SEO optimization, contact forms, and mobile-friendly design (R3,500 value).</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">7-Day Guarantee</h3>
            <p className="text-gray-600">Fast processing with 100% legal compliance guarantee. Professional support throughout the entire process.</p>
          </div>
        </div>

        {/* Pricing Card */}
        <Card className="max-w-2xl mx-auto shadow-2xl border-emerald-200">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="text-5xl font-bold text-emerald-600 mb-2">R1,350</div>
              <p className="text-gray-500">One-time payment</p>
            </div>

            <div className="bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl">🎁</span>
                <span className="text-orange-700 font-bold">FREE Professional Website (R3,500 value)</span>
              </div>
            </div>

            <Button 
              onClick={() => setShowForm(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl text-lg"
              size="lg"
            >
              Start Registration Process
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <p className="text-sm text-gray-500 mt-4">
              Complete setup in 7 days • No hidden fees • Professional support included
            </p>
          </CardContent>
        </Card>

        {/* What's Included */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">What's Included</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">CIPC Registration:</h3>
              <ul className="space-y-2">
                {[
                  'Company name reservation',
                  'CIPC registration certificate',
                  'SARS tax number registration',
                  'All legal documentation',
                  'Director certificates'
                ].map((item, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">FREE Website:</h3>
              <ul className="space-y-2">
                {[
                  'Modern responsive design',
                  'SEO optimized',
                  'Mobile-friendly',
                  'Contact forms',
                  'Google Maps integration'
                ].map((item, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 bg-white rounded-full px-6 py-3 shadow-md">
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">427+ Companies Registered This Month</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



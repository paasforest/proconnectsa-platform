'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Star, 
  Users, 
  DollarSign, 
  Shield, 
  Clock,
  ArrowRight,
  Wrench,
  Zap,
  Paintbrush,
  Home,
  Car,
  Hammer,
  Droplets,
  Trees,
  Building,
  Camera,
  Music,
  Heart,
  Baby,
  Dog,
  Plane
} from 'lucide-react'
import Link from 'next/link'
import ProviderRegistrationForm from '@/components/registration/ProviderRegistrationForm'
import { toast } from 'sonner'

const benefits = [
  {
    icon: DollarSign,
    title: 'Earn More',
    description: 'Access to quality leads and competitive pricing'
  },
  {
    icon: Users,
    title: 'Verified Leads',
    description: 'Only real customers with genuine service needs'
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Safe and reliable payment processing'
  },
  {
    icon: Clock,
    title: 'Flexible Schedule',
    description: 'Work when you want, where you want'
  }
]

const serviceCategories = [
  { name: 'Plumbing', icon: Wrench, color: 'bg-blue-500' },
  { name: 'Electrical', icon: Zap, color: 'bg-yellow-500' },
  { name: 'Handyman', icon: Hammer, color: 'bg-green-500' },
  { name: 'Cleaning', icon: Home, color: 'bg-purple-500' },
  { name: 'Painting', icon: Paintbrush, color: 'bg-pink-500' },
  { name: 'Landscaping', icon: Trees, color: 'bg-green-600' },
  { name: 'Renovation', icon: Building, color: 'bg-orange-500' },
  { name: 'Automotive', icon: Car, color: 'bg-red-500' },
  { name: 'Pool Services', icon: Droplets, color: 'bg-cyan-500' },
  { name: 'Photography', icon: Camera, color: 'bg-indigo-500' },
  { name: 'Entertainment', icon: Music, color: 'bg-purple-600' },
  { name: 'Health & Wellness', icon: Heart, color: 'bg-red-600' },
  { name: 'Childcare', icon: Baby, color: 'bg-pink-600' },
  { name: 'Pet Care', icon: Dog, color: 'bg-yellow-600' },
  { name: 'Transportation', icon: Plane, color: 'bg-blue-600' }
]

export default function RegisterProviderPage() {
  const [showForm, setShowForm] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)

  const handleFormComplete = (data: any) => {
    // Here you would typically send the data to your API
    console.log('Provider registration:', data)
    
    // Simulate API call
    setTimeout(() => {
      setRegistrationComplete(true)
      toast.success('Registration submitted! We\'ll review your application within 24 hours.')
    }, 1000)
  }

  const handleFormCancel = () => {
    setShowForm(false)
  }

  if (registrationComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Registration Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in joining our network. We'll review your application 
              and contact you within 24 hours with next steps.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/provider">Go to Dashboard</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/services">Browse Services</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProviderRegistrationForm 
          onComplete={handleFormComplete}
          onCancel={handleFormCancel}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Join Our Network
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with quality customers and grow your business. Join thousands of 
            verified professionals already earning more with ProConnectSA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Registration
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/services">Browse Services</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Benefits Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Join ProConnectSA?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide everything you need to succeed as a service professional
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Service Categories */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Services We Support
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From plumbing to photography, we welcome professionals from all industries
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {serviceCategories.map((category, index) => {
              const Icon = category.icon
              return (
                <div
                  key={index}
                  className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className={`w-12 h-12 ${category.color} text-white rounded-full flex items-center justify-center mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 text-center">
                    {category.name}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get started in just a few simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Register
              </h3>
              <p className="text-gray-600 text-sm">
                Complete our simple registration form with your business details and qualifications
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Get Verified
              </h3>
              <p className="text-gray-600 text-sm">
                We verify your credentials and documents within 24 hours
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start Earning
              </h3>
              <p className="text-gray-600 text-sm">
                Receive quality leads and start growing your business
              </p>
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Requirements
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              What you need to get started
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Valid ID document</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Business license or registration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Bank account details</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Tax number</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700">Insurance certificate</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700">Professional qualifications</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700">Portfolio of previous work</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-700">References from previous clients</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Join thousands of professionals already earning more with ProConnectSA
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => setShowForm(true)}
          >
            Start Registration Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </section>
      </div>
    </div>
  )
}






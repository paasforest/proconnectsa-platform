'use client'

import { useState, useEffect } from 'react'

// Force this page to be rendered dynamically (not statically generated)
export const dynamic = 'force-dynamic'
// Removed useSearchParams import to avoid prerendering issues
import { ClientHeader } from "@/components/layout/ClientHeader"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Wrench, 
  Zap, 
  Paintbrush, 
  Home as HomeIcon, 
  Car, 
  Hammer, 
  Droplets, 
  Trees, 
  Shield, 
  Sparkles,
  ArrowRight,
  Clock,
  Users,
  CheckCircle
} from "lucide-react"
import LeadGenerationForm from "@/components/leads/LeadGenerationForm"
import { toast } from "sonner"

export default function RequestQuotePage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null)

  // Manual URL parameter extraction to avoid prerendering issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSearchParams(new URLSearchParams(window.location.search))
    }
  }, [])

  // Read service parameter from URL and auto-select category
  useEffect(() => {
    if (!searchParams) return
    const serviceParam = searchParams.get('service')
    if (serviceParam) {
      // Map service ID to service name (matching LeadGenerationForm categories)
      const serviceMap: { [key: string]: string } = {
        'plumbing': 'plumbing',
        'electrical': 'electrical',
        'handyman': 'renovation', // Map handyman to renovation since it's the closest match
        'cleaning': 'cleaning',
        'painting': 'painting',
        'gardening': 'landscaping', // Map gardening to landscaping
        'hvac': 'hvac',
        'renovation': 'renovation',
        'automotive': 'automotive',
        'photography': 'cleaning', // Map photography to cleaning as fallback
        'entertainment': 'cleaning', // Map entertainment to cleaning as fallback
        'health': 'cleaning' // Map health to cleaning as fallback
      }
      
      const serviceId = serviceMap[serviceParam] || serviceParam
      setSelectedCategory(serviceId)
      setShowForm(true)
    }
  }, [searchParams])

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setShowForm(true)
  }

  const handleFormComplete = async (data: any) => {
    console.log('🎯 HANDLE FORM COMPLETE CALLED!', data)
    console.log('🎯 Service category ID:', data.service_category_id)
    
    try {
      // Import the API client
      const { apiClient } = await import('@/lib/api-simple')
      
      // Map form data to API format (including client contact details)
      const leadData = {
        service_category_id: data.service_category_id || 1, // Default to first category
        title: data.title,
        description: data.description,
        location_address: data.address,
        location_suburb: data.suburb,
        location_city: data.city,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        budget_range: data.budget_range,
        urgency: data.urgency,
        preferred_contact_time: data.preferred_contact_time,
        additional_requirements: data.special_requirements || '',
        hiring_intent: data.hiring_intent,
        hiring_timeline: data.hiring_timeline,
        research_purpose: data.research_purpose || '',
        source: 'website',
        utm_source: data.utm_source || '',
        utm_medium: data.utm_medium || '',
        utm_campaign: data.utm_campaign || '',
        // Client contact details
        client_name: data.client_name || 'Anonymous Client',
        client_email: data.contact_email,
        client_phone: data.contact_phone
      }
      
      console.log('📤 Submitting lead data to API:', leadData)
      console.log('📤 Required fields check:')
      console.log('  - service_category_id:', leadData.service_category_id)
      console.log('  - title:', leadData.title)
      console.log('  - description:', leadData.description)
      console.log('  - location_address:', leadData.location_address)
      console.log('  - location_suburb:', leadData.location_suburb)
      console.log('  - location_city:', leadData.location_city)
      console.log('  - budget_range:', leadData.budget_range)
      console.log('  - urgency:', leadData.urgency)
      console.log('  - hiring_intent:', leadData.hiring_intent)
      console.log('  - hiring_timeline:', leadData.hiring_timeline)
      
      // Submit to API using public endpoint
      const response = await apiClient.createPublicLead(leadData)
      
      console.log('✅ Lead submitted successfully:', response)
      // Don't set formSubmitted here - let the form handle its own success state
      toast.success('🎉 Quote Request Submitted Successfully!', {
        description: 'We\'ll match you with the best providers and you\'ll receive quotes within 24 hours.',
        duration: 6000
      })
    } catch (error) {
      console.error('❌ Error submitting lead:', error)
      console.error('❌ Error details:', (error as any).response?.data || (error as Error).message)
      toast.error('❌ Submission Failed', {
        description: 'There was an error submitting your request. Please try again or contact support.',
        duration: 6000
      })
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setSelectedCategory(null)
  }

  if (formSubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <ClientHeader />
        
        <main className="flex-1 flex items-center justify-center py-20">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Request Submitted Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                We've received your request and are matching you with the best providers in your area. 
                You'll receive quotes within 24 hours.
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/client">Go to Dashboard</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/request-quote">Submit Another Request</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        
        <Footer />
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="min-h-screen flex flex-col">
        <ClientHeader />
        
        <main className="flex-1">
          <LeadGenerationForm 
            onComplete={handleFormComplete}
            onCancel={handleFormCancel}
            preselectedCategory={selectedCategory}
          />
        </main>
        
        <Footer />
      </div>
    )
  }
  const serviceCategories = [
    { 
      name: "Plumbing", 
      icon: Wrench, 
      description: "Repairs, installations, maintenance",
      popular: true
    },
    { 
      name: "Electrical", 
      icon: Zap, 
      description: "Wiring, installations, repairs",
      popular: true
    },
    { 
      name: "Painting", 
      icon: Paintbrush, 
      description: "Interior, exterior, commercial",
      popular: true
    },
    { 
      name: "Cleaning", 
      icon: HomeIcon, 
      description: "House, office, deep cleaning",
      popular: false
    },
    { 
      name: "Gardening", 
      icon: Trees, 
      description: "Landscaping, maintenance, design",
      popular: false
    },
    { 
      name: "Carpentry", 
      icon: Hammer, 
      description: "Custom work, repairs, installations",
      popular: false
    },
    { 
      name: "Roofing", 
      icon: HomeIcon, 
      description: "Repairs, installations, maintenance",
      popular: false
    },
    { 
      name: "Pool Maintenance", 
      icon: Droplets, 
      description: "Cleaning, repairs, chemical balancing",
      popular: false
    },
    { 
      name: "Appliance Repair", 
      icon: Wrench, 
      description: "Washing machines, fridges, ovens",
      popular: false
    },
    { 
      name: "General Maintenance", 
      icon: Hammer, 
      description: "Handyman services, repairs",
      popular: true
    },
    { 
      name: "Security", 
      icon: Shield, 
      description: "Alarms, cameras, access control",
      popular: false
    },
    { 
      name: "Cleaning Services", 
      icon: Sparkles, 
      description: "Professional cleaning services",
      popular: false
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-900 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Request Your Free Quote
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Tell us what you need and get connected with up to 3 verified professionals in your area. 
              It's free, fast, and there's no obligation.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-emerald-600" />
                Takes 2 minutes
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-emerald-600" />
                Up to 3 quotes
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-emerald-600" />
                Verified professionals
              </div>
            </div>
          </div>
        </section>

        {/* Service Categories */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                What Service Do You Need?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Choose the service category that best matches your needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {serviceCategories.map((service, index) => (
                <Card 
                  key={index} 
                  className="relative hover:shadow-lg transition-all duration-200 cursor-pointer group hover:scale-105"
                >
                  <CardHeader className="text-center pb-2">
                    {service.popular && (
                      <Badge className="absolute -top-2 -right-2 bg-emerald-600">
                        Popular
                      </Badge>
                    )}
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <service.icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-sm">
                      {service.description}
                    </CardDescription>
                    <Button 
                      className="mt-4 w-full group-hover:bg-emerald-600 group-hover:text-white transition-colors" 
                      variant="outline"
                      onClick={() => handleCategorySelect(service.name)}
                    >
                      Get Quotes
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Preview */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                How It Works
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Getting quotes is simple and straightforward
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Choose Service
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Select the service category and describe what you need
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Get Matched
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  We find up to 3 verified professionals in your area
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Compare Quotes
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Review quotes, profiles, and choose the best professional
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" asChild>
                <Link href="/how-it-works">
                  Learn More About Our Process
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-emerald-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Find Your Professional?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Don't see your service category above? No problem! We work with professionals across many industries.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}





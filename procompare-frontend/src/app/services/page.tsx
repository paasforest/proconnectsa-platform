'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search,
  Wrench,
  Zap,
  Paintbrush,
  Home,
  Car,
  Hammer,
  Droplets,
  Trees,
  Shield,
  Sparkles,
  Building,
  Camera,
  Music,
  Gamepad2,
  Heart,
  Baby,
  Dog,
  Plane,
  Ship,
  Train,
  Bike,
  ArrowRight,
  Star,
  Clock,
  Users,
  CheckCircle,
  TrendingUp,
  Award,
  MapPin
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ServiceCategory {
  id: string
  name: string
  icon: any
  description: string
  popular: boolean
  subcategories: string[]
  avgPrice: string
  avgTime: string
  providers: number
  color: string
}

// Organized service categories with premium grouping
const serviceCategories: ServiceCategory[] = [
  // Home & Property Services
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: Wrench,
    description: 'Professional plumbing services for homes and businesses',
    popular: true,
    subcategories: ['Pipe Repairs', 'Faucet Installation', 'Toilet Repairs', 'Water Heater', 'Drain Cleaning', 'Leak Detection'],
    avgPrice: 'R300-800',
    avgTime: '2-4 hours',
    providers: 45,
    color: 'bg-blue-500'
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: Zap,
    description: 'Safe and reliable electrical work by certified electricians',
    popular: true,
    subcategories: ['Wiring', 'Outlet Installation', 'Lighting', 'Panel Upgrades', 'Safety Inspections', 'Generator Installation'],
    avgPrice: 'R400-1200',
    avgTime: '3-6 hours',
    providers: 38,
    color: 'bg-yellow-500'
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    icon: Sparkles,
    description: 'Professional cleaning services for homes and offices',
    popular: true,
    subcategories: ['House Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Carpet Cleaning', 'Window Cleaning', 'Post-Construction'],
    avgPrice: 'R150-500',
    avgTime: '2-6 hours',
    providers: 89,
    color: 'bg-green-500'
  },
  {
    id: 'painting',
    name: 'Painting',
    icon: Paintbrush,
    description: 'Interior and exterior painting with quality materials',
    popular: true,
    subcategories: ['Interior Painting', 'Exterior Painting', 'Wallpaper', 'Decorative Painting', 'Pressure Washing', 'Color Consultation'],
    avgPrice: 'R800-2500',
    avgTime: '1-3 days',
    providers: 34,
    color: 'bg-purple-500'
  },
  {
    id: 'handyman',
    name: 'Handyman',
    icon: Hammer,
    description: 'General repairs, maintenance, and installation services',
    popular: true,
    subcategories: ['Furniture Assembly', 'TV Mounting', 'Shelf Installation', 'Door Repairs', 'Cabinet Installation', 'General Maintenance'],
    avgPrice: 'R200-600',
    avgTime: '1-3 hours',
    providers: 62,
    color: 'bg-orange-500'
  },
  {
    id: 'hvac',
    name: 'HVAC',
    icon: Home,
    description: 'Heating, ventilation, and air conditioning services',
    popular: false,
    subcategories: ['AC Installation', 'AC Repair', 'Heating Systems', 'Duct Cleaning', 'Thermostat Installation', 'Maintenance'],
    avgPrice: 'R1200-3500',
    avgTime: '4-8 hours',
    providers: 28,
    color: 'bg-cyan-500'
  },
  {
    id: 'landscaping',
    name: 'Landscaping',
    icon: Trees,
    description: 'Garden design, lawn care, and outdoor maintenance',
    popular: false,
    subcategories: ['Garden Design', 'Lawn Care', 'Tree Services', 'Irrigation', 'Outdoor Lighting', 'Paving'],
    avgPrice: 'R500-2000',
    avgTime: '2-5 days',
    providers: 41,
    color: 'bg-green-600'
  },
  {
    id: 'renovation',
    name: 'Renovation',
    icon: Building,
    description: 'Home and office renovation projects',
    popular: false,
    subcategories: ['Kitchen Renovation', 'Bathroom Renovation', 'Basement Finishing', 'Room Addition', 'Flooring', 'Tiling'],
    avgPrice: 'R5000-25000',
    avgTime: '1-4 weeks',
    providers: 23,
    color: 'bg-indigo-500'
  },
  {
    id: 'security',
    name: 'Security',
    icon: Shield,
    description: 'Security systems, alarms, and access control',
    popular: false,
    subcategories: ['Alarm Installation', 'CCTV Systems', 'Access Control', 'Security Gates', 'Intercom Systems', 'Monitoring'],
    avgPrice: 'R800-3000',
    avgTime: '4-8 hours',
    providers: 19,
    color: 'bg-red-500'
  },
  {
    id: 'pool',
    name: 'Pool Services',
    icon: Droplets,
    description: 'Pool cleaning, maintenance, and repair services',
    popular: false,
    subcategories: ['Pool Cleaning', 'Pool Maintenance', 'Pool Repair', 'Chemical Balancing', 'Pool Cover', 'Pool Heating'],
    avgPrice: 'R400-1200',
    avgTime: '2-4 hours',
    providers: 31,
    color: 'bg-blue-600'
  },
  {
    id: 'immigration',
    name: 'Immigration Solutions',
    icon: Plane,
    description: 'AI-powered immigration assistance for visa applications and documentation',
    popular: true,
    subcategories: ['SOP Generation', 'IELTS Practice', 'Interview Coaching', 'Visa Guidance', 'Document Checklist', 'Expert Review'],
    avgPrice: 'R299-699',
    avgTime: '2-4 weeks',
    providers: 15,
    color: 'bg-indigo-600'
  }
]

const serviceGroups = [
  {
    title: 'Home & Property Services',
    description: 'Essential services for your home and property',
    services: serviceCategories.slice(0, 6),
    icon: Home
  },
  {
    title: 'Specialized Services',
    description: 'Professional services for specific needs',
    services: serviceCategories.slice(6, -1),
    icon: Award
  },
  {
    title: 'Immigration Solutions',
    description: 'AI-powered immigration assistance and documentation',
    services: serviceCategories.slice(-1),
    icon: Plane
  }
]

export default function ServicesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  const filteredCategories = serviceCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.subcategories.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const popularCategories = serviceCategories.filter(category => category.popular)

  const handleGetQuotes = (categoryId: string) => {
    if (categoryId === 'immigration') {
      // Track analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'click', {
          event_category: 'Immigration AI',
          event_label: 'Services Page - Immigration Category',
        });
      }
      // Redirect to external Immigration AI website with tracking
      const params = new URLSearchParams({
        utm_source: 'proconnectsa',
        utm_medium: 'website',
        utm_campaign: 'immigration_integration',
        utm_content: 'services-page',
      });
      window.open(`https://www.immigrationai.co.za?${params.toString()}`, '_blank', 'noopener,noreferrer');
    } else {
      router.push(`/request-quote?service=${categoryId}`)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Matching Homepage Style */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Professional{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Services
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Connect with South Africa's most trusted service professionals. All verified, insured, and background-checked.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search for services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-sm font-medium text-gray-700">Active Providers</div>
                <div className="text-xs text-gray-500">Verified & Insured</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">10,000+</div>
                <div className="text-sm font-medium text-gray-700">Projects Completed</div>
                <div className="text-xs text-gray-500">Average rating: 4.9/5</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">R1.2M+</div>
                <div className="text-sm font-medium text-gray-700">Earned This Month</div>
                <div className="text-xs text-gray-500">By our providers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">8</div>
                <div className="text-sm font-medium text-gray-700">Cities Covered</div>
                <div className="text-xs text-gray-500">Major SA cities</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services - Premium Cards */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Most Popular Services</h2>
            <p className="text-xl text-gray-600">These are our most requested services with verified professionals ready to help</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularCategories.map((category) => {
              const Icon = category.icon
              return (
                <Card 
                  key={category.id} 
                  className="relative hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105 border-0 shadow-lg"
                >
                  <Badge className="absolute -top-3 -right-3 bg-emerald-600 text-white px-3 py-1 text-sm font-bold">
                    Popular
                  </Badge>
                  
                  <CardHeader className="text-center pb-4 pt-8">
                    <div className={`w-20 h-20 ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {category.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 px-8 pb-8">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-emerald-600">{category.avgPrice}</div>
                        <div className="text-sm text-gray-600">Average Price</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-emerald-600">{category.avgTime}</div>
                        <div className="text-sm text-gray-600">Average Time</div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-3">
                        <Users className="inline w-4 h-4 mr-1" />
                        {category.providers} verified providers
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {category.subcategories.slice(0, 3).map((sub, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                            {sub}
                          </Badge>
                        ))}
                        {category.subcategories.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                            +{category.subcategories.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleGetQuotes(category.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg"
                    >
                      Get Free Quotes
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Service Groups - Organized Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">All Service Categories</h2>
            <p className="text-xl text-gray-600">Browse our complete directory of professional services</p>
          </div>
          
          {serviceGroups.map((group, groupIndex) => {
            const GroupIcon = group.icon
            return (
              <div key={groupIndex} className="mb-16">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mr-4">
                    <GroupIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{group.title}</h3>
                    <p className="text-gray-600">{group.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {group.services.map((category) => {
                    const Icon = category.icon
                    return (
                      <Card 
                        key={category.id} 
                        className="hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105 border border-gray-200"
                      >
                        <CardHeader className="text-center pb-2">
                          <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                            {category.name}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600">
                            {category.description}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-3 px-4 pb-4">
                          <div className="text-center">
                            <div className="text-sm text-gray-600 mb-2">
                              <Users className="inline w-4 h-4 mr-1" />
                              {category.providers} providers
                            </div>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {category.subcategories.slice(0, 2).map((sub, index) => (
                                <Badge key={index} variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                                  {sub}
                                </Badge>
                              ))}
                              {category.subcategories.length > 2 && (
                                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                                  +{category.subcategories.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <Button 
                            onClick={() => handleGetQuotes(category.id)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-md"
                          >
                            Get Quotes
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Find Your Perfect Professional?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join thousands of satisfied South Africans who found exactly what they needed
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              onClick={() => router.push('/request-quote')}
              className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors text-lg"
            >
              Get My Free Quotes
            </Button>
            <Button 
              onClick={() => router.push('/register')}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-emerald-600 transition-colors text-lg"
            >
              Become a Provider
            </Button>
          </div>
          <div className="flex justify-center items-center space-x-8 text-emerald-100">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>100% Free for customers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>All professionals verified</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
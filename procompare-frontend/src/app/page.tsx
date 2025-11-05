'use client'

import React, { useState, useEffect } from 'react';
import { Search, Star, ArrowRight, Shield, Clock, Award, CheckCircle, TrendingUp, Users, Zap, MapPin, Filter, Calendar, Phone, Mail, User, Wrench, Home, Paintbrush, Hammer, Droplets, Zap as Electric, X, Gift, FileText, BookOpen, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LeadGenerationForm from '@/components/leads/LeadGenerationForm';
import Head from 'next/head';

const Homepage = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [liveActivity, setLiveActivity] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  useEffect(() => {
    setIsVisible(true);
    // Simulate live activity
    const activities = [
      "Plumber booked in Johannesburg - R2,400 project",
      "Electrician completed job in Cape Town - R1,850",
      "Cleaner verified in Durban - Welcome bonus earned",
      "Contractor earned R4,200 this week in Pretoria",
      "New lead posted: Kitchen renovation in Sandton"
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      setLiveActivity([activities[index % activities.length]]);
      index++;
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Handler functions for lead generation
  const handleGetQuotes = (category = '') => {
    setSelectedCategory(category);
    setShowLeadForm(true);
  };

  const handleLeadFormComplete = async (leadData: any) => {
    try {
      // Import the API client and toast
      const { apiClient } = await import('@/lib/api-simple');
      const { toast } = await import('sonner');
      
      // Map form data to API format (including client contact details)
      const mappedLeadData = {
        service_category_id: leadData.service_category_id || 1,
        title: leadData.title,
        description: leadData.description,
        location_address: leadData.address,
        location_suburb: leadData.suburb,
        location_city: leadData.city,
        budget_range: leadData.budget_range,
        urgency: leadData.urgency,
        preferred_contact_time: leadData.preferred_contact_time,
        additional_requirements: leadData.special_requirements || '',
        hiring_intent: leadData.hiring_intent,
        hiring_timeline: leadData.hiring_timeline,
        research_purpose: leadData.research_purpose || '',
        source: 'website',
        // Client contact details from form
        client_name: leadData.contact_name || 'Anonymous Client',
        client_email: leadData.contact_email,
        client_phone: leadData.contact_phone
      };
      
      console.log('📤 Submitting lead data:', mappedLeadData);
      
      // Submit to API using public endpoint
      const response = await apiClient.createPublicLead(mappedLeadData);
      
      console.log('✅ Lead created successfully:', response);
      
      // Show success toast
      toast.success('🎉 Quote Request Submitted!', {
        description: 'You\'ll receive quotes from verified professionals within 24 hours. Check your email for updates.',
        duration: 6000,
      });
      
      // Reset form state after a short delay to allow user to see success
      setTimeout(() => {
        setShowLeadForm(false);
        setSelectedCategory('');
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Error creating lead:', error);
      console.error('❌ API Response:', error.response?.data);
      
      // Import toast for error message
      const { toast } = await import('sonner');
      
      // Get detailed error message from API response
      let errorMessage = 'Unknown error occurred';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          errorMessage = Object.entries(error.response.data.errors)
            .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('; ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error('❌ Submission Failed', {
        description: `There was an error submitting your request: ${errorMessage}. Please try again.`,
        duration: 8000,
      });
    }
  };

  const handleLeadFormCancel = () => {
    setShowLeadForm(false);
    setSelectedCategory('');
  };

  const serviceCategories = [
    { 
      id: 'plumbing', 
      name: 'Plumbing', 
      icon: Droplets, 
      count: '127 pros', 
      avgPrice: 'R1,850',
      color: 'bg-blue-500',
      leads: '23 leads this week'
    },
    { 
      id: 'electrical', 
      name: 'Electrical', 
      icon: Electric, 
      count: '89 pros', 
      avgPrice: 'R2,400',
      color: 'bg-yellow-500',
      leads: '31 leads this week'
    },
    { 
      id: 'cleaning', 
      name: 'Cleaning', 
      icon: Home, 
      count: '156 pros', 
      avgPrice: 'R850',
      color: 'bg-green-500',
      leads: '45 leads this week'
    },
    { 
      id: 'painting', 
      name: 'Painting', 
      icon: Paintbrush, 
      count: '93 pros', 
      avgPrice: 'R3,200',
      color: 'bg-purple-500',
      leads: '18 leads this week'
    },
    { 
      id: 'handyman', 
      name: 'Handyman', 
      icon: Hammer, 
      count: '201 pros', 
      avgPrice: 'R1,200',
      color: 'bg-orange-500',
      leads: '67 leads this week'
    },
    { 
      id: 'maintenance', 
      name: 'Maintenance', 
      icon: Wrench, 
      count: '78 pros', 
      avgPrice: 'R2,850',
      color: 'bg-red-500',
      leads: '29 leads this week'
    }
  ];

  const liveStats = [
    { label: "Active Providers", value: "500+", subtext: "Verified & Insured" },
    { label: "Projects Completed", value: "10,000+", subtext: "Average rating: 4.9/5" },
    { label: "Earned This Month", value: "R1.2M+", subtext: "By our providers" },
    { label: "Cities Covered", value: "8", subtext: "Major SA cities" }
  ];

  const providerSuccess = [
    {
      name: "Mike Ndlovu",
      business: "MN Plumbing",
      location: "Johannesburg",
      avatar: "MN",
      earnings: "R23,400",
      period: "First month",
      rating: 4.9,
      jobs: 18,
      testimonial: "ProConnectSA changed my business completely. Quality leads, great support."
    },
    {
      name: "Sarah van der Merwe",
      business: "Elite Cleaning",
      location: "Cape Town",
      avatar: "SV",
      earnings: "R31,800",
      period: "Last month",
      rating: 5.0,
      jobs: 42,
      testimonial: "Best investment I made. Premium clients, consistent work flow."
    },
    {
      name: "James Mthembu",
      business: "PowerTech Electrical",
      location: "Durban",
      avatar: "JM",
      earnings: "R45,200",
      period: "Last month",
      rating: 4.8,
      jobs: 29,
      testimonial: "Professional platform, serious clients. My income doubled!"
    }
  ];

  const customerTestimonials = [
    {
      name: "Linda Botha",
      location: "Sandton",
      avatar: "LB",
      service: "Kitchen Renovation",
      savings: "R2,400",
      rating: 5,
      testimonial: "Found an amazing contractor through ProConnectSA. Professional, insured, and saved me thousands!"
    },
    {
      name: "Ahmed Hassan",
      location: "Cape Town",
      avatar: "AH",
      service: "Office Cleaning",
      savings: "R890",
      rating: 5,
      testimonial: "Reliable cleaning service for our office. Vetted professionals make all the difference."
    }
  ];

  const businessServices = [
    {
      title: "Register Your Company & Get a Free Professional Website",
      price: "R1,350",
      popular: true,
      badge: "Most Popular",
      features: [
        "CIPC Registration",
        "SARS Tax Setup",
        "Legal Compliance (7-day completion)",
        "All documentation",
        "Professional Website (modern responsive design, SEO optimized, mobile-friendly, with contact forms)"
      ],
      cta: "Register & Get Website",
      description: "Everything you need to launch your business in just 7 days",
      highlight: "FREE Professional Website (R3,500 value)"
    }
  ];

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "ProConnectSA",
    "description": "South Africa's premium service marketplace connecting customers with verified, insured professionals",
    "url": "https://proconnectsa.co.za",
    "telephone": "+27679518124",
    "email": "support@proconnectsa.co.za",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ZA",
      "addressRegion": "Gauteng",
      "addressLocality": "Johannesburg"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "-26.2041",
      "longitude": "28.0473"
    },
    "areaServed": [
      "Johannesburg", "Cape Town", "Durban", "Pretoria", 
      "Port Elizabeth", "Bloemfontein", "East London", "Kimberley"
    ],
    "serviceType": [
      "Plumbing", "Electrical", "Cleaning", "Painting", 
      "Handyman", "Maintenance", "Home Services"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "10000"
    },
    "sameAs": [
      "https://facebook.com/proconnectsa",
      "https://twitter.com/proconnectsa",
      "https://linkedin.com/company/proconnectsa"
    ]
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="text-2xl font-bold">
                <span className="text-emerald-600">ProConnect</span>
                <span className="text-gray-900">SA</span>
              </div>
        <div className="hidden md:flex space-x-6">
          <button 
            onClick={() => handleGetQuotes()}
            className="text-gray-700 hover:text-emerald-600 transition-colors"
          >
            Find Professionals
          </button>
          <button 
            onClick={() => router.push('/how-it-works')}
            className="text-gray-700 hover:text-emerald-600 transition-colors"
          >
            How it Works
          </button>
          <button 
            onClick={() => router.push('/services')}
            className="text-gray-700 hover:text-emerald-600 transition-colors"
          >
            Services
          </button>
          <button 
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'click', {
                  event_category: 'Immigration AI',
                  event_label: 'Navbar - Immigration',
                });
              }
              const params = new URLSearchParams({
                utm_source: 'proconnectsa',
                utm_medium: 'website',
                utm_campaign: 'immigration_integration',
                utm_content: 'navbar',
              });
              window.open(`https://www.immigrationai.co.za?${params.toString()}`, '_blank', 'noopener,noreferrer');
            }}
            className="text-gray-700 hover:text-emerald-600 transition-colors font-medium"
          >
            🌍 Want to Travel Overseas?
          </button>
          <button 
            onClick={() => router.push('/providers')}
            className="text-gray-700 hover:text-emerald-600 transition-colors"
          >
            Success Stories
          </button>
        </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/login')}
                className="text-gray-700 hover:text-emerald-600 transition-colors"
              >
                Provider Login
              </button>
              <button 
                onClick={() => router.push('/register')}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Start Earning
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Live Activity Bar */}
      <div className="bg-emerald-50 border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-2 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-emerald-800 font-medium">
              LIVE: {liveActivity[0] || "47 new leads posted today"}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className={`text-5xl md:text-7xl font-bold text-gray-900 mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Get 3 Quotes From{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Verified Professionals
              </span>
            </h1>
            <p className={`text-xl text-gray-600 mb-12 max-w-2xl mx-auto transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Connect with South Africa's most trusted service marketplace. All professionals are verified, insured, and ready to help with your project.
            </p>
            
            {/* Request Quote Form */}
            <div className={`max-w-3xl mx-auto mb-12 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">What service do you need?</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                      <option>Select a service...</option>
                      <option>Plumbing</option>
                      <option>Electrical</option>
                      <option>Cleaning</option>
                      <option>Painting</option>
                      <option>Handyman</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Where are you located?</label>
                    <input
                      type="text"
                      placeholder="Enter your city"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">When do you need it?</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                      <option>As soon as possible</option>
                      <option>Within a week</option>
                      <option>Within a month</option>
                      <option>I'm flexible</option>
                    </select>
                  </div>
                </div>
        <button 
          onClick={() => handleGetQuotes()}
          className="w-full mt-6 bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors"
        >
          Get My 3 Free Quotes →
        </button>
                <p className="text-sm text-gray-500 text-center mt-3">
                  100% Free • No obligation • Verified professionals only
                </p>
              </div>
            </div>

            {/* Live Stats */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {liveStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-700">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.subtext}</div>
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className={`flex justify-center items-center space-x-8 text-sm text-gray-600 transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span>Background Checked</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Fully Insured</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>4.9/5 Average Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Services</h2>
            <p className="text-xl text-gray-600">Choose from our most requested professional services</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group cursor-pointer">
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600">{category.count} available</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average project</span>
                    <span className="font-medium text-gray-900">{category.avgPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Activity</span>
                    <span className="text-sm font-medium text-emerald-600">{category.leads}</span>
                  </div>
                </div>
                
        <button 
          onClick={() => handleGetQuotes(category.id)}
          className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-emerald-100 hover:text-emerald-700 transition-colors font-medium"
        >
          Get Quotes
        </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How ProConnectSA Works</h2>
            <p className="text-xl text-gray-600">Get matched with the perfect professional in 3 simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center relative">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-emerald-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tell us what you need</h3>
              <p className="text-gray-600 mb-6">Describe your project and we'll match you with verified professionals in your area.</p>
              <div className="bg-emerald-50 rounded-lg p-4">
                <p className="text-sm text-emerald-800 font-medium">✓ Takes 2 minutes</p>
              </div>
              {/* Connection line */}
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-200 transform -translate-y-1/2"></div>
            </div>
            
            <div className="text-center relative">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-emerald-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Get 3 detailed quotes</h3>
              <p className="text-gray-600 mb-6">Receive personalized quotes from pre-screened professionals within 24 hours.</p>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium">✓ All verified & insured</p>
              </div>
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-200 transform -translate-y-1/2"></div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-emerald-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Choose & get it done</h3>
              <p className="text-gray-600 mb-6">Compare quotes, read reviews, and hire the best professional for your job.</p>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-800 font-medium">✓ 100% satisfaction guarantee</p>
              </div>
            </div>
          </div>
          
      <div className="text-center mt-12">
        <button 
          onClick={() => handleGetQuotes()}
          className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors"
        >
          Start Your Project Today
        </button>
      </div>
        </div>
      </section>

      {/* Immigration Services Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
              <span className="text-2xl">🌍</span>
              <span className="text-sm font-medium text-blue-900">AI-Powered Immigration Assistant</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Dreaming of Living Abroad?
              <span className="block mt-2 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Make It Happen with AI
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Get AI-powered help for visa applications, English tests, and interview prep for 
              <span className="font-semibold text-gray-900"> Canada 🇨🇦 UK 🇬🇧 USA 🇺🇸 Australia 🇦🇺</span> and more
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'click', {
                      event_category: 'Immigration AI',
                      event_label: 'Homepage - Start Journey',
                    });
                  }
                  const params = new URLSearchParams({
                    utm_source: 'proconnectsa',
                    utm_medium: 'website',
                    utm_campaign: 'immigration_integration',
                    utm_content: 'homepage-start-journey',
                  });
                  window.open(`https://www.immigrationai.co.za?${params.toString()}`, '_blank', 'noopener,noreferrer');
                }}
                className="group px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Start Your Immigration Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'click', {
                      event_category: 'Immigration AI',
                      event_label: 'Homepage - Check Eligibility',
                    });
                  }
                  const params = new URLSearchParams({
                    utm_source: 'proconnectsa',
                    utm_medium: 'website',
                    utm_campaign: 'immigration_integration',
                    utm_content: 'homepage-check-eligibility',
                  });
                  window.open(`https://www.immigrationai.co.za?${params.toString()}`, '_blank', 'noopener,noreferrer');
                }}
                className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Check My Eligibility
              </button>
            </div>
          </div>

          {/* Immigration Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI SOP Generator</h3>
              <p className="text-gray-600">Create compelling Statements of Purpose and cover letters that stand out to immigration officers.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">IELTS Practice Tests</h3>
              <p className="text-gray-600">Comprehensive prep for IELTS, TOEFL, and CELPIP with real-time feedback and adaptive learning.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Interview Coaching</h3>
              <p className="text-gray-600">AI-powered mock interviews simulate real visa interviews, building confidence and perfecting answers.</p>
            </div>
          </div>

          {/* Popular Destinations */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Popular Destinations</h3>
            <div className="flex flex-wrap justify-center items-center gap-6">
              {[
                { country: 'Canada', flag: '🇨🇦', visa: 'Express Entry' },
                { country: 'UK', flag: '🇬🇧', visa: 'Skilled Worker' },
                { country: 'USA', flag: '🇺🇸', visa: 'H1B Visa' },
                { country: 'Australia', flag: '🇦🇺', visa: 'Skilled Independent' },
                { country: 'New Zealand', flag: '🇳🇿', visa: 'Skilled Migrant' }
              ].map((dest, index) => (
                <div key={index} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                  <span className="text-2xl">{dest.flag}</span>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 text-sm">{dest.country}</div>
                    <div className="text-xs text-gray-600">{dest.visa}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Preview */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Affordable AI-Powered Immigration Support</h3>
              <p className="text-gray-600">Plans start at just R149/month • Cancel anytime</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 border border-gray-200 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 mb-1">R149</div>
                <div className="text-sm text-gray-600 mb-2">Starter Plan</div>
                <div className="text-xs text-gray-500">3 Eligibility Checks, 2 Document Types</div>
              </div>
              <div className="text-center p-4 border-2 border-blue-500 rounded-xl bg-blue-50 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Most Popular
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">R299</div>
                <div className="text-sm text-gray-600 mb-2">Entry Plan</div>
                <div className="text-xs text-gray-500">10 Checks, 5 Docs, Interview Practice</div>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 mb-1">R699</div>
                <div className="text-sm text-gray-600 mb-2">Professional Plan</div>
                <div className="text-xs text-gray-500">Unlimited checks, All docs, Full features</div>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 mb-1">R1,499</div>
                <div className="text-sm text-gray-600 mb-2">Enterprise Plan</div>
                <div className="text-xs text-gray-500">Team features, Analytics, Dedicated support</div>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <button 
                onClick={() => router.push('/immigration')}
                className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                View All Plans & Start Today
              </button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600 mt-12">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>1000+ successful applications</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Expert consultant support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Provider Success Stories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Real Provider Success Stories</h2>
            <p className="text-xl text-gray-600">See how professionals are growing their businesses with ProConnectSA</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {providerSuccess.map((provider, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-600">
                    {provider.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{provider.name}</div>
                    <div className="text-sm text-gray-600">{provider.business}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {provider.location}
                    </div>
                  </div>
                </div>
                
                <div className="bg-emerald-50 rounded-lg p-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">{provider.earnings}</div>
                    <div className="text-sm text-emerald-700">Earned {provider.period}</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{provider.rating}</div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{provider.jobs}</div>
                    <div className="text-xs text-gray-600">Jobs</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-emerald-600">100%</div>
                    <div className="text-xs text-gray-600">Satisfied</div>
                  </div>
                </div>
                
                <p className="text-gray-700 italic text-sm">"{provider.testimonial}"</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors mr-4">
              Start Earning Today
            </button>
            <button className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-colors">
              View All Success Stories
            </button>
          </div>
        </div>
      </section>

      {/* Business Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Start Your Professional Service Business</h2>
            <p className="text-xl text-gray-600 mb-2">Everything you need to launch and grow your service business</p>
            <p className="text-lg text-emerald-600 font-medium">Join 500+ verified professionals earning an average of R15,000/month</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {businessServices.map((service, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-emerald-50 rounded-3xl shadow-2xl border border-emerald-200 overflow-hidden relative">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full opacity-20 -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100 to-blue-200 rounded-full opacity-20 translate-y-24 -translate-x-24"></div>
                
                {service.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg">
                      🔥 MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className="relative z-10 p-12">
                  <div className="text-center mb-10">
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{service.title}</h3>
                    <p className="text-xl text-gray-600 mb-6">{service.description}</p>
                    
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <div className="text-5xl md:text-6xl font-bold text-emerald-600">{service.price}</div>
                      <div className="text-left">
                        <div className="text-gray-500 text-sm">one-time</div>
                        <div className="text-gray-500 text-sm">payment</div>
                      </div>
                    </div>
                    
                    {service.highlight && (
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 px-6 py-3 rounded-full">
                        <span className="text-2xl">🎁</span>
                        <span className="text-orange-700 font-bold">{service.highlight}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8 mb-10">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <CheckCircle className="w-6 h-6 text-emerald-500 mr-3" />
                        What's Included
                      </h4>
                      <ul className="space-y-4">
                        {service.features.slice(0, 4).map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span className="text-gray-700 leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <span className="text-2xl mr-3">🎁</span>
                        FREE Bonus
                      </h4>
                      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-2xl p-6">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-orange-600 text-sm">🎁</span>
                          </div>
                          <div>
                            <span className="text-emerald-700 font-bold text-sm mb-2 block">FREE BONUS:</span>
                            <span className="text-gray-700 leading-relaxed">{service.features[4]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Trust indicators */}
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="flex items-center justify-center space-x-2 text-green-700">
                        <Shield className="w-5 h-5" />
                        <span className="font-medium">7-Day Guarantee</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-green-700">
                        <Zap className="w-5 h-5" />
                        <span className="font-medium">Fast Processing</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">100% Legal</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <button 
                      onClick={() => {
                        console.log('Button clicked - navigating to /register-business')
                        router.push('/register-business')
                      }}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-6 px-12 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-emerald-300"
                    >
                      <span className="flex items-center justify-center gap-3">
                        <Zap className="w-6 h-6" />
                        {service.cta}
                      </span>
                    </button>
                    <p className="text-gray-500 mt-4 text-sm">
                      Complete setup in 7 days • No hidden fees • Professional support included
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Questions about starting your business?</p>
            <button className="text-emerald-600 hover:text-emerald-700 font-medium">
              Speak to a Business Success Manager →
            </button>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Real feedback from real South African customers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {customerTestimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-6 italic">"{testimonial.testimonial}"</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center font-medium text-sm text-emerald-600">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.location}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-600">{testimonial.service}</div>
                    <div className="text-emerald-600 font-bold">Saved {testimonial.savings}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Find Your Perfect Professional?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join thousands of satisfied South Africans who found exactly what they needed
          </p>
          
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <button 
          onClick={() => handleGetQuotes()}
          className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors"
        >
          Get My Free Quotes
        </button>
        <button 
          onClick={() => router.push('/register')}
          className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-emerald-600 transition-colors"
        >
          Become a Provider
        </button>
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="text-3xl font-bold mb-4">
                <span className="text-emerald-400">ProConnect</span>
                <span className="text-white">SA</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                South Africa's premium service marketplace connecting customers with verified, insured professionals across 8 major cities.
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <p>📧 support@proconnectsa.co.za</p>
                <p>📱 +27679518124</p>
                <p>🏢 Johannesburg, Cape Town, Durban, Pretoria</p>
              </div>
            </div>
            
        <div>
          <h4 className="font-bold mb-6 text-emerald-400">For Customers</h4>
          <ul className="space-y-3 text-gray-400">
            <li><button onClick={() => handleGetQuotes()} className="hover:text-white transition-colors text-left">Find Professionals</button></li>
            <li><button onClick={() => router.push('/how-it-works')} className="hover:text-white transition-colors text-left">How It Works</button></li>
            <li><button onClick={() => router.push('/services')} className="hover:text-white transition-colors text-left">Service Categories</button></li>
            <li><button onClick={() => router.push('/reviews')} className="hover:text-white transition-colors text-left">Customer Reviews</button></li>
            <li><button onClick={() => router.push('/providers')} className="hover:text-white transition-colors text-left">Success Stories</button></li>
            <li><button onClick={() => router.push('/support')} className="hover:text-white transition-colors text-left">Help Center</button></li>
          </ul>
        </div>
            
            <div>
              <h4 className="font-bold mb-6 text-emerald-400">For Professionals</h4>
              <ul className="space-y-3 text-gray-400">
                <li><button onClick={() => router.push('/register')} className="hover:text-white transition-colors text-left">Join as Provider</button></li>
                <li><button onClick={() => router.push('/providers')} className="hover:text-white transition-colors text-left">Success Stories</button></li>
                <li><button onClick={() => router.push('/business-services')} className="hover:text-white transition-colors text-left">Business Registration</button></li>
                <li><button onClick={() => router.push('/business-services')} className="hover:text-white transition-colors text-left">Website Design</button></li>
                <li><button onClick={() => router.push('/provider')} className="hover:text-white transition-colors text-left">Provider Dashboard</button></li>
                <li><button onClick={() => router.push('/support')} className="hover:text-white transition-colors text-left">Support Center</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 mb-4 md:mb-0">
                © 2025 ProConnectSA. All rights reserved. | Proudly South African 🇿🇦
              </div>
              <div className="flex space-x-6 text-gray-400">
                <button onClick={() => router.push('/how-it-works')} className="hover:text-white transition-colors">How it Works</button>
                <button onClick={() => router.push('/providers')} className="hover:text-white transition-colors">For Providers</button>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-800 text-center">
              <div className="flex justify-center items-center space-x-4 text-gray-400 text-sm">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>SARS Registered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>CIPC Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>BBB Accredited</span>
                </div>
              </div>
            </div>
        </div>
      </div>
    </footer>

    {/* Lead Generation Form Modal */}
    {showLeadForm && (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Get Your Free Quotes
              </h2>
              <button
                onClick={handleLeadFormCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mt-1">
              Tell us about your project and we'll connect you with verified professionals
            </p>
          </div>
          <div className="p-6">
            <LeadGenerationForm
              onCancel={handleLeadFormCancel}
              preselectedCategory={selectedCategory}
            />
          </div>
        </div>
      </div>
    )}
  </div>
    </>
  );
};

export default Homepage;
'use client'

import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, FileText, MessageSquare, Globe, BookOpen, CheckCircle, Users, MapPin, TrendingUp, Clock, DollarSign, Plus, Minus, Mail, Phone, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { IMMIGRATION_AI_URL, ANALYTICS_EVENTS } from '@/config/immigration';

const ImmigrationPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Track page view
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', ANALYTICS_EVENTS.IMMIGRATION_PAGE_VIEW, {
        event_category: 'Immigration AI',
        event_label: 'Page View',
      });
    }
  }, []);

  // Analytics tracking function
  const trackClick = (eventLabel: string, eventValue?: string) => {
    if (typeof window !== 'undefined') {
      // Google Analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', ANALYTICS_EVENTS.IMMIGRATION_CTA_CLICK, {
          event_category: 'Immigration AI',
          event_label: eventLabel,
          value: eventValue,
        });
      }
      // Google Tag Manager fallback
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: ANALYTICS_EVENTS.IMMIGRATION_CTA_CLICK,
          eventCategory: 'Immigration AI',
          eventLabel: eventLabel,
          eventValue: eventValue,
        });
      }
    }
  };

  // Handle redirect to Immigration AI
  const handleRedirect = (eventLabel: string) => {
    trackClick(eventLabel);
    window.open(IMMIGRATION_AI_URL, '_blank', 'noopener,noreferrer');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackClick('Lead Capture - Get Report', email);
    // Redirect to Immigration AI website for email submission
    handleRedirect('Lead Capture - Get Eligibility Report');
  };

  const features = [
    {
      icon: FileText,
      title: 'Generate SOPs & Cover Letters',
      description: 'AI-powered tools create personalized statements of purpose and cover letters that stand out to immigration officers.',
      color: 'blue'
    },
    {
      icon: BookOpen,
      title: 'Practice English Tests',
      description: 'Comprehensive prep for IELTS, TOEFL, and CELPIP with real-time feedback and adaptive learning.',
      color: 'green'
    },
    {
      icon: MessageSquare,
      title: 'Get Interview Coaching',
      description: 'AI-powered mock interviews simulate real visa interviews, helping you build confidence and perfect your answers.',
      color: 'purple'
    },
    {
      icon: Globe,
      title: 'Explore Visa Options',
      description: 'Discover the best visa pathways for Canada, UK, USA, and 20+ other countries based on your profile.',
      color: 'orange'
    },
    {
      icon: CheckCircle,
      title: 'Document Checklist',
      description: 'Never miss a document again. Get customized checklists for your specific visa application type.',
      color: 'teal'
    },
    {
      icon: Users,
      title: 'Expert Review',
      description: 'Premium plans include review by licensed immigration consultants to ensure your application is perfect.',
      color: 'red'
    }
  ];

  const countries = [
    {
      name: 'Canada',
      flag: '🇨🇦',
      visaTypes: ['Express Entry', 'Study Permit', 'Work Permit', 'Family Sponsorship'],
      difficulty: 'Medium',
      avgTime: '6-12 months',
      popularityScore: 95,
      description: 'Welcoming immigration system with multiple pathways'
    },
    {
      name: 'United Kingdom',
      flag: '🇬🇧',
      visaTypes: ['Skilled Worker', 'Student Visa', 'Global Talent', 'Family Visa'],
      difficulty: 'Medium-Hard',
      avgTime: '3-8 months',
      popularityScore: 88,
      description: 'Strong job market and excellent education system'
    },
    {
      name: 'United States',
      flag: '🇺🇸',
      visaTypes: ['H1B', 'F1 Student', 'EB-5 Investor', 'Family-Based'],
      difficulty: 'Hard',
      avgTime: '12-24 months',
      popularityScore: 92,
      description: 'Competitive but offers great opportunities'
    },
    {
      name: 'Australia',
      flag: '🇦🇺',
      visaTypes: ['Skilled Independent', 'Student Visa', 'Work & Holiday', 'Partner Visa'],
      difficulty: 'Medium',
      avgTime: '6-18 months',
      popularityScore: 85,
      description: 'Points-based system favoring skilled workers'
    },
    {
      name: 'Germany',
      flag: '🇩🇪',
      visaTypes: ['EU Blue Card', 'Job Seeker', 'Student Visa', 'Freelance Visa'],
      difficulty: 'Medium',
      avgTime: '3-6 months',
      popularityScore: 78,
      description: 'Strong economy with growing demand for skilled workers'
    },
    {
      name: 'New Zealand',
      flag: '🇳🇿',
      visaTypes: ['Skilled Migrant', 'Work Visa', 'Student Visa', 'Partner Visa'],
      difficulty: 'Medium',
      avgTime: '6-12 months',
      popularityScore: 80,
      description: 'High quality of life and straightforward immigration process'
    }
  ];

  const plans = [
    {
      name: 'Starter Plan',
      price: 'R149',
      period: 'per month',
      description: 'Perfect for getting started',
      features: [
        '3 Visa Eligibility Checks per month',
        '2 Document Types (SOP, Cover Letter)',
        'PDF Downloads',
        'Basic Support',
        'Email support'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Entry Plan',
      price: 'R299',
      period: 'per month',
      description: 'Everything you need to succeed',
      features: [
        '10 Visa Eligibility Checks per month',
        '5 Document Types',
        'Basic Interview Practice (5 sessions/month)',
        'English Test Practice (IELTS only)',
        'Priority email support',
        'PDF Downloads'
      ],
      cta: 'Get Started',
      popular: true
    },
    {
      name: 'Professional Plan',
      price: 'R699',
      period: 'per month',
      description: 'For professionals and serious applicants',
      features: [
        'Unlimited Visa Eligibility Checks',
        'All Document Types (8+ types)',
        'Relationship Proof Kit',
        'AI Photo Analysis',
        'Unlimited Interview Practice',
        'Full English Test Practice',
        'Interview Questions Database',
        'Agent Dashboard'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Enterprise Plan',
      price: 'R1,499',
      period: 'per month',
      description: 'For businesses and teams',
      features: [
        'Everything in Professional',
        'Unlimited Team Members',
        'Advanced Analytics Dashboard',
        'Bulk Document Processing',
        'Priority Phone Support',
        'Dedicated Account Manager',
        'SLA Guarantee (99.9% uptime)'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const faqs = [
    {
      question: 'How does the AI SOP writer work?',
      answer: 'Our AI analyzes successful visa applications and uses your personal background, education, and goals to generate a compelling Statement of Purpose. You can edit and refine it until it perfectly represents your story.'
    },
    {
      question: 'Can I use this for multiple countries?',
      answer: 'Yes! Our Standard and Premium plans cover all major immigration destinations including Canada, UK, USA, Australia, New Zealand, Germany, and more. Each country has specific requirements which our AI handles automatically.'
    },
    {
      question: 'Is the IELTS practice as good as official tests?',
      answer: 'Our practice tests are designed by IELTS-certified instructors and use the same format as official tests. While they can\'t replace official testing, they provide excellent preparation and identify areas for improvement.'
    },
    {
      question: 'Do I need the Premium plan or is Basic enough?',
      answer: 'Basic (R299) is great for getting started with limited usage. Standard (R499) is perfect for most users with unlimited access. Upgrade to Premium (R699) if you want expert human review of your documents, personalized consultation, or if your case is complex and requires professional guidance.'
    },
    {
      question: 'How long does it take to prepare an application?',
      answer: 'Most users complete their initial application documents within 2-4 weeks. Our platform guides you step-by-step, and the AI tools significantly reduce the time compared to doing everything manually.'
    },
    {
      question: 'What if I\'m not satisfied with the service?',
      answer: 'We offer a 7-day money-back guarantee. If you\'re not happy with the service within the first week, contact us for a full refund, no questions asked.'
    },
    {
      question: 'Can this guarantee my visa approval?',
      answer: 'No service can guarantee visa approval as the final decision rests with immigration authorities. However, we help you present the strongest possible application by ensuring all documents are professional, complete, and meet official requirements.'
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Absolutely. We use bank-level encryption for all data. Your information is stored securely and never shared with third parties. You can delete your account and all associated data at any time.'
    }
  ];

  const colorClasses: Record<string, { bg: string; icon: string; hover: string }> = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', hover: 'group-hover:bg-blue-100' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', hover: 'group-hover:bg-green-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', hover: 'group-hover:bg-purple-100' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', hover: 'group-hover:bg-orange-100' },
    teal: { bg: 'bg-teal-50', icon: 'text-teal-600', hover: 'group-hover:bg-teal-100' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', hover: 'group-hover:bg-red-100' }
  };

  const difficultyColors: Record<string, string> = {
    'Easy': 'bg-green-100 text-green-700',
    'Medium': 'bg-yellow-100 text-yellow-700',
    'Medium-Hard': 'bg-orange-100 text-orange-700',
    'Hard': 'bg-red-100 text-red-700'
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 sm:pt-36 sm:pb-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">AI-Powered Immigration Assistant</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6">
              Your Smart Immigration
              <span className="block mt-2 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Assistant for Success
              </span>
            </h1>

            <p className="mt-6 text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get AI-powered help for visa applications, English tests, and interview prep for
              <span className="font-semibold text-gray-900"> Canada 🇨🇦 UK 🇬🇧 USA 🇺🇸</span> and more
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => handleRedirect('Hero - Try AI Assistant')}
                className="group px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Try the AI Immigration Assistant
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => handleRedirect('Hero - Check Eligibility')}
                className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Check My Visa Eligibility
              </button>
            </div>

            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Plans from R149/month</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>1000+ successful applications</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform provides comprehensive support for every step of your immigration journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colors = colorClasses[feature.color];

              return (
                <div
                  key={index}
                  className="group p-8 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`w-14 h-14 ${colors.bg} ${colors.hover} rounded-xl flex items-center justify-center mb-5 transition-colors duration-300`}>
                    <Icon className={`w-7 h-7 ${colors.icon}`} />
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Country Selector Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Explore Your Destination
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Compare top immigration destinations and find the perfect pathway for your profile
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {countries.map((country, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-5xl">{country.flag}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{country.name}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${difficultyColors[country.difficulty]}`}>
                        {country.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{country.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Processing: <span className="font-semibold text-gray-900">{country.avgTime}</span></span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Popularity: <span className="font-semibold text-gray-900">{country.popularityScore}/100</span></span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">POPULAR VISA TYPES:</p>
                  <div className="flex flex-wrap gap-2">
                    {country.visaTypes.map((visa, vIndex) => (
                      <span
                        key={vIndex}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium"
                      >
                        {visa}
                      </span>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => handleRedirect(`Country - Explore ${country.name}`)}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Explore {country.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Capture Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-white/20">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-6 h-6" />
                  <h3 className="text-2xl font-bold">Get Your Free Visa Eligibility Report</h3>
                </div>
                <p className="text-blue-100">
                  Enter your email to receive a personalized assessment of your immigration options
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="flex-1 w-full md:w-auto">
                {!submitted ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      className="flex-1 px-6 py-4 rounded-xl border-2 border-white/30 bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white transition-all"
                    />
                    <button
                      type="submit"
                      className="group px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      Get Report
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-500 text-white px-6 py-4 rounded-xl font-semibold text-center">
                    Check your email! Your report is on its way.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Affordable pricing to match your immigration journey. Plans start at just R149/month.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto items-center">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl scale-105 border-4 border-blue-400'
                    : 'bg-white border-2 border-gray-200 hover:border-gray-300 shadow-lg'
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                    <div className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                      <Sparkles className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                      /{plan.period}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRedirect(`Pricing - ${plan.name} Plan`)}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 mb-8 ${
                    plan.popular
                      ? 'bg-white text-blue-600 hover:bg-gray-50 shadow-lg'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {plan.cta}
                </button>

                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-blue-200' : 'text-green-500'}`} />
                      <span className={`text-sm ${plan.popular ? 'text-blue-50' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our Immigration AI platform
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  {openFaqIndex === index ? (
                    <Minus className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {openFaqIndex === index && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.1))]"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to Make Your Immigration Dream a Reality?
          </h2>

          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Join thousands of successful applicants who trusted our AI-powered platform to guide their journey
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button 
              onClick={() => handleRedirect('Final CTA - Get Started R299')}
              className="group px-8 py-5 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-2xl hover:shadow-3xl flex items-center gap-3 text-lg"
            >
              Get Started at R149/month
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={() => handleRedirect('Final CTA - View All Plans')}
              className="px-8 py-5 bg-blue-800 text-white font-bold rounded-xl border-2 border-blue-400 hover:bg-blue-900 transition-all duration-200 text-lg"
            >
              View All Plans
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              'Money-back guarantee',
              'Cancel anytime',
              'Affordable monthly plans'
            ].map((benefit, index) => (
              <div key={index} className="flex items-center justify-center gap-2 text-white">
                <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-white text-xl font-bold mb-4">Immigration AI</h3>
              <p className="text-sm leading-relaxed mb-6">
                Empowering South Africans to achieve their immigration dreams through AI-powered assistance and expert guidance.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">SOP Generator</a></li>
                <li><a href="#" className="hover:text-white transition-colors">IELTS Practice</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Interview Coaching</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Visa Guidance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Expert Review</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Destinations</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Canada Immigration</a></li>
                <li><a href="#" className="hover:text-white transition-colors">UK Immigration</a></li>
                <li><a href="#" className="hover:text-white transition-colors">USA Immigration</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Australia Immigration</a></li>
                <li><a href="#" className="hover:text-white transition-colors">All Destinations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Cape Town, South Africa</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <a href="tel:+27679518124" className="hover:text-white transition-colors">0679518124</a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <a href="mailto:hello@immigrationai.co.za" className="hover:text-white transition-colors">hello@immigrationai.co.za</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm">
                &copy; {new Date().getFullYear()} Immigration AI. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ImmigrationPage;

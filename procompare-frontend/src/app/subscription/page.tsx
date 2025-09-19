'use client'

import { useState } from 'react'
import { Check, Star, Zap, Crown, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SUBSCRIPTION_PACKAGES, PAY_PER_LEAD_PRICE, PAY_PER_LEAD_CURRENCY } from '@/constants'

const packageIcons = {
  basic: Star,
  advanced: Zap,
  pro: Crown,
  enterprise: Building2,
}

export default function SubscriptionPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

  const handleSubscribe = (packageId: string) => {
    // TODO: Implement subscription logic
    console.log('Subscribing to package:', packageId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of service providers who are growing their business with ProConnectSA. 
            Save up to 93% compared to pay-per-lead pricing!
          </p>
        </div>

        {/* Pay-per-lead comparison */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-red-800">Pay-per-Lead Pricing</h3>
              <p className="text-red-600">R{PAY_PER_LEAD_PRICE} per lead • No monthly commitment</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-800">R{PAY_PER_LEAD_PRICE}</p>
              <p className="text-sm text-red-600">per lead</p>
            </div>
          </div>
        </div>

        {/* Subscription packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Object.values(SUBSCRIPTION_PACKAGES).map((pkg) => {
            const Icon = packageIcons[pkg.id as keyof typeof packageIcons]
            const isSelected = selectedPackage === pkg.id
            
            return (
              <Card 
                key={pkg.id} 
                className={`relative transition-all duration-200 hover:shadow-lg ${
                  pkg.popular 
                    ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
                    : isSelected 
                    ? 'ring-2 ring-blue-300' 
                    : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {typeof pkg.leads === 'number' ? `${pkg.leads} leads per month` : 'Unlimited leads'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center pb-4">
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">R{pkg.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  
                  <div className="mb-4">
                    <Badge variant="secondary" className="text-green-600 bg-green-100">
                      {pkg.savings}% SAVINGS
                    </Badge>
                  </div>

                  <ul className="space-y-2 text-left">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button 
                    className="w-full"
                    variant={pkg.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(pkg.id)}
                  >
                    {pkg.id === 'enterprise' ? 'Contact Sales' : 'Subscribe Now'}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Value proposition */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">Why Choose Subscription?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">93%</span>
              </div>
              <h3 className="font-semibold mb-2">Massive Savings</h3>
              <p className="text-gray-600 text-sm">
                Save up to 93% compared to pay-per-lead pricing
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Priority Access</h3>
              <p className="text-gray-600 text-sm">
                Get priority matching and faster lead delivery
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Premium Features</h3>
              <p className="text-gray-600 text-sm">
                In-app chat, analytics, and dedicated support
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Can I change my plan later?</h3>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What happens to unused leads?</h3>
              <p className="text-gray-600 text-sm">
                Unused leads don't roll over to the next month. We recommend choosing a plan that matches your capacity.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 text-sm">
                Yes! All plans come with a 7-day free trial. No credit card required to start.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600 text-sm">
                Absolutely! Cancel anytime with no cancellation fees. Your access continues until the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}









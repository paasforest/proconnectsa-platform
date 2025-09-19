'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CreditCardComponent } from './CreditCard'
import { 
  CreditCard, 
  Coins, 
  Zap, 
  Star, 
  Shield,
  Lock,
  CheckCircle,
  AlertCircle,
  Gift,
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'

interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  originalPrice?: number
  discount?: number
  popular?: boolean
  features: string[]
  icon: React.ReactNode
  color: string
}

interface CreditPurchaseProps {
  onPurchase: (packageId: string, paymentMethod: string) => void
  isLoading?: boolean
}

const creditPackages: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 50,
    price: 2500, // R50 per credit
    features: [
      '50 Credits',
      'Basic lead access',
      'Standard support',
      '30-day validity'
    ],
    icon: <Coins className="h-8 w-8 text-yellow-600" />,
    color: 'bg-yellow-100'
  },
  {
    id: 'professional',
    name: 'Professional Pack',
    credits: 150,
    price: 7500, // R50 per credit
    originalPrice: 15000,
    discount: 20,
    popular: true,
    features: [
      '150 Credits',
      'Priority lead access',
      'Premium support',
      '60-day validity',
      'Advanced filters'
    ],
    icon: <Zap className="h-8 w-8 text-blue-600" />,
    color: 'bg-blue-100'
  },
  {
    id: 'business',
    name: 'Business Pack',
    credits: 300,
    price: 15000, // R50 per credit
    originalPrice: 30000,
    discount: 20,
    features: [
      '300 Credits',
      'Premium lead access',
      'Priority support',
      '90-day validity',
      'Advanced filters',
      'Analytics dashboard'
    ],
    icon: <Star className="h-8 w-8 text-purple-600" />,
    color: 'bg-purple-100'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 500,
    price: 25000, // R50 per credit
    originalPrice: 50000,
    discount: 20,
    features: [
      '500 Credits',
      'Unlimited lead access',
      'Dedicated support',
      '120-day validity',
      'All premium features',
      'Custom integrations'
    ],
    icon: <TrendingUp className="h-8 w-8 text-green-600" />,
    color: 'bg-green-100'
  }
]

export function CreditPurchase({ onPurchase, isLoading = false }: CreditPurchaseProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'eft' | 'paypal'>('card')
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId)
    setShowPaymentForm(true)
  }

  const handlePurchase = () => {
    if (!selectedPackage) {
      toast.error('Please select a credit package')
      return
    }
    
    onPurchase(selectedPackage, paymentMethod)
  }

  const selectedPackageData = creditPackages.find(pkg => pkg.id === selectedPackage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Coins className="h-8 w-8 text-yellow-600" />
          <h1 className="text-3xl font-bold text-gray-900">Buy Credits</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Purchase credits to access premium features, contact leads, and unlock advanced tools on ProConnectSA.
        </p>
      </div>

      {/* Credit Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {creditPackages.map((pkg) => (
          <CreditCardComponent
            key={pkg.id}
            package={pkg}
            onSelect={handlePackageSelect}
            isSelected={selectedPackage === pkg.id}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Payment Form */}
      {showPaymentForm && selectedPackageData && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Complete Purchase</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selected Package Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedPackageData.color}`}>
                    {selectedPackageData.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedPackageData.name}</h3>
                    <p className="text-sm text-gray-600">{selectedPackageData.credits} Credits</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    R{selectedPackageData.price}
                    {selectedPackageData.originalPrice && (
                      <span className="text-lg text-gray-500 line-through ml-2">
                        R{selectedPackageData.originalPrice}
                      </span>
                    )}
                  </div>
                  {selectedPackageData.discount && (
                    <Badge className="bg-green-500 text-white">
                      Save {selectedPackageData.discount}%
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Payment Method</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <CreditCard className="h-8 w-8 mx-auto mb-2" />
                  <div className="font-medium">Credit Card</div>
                  <div className="text-sm text-gray-600">Visa, Mastercard</div>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('eft')}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    paymentMethod === 'eft'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Shield className="h-8 w-8 mx-auto mb-2" />
                  <div className="font-medium">EFT</div>
                  <div className="text-sm text-gray-600">Bank Transfer</div>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    paymentMethod === 'paypal'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Lock className="h-8 w-8 mx-auto mb-2" />
                  <div className="font-medium">PayPal</div>
                  <div className="text-sm text-gray-600">Secure Payment</div>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('manual')}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    paymentMethod === 'manual'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Building className="h-8 w-8 mx-auto mb-2" />
                  <div className="font-medium">Manual Deposit</div>
                  <div className="text-sm text-gray-600">ATM/Bank Deposit</div>
                </button>
              </div>
            </div>

            {/* Payment Details */}
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Manual Deposit Section */}
            {paymentMethod === 'manual' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Manual Deposit Instructions</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Make a cash deposit at any ATM or bank branch using the reference number below.
                  </p>
                  
                  <div className="bg-white border border-blue-300 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Reference Number:</span>
                      <span className="font-mono text-lg font-bold text-blue-600">
                        {`MD${Date.now().toString().slice(-8)}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-medium text-gray-700">Amount to Deposit:</span>
                      <span className="font-mono text-lg font-bold text-green-600">
                        R{selectedPackageData.price}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-blue-700">
                    <p><strong>Step 1:</strong> Go to any ATM or bank branch</p>
                    <p><strong>Step 2:</strong> Select "Deposit" or "Cash Deposit"</p>
                    <p><strong>Step 3:</strong> Enter the reference number above</p>
                    <p><strong>Step 4:</strong> Deposit the exact amount shown</p>
                    <p><strong>Step 5:</strong> Upload your deposit slip below</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Upload Deposit Slip</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Building className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Upload your deposit slip (PDF, JPG, PNG)</p>
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                    <Button variant="outline" className="mt-2">
                      Choose File
                    </Button>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Manual Verification Required</p>
                      <p>Your credits will be activated within 24 hours after admin verification of your deposit slip.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-1">Secure Payment</p>
                  <p>Your payment information is encrypted and secure. We never store your card details.</p>
                </div>
              </div>
            </div>

            {/* Purchase Button */}
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowPaymentForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePurchase}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? 'Processing...' : `Purchase for R${selectedPackageData.price}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}








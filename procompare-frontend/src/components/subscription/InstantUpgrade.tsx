'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  ArrowRight, 
  Zap, 
  Crown, 
  Star,
  CreditCard,
  Shield,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'

interface SubscriptionTier {
  id: string
  name: string
  price: number
  monthly_credits: number
  features: string[]
  icon: any
  color: string
  popular?: boolean
}

interface InstantUpgradeProps {
  currentTier?: string
  onUpgrade: (tierId: string) => Promise<void>
  loading?: boolean
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 250,
    monthly_credits: 5, // 5 leads per month
    features: [
      '5 leads per month',
      'Basic lead access',
      'Email support',
      'Standard response time',
      'Basic analytics',
      'R50 per additional lead'
    ],
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    id: 'advanced',
    name: 'Advanced',
    price: 450,
    monthly_credits: 12, // 12 leads per month
    features: [
      '12 leads per month',
      'Priority lead access',
      'Phone + Email support',
      'Faster response time',
      'Advanced analytics',
      'Lead scoring insights',
      'R50 per additional lead'
    ],
    icon: Star,
    color: 'bg-purple-500'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 650,
    monthly_credits: 30, // 30 leads per month
    features: [
      '30 leads per month',
      'VIP lead access',
      'Priority support',
      'Fastest response time',
      'Premium analytics',
      'Lead scoring insights',
      'In-app chat system',
      'Priority matching',
      'R50 per additional lead'
    ],
    icon: Crown,
    color: 'bg-gold-500',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 850,
    monthly_credits: 999999, // Unlimited leads
    features: [
      'UNLIMITED leads per month',
      'Unlimited lead access',
      'Dedicated support',
      'Instant response time',
      'Enterprise analytics',
      'Advanced lead scoring',
      'In-app chat system',
      'Priority matching',
      'Custom integrations',
      'White-label options'
    ],
    icon: Zap,
    color: 'bg-red-500'
  }
]

export default function InstantUpgrade({ currentTier, onUpgrade, loading = false }: InstantUpgradeProps) {
  const { data: session } = useSession()
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [upgrading, setUpgrading] = useState(false)

  const handleUpgrade = async (tierId: string) => {
    try {
      setUpgrading(true)
      setSelectedTier(tierId)
      
      // Simulate instant upgrade process
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await onUpgrade(tierId)
      
      toast.success('Upgrade successful! Your new features are now active.')
    } catch (error) {
      toast.error('Upgrade failed. Please try again.')
    } finally {
      setUpgrading(false)
      setSelectedTier(null)
    }
  }

  const getCurrentTierIndex = () => {
    if (!currentTier) return -1
    return subscriptionTiers.findIndex(tier => tier.id === currentTier)
  }

  const getUpgradeableTiers = () => {
    const currentIndex = getCurrentTierIndex()
    if (currentIndex === -1) return subscriptionTiers // Pay-as-you-go can upgrade to any tier
    
    return subscriptionTiers.slice(currentIndex + 1)
  }

  const upgradeableTiers = getUpgradeableTiers()

  if (upgradeableTiers.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            You're on the highest tier!
          </h3>
          <p className="text-green-600">
            You have access to all premium features.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Instant Upgrade Available
        </h2>
        <p className="text-gray-600">
          Upgrade instantly and get immediate access to premium features
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {upgradeableTiers.map((tier) => {
          const Icon = tier.icon
          const isSelected = selectedTier === tier.id
          const isUpgrading = upgrading && isSelected
          
          return (
            <Card 
              key={tier.id}
              className={`relative cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-md hover:scale-105'
              } ${tier.popular ? 'border-blue-500' : ''}`}
              onClick={() => !isUpgrading && handleUpgrade(tier.id)}
            >
              {tier.popular && (
                <Badge className="absolute -top-2 -right-2 bg-blue-600">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className={`w-12 h-12 ${
                  tier.color === 'bg-blue-600' ? 'bg-blue-600' :
                  tier.color === 'bg-purple-600' ? 'bg-purple-600' :
                  tier.color === 'bg-emerald-600' ? 'bg-emerald-600' :
                  tier.color === 'bg-orange-600' ? 'bg-orange-600' :
                  'bg-gray-600'
                } text-white rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{tier.name}</CardTitle>
                <div className="text-2xl font-bold text-gray-900">
                  R{tier.price}
                  <span className="text-sm font-normal text-gray-500">/month</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Monthly Credits</div>
                  <div className="text-xl font-semibold text-blue-600">
                    {tier.monthly_credits}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {tier.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {tier.features.length > 4 && (
                    <div className="text-xs text-gray-500">
                      +{tier.features.length - 4} more features
                    </div>
                  )}
                </div>
                
                <Button 
                  className="w-full"
                  disabled={isUpgrading || loading}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUpgrade(tier.id)
                  }}
                >
                  {isUpgrading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Upgrading...
                    </>
                  ) : (
                    <>
                      Upgrade Now
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">
              Instant Activation
            </h4>
            <p className="text-sm text-blue-700">
              Your upgrade takes effect immediately. No waiting, no delays. 
              You'll have access to all premium features right away.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900 mb-1">Instant Access</h4>
          <p className="text-sm text-gray-600">Features activate immediately</p>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900 mb-1">Secure Payment</h4>
          <p className="text-sm text-gray-600">Safe and encrypted transactions</p>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h4 className="font-semibold text-gray-900 mb-1">Better Leads</h4>
          <p className="text-sm text-gray-600">Higher quality, more profitable</p>
        </div>
      </div>
    </div>
  )
}






'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider';
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

// Premium Listing Plans - as agreed: R299/month or R2,990 lifetime for unlimited FREE leads
const premiumPlans: SubscriptionTier[] = [
  {
    id: 'monthly',
    name: 'Monthly Premium',
    price: 299,
    monthly_credits: 999999, // Unlimited (no credit deductions)
    features: [
      '⭐ Unlimited FREE leads (no credit deductions)',
      '✓ Enhanced visibility in public directory',
      '✓ Priority matching for new leads',
      '✓ Featured placement in search results',
      '✓ Premium badge on your profile'
    ],
    icon: Star,
    color: 'bg-purple-500',
    popular: true
  },
  {
    id: 'lifetime',
    name: 'Lifetime Premium',
    price: 2990,
    monthly_credits: 999999, // Unlimited forever (no credit deductions)
    features: [
      '⭐ Unlimited FREE leads forever (no credit deductions)',
      '✓ Enhanced visibility in public directory',
      '✓ Priority matching for new leads',
      '✓ Featured placement in search results',
      '✓ Premium badge on your profile',
      '✓ No monthly renewals needed',
      '✓ Save R3,588 vs monthly (12 months)'
    ],
    icon: Crown,
    color: 'bg-emerald-500'
  }
]

export default function InstantUpgrade({ currentTier, onUpgrade, loading = false }: InstantUpgradeProps) {
  const { user, token } = useAuth()
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

  // Always show premium plans (no tier restrictions)
  const upgradeableTiers = premiumPlans

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
          Premium Listing
        </h2>
        <p className="text-gray-600 mb-2">
          Upgrade to Premium Listing for unlimited FREE leads and enhanced visibility
        </p>
        <p className="text-sm text-gray-500">
          Your current plan: <span className="font-semibold">Pay As You Go</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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
                  tier.color === 'bg-purple-500' ? 'bg-purple-500' :
                  tier.color === 'bg-emerald-500' ? 'bg-emerald-500' :
                  'bg-gray-500'
                } text-white rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{tier.name}</CardTitle>
                <div className="text-2xl font-bold text-gray-900">
                  R{tier.price.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500">
                    {tier.id === 'lifetime' ? ' one-time' : '/month'}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Leads</div>
                  <div className="text-xl font-semibold text-green-600">
                    Unlimited FREE
                  </div>
                </div>
                
                <div className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isUpgrading || loading}
                  onClick={(e) => {
                    e.stopPropagation()
                    // Redirect to settings for premium request
                    window.location.href = '/dashboard/settings'
                  }}
                >
                  {isUpgrading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Request Premium Listing
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-purple-900 mb-1">
              Automatic Activation
            </h4>
            <p className="text-sm text-purple-700">
              Premium listing activates automatically once your EFT payment is confirmed. 
              You'll receive unlimited FREE leads with no credit deductions.
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






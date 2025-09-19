'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CreditCard, 
  Coins, 
  Zap, 
  Star, 
  TrendingUp,
  CheckCircle,
  Clock,
  Gift
} from 'lucide-react'

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

interface CreditCardProps {
  package: CreditPackage
  onSelect: (packageId: string) => void
  isSelected?: boolean
  isLoading?: boolean
}

export function CreditCardComponent({ 
  package: creditPackage, 
  onSelect, 
  isSelected = false,
  isLoading = false 
}: CreditCardProps) {
  const getPricePerCredit = () => {
    return (creditPackage.price / creditPackage.credits).toFixed(2)
  }

  const getSavings = () => {
    if (creditPackage.originalPrice) {
      return creditPackage.originalPrice - creditPackage.price
    }
    return 0
  }

  return (
    <Card 
      className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected 
          ? 'ring-2 ring-blue-500 shadow-lg' 
          : 'hover:shadow-md'
      } ${creditPackage.popular ? 'border-blue-500' : ''}`}
      onClick={() => onSelect(creditPackage.id)}
    >
      {creditPackage.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-500 text-white px-3 py-1">
            <Star className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}
      
      {creditPackage.discount && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-red-500 text-white px-2 py-1 text-xs">
            -{creditPackage.discount}%
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${creditPackage.color}`}>
          {creditPackage.icon}
        </div>
        <CardTitle className="text-xl">{creditPackage.name}</CardTitle>
        <div className="space-y-1">
          <div className="text-3xl font-bold text-gray-900">
            R{creditPackage.price}
            {creditPackage.originalPrice && (
              <span className="text-lg text-gray-500 line-through ml-2">
                R{creditPackage.originalPrice}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {creditPackage.credits} Credits
          </div>
          <div className="text-xs text-gray-500">
            R{getPricePerCredit()} per credit
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          {creditPackage.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        {getSavings() > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-green-700">
              <Gift className="h-4 w-4" />
              <span className="text-sm font-medium">
                Save R{getSavings()} ({creditPackage.discount}% off)
              </span>
            </div>
          </div>
        )}

        <Button 
          className="w-full"
          disabled={isLoading}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(creditPackage.id)
          }}
        >
          {isLoading ? (
            <Clock className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CreditCard className="h-4 w-4 mr-2" />
          )}
          {isLoading ? 'Processing...' : 'Select Package'}
        </Button>
      </CardContent>
    </Card>
  )
}








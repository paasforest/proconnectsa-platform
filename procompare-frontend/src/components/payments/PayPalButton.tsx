'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react'
import { paypalService } from '@/lib/paypal-service'
import { toast } from 'sonner'

interface PayPalButtonProps {
  type: 'credits' | 'subscription'
  credits?: number
  tier?: 'basic' | 'advanced' | 'pro' | 'enterprise'
  amount?: number
  onSuccess?: (result: any) => void
  onError?: (error: string) => void
  className?: string
}

export function PayPalButton({ 
  type, 
  credits = 0, 
  tier = 'basic', 
  amount = 0,
  onSuccess,
  onError,
  className = ''
}: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate pricing
  const pricing = type === 'credits' 
    ? paypalService.getCreditPricing(credits)
    : { amount: paypalService.getSubscriptionPricing(tier), savings: 0 }

  const handleSuccess = (result: any) => {
    setPaymentStatus('success')
    setIsProcessing(false)
    toast.success('Payment completed successfully!')
    onSuccess?.(result)
  }

  const handleError = (error: string) => {
    setPaymentStatus('error')
    setErrorMessage(error)
    setIsProcessing(false)
    toast.error(error)
    onError?.(error)
  }

  const handlePayment = async () => {
    if (isLoading || isProcessing) return

    setIsLoading(true)
    setPaymentStatus('processing')
    setErrorMessage('')

    try {
      if (type === 'credits') {
        const result = await paypalService.createCreditPayment(credits)
        if (result.success && result.approvalUrl) {
          // Redirect to PayPal
          window.location.href = result.approvalUrl
        } else {
          handleError(result.error || 'Payment creation failed')
        }
      } else {
        const result = await paypalService.createSubscription(tier, amount)
        if (result.success && result.approvalUrl) {
          // Redirect to PayPal
          window.location.href = result.approvalUrl
        } else {
          handleError(result.error || 'Subscription creation failed')
        }
      }
    } catch (error) {
      handleError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getButtonText = () => {
    if (isLoading) return 'Preparing Payment...'
    if (isProcessing) return 'Processing...'
    if (paymentStatus === 'success') return 'Payment Successful!'
    if (paymentStatus === 'error') return 'Try Again'
    
    if (type === 'credits') {
      return `Buy ${credits} Credits - R${pricing.amount}`
    } else {
      return `Subscribe to ${tier.charAt(0).toUpperCase() + tier.slice(1)} - R${pricing.amount}/month`
    }
  }

  const getButtonVariant = () => {
    if (paymentStatus === 'success') return 'default'
    if (paymentStatus === 'error') return 'destructive'
    return 'default'
  }

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {renderStatusIcon()}
          {type === 'credits' ? 'Credit Purchase' : 'Subscription'}
        </CardTitle>
        <CardDescription>
          {type === 'credits' 
            ? `Purchase ${credits} credits to access lead contact details`
            : `Upgrade to ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan for better features`
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Pricing Display */}
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">
            R{pricing.amount}
          </div>
          {pricing.savings > 0 && (
            <div className="text-sm text-muted-foreground">
              You save R{pricing.savings}!
            </div>
          )}
          {type === 'credits' && (
            <div className="text-sm text-muted-foreground">
              R{Math.round(pricing.amount / credits)} per credit
            </div>
          )}
        </div>

        {/* Features */}
        {type === 'credits' && (
          <div className="space-y-2">
            <div className="text-sm font-medium">What you get:</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {credits} lead contact details</li>
              <li>• Access to phone numbers and emails</li>
              <li>• Direct communication with clients</li>
              <li>• Credits never expire</li>
            </ul>
          </div>
        )}

        {type === 'subscription' && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Plan includes:</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {tier === 'basic' && (
                <>
                  <li>• 5 leads per month</li>
                  <li>• Basic support</li>
                  <li>• Standard response time</li>
                </>
              )}
              {tier === 'advanced' && (
                <>
                  <li>• 12 leads per month</li>
                  <li>• Priority support</li>
                  <li>• Faster response time</li>
                </>
              )}
              {tier === 'pro' && (
                <>
                  <li>• 30 leads per month</li>
                  <li>• Premium support</li>
                  <li>• Fastest response time</li>
                </>
              )}
              {tier === 'enterprise' && (
                <>
                  <li>• Unlimited leads</li>
                  <li>• Dedicated support</li>
                  <li>• Custom features</li>
                </>
              )}
            </ul>
          </div>
        )}

        {/* Error Message */}
        {paymentStatus === 'error' && errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

        {/* Success Message */}
        {paymentStatus === 'success' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">
              {type === 'credits' 
                ? `${credits} credits have been added to your account!`
                : `Welcome to the ${tier} plan!`
              }
            </p>
          </div>
        )}

        {/* PayPal Button */}
        <Button
          onClick={handlePayment}
          disabled={isLoading || isProcessing || paymentStatus === 'success'}
          variant={getButtonVariant()}
          className="w-full"
          size="lg"
        >
          {getButtonText()}
        </Button>

        {/* Security Badge */}
        <div className="text-center">
          <Badge variant="secondary" className="text-xs">
            🔒 Secured by PayPal
          </Badge>
        </div>

        {/* PayPal Container for SDK Integration */}
        <div ref={containerRef} className="hidden" />
      </CardContent>
    </Card>
  )
}

export default PayPalButton





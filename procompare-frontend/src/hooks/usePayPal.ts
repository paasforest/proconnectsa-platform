'use client'

import { useState, useCallback } from 'react'
import { paypalService, PayPalExecutionResponse } from '@/lib/paypal-service'
import { toast } from 'sonner'

interface UsePayPalOptions {
  onSuccess?: (result: PayPalExecutionResponse) => void
  onError?: (error: string) => void
}

export function usePayPal(options: UsePayPalOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCreditPurchase = useCallback(async (credits: number) => {
    if (isLoading || isProcessing) return

    setIsLoading(true)
    try {
      const result = await paypalService.createCreditPayment(credits)
      
      if (result.success && result.approvalUrl) {
        // Redirect to PayPal
        window.location.href = result.approvalUrl
      } else {
        const error = result.error || 'Payment creation failed'
        toast.error(error)
        options.onError?.(error)
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred'
      toast.error(errorMessage)
      options.onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, isProcessing, options])

  const handleSubscriptionPurchase = useCallback(async (tier: string, amount: number) => {
    if (isLoading || isProcessing) return

    setIsLoading(true)
    try {
      const result = await paypalService.createSubscription(tier, amount)
      
      if (result.success && result.approvalUrl) {
        // Redirect to PayPal
        window.location.href = result.approvalUrl
      } else {
        const error = result.error || 'Subscription creation failed'
        toast.error(error)
        options.onError?.(error)
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred'
      toast.error(errorMessage)
      options.onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, isProcessing, options])

  const executePayment = useCallback(async (paymentId: string, payerId: string, credits: number) => {
    setIsProcessing(true)
    try {
      const result = await paypalService.executeCreditPayment(paymentId, payerId, credits)
      
      if (result.success) {
        toast.success('Payment completed successfully!')
        options.onSuccess?.(result)
      } else {
        const error = result.error || 'Payment execution failed'
        toast.error(error)
        options.onError?.(error)
      }
    } catch (error) {
      const errorMessage = 'Payment processing failed'
      toast.error(errorMessage)
      options.onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }, [options])

  const getCreditPricing = useCallback((credits: number) => {
    return paypalService.getCreditPricing(credits)
  }, [])

  const getSubscriptionPricing = useCallback((tier: string, billingCycle: string = 'monthly') => {
    return paypalService.getSubscriptionPricing(tier, billingCycle)
  }, [])

  return {
    isLoading,
    isProcessing,
    handleCreditPurchase,
    handleSubscriptionPurchase,
    executePayment,
    getCreditPricing,
    getSubscriptionPricing
  }
}

export default usePayPal





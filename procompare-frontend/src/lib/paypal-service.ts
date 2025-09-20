/**
 * PayPal Service for ProConnectSA
 * Handles PayPal payments for credits and subscriptions
 */

export interface PayPalConfig {
  clientId: string
  currency: string
  environment: 'sandbox' | 'live'
}

export interface CreditPurchase {
  credits: number
  amount: number
  currency: string
}

export interface SubscriptionPurchase {
  tier: 'basic' | 'advanced' | 'pro' | 'enterprise'
  amount: number
  currency: string
  billingCycle: 'monthly' | 'yearly'
}

export interface PayPalPaymentResponse {
  success: boolean
  paymentId?: string
  approvalUrl?: string
  error?: string
}

export interface PayPalExecutionResponse {
  success: boolean
  transactionId?: string
  creditsAdded?: number
  newBalance?: number
  error?: string
}

class PayPalService {
  private config: PayPalConfig
  private isLoaded = false

  constructor(config: PayPalConfig) {
    this.config = config
  }

  /**
   * Load PayPal SDK
   */
  async loadPayPalSDK(): Promise<void> {
    if (this.isLoaded) return

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `https://www.paypal.com/sdk/js?client-id=${this.config.clientId}&currency=${this.config.currency}&intent=capture`
      script.async = true
      
      script.onload = () => {
        this.isLoaded = true
        resolve()
      }
      
      script.onerror = () => {
        reject(new Error('Failed to load PayPal SDK'))
      }
      
      document.head.appendChild(script)
    })
  }

  /**
   * Create PayPal payment for credit purchase
   */
  async createCreditPayment(credits: number): Promise<PayPalPaymentResponse> {
    try {
      const response = await fetch('/api/payments/buy-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credits,
          return_url: `${window.location.origin}/provider?payment=success`,
          cancel_url: `${window.location.origin}/provider?payment=cancelled`
        })
      })

      const data = await response.json()

      if (data.success) {
        return {
          success: true,
          paymentId: data.payment_id,
          approvalUrl: data.approval_url
        }
      } else {
        return {
          success: false,
          error: data.error || 'Payment creation failed'
        }
      }
    } catch (error) {
      console.error('PayPal credit payment error:', error)
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  /**
   * Execute PayPal payment after user approval
   */
  async executeCreditPayment(paymentId: string, payerId: string, credits: number): Promise<PayPalExecutionResponse> {
    try {
      const response = await fetch('/api/payments/paypal-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_id: paymentId,
          payer_id: payerId,
          credits
        })
      })

      const data = await response.json()

      if (data.success) {
        return {
          success: true,
          transactionId: data.transaction_id,
          creditsAdded: data.credits_added,
          newBalance: data.new_balance
        }
      } else {
        return {
          success: false,
          error: data.error || 'Payment execution failed'
        }
      }
    } catch (error) {
      console.error('PayPal payment execution error:', error)
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  /**
   * Create PayPal subscription
   */
  async createSubscription(tier: string, amount: number, billingCycle: string = 'monthly'): Promise<PayPalPaymentResponse> {
    try {
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_tier: tier,
          amount,
          currency: this.config.currency,
          billing_cycle: billingCycle
        })
      })

      const data = await response.json()

      if (data.success) {
        return {
          success: true,
          paymentId: data.subscription_id,
          approvalUrl: data.paypal_url
        }
      } else {
        return {
          success: false,
          error: data.error || 'Subscription creation failed'
        }
      }
    } catch (error) {
      console.error('PayPal subscription error:', error)
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  /**
   * Render PayPal button for credit purchase
   */
  async renderCreditButton(containerId: string, credits: number, onSuccess: (result: PayPalExecutionResponse) => void, onError: (error: string) => void) {
    await this.loadPayPalSDK()

    const container = document.getElementById(containerId)
    if (!container) {
      onError('Payment container not found')
      return
    }

    // Clear container
    container.innerHTML = ''

    // Create PayPal button
    const paypalButton = document.createElement('div')
    paypalButton.id = `paypal-button-${credits}`
    container.appendChild(paypalButton)

    // @ts-ignore - PayPal SDK types
    window.paypal.Buttons({
      createOrder: async () => {
        try {
          const payment = await this.createCreditPayment(credits)
          if (payment.success && payment.paymentId) {
            return payment.paymentId
          } else {
            throw new Error(payment.error || 'Payment creation failed')
          }
        } catch (error) {
          console.error('PayPal order creation error:', error)
          onError('Failed to create payment order')
          throw error
        }
      },
      onApprove: async (data: any) => {
        try {
          const result = await this.executeCreditPayment(data.paymentID, data.payerID, credits)
          if (result.success) {
            onSuccess(result)
          } else {
            onError(result.error || 'Payment execution failed')
          }
        } catch (error) {
          console.error('PayPal approval error:', error)
          onError('Payment processing failed')
        }
      },
      onError: (err: any) => {
        console.error('PayPal button error:', err)
        onError('Payment failed. Please try again.')
      },
      onCancel: () => {
        onError('Payment cancelled by user')
      }
    }).render(`#paypal-button-${credits}`)
  }

  /**
   * Render PayPal button for subscription
   */
  async renderSubscriptionButton(containerId: string, tier: string, amount: number, onSuccess: (result: any) => void, onError: (error: string) => void) {
    await this.loadPayPalSDK()

    const container = document.getElementById(containerId)
    if (!container) {
      onError('Payment container not found')
      return
    }

    // Clear container
    container.innerHTML = ''

    // Create PayPal button
    const paypalButton = document.createElement('div')
    paypalButton.id = `paypal-subscription-${tier}`
    container.appendChild(paypalButton)

    // @ts-ignore - PayPal SDK types
    window.paypal.Buttons({
      createSubscription: async () => {
        try {
          const subscription = await this.createSubscription(tier, amount)
          if (subscription.success && subscription.paymentId) {
            return subscription.paymentId
          } else {
            throw new Error(subscription.error || 'Subscription creation failed')
          }
        } catch (error) {
          console.error('PayPal subscription creation error:', error)
          onError('Failed to create subscription')
          throw error
        }
      },
      onApprove: async (data: any) => {
        try {
          // Handle subscription approval
          onSuccess({
            subscriptionId: data.subscriptionID,
            tier,
            amount
          })
        } catch (error) {
          console.error('PayPal subscription approval error:', error)
          onError('Subscription processing failed')
        }
      },
      onError: (err: any) => {
        console.error('PayPal subscription error:', err)
        onError('Subscription failed. Please try again.')
      },
      onCancel: () => {
        onError('Subscription cancelled by user')
      }
    }).render(`#paypal-subscription-${tier}`)
  }

  /**
   * Get pricing for credits
   */
  getCreditPricing(credits: number): { amount: number; savings: number } {
    const basePrice = credits * 50 // R50 per credit base price
    let finalPrice = basePrice
    
    // Volume discounts
    if (credits >= 50) {
      finalPrice = basePrice * 0.9 // 10% discount for 50+ credits
    } else if (credits >= 20) {
      finalPrice = basePrice * 0.95 // 5% discount for 20+ credits
    }
    
    return {
      amount: finalPrice,
      savings: basePrice - finalPrice
    }
  }

  /**
   * Get subscription pricing
   */
  getSubscriptionPricing(tier: string, billingCycle: string = 'monthly'): number {
    const pricing = {
      basic: { monthly: 299, yearly: 2990 },
      advanced: { monthly: 599, yearly: 5990 },
      pro: { monthly: 999, yearly: 9990 },
      enterprise: { monthly: 1999, yearly: 19990 }
    }
    
    return pricing[tier as keyof typeof pricing]?.[billingCycle as keyof typeof pricing.basic] || 0
  }
}

// Export singleton instance
export const paypalService = new PayPalService({
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
  currency: 'ZAR',
  environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox'
})

export default PayPalService





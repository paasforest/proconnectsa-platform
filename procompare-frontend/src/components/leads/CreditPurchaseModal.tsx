'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  CheckCircle, 
  AlertTriangle,
  DollarSign,
  Shield,
  Clock
} from 'lucide-react'
import { Lead, CreditPurchase } from '@/types'

interface CreditPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  lead: Lead
  onPurchase: (purchase: CreditPurchase) => Promise<void>
}

export function CreditPurchaseModal({
  isOpen,
  onClose,
  lead,
  onPurchase
}: CreditPurchaseModalProps) {
  const creditCost = lead.credit_cost ? (lead.credit_cost * 50) : 50 // Dynamic pricing based on lead (R50 base)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('manual')
  const [error, setError] = useState<string | null>(null)
  
  const handlePurchase = async () => {
    setIsProcessing(true)
    setError(null)
    
    try {
      if (paymentMethod === 'manual') {
        // For manual deposits, create a deposit request
        const response = await fetch('/api/payments/dashboard/deposits/create/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            amount: creditCost,
            credits_to_activate: lead.credit_cost || 1,
            payment_method: 'manual_deposit'
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create deposit request')
        }

        const result = await response.json()
        
        // Show success message and redirect to deposit instructions
        alert(`Deposit request created! Reference: ${result.deposit.reference_number}\nAmount: R${creditCost} for ${lead.credit_cost || 1} credit(s)\n\nYou will receive an invoice via email with payment instructions.`)
        
        // Close modal
        onClose()
      } else {
        // For other payment methods, show coming soon message
        alert(`${paymentMethods.find(m => m.id === paymentMethod)?.name} payment is coming soon! Please use Manual Deposit for now.`)
        setIsProcessing(false)
        return
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }
  
  const paymentMethods = [
    {
      id: 'manual',
      name: 'Manual Deposit',
      description: 'ATM/Bank cash deposit - Available now',
      icon: '🏦',
      available: true
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, American Express - Coming soon',
      icon: '💳',
      available: false
    },
    {
      id: 'eft',
      name: 'EFT/Bank Transfer',
      description: 'Direct bank transfer - Coming soon',
      icon: '🏦',
      available: false
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay with PayPal account - Coming soon',
      icon: '🅿️',
      available: false
    }
  ]
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Purchase Lead Access
          </DialogTitle>
          <DialogDescription>
            Buy credits to view client contact details for this lead
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Lead Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{lead.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Service Category</span>
                <Badge variant="outline">{lead.service_category}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Location</span>
                <span className="text-sm">{lead.location_suburb}, {lead.location_city}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Budget Range</span>
                <span className="text-sm font-medium">{lead.budget_range.replace('_', ' - ')}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Pricing */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Credit Cost</span>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-xl font-bold">R{creditCost}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              One-time payment to access this lead's contact details
            </p>
          </div>
          
          {/* Payment Method Selection */}
          <div className="space-y-3">
            <h3 className="font-medium">Payment Method</h3>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                    method.available
                      ? paymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50 cursor-pointer'
                        : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => method.available && setPaymentMethod(e.target.value)}
                    disabled={!method.available}
                    className="sr-only"
                  />
                  <span className="text-lg">{method.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {method.name}
                      {method.available ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Available</span>
                      ) : (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Coming Soon</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{method.description}</div>
                  </div>
                  {paymentMethod === method.id && method.available && (
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                  )}
                </label>
              ))}
            </div>
          </div>
          
          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your payment is secure and encrypted. You'll receive a receipt via email.
            </AlertDescription>
          </Alert>
          
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="flex-1 flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  {paymentMethod === 'manual' ? 'Create Deposit Request' : 'Pay R' + creditCost}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreditPurchaseModal




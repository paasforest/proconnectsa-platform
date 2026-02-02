"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, Zap, Crown, AlertCircle, Copy, XCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-simple';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

interface PremiumListingUpgradeProps {
  currentTier?: string;
  onUpgradeComplete?: () => void;
}

interface BankingDetails {
  bank_name: string;
  account_number: string;
  branch_code: string;
  account_holder: string;
}

interface PremiumRequestResponse {
  success: boolean;
  reference_number: string;
  amount: number;
  plan_type: 'monthly' | 'lifetime';
  banking_details: BankingDetails;
  customer_code: string;
  instructions?: string[];
}

export default function PremiumListingUpgrade({ 
  currentTier = 'pay_as_you_go',
  onUpgradeComplete 
}: PremiumListingUpgradeProps) {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [showBankingDetails, setShowBankingDetails] = useState(false);
  const [premiumRequest, setPremiumRequest] = useState<PremiumRequestResponse | null>(null);

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Premium',
      price: 299,
      period: 'per month',
      description: 'Perfect for growing your business',
      popular: true,
      features: [
        'Unlimited FREE leads (no credit deductions)',
        'Enhanced visibility in public directory',
        'Priority matching for new leads',
        'Featured placement in search results',
        'Premium badge on your profile'
      ],
      icon: Star,
      color: 'blue'
    },
    {
      id: 'lifetime',
      name: 'Lifetime Premium',
      price: 2990,
      period: 'one-time',
      description: 'Best value - pay once, enjoy forever',
      popular: false,
      features: [
        'Unlimited FREE leads forever (no credit deductions)',
        'Enhanced visibility in public directory',
        'Priority matching for new leads',
        'Featured placement in search results',
        'Premium badge on your profile',
        'No monthly renewals needed',
        'Save R3,588 vs monthly (12 months)'
      ],
      icon: Crown,
      color: 'purple'
    }
  ];

  const handleRequestPremium = async (planType: 'monthly' | 'lifetime') => {
    if (!token) {
      toast.error('Please log in to request premium listing');
      return;
    }

    try {
      setLoading(planType);
      apiClient.setToken(token);

      const response = await apiClient.post('/api/auth/request-premium-listing/', {
        plan_type: planType
      });

      // Handle different response structures
      const responseData = response?.data || response;
      
      if (responseData.success || response.success) {
        setPremiumRequest(responseData);
        setShowBankingDetails(true);
        toast.success('Premium request created! Please complete the EFT payment.');
      } else {
        const errorMsg = responseData.error || response.error || 'Failed to create premium request';
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Premium request error:', error);
      // Better error handling
      let errorMessage = 'Failed to request premium listing';
      
      if (error.response?.data) {
        errorMessage = error.response.data.error || 
                      error.response.data.message || 
                      error.response.data.detail ||
                      errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Check for network errors
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        errorMessage = 'Network error: Please check your internet connection and try again';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getCurrentPlanText = () => {
    if (currentTier === 'pay_as_you_go') {
      return 'pay as you go';
    }
    return currentTier;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upgrade plan</h2>
        <p className="text-gray-600">
          Request a premium plan for more leads and better value. Your current plan: <span className="font-semibold">{getCurrentPlanText()}</span>.
        </p>
      </div>

      {/* Premium Plans */}
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isRequesting = loading === plan.id;
          
          return (
            <Card 
              key={plan.id}
              className={`relative transition-all hover:shadow-lg ${
                plan.popular ? 'border-blue-500 shadow-md' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className={`p-3 rounded-full ${
                    plan.color === 'blue' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      plan.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
                    }`} />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">{plan.name}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Pricing */}
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold text-gray-900">R{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                      : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                  } text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all`}
                  onClick={() => handleRequestPremium(plan.id as 'monthly' | 'lifetime')}
                  disabled={isRequesting}
                >
                  {isRequesting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Request Premium Listing'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Banking Details Modal */}
      {showBankingDetails && premiumRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Complete EFT to Activate Premium</h3>
                <button
                  onClick={() => {
                    setShowBankingDetails(false);
                    setPremiumRequest(null);
                    if (onUpgradeComplete) onUpgradeComplete();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Amount Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-900 font-medium">Amount Due</span>
                  <span className="text-blue-900 font-bold text-xl">R{premiumRequest.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-blue-700">
                  <span>Plan Type</span>
                  <span className="font-medium capitalize">{premiumRequest.plan_type}</span>
                </div>
              </div>

              {/* Banking Details */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-3">Banking Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Bank:</span>
                    <span className="font-medium text-green-900">{premiumRequest.banking_details.bank_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Account Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-green-900">{premiumRequest.banking_details.account_number}</span>
                      <button
                        onClick={() => copyToClipboard(premiumRequest.banking_details.account_number)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Branch Code:</span>
                    <span className="font-medium text-green-900">{premiumRequest.banking_details.branch_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Account Holder:</span>
                    <span className="font-medium text-green-900">{premiumRequest.banking_details.account_holder}</span>
                  </div>
                </div>
              </div>

              {/* Reference Number - Most Important */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Payment Reference (IMPORTANT)</h4>
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded border border-yellow-200">
                  <span className="font-mono font-bold text-lg text-yellow-900">{premiumRequest.reference_number}</span>
                  <button
                    onClick={() => copyToClipboard(premiumRequest.reference_number)}
                    className="text-yellow-600 hover:text-yellow-700 flex items-center gap-1"
                  >
                    <Copy className="w-5 h-5" />
                    <span className="text-sm">Copy</span>
                  </button>
                </div>
                <p className="text-xs text-yellow-800 mt-2">
                  ⚠️ Use this EXACT reference when making the EFT payment. Premium will activate automatically once payment is detected.
                </p>
              </div>

              {/* Instructions */}
              {premiumRequest.instructions && premiumRequest.instructions.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Important Instructions</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {premiumRequest.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-gray-500">•</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Auto-Activation Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Zap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Automatic Activation</h4>
                    <p className="text-sm text-blue-700">
                      Once your EFT payment is detected (usually within 5 minutes), your premium listing will be activated automatically. 
                      You'll receive an email confirmation when it's active.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end">
              <Button
                onClick={() => {
                  setShowBankingDetails(false);
                  setPremiumRequest(null);
                  if (onUpgradeComplete) onUpgradeComplete();
                }}
                className="px-6"
              >
                Got it, I'll make the payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

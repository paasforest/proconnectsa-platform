"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star, CheckCircle, XCircle, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { apiClient } from "@/lib/api-simple";

interface SubscriptionPlansProps {
  currentTier?: string | null;
  onSelectPlan?: (plan: string) => void;
}

interface PremiumPlan {
  name: string;
  price: number;
  period: string;
  popular: boolean;
  features: string[];
  description: string;
}

const premiumPlans: PremiumPlan[] = [
  {
    name: "Monthly Premium",
    price: 299,
    period: "per month",
    popular: true,
    description: "Perfect for growing your business",
    features: [
      "⭐ Unlimited FREE leads (no credit deductions)",
      "✓ Enhanced visibility in public directory",
      "✓ Priority matching for new leads",
      "✓ Featured placement in search results",
      "✓ Premium badge on your profile"
    ]
  },
  {
    name: "Lifetime Premium",
    price: 2990,
    period: "one-time",
    popular: false,
    description: "Best value - pay once, enjoy forever",
    features: [
      "⭐ Unlimited FREE leads forever (no credit deductions)",
      "✓ Enhanced visibility in public directory",
      "✓ Priority matching for new leads",
      "✓ Featured placement in search results",
      "✓ Premium badge on your profile",
      "✓ No monthly renewals needed",
      "✓ Save R3,588 vs monthly (12 months)"
    ]
  }
];

interface PremiumDetails {
  reference_number: string;
  amount: number;
  bank_name: string;
  account_number: string;
  branch_code: string;
  account_holder: string;
}

export default function SubscriptionPlans({ currentTier, onSelectPlan }: SubscriptionPlansProps) {
  const router = useRouter();
  const { user, isLoading, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime' | null>(null);
  const [premiumDetails, setPremiumDetails] = useState<PremiumDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRequestPremium = async (planType: 'monthly' | 'lifetime') => {
    // Don't do anything while still loading auth state
    if (isLoading) {
      return;
    }

    // If user is not logged in after loading, redirect to login
    if (!user || !token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedPlan(planType);

    try {
      apiClient.setToken(token);
      const response = await apiClient.get('/api/auth/premium-listing/request/');
      
      if (response.success) {
        const amount = planType === 'monthly' ? 299.00 : 2990.00;
        const eftDetails = response.eft_details || {};
        
        setPremiumDetails({
          reference_number: eftDetails.reference || `PREMIUM${user.id}${Date.now().toString().slice(-6)}`,
          amount: amount,
          bank_name: eftDetails.bank_name || 'Nedbank',
          account_number: eftDetails.account_number || '1313872032',
          branch_code: eftDetails.branch_code || '198765',
          account_holder: eftDetails.account_holder || 'ProConnectSA (Pty) Ltd'
        });
        
        setShowPremiumModal(true);
      } else {
        setError(response.message || 'Failed to get premium details');
      }
    } catch (err: any) {
      console.error('Error requesting premium:', err);
      setError(err.message || 'Failed to request premium listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Upgrade plan</h2>
        <p className="text-gray-600 text-lg mb-2">
          Request a premium plan for more leads and better value.
        </p>
        <p className="text-sm text-gray-500">
          Your current plan: <span className="font-semibold">pay as you go</span>
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {premiumPlans.map((plan) => (
          <Card 
            key={plan.name}
            className={`relative rounded-2xl border-2 transition-all hover:scale-105 h-full ${
              plan.popular 
                ? "border-purple-500 shadow-2xl shadow-purple-200" 
                : "border-gray-200 shadow-lg hover:shadow-xl"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Star size={14} className="fill-current" />
                Most Popular
              </div>
            )}
            
            <CardContent className="p-6 text-center h-full flex flex-col">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">R{plan.price.toLocaleString()}</span>
                  <span className="text-gray-500 text-lg">/{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <div className="flex-grow mb-6">
                <ul className="space-y-3 text-left">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div className="mt-auto">
                <Button 
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  }`}
                  onClick={() => handleRequestPremium(plan.name === "Monthly Premium" ? 'monthly' : 'lifetime')}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Request Premium Listing"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-gray-600">
          Premium listing gives you unlimited FREE leads. No credit deductions when you unlock leads.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Payment via EFT. Premium activates automatically once payment is confirmed.
        </p>
      </div>

      {/* Premium Payment Modal */}
      {showPremiumModal && premiumDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Premium Listing Payment</h3>
              <button
                onClick={() => {
                  setShowPremiumModal(false);
                  setPremiumDetails(null);
                  setSelectedPlan(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Plan Info */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">
                  {selectedPlan === 'monthly' ? 'Monthly Premium' : 'Lifetime Premium'}
                </h4>
                <p className="text-2xl font-bold text-purple-900">
                  R{premiumDetails.amount.toLocaleString()}
                  {selectedPlan === 'monthly' && <span className="text-lg font-normal text-purple-700">/month</span>}
                </p>
                <p className="text-sm text-purple-700 mt-2">
                  {selectedPlan === 'monthly' 
                    ? 'Unlimited FREE leads for 1 month'
                    : 'Unlimited FREE leads forever (lifetime)'}
                </p>
              </div>

              {/* Account Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Account Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bank:</span>
                    <span className="text-sm font-medium">{premiumDetails.bank_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Account Number:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{premiumDetails.account_number}</span>
                      <button
                        onClick={() => copyToClipboard(premiumDetails.account_number)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Copy account number"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Branch Code:</span>
                    <span className="text-sm font-medium">{premiumDetails.branch_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Account Holder:</span>
                    <span className="text-sm font-medium">{premiumDetails.account_holder}</span>
                  </div>
                </div>
              </div>
              
              {/* Reference Number - Most Important */}
              <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">⚠️ Payment Reference (REQUIRED)</h4>
                <div className="flex items-center justify-between bg-white border-2 border-blue-400 rounded-lg p-3 mb-2">
                  <span className="font-mono text-lg font-bold text-blue-600">
                    {premiumDetails.reference_number}
                  </span>
                  <button
                    onClick={() => copyToClipboard(premiumDetails.reference_number)}
                    className="text-blue-600 hover:text-blue-700 ml-2"
                    title="Copy reference number"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-blue-700 font-semibold">
                  ⚠️ IMPORTANT: Use this EXACT reference when making payment. Premium activates automatically once payment is confirmed.
                </p>
              </div>

              {/* Amount */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-green-900">Amount to Pay:</span>
                  <span className="text-2xl font-bold text-green-600">
                    R{premiumDetails.amount.toLocaleString()}
                  </span>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Payment Instructions</h4>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Make an EFT payment of <strong>R{premiumDetails.amount.toLocaleString()}</strong> to the account above</li>
                  <li>Use the reference number: <strong className="font-mono">{premiumDetails.reference_number}</strong></li>
                  <li>Premium listing activates automatically within 5 minutes of payment confirmation</li>
                  <li>You'll receive an email confirmation once activated</li>
                  <li>Contact support if premium doesn't activate within 30 minutes</li>
                </ul>
              </div>

              {/* Benefits Reminder */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">What You Get:</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>⭐ Unlimited FREE leads (no credit deductions)</li>
                  <li>✓ Enhanced visibility in public directory</li>
                  <li>✓ Priority matching for new leads</li>
                  <li>✓ Featured placement in search results</li>
                  <li>✓ Premium badge on your profile</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowPremiumModal(false);
                  setPremiumDetails(null);
                  setSelectedPlan(null);
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
            <p className="text-gray-700 mb-4">{error}</p>
            <button
              onClick={() => setError(null)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



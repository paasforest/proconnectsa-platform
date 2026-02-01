"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

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

export default function SubscriptionPlans({ currentTier, onSelectPlan }: SubscriptionPlansProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRequestPremium = async (planType: 'monthly' | 'lifetime') => {
    // Don't do anything while still loading auth state
    if (isLoading) {
      return;
    }

    // If user is not logged in after loading, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    // If user is logged in, redirect to settings page where premium request is handled
    // The settings page will handle the premium request properly
    router.push('/dashboard/settings');
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
    </div>
  );
}



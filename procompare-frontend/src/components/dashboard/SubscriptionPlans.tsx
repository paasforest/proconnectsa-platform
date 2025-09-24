import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star, Mail } from "lucide-react";
import { motion } from "framer-motion";

interface SubscriptionPlan {
  name: string;
  price: number;
  leads: string;
  popular: boolean;
  color: string;
  features: string[];
  savings?: string;
}

interface SubscriptionPlansProps {
  currentTier?: string | null;
  onSelectPlan: (plan: string) => void;
}

const plans: SubscriptionPlan[] = [
  {
    name: "Basic",
    price: 299,
    leads: "5 leads",
    popular: false,
    color: "slate",
    features: ["5 leads per month", "Email support", "Basic analytics"],
    savings: "Save 15% vs Pay As You Go"
  },
  {
    name: "Advanced", 
    price: 599,
    leads: "12 leads",
    popular: true,
    color: "blue",
    features: ["12 leads per month", "Priority support", "Advanced analytics", "Lead quality scores"],
    savings: "Save 25% vs Pay As You Go"
  },
  {
    name: "Pro",
    price: 999,
    leads: "30 leads", 
    popular: false,
    color: "purple",
    features: ["30 leads per month", "Phone support", "Premium analytics", "Custom filters", "API access"],
    savings: "Save 35% vs Pay As You Go"
  },
  {
    name: "Enterprise",
    price: 1000,
    leads: "50 leads",
    popular: false,
    color: "emerald",
    features: ["50 leads per month", "Dedicated manager", "Custom integrations", "White-label options", "SLA guarantee"],
    savings: "Save 40% vs Pay As You Go"
  }
];

const getColorClasses = (color: string, isPopular: boolean) => {
  // Use explicit conditional logic to prevent hydration mismatches
  if (color === 'slate') {
    return isPopular ? "border-slate-500 shadow-slate-200" : "border-slate-200 hover:border-slate-300";
  } else if (color === 'blue') {
    return isPopular ? "border-blue-500 shadow-blue-200" : "border-blue-200 hover:border-blue-300";
  } else if (color === 'purple') {
    return isPopular ? "border-purple-500 shadow-purple-200" : "border-purple-200 hover:border-purple-300";
  } else if (color === 'emerald') {
    return isPopular ? "border-emerald-500 shadow-emerald-200" : "border-emerald-200 hover:border-emerald-300";
  }
  // Default fallback
  return isPopular ? "border-gray-500 shadow-gray-200" : "border-gray-200 hover:border-gray-300";
};

const getAccentColor = (color: string) => {
  // Use explicit conditional logic to prevent hydration mismatches
  if (color === 'slate') {
    return "text-slate-600";
  } else if (color === 'blue') {
    return "text-blue-600";
  } else if (color === 'purple') {
    return "text-purple-600";
  } else if (color === 'emerald') {
    return "text-emerald-600";
  }
  // Default fallback
  return "text-gray-600";
};

export default function SubscriptionPlans({ currentTier, onSelectPlan }: SubscriptionPlansProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
        <p className="text-gray-600 text-lg">Upgrade to a subscription for better value and more leads</p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <Card className={`relative rounded-2xl border-2 transition-all hover:scale-105 h-full ${
              plan.popular ? "shadow-2xl" : "shadow-lg hover:shadow-xl"
            } ${getColorClasses(plan.color, plan.popular)}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star size={14} className="fill-current" />
                  Most Popular
                </div>
              )}
              
              <CardContent className="p-6 text-center h-full flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">R{plan.price}</span>
                    <span className="text-gray-500 text-lg">/month</span>
                  </div>
                  <p className={`text-lg font-semibold ${getAccentColor(plan.color)} mb-2`}>
                    {plan.leads} per month
                  </p>
                  {plan.savings && (
                    <p className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full inline-block">
                      {plan.savings}
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="flex-grow mb-6">
                  <ul className="space-y-3 text-left">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check size={16} className="text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="mt-auto">
                  {plan.name === "Enterprise" ? (
                    <Button 
                      variant="outline"
                      className="w-full py-3 rounded-xl font-semibold border-2 hover:bg-gray-50"
                      onClick={() => onSelectPlan(plan.name)}
                    >
                      <Mail size={16} className="mr-2" />
                      Contact Us
                    </Button>
                  ) : (
                    <Button 
                      className={`w-full py-3 rounded-xl font-semibold transition-all ${
                        currentTier === plan.name.toLowerCase()
                          ? "bg-gray-100 text-gray-700 cursor-default"
                          : plan.popular
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                          : "bg-gray-900 hover:bg-gray-800 text-white"
                      }`}
                      onClick={() => onSelectPlan(plan.name)}
                      disabled={currentTier === plan.name.toLowerCase()}
                    >
                      {currentTier === plan.name.toLowerCase() ? "Current Plan" : "Choose Plan"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}



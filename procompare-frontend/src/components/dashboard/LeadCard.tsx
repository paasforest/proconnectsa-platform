import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  MapPin, 
  Users, 
  Zap, 
  Star, 
  TrendingUp, 
  CreditCard, 
  Wallet,
  Wrench, // Electrical
  Droplets, // Plumbing
  TreePine, // Gardening
  Sparkles, // Cleaning
  Home, // Roofing
  Briefcase // Default
} from "lucide-react";
import { motion } from "framer-motion";

interface Lead {
  id: string;
  title: string;
  description: string;
  urgency: "High" | "Medium" | "Low";
  creditCost: number;
  priceInRands?: number;
  pricingReasoning?: string;
  category?: string;
  location?: string;
  timePosted?: "Today" | "This Week" | "Last Week";
  currentClaims?: number;
  totalClaims?: number;
  featured?: boolean;
}

interface LeadCardProps {
  lead: Lead;
  walletBalance: number;
  onClaim: (lead: Lead) => void;
}

// Category icon mapping
const getCategoryIcon = (category?: string) => {
  switch (category?.toLowerCase()) {
    case "electrical":
      return <Wrench size={14} className="text-blue-600" />;
    case "plumbing":
      return <Droplets size={14} className="text-blue-500" />;
    case "gardening":
      return <TreePine size={14} className="text-green-600" />;
    case "cleaning":
      return <Sparkles size={14} className="text-purple-600" />;
    case "roofing":
      return <Home size={14} className="text-orange-600" />;
    default:
      return <Briefcase size={14} className="text-gray-600" />;
  }
};

// Urgency badge styling
const getUrgencyBadge = (urgency: "High" | "Medium" | "Low") => {
  switch (urgency) {
    case "High":
      return "bg-red-100 text-red-600 border-red-200";
    case "Medium":
      return "bg-yellow-100 text-yellow-600 border-yellow-200";
    case "Low":
      return "bg-green-100 text-green-600 border-green-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

// Time posted badge styling
const getTimePostedBadge = (timePosted?: "Today" | "This Week" | "Last Week") => {
  switch (timePosted) {
    case "Today":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "This Week":
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export default function LeadCard({ lead, walletBalance, onClaim }: LeadCardProps) {
  const canAfford = walletBalance >= lead.creditCost;
  const priceInRands = lead.priceInRands || (lead.creditCost * 50); // R50 per credit

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        duration: 0.2
      }}
      className="group h-full"
    >
      <Card className={`rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden relative h-full ${
        (lead.assigned_providers_count || 0) >= (lead.max_providers || 3) 
          ? "bg-gray-50 opacity-75" 
          : "bg-white"
      }`}>
        {/* Featured Badge */}
        {lead.featured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-400 to-orange-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium z-10">
            <Star size={12} className="fill-current" />
            Featured
          </div>
        )}
        
        <CardContent className="p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 pr-4">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
                {lead.title}
              </h3>
              
              {/* Location and Category */}
              <div className="flex items-center gap-2 mb-3">
                {lead.location && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <MapPin size={14} />
                    {lead.location}
                  </span>
                )}
                {lead.category && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
                      {getCategoryIcon(lead.category)}
                      {lead.category}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {/* Time Posted Badge */}
            <span className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium border ${getTimePostedBadge(lead.timePosted)}`}>
              <Clock size={12} />
              {lead.timePosted}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
            {lead.description}
          </p>

          {/* Stats Row */}
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Users size={14} />
              {Math.min(lead.assigned_providers_count || 0, lead.max_providers || 3)}/{lead.max_providers || 3} claimed
            </span>
            <span className={`flex items-center gap-1 font-medium px-2 py-1 rounded-full border text-xs ${getUrgencyBadge(lead.urgency)}`}>
              <TrendingUp size={12} />
              {lead.urgency} priority
            </span>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-auto">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-indigo-600 font-bold text-lg">
                  <CreditCard size={18} />
                  R{priceInRands}
                </span>
                <span className="text-gray-500 text-sm">({lead.creditCost} credits)</span>
              </div>
              {lead.creditCost > 0 && (
                <div className="text-xs text-gray-400 max-w-32 truncate cursor-help" title={lead.pricingReasoning}>
                  {lead.creditCost > 5 ? 'Premium pricing' : lead.creditCost > 2 ? 'Standard pricing' : 'Basic pricing'}
                </div>
              )}
              {lead.creditCost === 0 && (
                <div className="text-xs text-green-600 font-medium">
                  ✓ Already unlocked
                </div>
              )}
            </div>
            
            <Button 
              onClick={() => onClaim(lead)}
              disabled={!canAfford || (lead.assigned_providers_count || 0) >= (lead.max_providers || 3)}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                canAfford && (lead.assigned_providers_count || 0) < (lead.max_providers || 3)
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl" 
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {(lead.assigned_providers_count || 0) >= (lead.max_providers || 3) ? (
                <>
                  <Users size={16} className="mr-1" />
                  Fully Claimed
                </>
              ) : canAfford ? (
                <>
                  <Zap size={16} className="mr-1" />
                  Claim Lead
                </>
              ) : (
                <>
                  <Wallet size={16} className="mr-1" />
                  Low Balance
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

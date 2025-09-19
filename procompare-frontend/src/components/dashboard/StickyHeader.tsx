import React from "react";
import { Button } from "@/components/ui/button";
import { Wallet, CreditCard, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface StickyHeaderProps {
  walletBalance: number;
  billingType: "payg" | "subscription";
  onTopUp: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export default function StickyHeader({ 
  walletBalance, 
  billingType, 
  onTopUp, 
  onRefresh, 
  refreshing 
}: StickyHeaderProps) {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 bg-white/70 backdrop-blur-lg shadow-sm border-b border-gray-200/50"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Wallet Balance */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-xl">
                <Wallet className="text-indigo-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Balance</p>
                <motion.p 
                  key={walletBalance}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold text-gray-900"
                >
                  {walletBalance} Credits
                </motion.p>
              </div>
            </div>
            
            {/* Billing Type Indicator */}
            <div className="hidden sm:flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                billingType === "payg" 
                  ? "bg-blue-100 text-blue-700" 
                  : "bg-purple-100 text-purple-700"
              }`}>
                {billingType === "payg" ? "Pay As You Go" : "Subscription"}
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 hover:bg-gray-50"
            >
              <RefreshCw 
                size={16} 
                className={refreshing ? "animate-spin" : ""} 
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            
            <Button
              onClick={onTopUp}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <CreditCard size={16} />
              Top Up
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}



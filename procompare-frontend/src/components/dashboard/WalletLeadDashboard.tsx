"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/AuthProvider';
import {
  Wallet, Eye, EyeOff, Phone, Mail, MapPin, Clock, Star, TrendingUp, 
  Users, DollarSign, Activity, ChevronDown, MessageSquare, Calendar, 
  CheckCircle, XCircle, AlertCircle, Zap, Target, Plus, Shield, Copy,
  Loader, RefreshCw, Bell, X, Filter, Search, SortDesc, ThumbsDown, 
  Send, Timer, Lock, Unlock, CreditCard, TrendingDown, Award, BarChart3,
  Banknote, Building2, ExternalLink
} from 'lucide-react';
import { apiClient } from '@/lib/api-simple';

// Types
interface Lead {
  id: string;
  name: string;
  masked_name: string;
  location: string;
  masked_location: string;
  city: string;
  area: string;
  timeAgo: string;
  service: string;
  credits: number;
  verifiedPhone: boolean;
  highIntent?: boolean;
  details?: string;
  masked_details?: string;
  email?: string;
  phone?: string;
  masked_phone?: string;
  budget?: string;
  urgency?: 'low' | 'medium' | 'high';
  status?: 'new' | 'responded' | 'interested' | 'quoted' | 'won' | 'lost';
  rating?: number;
  lastActivity?: string;
  isUnlocked?: boolean;
  category: 'residential' | 'commercial' | 'premium';
  email_available?: boolean;
  jobSize?: 'small' | 'medium' | 'large';
  competitorCount?: number;
  leadScore?: number;
  estimatedValue?: string;
  timeline?: string;
  previousHires?: number;
  description?: string;
  qa?: Array<{ question: string; answer: string }>;
  createdAt: string;
  urgent?: boolean;
  hasAdditionalDetails?: boolean;
}

interface Notification {
  id: number;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

// Utility functions
const maskPhone = (phone?: string) => {
  if (!phone) return 'Phone hidden';
  return phone.slice(0, 3) + '***' + phone.slice(-2);
};

const maskEmail = (email?: string) => {
  if (!email) return 'Email hidden';
  const [name, domain] = email.split('@');
  return name.slice(0, 2) + '***@' + domain;
};

const formatTimeAgo = (date: string) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const getUrgencyColor = (urgency?: string) => {
  switch (urgency) {
    case 'high': return 'text-red-600 bg-red-50 border-red-200';
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    default: return 'text-green-600 bg-green-50 border-green-200';
  }
};

// Badge Component
const Badge: React.FC<{ 
  variant: 'success' | 'warning' | 'info' | 'danger'; 
  size?: 'sm' | 'md';
  children: React.ReactNode;
}> = ({ variant, size = 'md', children }) => {
  const baseClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';
  const variantClasses = {
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border border-blue-200',
    danger: 'bg-red-100 text-red-800 border border-red-200'
  };
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </span>
  );
};

// Button Component
const Button: React.FC<{
  variant?: 'primary' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ variant = 'primary', size = 'md', className = '', onClick, disabled = false, children }) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  const variantClasses = {
    primary: disabled 
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: disabled
      ? 'border border-gray-200 text-gray-400 cursor-not-allowed'
      : 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    secondary: disabled
      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500'
  };
  
  return (
    <button 
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Lead Card Component (Left Panel)
const LeadCard: React.FC<{ 
  lead: Lead; 
  isSelected: boolean; 
  onSelect: (lead: Lead) => void;
}> = ({ lead, isSelected, onSelect }) => {
  return (
    <div 
      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={() => onSelect(lead)}
    >
      {/* Header: Name + Credits */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">
            {lead.name ? lead.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="font-semibold text-gray-900">
            {lead.name || 'Unknown U.'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-blue-600">{lead.credits}</span>
          <CreditCard className="w-4 h-4 text-blue-600" />
        </div>
      </div>

      {/* Location */}
      <p className="text-sm text-gray-600 mb-2">
        📍 {lead.masked_location || lead.location || 'Unknown'}
      </p>

      {/* Service */}
      <p className="text-sm font-medium text-gray-800 mb-3">
        {lead.service}
      </p>

      {/* Badges */}
      <div className="flex flex-wrap gap-1 mb-2">
        {lead.verifiedPhone && (
          <Badge variant="success" size="sm">✓ Verified phone</Badge>
        )}
        {lead.highIntent && (
          <Badge variant="warning" size="sm">🔥 High intent</Badge>
        )}
        {lead.details && lead.masked_details && lead.details !== lead.masked_details && (
          <Badge variant="info" size="sm">+ Additional details</Badge>
        )}
      </div>

      {/* Urgency/Time */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{lead.timeAgo || 'Unknown'}</span>
        {lead.urgency === 'high' && (
          <span className="text-red-600 font-medium">🚨 Urgent</span>
        )}
      </div>
    </div>
  );
};

// Lead Details Component (Middle Panel)
const LeadDetails: React.FC<{ 
  selectedLead: Lead | null;
  onUnlockLead: (leadId: string) => void;
}> = ({ selectedLead, onUnlockLead }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (selectedLead) {
      setIsUnlocked(selectedLead.isUnlocked || false);
    }
  }, [selectedLead]);

  const handleUnlockLead = async () => {
    if (selectedLead) {
      try {
        await onUnlockLead(selectedLead.id);
        setIsUnlocked(true);
      } catch (error) {
        console.error('Failed to unlock lead:', error);
      }
    }
  };

  if (!selectedLead) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium mb-2">Select a lead</h3>
          <p>Choose a lead from the list to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-blue-600">
              {selectedLead.name ? selectedLead.name.charAt(0) : 'U'}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {selectedLead.name || 'Unknown Customer'}
            </h1>
            <p className="text-gray-600">
              📍 {selectedLead.masked_location || selectedLead.location || 'Unknown'}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedLead.verifiedPhone && (
            <Badge variant="success">✓ Verified phone</Badge>
          )}
          {selectedLead.highIntent && (
            <Badge variant="warning">🔥 High hiring intent</Badge>
          )}
          {selectedLead.details && selectedLead.masked_details && selectedLead.details !== selectedLead.masked_details && (
            <Badge variant="info">+ Additional details</Badge>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <span className="font-medium">
              {isUnlocked ? selectedLead.phone : maskPhone(selectedLead.phone)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <span className="font-medium">
              {isUnlocked ? selectedLead.email : maskEmail(selectedLead.email)}
            </span>
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Service Request</h2>
        <div className="space-y-3">
          <div>
            <span className="font-medium text-gray-700">Service:</span>
            <p className="text-gray-900">{selectedLead.service}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Budget:</span>
            <p className="text-gray-900">{selectedLead.budget || 'Not specified'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Timeline:</span>
            <p className="text-gray-900">{selectedLead.timeline || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Project Details - Locked/Unlocked State */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Project Details</h2>
        
        {!isUnlocked ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Unlock full details</h3>
            <p className="text-gray-600 mb-4">
              Get access to complete project description, Q&A, and location details
            </p>
            <Button 
              onClick={handleUnlockLead}
              className="bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Unlock for {selectedLead.credits} credits
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-900">{selectedLead.details || 'No description available'}</p>
            </div>
            
            {/* Q&A Section */}
            {selectedLead.qa && selectedLead.qa.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Q&A</h3>
                <div className="space-y-3">
                  {selectedLead.qa.map((item, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4">
                      <p className="font-medium text-gray-800">{item.question}</p>
                      <p className="text-gray-600">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map placeholder */}
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Location</h3>
              <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="w-8 h-8 mx-auto mb-2" />
                  <p>Map view for {selectedLead.location}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="primary" size="lg" className="flex-1">
          Send Quote
        </Button>
        <Button variant="outline" size="lg">
          Save Lead
        </Button>
      </div>
    </div>
  );
};

// Performance Panel Component (Right Panel)
const PerformancePanel: React.FC<{ 
  userStats?: any;
  onTopUp?: () => void;
}> = ({ userStats, onTopUp }) => {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Performance</h2>
        
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">87%</div>
            <div className="text-sm text-gray-600">Response Rate</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">2.4h</div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600">
              {userStats?.credit_balance || 156}
            </div>
            <div className="text-sm text-gray-600">Credits Remaining</div>
          </div>
        </div>
      </div>

      {/* Top Up Credits Section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-900 mb-3">💰 Top Up Credits</h3>
        <p className="text-sm text-green-800 mb-3">
          Need more credits to unlock leads? Top up your account instantly.
        </p>
        <Button 
          onClick={onTopUp}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Top Up Credits
        </Button>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Pro Tip</h3>
        <p className="text-sm text-blue-800">
          Respond within 2 hours to increase your chances of winning the job by 60%
        </p>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Recent Activity</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Lead unlocked - Plumbing job</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Quote sent - Electrical work</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600">New lead available - Cleaning</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const WalletLeadDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [showBankingModal, setShowBankingModal] = useState(false);
  const [depositInstructions, setDepositInstructions] = useState<any>(null);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/leads/wallet/available/');
      setLeads(response.data?.leads || response.leads || []);
    } catch (error) {
      addNotification('error', 'Failed to load leads', 'Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user stats
  const fetchUserStats = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/auth/stats/');
      setUserStats(response);
    } catch (error) {
      // Handle error silently
    }
  }, []);

  // Fetch deposit instructions
  const fetchDepositInstructions = useCallback(async () => {
    try {
      // Get user profile which contains customer_code
      const profileResponse = await apiClient.get('/api/auth/profile/');
      
      // Create banking instructions response using profile data
      const response = {
        success: true,
        customer_code: profileResponse.customer_code,
        account_details: {
          bank_name: 'Nedbank',
          account_number: '1313872032',
          branch_code: '198765',
          account_holder: 'ProConnectSA (Pty) Ltd'
        },
        amount: 100,
        instructions: [
          `Make a deposit of any amount (minimum R50) to the Nedbank account below`,
          `IMPORTANT: Use your customer code: ${profileResponse.customer_code} as reference`,
          '🏦 Nedbank Account: 1313872032',
          '🏦 Branch Code: 198765',
          '🏦 Account Holder: ProConnectSA (Pty) Ltd',
          'Credits will be added automatically within 5 minutes',
          'Contact support if credits don\'t appear within 30 minutes'
        ]
      };
      
      setDepositInstructions(response);
      setShowBankingModal(true);
    } catch (error) {
      console.error('Failed to fetch deposit instructions:', error);
      addNotification('error', 'Service Unavailable', 'The banking service is currently unavailable. Please contact support at +27679518124 for assistance with deposits.');
    }
  }, []);

  // Unlock lead
  const handleUnlockLead = useCallback(async (leadId: string) => {
    try {
      const response = await apiClient.post(`/api/auth/leads/${leadId}/unlock/`);
      
      // Track lead view when unlocking (proper assignment tracking)
      await apiClient.post(`/api/leads/${leadId}/track-view/`);
      
      addNotification('success', 'Lead unlocked', `You now have access to full contact details. ${response.credits_spent} credits deducted.`);
      
      // Update user stats with remaining credits
      setUserStats((prev: any) => prev ? { ...prev, credit_balance: response.remaining_credits } : null);

      // Update the lead in the list
      setLeads((prev: Lead[]) => prev.map(lead =>
        lead.id === leadId ? { ...lead, isUnlocked: true } : lead
      ));

      // Update selected lead if it's the same one
      if (selectedLead?.id === leadId) {
        setSelectedLead((prev: Lead | null) => prev ? { ...prev, isUnlocked: true } : null);
      }
    } catch (error: any) {
      console.error('Failed to unlock lead:', error);
      
      // Handle user-friendly error messages from backend
      if (error.response?.data?.user_friendly) {
        const errorData = error.response.data;
        addNotification('error', errorData.error, errorData.message);
        
        // If there's a suggestion, show it as an info notification
        if (errorData.suggestion) {
          setTimeout(() => {
            addNotification('info', 'Tip', errorData.suggestion);
          }, 2000);
        }
      } else if (error.response?.status === 400) {
        // Handle insufficient credits or other 400 errors
        const errorData = error.response.data;
        if (errorData.error === 'Insufficient credits') {
          addNotification('error', 'Insufficient Credits', 
            `You need ${errorData.credits_needed} credits but only have ${errorData.credits_available}. Deposit R${errorData.deposit_needed} to continue.`);
        } else {
          addNotification('error', 'Unable to unlock', errorData.error || 'Please check your credits and try again.');
        }
      } else {
        // Generic error fallback
        addNotification('error', 'Failed to unlock lead', 'Please check your credits and try again.');
      }
    }
  }, [selectedLead]);

  // Add notification
  const addNotification = useCallback((type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, title, message }]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // Dismiss notification
  const dismissNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Set up API client with token
  useEffect(() => {
    if (user !== null && token) {
      apiClient.setToken(token);
    }
  }, [status, session]);

  // Load data on mount
  useEffect(() => {
    if (user !== null) {
      fetchLeads();
      fetchUserStats();
    }
  }, [status, fetchLeads, fetchUserStats]);

  if (false) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Lead Dashboard</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Wallet className="w-4 h-4" />
              <span>{userStats?.credit_balance || 0} credits</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchDepositInstructions}
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Top Up Credits
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchLeads}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main content area - Three panel layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* LEFT: Lead List (25%) */}
        <div className="col-span-3 border-r bg-white overflow-y-auto">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">Available Leads</h2>
            <p className="text-sm text-gray-600">{leads.length} leads available</p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div>
              {leads.map(lead => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  isSelected={selectedLead?.id === lead.id}
                  onSelect={setSelectedLead}
                />
              ))}
              {leads.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No leads available at the moment</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MIDDLE: Lead Details (50%) */}
        <div className="col-span-6 bg-gray-50 overflow-y-auto">
          <LeadDetails 
            selectedLead={selectedLead}
            onUnlockLead={handleUnlockLead}
          />
        </div>

        {/* RIGHT: Performance/Stats (25%) */}
        <div className="col-span-3 border-l bg-white overflow-y-auto">
          <PerformancePanel userStats={userStats} onTopUp={fetchDepositInstructions} />
        </div>
      </div>

      {/* Banking Details Modal */}
      {showBankingModal && depositInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  Banking Details
                </h2>
                <button
                  onClick={() => setShowBankingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Account Details */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">Account Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Name:</span>
                      <span className="font-medium">{depositInstructions.account_details?.account_holder || depositInstructions.deposit_instructions?.account_name || 'ProConnectSA (Pty) Ltd'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Number:</span>
                      <span className="font-mono font-medium">{depositInstructions.account_details?.account_number || depositInstructions.deposit_instructions?.account_number || '1313872032'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank:</span>
                      <span className="font-medium">{depositInstructions.account_details?.bank_name || depositInstructions.deposit_instructions?.bank || 'Nedbank'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Branch Code:</span>
                      <span className="font-mono font-medium">{depositInstructions.account_details?.branch_code || depositInstructions.deposit_instructions?.branch_code || '198765'}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Code */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-3">Your Customer Code</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Reference Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-bold text-green-600 bg-white px-3 py-1 rounded border">
                        {depositInstructions.customer_code || 'Loading...'}
                      </span>
                      <button
                        onClick={() => {
                          if (depositInstructions.customer_code) {
                            navigator.clipboard.writeText(depositInstructions.customer_code);
                            addNotification('success', 'Copied!', 'Customer code copied to clipboard');
                          }
                        }}
                        className="p-1 hover:bg-green-100 rounded"
                        disabled={!depositInstructions.customer_code}
                      >
                        <Copy className="w-4 h-4 text-green-600" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-green-700 mt-2">
                    ⚠️ Always use this exact reference when making deposits
                  </p>
                </div>

                {/* Deposit Instructions */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">How to Deposit</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <p className="text-gray-700">Go to any ATM or bank branch</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <p className="text-gray-700">Select "Deposit" or "Cash Deposit"</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <p className="text-gray-700">Enter the reference number: <code className="font-mono bg-white px-1 rounded">{depositInstructions.customer_code || 'Your Customer Code'}</code></p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                      <p className="text-gray-700">Deposit any amount (minimum R50)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                      <p className="text-gray-700">Credits will be added automatically within 5 minutes</p>
                    </div>
                  </div>
                </div>

                {/* Credit Conversion */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">Credit Conversion</h3>
                  <p className="text-yellow-800">
                    <strong>R50 = 1 Credit</strong> - Your credits will be calculated automatically based on your deposit amount.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowBankingModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(depositInstructions.customer_code);
                      addNotification('success', 'Copied!', 'Customer code copied to clipboard');
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Reference
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`max-w-sm rounded-xl shadow-lg p-4 backdrop-blur-sm border transform transition-all duration-300 ease-out ${
              notification.type === 'success'
                ? 'bg-green-50/95 border-green-200'
                : notification.type === 'error'
                ? 'bg-red-50/95 border-red-200'
                : 'bg-blue-50/95 border-blue-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{notification.title}</h4>
                <p className="text-sm mt-1 opacity-90">{notification.message}</p>
              </div>
              <button 
                onClick={() => dismissNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600 ml-3 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletLeadDashboard;

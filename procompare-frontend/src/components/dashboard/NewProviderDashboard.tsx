'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { 
  Bell, Settings, Star, Zap, Droplets, Home, Wrench, Hammer, Paintbrush,
  MapPin, Clock, DollarSign, Filter, RefreshCw, User, Shield, Award,
  CreditCard, Wallet, TrendingUp, Eye, CheckCircle, AlertCircle,
  Copy, Download, Calendar, Phone, Mail, ExternalLink, Plus, Minus, LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useNotifications } from '@/hooks/use-notifications';

// Fetcher function for SWR
const fetcher = async (url: string, token: string) => {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Token ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

const NewProviderDashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('payAsYouGo');
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    areas: [],
    budget: 'all'
  });
  const [notifications, setNotifications] = useState([]);

  // WebSocket integration
  const { socket, isConnected } = useWebSocket();
  const { notifications: wsNotifications } = useNotifications();

  // Fetch real provider data from Hetzner backend
  const token = (session as any)?.accessToken || (session as any)?.token;
  const API_BASE = 'http://128.140.123.48:8000';
  const { data: profile, mutate: mutateProfile } = useSWR(token ? [`${API_BASE}/api/auth/profile/`, token] : null, ([url, token]) => fetcher(url, token));
  const { data: stats, mutate: mutateStats } = useSWR(token ? [`${API_BASE}/api/auth/stats/`, token] : null, ([url, token]) => fetcher(url, token));
  const { data: leads, mutate: mutateLeads } = useSWR(token ? [`${API_BASE}/api/leads/wallet/available/`, token] : null, ([url, token]) => fetcher(url, token));
  const { data: myClaims, mutate: mutateClaims } = useSWR(token ? [`${API_BASE}/api/auth/leads/my-claims/`, token] : null, ([url, token]) => fetcher(url, token));
  const { data: deposits, mutate: mutateDeposits } = useSWR(token ? [`${API_BASE}/api/payments/dashboard/deposits/`, token] : null, ([url, token]) => fetcher(url, token));

  // Handle WebSocket events
  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const handleLeadUpdate = (data: any) => {
        mutateLeads();
        toast.success('New lead available!');
      };

      const handleLeadClaimed = (data: any) => {
        mutateLeads();
        mutateClaims();
        toast.info('Lead claimed by another provider');
      };

      // Use addEventListener instead of socket.on for WebSocket
      socket.addEventListener('message', (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'lead_created') {
            handleLeadUpdate(message);
          } else if (message.type === 'lead_claimed') {
            handleLeadClaimed(message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      return () => {
        socket.removeEventListener('message', handleLeadUpdate);
        socket.removeEventListener('message', handleLeadClaimed);
      };
    }
  }, [socket, mutateLeads, mutateClaims]);

  // Calculate wallet balance from deposits
  const walletBalance = deposits?.deposits?.reduce((total: number, deposit: any) => {
    return total + (deposit.status === 'completed' ? deposit.amount : 0);
  }, 0) || 0;

  // Calculate credits from profile
  const credits = profile?.credit_balance || 0;

  const serviceCategories = [
    { id: 'plumbing', name: 'Plumbing', icon: Droplets, count: 12 },
    { id: 'electrical', name: 'Electrical', icon: Zap, count: 8 },
    { id: 'cleaning', name: 'Cleaning', icon: Home, count: 23 },
    { id: 'handyman', name: 'Handyman', icon: Hammer, count: 15 },
    { id: 'maintenance', name: 'Maintenance', icon: Wrench, count: 9 },
    { id: 'painting', name: 'Painting', icon: Paintbrush, count: 6 }
  ];

  const handleClaimLead = async (leadId: string, cost: number) => {
    if (credits < cost) {
      toast.error('Insufficient credits. Please top up your wallet.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/leads/bark/${leadId}/claim/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${(session as any)?.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Lead claimed successfully! ${result.credit_cost} credits deducted.`);
        mutateLeads();
        mutateClaims();
        mutateProfile();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to claim lead');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  const handleTopUp = async (amount: number) => {
    try {
      const response = await fetch('/api/payments/create-deposit/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${(session as any)?.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Deposit request created! Reference: ${result.reference_number || result.id}`);
        mutateDeposits();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to create deposit request');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  const copyCustomerCode = () => {
    const customerCode = profile?.customer_code || `PC-SA-2024-${profile?.id?.slice(-4) || 'XXXX'}`;
    navigator.clipboard.writeText(customerCode);
    toast.success('Customer code copied to clipboard!');
  };

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint if we have a token
      if (session?.accessToken) {
        try {
          await apiClient.logout();
        } catch (error) {
          console.warn('Backend logout failed, continuing with frontend logout:', error);
        }
      }
      
      // Clear API client token
      apiClient.setToken(null);
      
      // Sign out from NextAuth
      await signOut({ 
        redirect: false,
        callbackUrl: '/login'
      });
      
      // Clear any local storage
      localStorage.removeItem('api_token');
      localStorage.removeItem('user_data');
      
      // Redirect to login
      router.push('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout');
      // Force redirect even if signOut fails
      router.push('/login');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch(urgency?.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'within 2 weeks': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'flexible': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      plumbing: Droplets,
      electrical: Zap,
      cleaning: Home,
      handyman: Hammer,
      maintenance: Wrench,
      painting: Paintbrush
    };
    return icons[category] || Wrench;
  };

  if (!profile || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">
                <span className="text-emerald-600">ProConnect</span>
                <span className="text-gray-900">SA</span>
              </h1>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Live' : 'Disconnected'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/settings')}
                className="p-2 text-gray-400 hover:text-gray-500"
                title="Settings"
              >
                <Settings className="w-6 h-6" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500"
                title="Logout"
              >
                <LogOut className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {profile?.business_name || `${profile?.first_name} ${profile?.last_name}` || 'Provider'}
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-medium">
                      {stats?.subscription_tier || 'Basic'} Plan
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Provider Info Panel */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Provider Details */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{profile.business_name || `${profile.first_name} ${profile.last_name}`}</h2>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-600">Verified</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{Number(stats.average_rating || 0).toFixed(1)} ({stats.total_reviews || 0} reviews)</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {Number(stats.job_completion_rate || 0).toFixed(0)}% completion rate
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => mutateLeads()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2 inline" />
                    Refresh
                  </button>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                    <Settings className="w-4 h-4 mr-2 inline" />
                    Settings
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-emerald-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-emerald-600">{stats.leads_claimed_this_month || 0}</div>
                  <div className="text-sm text-emerald-700">Leads This Month</div>
                  <div className="text-xs text-emerald-600">of {stats.monthly_lead_limit || 0} limit</div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">R{walletBalance}</div>
                  <div className="text-sm text-blue-700">Wallet Balance</div>
                  <div className="text-xs text-blue-600">{credits} credits</div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">{Number(stats.average_rating || 0).toFixed(1)}</div>
                  <div className="text-sm text-purple-700">Average Rating</div>
                  <div className="text-xs text-purple-600">{stats.total_reviews || 0} reviews</div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600">{stats.response_time_hours || 'N/A'}</div>
                  <div className="text-sm text-orange-700">Avg Response Time</div>
                  <div className="text-xs text-orange-600">Last 30 days</div>
                </div>
              </div>
            </div>

            {/* Customer Code & Wallet */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-500 to-blue-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold">Customer Reference Code</h3>
                  <Wallet className="w-6 h-6" />
                </div>
                <div className="font-mono text-lg font-bold mb-2">
                  {profile.customer_code || `PC-SA-2024-${profile.id?.slice(-4) || 'XXXX'}`}
                </div>
                <p className="text-emerald-100 text-sm mb-4">
                  Use this code for manual banking deposits or customer reference
                </p>
                <div className="flex space-x-2">
                  <button 
                    onClick={copyCustomerCode}
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Copy className="w-4 h-4 mr-1 inline" />
                    Copy
                  </button>
                  <button className="flex-1 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Download className="w-4 h-4 mr-1 inline" />
                    Download
                  </button>
                </div>
              </div>

              {/* Quick Top-up */}
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">Quick Top-up</h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[200, 500, 1000, 2000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => handleTopUp(amount)}
                      className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      +R{amount}
                    </button>
                  ))}
                </div>
                <button className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                  <CreditCard className="w-4 h-4 mr-2 inline" />
                  Add Custom Amount
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Areas & Categories */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="text-sm font-medium text-gray-700 mr-2">Service Areas:</span>
              {(stats.service_areas || []).map((area: string) => (
                <span key={area} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mr-2">
                  <MapPin className="w-3 h-3 mr-1" />
                  {area}
                </span>
              ))}
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 mr-2">Categories:</span>
              {(stats.service_categories || []).map((category: string) => (
                <span key={category} className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full mr-2">
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8">
          <button
            onClick={() => setActiveTab('payAsYouGo')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'payAsYouGo'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pay As You Go
          </button>
          <button
            onClick={() => setActiveTab('myLeads')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'myLeads'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Leads ({myClaims?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'subscription'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Subscription
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'payAsYouGo' && (
          <div className="grid gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Available Leads</h3>
              <div className="text-sm text-gray-600">
                Showing {leads?.leads?.length || 0} leads • Updated 2 minutes ago
              </div>
            </div>
            
            {leads?.leads?.map((lead: any) => {
              const CategoryIcon = getCategoryIcon(lead.service_category);
              const canClaim = credits >= lead.credit_cost && lead.can_claim;
              
              return (
                <div key={lead.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          <CategoryIcon className="w-5 h-5 text-emerald-600" />
                          <h4 className="text-xl font-bold text-gray-900">{lead.title}</h4>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(lead.urgency)}`}>
                          {lead.urgency}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{lead.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{lead.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{lead.budget_range}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{lead.urgency}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{lead.assigned_count}/{lead.max_providers} claims</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6 text-right">
                      <div className="bg-emerald-50 p-4 rounded-xl mb-3">
                        <div className="text-2xl font-bold text-emerald-600">{lead.credit_cost}</div>
                        <div className="text-sm text-emerald-700">Credit Cost</div>
                      </div>
                      
                      <button
                        onClick={() => handleClaimLead(lead.id, lead.credit_cost)}
                        disabled={!canClaim}
                        className={`w-full px-6 py-3 rounded-xl font-bold transition-colors ${
                          canClaim
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {canClaim ? 'Claim Lead' : 'Insufficient Credits'}
                      </button>
                      
                      <p className="text-xs text-gray-500 mt-2">{lead.pricing_reasoning}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'myLeads' && (
          <div className="grid gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">My Claimed Leads</h3>
              <div className="text-sm text-gray-600">
                {myClaims?.length || 0} active leads
              </div>
            </div>
            
            {myClaims?.map((lead: any) => (
              <div key={lead.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-xl font-bold text-gray-900">{lead.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        lead.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {lead.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{lead.location_suburb}, {lead.location_city}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{lead.budget_range}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Claimed {new Date(lead.claimed_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {lead.next_action && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <div className="font-medium text-blue-900">Next Action:</div>
                        <div className="text-blue-700">{lead.next_action}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-6 space-y-2">
                    {lead.customer_contact && (
                      <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors">
                        <Phone className="w-4 h-4" />
                        <span>Call Customer</span>
                      </button>
                    )}
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors w-full">
                      <ExternalLink className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="grid gap-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h3>
              <p className="text-gray-600">Upgrade your plan to get more leads and better features</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "Basic", price: "R299/month", leads: "Up to 10 leads", current: false },
                { name: "Advanced", price: "R599/month", leads: "Up to 25 leads", current: false },
                { name: "Pro", price: "R999/month", leads: "Up to 50 leads", current: true },
                { name: "Enterprise", price: "R1,899/month", leads: "Unlimited leads", current: false }
              ].map((plan, index) => (
                <div key={index} className={`bg-white rounded-2xl p-6 border-2 ${
                  plan.current ? 'border-emerald-500 ring-4 ring-emerald-100' : 'border-gray-200'
                } relative`}>
                  {plan.current && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-emerald-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                        CURRENT PLAN
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-emerald-600 mb-2">{plan.price}</div>
                    <div className="text-sm text-gray-600 mb-6">{plan.leads}</div>
                    <button className={`w-full py-3 rounded-xl font-bold transition-colors ${
                      plan.current 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}>
                      {plan.current ? 'Current Plan' : 'Upgrade'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewProviderDashboard;

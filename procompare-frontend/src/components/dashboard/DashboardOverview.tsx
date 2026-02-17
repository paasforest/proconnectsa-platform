"use client";

import React, { useState, useEffect } from 'react';
import {
  Users, ShoppingCart, Wallet, MessageSquare, TrendingUp, 
  Clock, Target, DollarSign, Activity, BarChart3, Zap,
  ArrowUpRight, ArrowDownRight, Eye, Star, CheckCircle, Wrench, Crown, AlertCircle, RefreshCw
} from 'lucide-react';
import { apiClient } from '@/lib/api-simple';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PremiumListingUpgrade from './PremiumListingUpgrade';

interface DashboardStats {
  total_leads: number;
  active_leads: number;
  completed_jobs: number;
  total_revenue: number;
  average_rating: number;
  response_rate: number;
  conversion_rate: number;
  profile_views: number;
  avg_response_time?: number;
  total_spent?: number;
  credit_balance: number;
  recent_leads?: Array<{
    id: string;
    title: string;
    location: string;
    budget: string;
    timeAgo: string;
    credits: number;
  }>;
}

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  business_name: string;
  phone: string;
  location: string;
  services: string[];
  subscription_tier: string;
  customer_code: string;
  credit_balance: number;
  is_verified: boolean;
}

const DashboardOverview = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [premiumStatus, setPremiumStatus] = useState<any>(null);
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        apiClient.setToken(token);
        
        const [statsResponse, profileResponse] = await Promise.all([
          apiClient.get('/api/auth/stats/'),
          apiClient.get('/api/auth/profile/')
        ]);
        
        // Check if this is a new user by looking at user data
        const isNewUser = user?.created_at && new Date(user.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000); // Created within last 24 hours
        
        if (isNewUser || !statsResponse?.data) {
          // Show clean data for new users
          setStats({
            total_leads: 0,
            active_leads: 0,
            completed_jobs: 0,
            total_revenue: 0,
            average_rating: 0,
            response_rate: 0,
            conversion_rate: 0,
            profile_views: 0,
            credit_balance: 0, // New users start with 0 credits
            recent_leads: []
          });
        } else {
          // Use API data for existing users
          // Also fetch available leads count for active_leads
          let availableLeadsCount = 0;
          try {
            const leadsResponse = await apiClient.get('/api/leads/wallet/available/');
            const leads = leadsResponse.data?.leads || leadsResponse.leads || [];
            availableLeadsCount = Array.isArray(leads) ? leads.length : 0;
          } catch (e) {
            // If leads fetch fails, use stats data
            availableLeadsCount = statsResponse.data?.active_leads || 0;
          }
          
          setStats({
            total_leads: statsResponse.data.total_leads || 0,
            active_leads: availableLeadsCount || statsResponse.data.active_leads || 0,
            completed_jobs: statsResponse.data.completed_leads || 0,
            total_revenue: statsResponse.data.total_earnings || 0,
            average_rating: 0,
            response_rate: 0,
            conversion_rate: statsResponse.data.conversion_rate || 0,
            profile_views: 0,
            credit_balance: statsResponse.data.credit_balance || user?.wallet_balance || 0,
            recent_leads: []
          });
        }
        
        setProfile(profileResponse?.data || {
          id: user?.id?.toString() || '',
          email: user?.email || '',
          first_name: user?.first_name || '',
          last_name: user?.last_name || '',
          phone: user?.phone || '',
          city: user?.city || '',
          province: user?.province || '',
          subscription_tier: 'basic'
        });
        
        // Fetch premium status if provider
        if (user?.user_type === 'provider' && token) {
          try {
            const premiumResponse = await fetch('/api/backend-proxy/auth/premium-status/', {
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
              }
            });
            if (premiumResponse.ok) {
              const premiumData = await premiumResponse.json();
              setPremiumStatus(premiumData.data || premiumData);
            }
          } catch (error) {
            console.error('Failed to fetch premium status:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Show clean data for new users on error
        setStats({
          total_leads: 0,
          active_leads: 0,
          completed_jobs: 0,
          total_revenue: 0,
          average_rating: 0,
          response_rate: 0,
          conversion_rate: 0,
          profile_views: 0,
          credit_balance: 0, // New users start with 0 credits
          recent_leads: []
        });
        setProfile({
          id: user?.id?.toString() || '',
          email: user?.email || '',
          first_name: user?.first_name || '',
          last_name: user?.last_name || '',
          phone: user?.phone || '',
          city: user?.city || '',
          province: user?.province || '',
          subscription_tier: 'basic'
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, token]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Leads',
      value: stats?.total_leads || 0,
      change: '+12%',
      changeType: 'positive' as const,
      icon: Target,
      color: 'blue',
      description: 'Available leads this month'
    },
    {
      title: 'Active Leads',
      value: stats?.active_leads || 0,
      change: '+8%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
      color: 'green',
      description: 'Leads you\'ve unlocked'
    },
    {
      title: 'Credits Balance',
      value: stats?.credit_balance || 0,
      change: '-2',
      changeType: 'negative' as const,
      icon: Wallet,
      color: 'purple',
      description: 'Available credits'
    },
    {
      title: 'Response Rate',
      value: `${stats?.response_rate || 0}%`,
      change: '+5%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'orange',
      description: 'Your response rate'
    }
  ];

  const quickActions = [
    {
      title: 'Browse Leads',
      description: stats?.active_leads ? `${stats.active_leads} new leads available` : 'Find new opportunities',
      icon: Eye,
      href: '/dashboard/leads-dashboard',
      color: 'blue',
      badge: stats?.active_leads || 0
    },
    {
      title: 'My Leads',
      description: 'View purchased leads',
      icon: ShoppingCart,
      href: '/dashboard/my-leads',
      color: 'green'
    },
    {
      title: 'Add Credits',
      description: 'Top up your wallet',
      icon: Wallet,
      href: '/dashboard/wallet',
      color: 'purple'
    },
    {
      title: 'Upgrade plan',
      description: 'Request premium for more leads',
      icon: Crown,
      href: '/dashboard/upgrade',
      color: 'amber'
    },
    {
      title: 'Manage Services',
      description: 'Update your services',
      icon: Target,
      href: '/dashboard/services',
      color: 'orange'
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Overview
        </h1>
        {user?.created_at && new Date(user.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) ? (
          <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">🎉 Welcome to ProConnectSA!</h2>
            <p className="text-blue-800 mb-2">
              You're all set up! Start by browsing available leads and building your reputation.
            </p>
            <div className="text-sm text-blue-700">
              <p>• You have <strong>0 credits</strong> - complete your profile to earn your first credits!</p>
              <p>• Complete your profile to attract more clients</p>
              <p>• Respond quickly to leads to build your rating</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 mt-2">
            Here's what's happening with your leads and business performance.
          </p>
        )}
        {profile?.location && (
          <p className="text-sm text-gray-500 mt-1">
            📍 Serving {profile.location} • {profile.subscription_tier} Plan
          </p>
        )}
        {profile?.services && profile.services.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              🔧 Services: {profile.services.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Premium Request Status Banner */}
      {premiumStatus?.has_premium_request && premiumStatus.premium_status === 'pending' && (
        <div className={`mb-6 rounded-lg shadow-lg p-4 border-2 ${
          premiumStatus.deposit?.payment_verified 
            ? 'bg-blue-50 border-blue-300' 
            : 'bg-yellow-50 border-yellow-300'
        }`}>
          <div className="flex items-start gap-3">
            {premiumStatus.deposit?.payment_verified ? (
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className={`font-semibold mb-1 ${
                premiumStatus.deposit?.payment_verified ? 'text-blue-900' : 'text-yellow-900'
              }`}>
                Premium Request Status
              </h3>
              <p className={`text-sm mb-2 ${
                premiumStatus.deposit?.payment_verified ? 'text-blue-700' : 'text-yellow-700'
              }`}>
                {premiumStatus.deposit?.payment_verified 
                  ? '✅ Payment verified! Your premium request is pending admin approval.'
                  : `⏳ Payment verification pending. Reference: ${premiumStatus.deposit?.reference_number || 'N/A'}`}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => router.push('/dashboard/settings')}
                  className={`text-sm font-medium px-3 py-1 rounded ${
                    premiumStatus.deposit?.payment_verified 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-yellow-600 text-white hover:bg-yellow-700'
                  }`}
                >
                  View Details
                </button>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/backend-proxy/auth/premium-status/', {
                        headers: {
                          'Authorization': `Token ${token}`,
                          'Content-Type': 'application/json'
                        }
                      });
                      if (response.ok) {
                        const data = await response.json();
                        setPremiumStatus(data.data || data);
                      }
                    } catch (error) {
                      console.error('Failed to refresh:', error);
                    }
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Leads Alert Banner */}
      {stats?.active_leads && stats.active_leads > 0 && (
        <div className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">🎯 New Leads Available!</h3>
                <p className="text-blue-100">
                  You have <strong className="text-white">{stats.active_leads}</strong> new lead{stats.active_leads !== 1 ? 's' : ''} matching your services
                </p>
              </div>
            </div>
            <a
              href="/dashboard/leads-dashboard"
              className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              View Leads →
            </a>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const colorClasses: { [key: string]: string } = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            purple: 'bg-purple-50 text-purple-600',
            orange: 'bg-orange-50 text-orange-600'
          };
          
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[card.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {card.changeType === 'positive' ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
            <p className="text-sm text-gray-600">Latest available opportunities</p>
          </div>
          <div className="p-6">
            {stats?.recent_leads && stats.recent_leads.length > 0 ? (
              <div className="space-y-4">
                {stats.recent_leads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{lead.title}</h3>
                      <p className="text-sm text-gray-600">{lead.location}</p>
                      <p className="text-xs text-gray-500">{lead.timeAgo}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{lead.budget}</p>
                        <p className="text-xs text-gray-500">Budget</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Wallet className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{lead.credits}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent leads available</p>
                <a href="/dashboard/leads-dashboard" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Browse all leads
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-600">Common tasks</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const colorClasses: { [key: string]: string } = {
                  blue: 'bg-blue-50 text-blue-600',
                  green: 'bg-green-50 text-green-600',
                  purple: 'bg-purple-50 text-purple-600',
                  orange: 'bg-orange-50 text-orange-600',
                  amber: 'bg-amber-50 text-amber-600'
                };
                
                return (
                  <a
                    key={index}
                    href={action.href}
                    className="flex items-center p-4 rounded-lg hover:bg-gray-50 transition-colors relative"
                  >
                    <div className={`p-2 rounded-lg ${colorClasses[action.color]} mr-4`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                        {(action as any).badge > 0 && (
                          <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                            {(action as any).badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Response Time</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.avg_response_time || 'N/A'}</p>
          <p className="text-sm text-gray-600 mt-1">Average response time</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.conversion_rate || 0}%</p>
          <p className="text-sm text-gray-600 mt-1">Lead to customer rate</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Spent</h3>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">R{stats?.total_spent || 0}</p>
          <p className="text-sm text-gray-600 mt-1">This month</p>
        </div>
      </div>

      {/* Premium Listing Upgrade Section - Show only for pay-as-you-go users */}
      {profile?.subscription_tier === 'pay_as_you_go' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <PremiumListingUpgrade 
            currentTier={profile.subscription_tier}
            onUpgradeComplete={() => {
              // Refresh profile data after upgrade request
              window.location.reload();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;








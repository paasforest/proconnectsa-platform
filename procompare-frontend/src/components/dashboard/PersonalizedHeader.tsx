"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Building2, 
  MapPin, 
  Star, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  Settings,
  Bell,
  RefreshCw,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';

interface ProviderStats {
  business_name: string;
  service_categories: string[];
  service_areas: string[];
  average_rating: number;
  total_reviews: number;
  response_time_hours: number;
  job_completion_rate: number;
  leads_claimed_this_month: number;
  monthly_lead_limit: number;
  subscription_tier: string;
  credit_balance: number;
  customer_code: string;
  verification_status: string;
}

interface PersonalizedHeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
  onSettings: () => void;
  onProfile: () => void;
}

export default function PersonalizedHeader({ 
  onRefresh, 
  refreshing, 
  onSettings, 
  onProfile 
}: PersonalizedHeaderProps) {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProviderStats = async () => {
    try {
      // Use the Flask API with authentication
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'}/api/auth/profile/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Token ${token}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile data received:', data);
        if (data.data && data.data.provider_profile) {
          setStats(data.data.provider_profile);
        } else {
          // Check if this is a new user
          const isNewUser = user?.created_at && new Date(user.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
          
          // Use user data from authentication with clean data for new users
          setStats({
            business_name: user?.business_name || `${user?.first_name} ${user?.last_name}` || 'Your Business',
            service_categories: user?.primary_service ? [user.primary_service.toUpperCase()] : ['GENERAL'],
            service_areas: user?.city ? [user.city] : ['Your Area'],
            average_rating: 0,
            total_reviews: 0,
            response_time_hours: isNewUser ? 0 : 24,
            job_completion_rate: 0,
            leads_claimed_this_month: 0,
            monthly_lead_limit: isNewUser ? 5 : 10, // Lower limit for new users
            subscription_tier: 'basic',
            credit_balance: isNewUser ? 0 : (user?.wallet_balance || 0), // New users start with 0 credits
            customer_code: `PC${user?.id || '00000000'}`,
            verification_status: isNewUser ? 'pending' : 'verified'
          });
        }
      } else {
        console.error('Profile API error:', response.status, response.statusText);
        // Check if this is a new user
        const isNewUser = user?.created_at && new Date(user.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        // Use user data from authentication with clean data for new users
        setStats({
          business_name: user?.business_name || `${user?.first_name} ${user?.last_name}` || 'Your Business',
          service_categories: user?.primary_service ? [user.primary_service.toUpperCase()] : ['GENERAL'],
          service_areas: user?.city ? [user.city] : ['Your Area'],
          average_rating: 0,
          total_reviews: 0,
          response_time_hours: isNewUser ? 0 : 24,
          job_completion_rate: 0,
          leads_claimed_this_month: 0,
          monthly_lead_limit: isNewUser ? 5 : 10,
          subscription_tier: 'basic',
          credit_balance: isNewUser ? 0 : (user?.wallet_balance || 0), // New users start with 0 credits
          customer_code: `PC${user?.id || '00000000'}`,
          verification_status: isNewUser ? 'pending' : 'verified'
        });
      }
    } catch (error) {
      console.error('Error fetching provider stats:', error);
      // Check if this is a new user
      const isNewUser = user?.created_at && new Date(user.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Use user data from authentication with clean data for new users
      setStats({
        business_name: user?.business_name || `${user?.first_name} ${user?.last_name}` || 'Your Business',
        service_categories: user?.primary_service ? [user.primary_service.toUpperCase()] : ['GENERAL'],
        service_areas: user?.city ? [user.city] : ['Your Area'],
        average_rating: 0,
        total_reviews: 0,
        response_time_hours: isNewUser ? 0 : 24,
        job_completion_rate: 0,
        leads_claimed_this_month: 0,
        monthly_lead_limit: isNewUser ? 5 : 10,
        subscription_tier: 'basic',
        credit_balance: isNewUser ? 0 : (user?.wallet_balance || 0), // New users start with 0 credits
        customer_code: `PC${user?.id || '00000000'}`,
        verification_status: isNewUser ? 'pending' : 'verified'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch provider stats when component mounts or user changes
    if (user) {
      fetchProviderStats();
    }
  }, [user]);

  const getSubscriptionColor = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'pro':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'advanced':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'basic':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getVerificationStatus = (status: string) => {
    switch (status) {
      case 'verified':
        return { color: 'text-green-600', icon: CheckCircle2, text: 'Verified' };
      case 'pending':
        return { color: 'text-yellow-600', icon: Clock, text: 'Pending' };
      case 'rejected':
        return { color: 'text-red-600', icon: Clock, text: 'Rejected' };
      default:
        return { color: 'text-gray-600', icon: Clock, text: 'Unknown' };
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>Loading provider information...</p>
          </div>
        </div>
      </div>
    );
  }

  const verificationInfo = getVerificationStatus(stats.verification_status || 'unknown');
  const VerificationIcon = verificationInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700"
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Business Header - Vertical Layout */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {stats.business_name || 'Provider'}
                </h1>
                <Badge className={getSubscriptionColor(stats.subscription_tier || 'basic')}>
                  {(stats.subscription_tier || 'basic').toUpperCase()}
                </Badge>
                <div className={`flex items-center gap-1 ${verificationInfo.color}`}>
                  <VerificationIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">{verificationInfo.text}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Business Info - Vertical Stack */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>
                <strong>Service Areas:</strong> {stats.service_areas?.slice(0, 2).join(', ') || 'No areas'}
                {stats.service_areas && stats.service_areas.length > 2 && (
                  <span> +{stats.service_areas.length - 2} more</span>
                )}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span><strong>Services:</strong> {stats.service_categories?.length || 0} categories</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span><strong>Response Time:</strong> {stats.response_time_hours || 0}h average</span>
            </div>
          </div>
        </div>

        {/* Stats Grid - Vertical Layout */}
        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-3">
              <CardContent className="p-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.leads_claimed_this_month || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Leads this month
                  </div>
                  <div className="text-xs text-gray-500">
                    / {stats.monthly_lead_limit || 0}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-3">
              <CardContent className="p-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.credit_balance || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Credits
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-3">
              <CardContent className="p-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Number(stats.average_rating || 0).toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Rating
                  </div>
                  <div className="text-xs text-gray-500">
                    ({(stats.total_reviews || 0)} reviews)
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-3">
              <CardContent className="p-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Number(stats.job_completion_rate || 0).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Completion
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons - Vertical Layout */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onProfile}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onSettings}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
          </div>
        </div>

        {/* Service Categories */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Your Services
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.service_categories?.length ? (
              stats.service_categories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category.replace('_', ' ').toUpperCase()}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">No services configured</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}




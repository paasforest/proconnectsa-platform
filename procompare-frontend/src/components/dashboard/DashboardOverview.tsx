"use client";

import React, { useState, useEffect } from 'react';
import {
  Users, ShoppingCart, Wallet, MessageSquare, TrendingUp, 
  Clock, Target, DollarSign, Activity, BarChart3, Zap,
  ArrowUpRight, ArrowDownRight, Eye, Star
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useSession } from 'next-auth/react';

interface DashboardStats {
  total_leads: number;
  active_leads: number;
  completed_jobs: number;
  average_rating: number;
  response_rate: number;
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

const DashboardOverview = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        if (session?.accessToken) {
          apiClient.setToken(session.accessToken);
        }
        const response = await apiClient.get('/api/auth/stats/');
        setStats(response);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.accessToken) {
      fetchDashboardStats();
    }
  }, [session?.accessToken]);

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
      description: 'Find new opportunities',
      icon: Eye,
      href: '/dashboard/leads',
      color: 'blue'
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your leads.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const colorClasses = {
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
                <a href="/dashboard/leads" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
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
                const colorClasses = {
                  blue: 'bg-blue-50 text-blue-600',
                  green: 'bg-green-50 text-green-600',
                  purple: 'bg-purple-50 text-purple-600',
                  orange: 'bg-orange-50 text-orange-600'
                };
                
                return (
                  <a
                    key={index}
                    href={action.href}
                    className="flex items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${colorClasses[action.color]} mr-4`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  );
};

export default DashboardOverview;








"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Search, Filter, MapPin, Clock, DollarSign, Phone, Mail, 
  Eye, EyeOff, Unlock, Lock, Star, Zap, Target, Users,
  ChevronDown, SortAsc, SortDesc, RefreshCw, AlertCircle, Wallet
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { trackLeadViewDebounced } from '@/lib/leadTracking';

interface Lead {
  id: string;
  name: string;
  masked_name: string;
  location: string;
  masked_location: string;
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
  timeAgo: string;
  category: 'residential' | 'commercial' | 'premium';
  jobSize?: 'small' | 'medium' | 'large';
  leadScore?: number;
  estimatedValue?: string;
  timeline?: string;
  isUnlocked?: boolean;
}

interface FilterOptions {
  service: string;
  location: string;
  budget: string;
  urgency: string;
  category: string;
  verified: boolean;
  highIntent: boolean;
}

const LeadsPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    service: '',
    location: '',
    budget: '',
    urgency: '',
    category: '',
    verified: false,
    highIntent: false
  });
  const [unlockingLead, setUnlockingLead] = useState<string | null>(null);

  // Authentication
  const { data: session, status } = useSession();

  const serviceCategories = [
    'Plumbing', 'Electrical', 'Cleaning', 'Legal', 'Marketing', 
    'Web Design', 'Photography', 'Catering', 'Landscaping', 'Other'
  ];

  const budgetRanges = [
    'Under R1,000', 'R1,000 - R5,000', 'R5,000 - R10,000', 
    'R10,000 - R25,000', 'R25,000+'
  ];

  const urgencyLevels = ['Low', 'Medium', 'High'];

  // Set up API client with token
  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      apiClient.setToken(session.accessToken);
    }
  }, [status, session]);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    if (status !== 'authenticated') return;
    
    try {
      setLoading(true);
      console.log('🔍 Fetching leads from API...');
      const response = await apiClient.get('/api/leads/wallet/available/');
      console.log('📊 API Response:', response);
      setLeads(response.leads || []);
      console.log('✅ Leads set:', response.leads?.length || 0, 'leads');
    } catch (error) {
      console.error('❌ Failed to fetch leads:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      // Set empty array on error to prevent infinite loading
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLeads();
    }
  }, [status, fetchLeads]);

  // Unlock lead
  const handleUnlockLead = async (leadId: string) => {
    try {
      setUnlockingLead(leadId);
      console.log('🔓 Attempting to unlock lead:', leadId);
      
      // Use the correct wallet unlock endpoint
      const response = await apiClient.post(`/api/auth/api/leads/${leadId}/unlock/`);
      
      console.log('✅ Lead unlocked successfully:', response);
      
      // Update the lead in the list
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId 
            ? { ...lead, isUnlocked: true, ...response }
            : lead
        )
      );
      
      // Refresh leads to get updated data
      fetchLeads();
    } catch (error: any) {
      console.error('❌ Failed to unlock lead:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to unlock lead. Please try again.';
      
      if (error.response?.data) {
        if (error.response.data.user_friendly) {
          errorMessage = error.response.data.message || error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      alert(errorMessage);
    } finally {
      setUnlockingLead(null);
    }
  };

  // Filter and sort leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.masked_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.masked_location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = 
      (!filters.service || lead.service.toLowerCase().includes(filters.service.toLowerCase())) &&
      (!filters.location || lead.masked_location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.urgency || lead.urgency === filters.urgency.toLowerCase()) &&
      (!filters.category || lead.category === filters.category.toLowerCase()) &&
      (!filters.verified || lead.verifiedPhone) &&
      (!filters.highIntent || lead.highIntent);

    return matchesSearch && matchesFilters;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.timeAgo).getTime() - new Date(a.timeAgo).getTime();
      case 'oldest':
        return new Date(a.timeAgo).getTime() - new Date(b.timeAgo).getTime();
      case 'credits_low':
        return a.credits - b.credits;
      case 'credits_high':
        return b.credits - a.credits;
      case 'urgency':
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        return (urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 0) - 
               (urgencyOrder[a.urgency as keyof typeof urgencyOrder] || 0);
      default:
        return 0;
    }
  });

  // Track views when leads are loaded
  useEffect(() => {
    if (filteredLeads.length > 0) {
      filteredLeads.forEach(lead => {
        trackLeadViewDebounced(lead.id);
      });
    }
  }, [filteredLeads]);

  const clearFilters = () => {
    setFilters({
      service: '',
      location: '',
      budget: '',
      urgency: '',
      category: '',
      verified: false,
      highIntent: false
    });
    setSearchTerm('');
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'commercial': return 'bg-blue-100 text-blue-800';
      case 'residential': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show unauthenticated state
  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-400" />
          <p className="text-gray-600">Please log in to view leads</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Available Leads</h1>
        <p className="text-gray-600 mt-2">Browse and purchase leads from your service areas</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="credits_low">Credits: Low to High</option>
              <option value="credits_high">Credits: High to Low</option>
              <option value="urgency">Urgency</option>
            </select>

            <button
              onClick={fetchLeads}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                <select
                  value={filters.service}
                  onChange={(e) => setFilters({...filters, service: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Services</option>
                  {serviceCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                <select
                  value={filters.urgency}
                  onChange={(e) => setFilters({...filters, urgency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Urgency</option>
                  {urgencyLevels.map(level => (
                    <option key={level} value={level.toLowerCase()}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => setFilters({...filters, verified: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Verified Phone Only</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.highIntent}
                  onChange={(e) => setFilters({...filters, highIntent: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">High Intent Only</span>
              </label>

              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredLeads.length} of {leads.length} leads
        </p>
      </div>

      {/* Leads Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {lead.isUnlocked ? lead.name : lead.masked_name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {lead.isUnlocked ? lead.location : lead.masked_location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {lead.timeAgo}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(lead.urgency)}`}>
                    {lead.urgency?.toUpperCase() || 'MEDIUM'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(lead.category)}`}>
                    {lead.category.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Service and Budget */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 mb-1">{lead.service}</p>
                {lead.budget && (
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {lead.budget}
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {lead.verifiedPhone && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Phone className="w-3 h-3 mr-1" />
                    Verified
                  </span>
                )}
                {lead.highIntent && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <Zap className="w-3 h-3 mr-1" />
                    High Intent
                  </span>
                )}
                {lead.jobSize && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {lead.jobSize.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Bark-style Competition Stats */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              <span>{lead.views_count || 0} professionals viewed</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{lead.responses_count || 0} responded</span>
            </div>
          </div>
        </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {lead.isUnlocked ? lead.details : lead.masked_details}
                </p>
              </div>

              {/* Contact Info (if unlocked) */}
              {lead.isUnlocked && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    {lead.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {lead.phone}
                      </div>
                    )}
                    {lead.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {lead.email}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Wallet className="w-4 h-4 mr-1" />
                  {lead.credits} credits
                </div>
                <button
                  onClick={() => handleUnlockLead(lead.id)}
                  disabled={unlockingLead === lead.id || lead.isUnlocked}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    lead.isUnlocked
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : unlockingLead === lead.id
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {unlockingLead === lead.id ? (
                    <div className="flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Unlocking...
                    </div>
                  ) : lead.isUnlocked ? (
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      Unlocked
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Unlock className="w-4 h-4 mr-2" />
                      Unlock Lead
                    </div>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadsPage;




import React, { useState, useEffect, useCallback } from 'react';
import { Clock, MapPin, DollarSign, Users, Eye, Lock, CheckCircle, AlertCircle, Star, Calendar, Phone, Mail, User } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { apiClient } from '@/lib/api-simple';
import { useRouter } from 'next/navigation';

const WalletLeadDashboard = () => {
  const { user, token } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // For background refresh indicator
  const [userCredits, setUserCredits] = useState(100);
  const [purchasedLeads, setPurchasedLeads] = useState(new Set());
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [reserveInfo, setReserveInfo] = useState<any | null>(null);
  
  // Cache key for localStorage
  const CACHE_KEY = `proconnectsa_leads_${user?.id || 'guest'}`;
  const CACHE_TIMESTAMP_KEY = `proconnectsa_leads_timestamp_${user?.id || 'guest'}`;
  const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

  // Helper function to show notifications
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000); // Auto-hide after 4 seconds
  };

  // Sample leads data (replace with API call)
  const sampleLeads = [
    {
      id: 1,
      title: "Kitchen Renovation - Modern Design",
      description: "I need a complete kitchen renovation for my 3-bedroom house. Looking for modern design with granite countertops, new cabinets, and updated appliances. The space is approximately 12x15 feet. I have a budget ready and need this completed within 6 weeks.",
      service_category: { name: "Home Renovation", id: 1 },
      location_city: "Johannesburg",
      location_suburb: "Sandton",
      budget_range: "R25,000 - R50,000",
      urgency: "urgent",
      timeline: "Within 1 month",
      created_at: "2024-01-20T10:30:00Z",
      client_name: "Sarah M.", // Partially hidden
      credit_cost: 0, // Will be set by ML pricing
      max_providers: 5,
      current_responses: 2,
      lead_status: "active",
      client_rating: 4.8,
      client_jobs_posted: 12,
      project_details: {
        property_type: "Residential House",
        room_size: "12x15 feet",
        preferred_style: "Modern Contemporary",
        has_permits: true,
        timeline_flexible: false
      },
      hidden_details: {
        full_name: "Sarah Mitchell",
        phone: "+27 11 234 5678",
        email: "sarah.mitchell@email.com",
        exact_address: "123 Rivonia Road, Sandton, Johannesburg"
      }
    },
    {
      id: 2,
      title: "Electrical Installation - New Office",
      description: "Setting up electrical systems for a new office space. Need complete electrical installation including LED lighting, power outlets, network cabling preparation, and circuit breakers. The office is 200 square meters with 15 workstations planned.",
      service_category: { name: "Electrical Services", id: 2 },
      location_city: "Cape Town",
      location_suburb: "Century City",
      budget_range: "R15,000 - R30,000",
      urgency: "medium",
      timeline: "Within 2 months",
      created_at: "2024-01-19T14:20:00Z",
      client_name: "Michael K.",
      credit_cost: 0, // Will be set by ML pricing
      max_providers: 4,
      current_responses: 1,
      lead_status: "active",
      client_rating: 4.5,
      client_jobs_posted: 8,
      project_details: {
        property_type: "Commercial Office",
        space_size: "200 sqm",
        workstations: 15,
        special_requirements: "Network cable preparation",
        compliance_needed: true
      },
      hidden_details: {
        full_name: "Michael Kowalski",
        phone: "+27 21 456 7890",
        email: "michael.k@company.com",
        exact_address: "45 Century Boulevard, Century City, Cape Town"
      }
    },
    {
      id: 3,
      title: "Plumbing Emergency - Burst Pipe Repair",
      description: "Emergency plumbing needed! Burst pipe in main bathroom causing water damage. Need immediate repair and assessment of potential additional damage. Insurance claim will be submitted. Available 24/7 for urgent repair.",
      service_category: { name: "Plumbing", id: 3 },
      location_city: "Durban",
      location_suburb: "Umhlanga",
      budget_range: "R3,000 - R8,000",
      urgency: "urgent",
      timeline: "Immediate",
      created_at: "2024-01-21T08:15:00Z",
      client_name: "Jennifer L.",
      credit_cost: 0, // Will be set by ML pricing
      max_providers: 3,
      current_responses: 3,
      lead_status: "limited",
      client_rating: 4.9,
      client_jobs_posted: 3,
      project_details: {
        property_type: "Residential Apartment",
        emergency_level: "High",
        insurance_claim: true,
        access_available: "24/7",
        water_shut_off: true
      },
      hidden_details: {
        full_name: "Jennifer Lewis",
        phone: "+27 31 789 0123",
        email: "j.lewis@email.com",
        exact_address: "78 Ocean Drive, Umhlanga, Durban"
      }
    },
    {
      id: 4,
      title: "Garden Landscaping - Complete Makeover",
      description: "Complete garden transformation needed for a 500sqm backyard. Want to include irrigation system, new lawn, flower beds, paved pathways, and outdoor entertainment area. Looking for creative design ideas and professional execution.",
      service_category: { name: "Landscaping", id: 4 },
      location_city: "Pretoria",
      location_suburb: "Waterkloof",
      budget_range: "R35,000 - R60,000",
      urgency: "low",
      timeline: "Within 3 months",
      created_at: "2024-01-18T16:45:00Z",
      client_name: "David W.",
      credit_cost: 0, // Will be set by ML pricing
      max_providers: 6,
      current_responses: 0,
      lead_status: "active",
      client_rating: 4.6,
      client_jobs_posted: 5,
      project_details: {
        property_type: "Residential House",
        garden_size: "500 sqm",
        current_state: "Needs complete renovation",
        special_features: "Outdoor entertainment area",
        irrigation_needed: true
      },
      hidden_details: {
        full_name: "David Williams",
        phone: "+27 12 345 6789",
        email: "david.williams@email.com",
        exact_address: "92 Bourke Street, Waterkloof, Pretoria"
      }
    }
  ];

  // Function to calculate ML-based pricing for sample leads
  const calculateMLPricing = (lead) => {
    // Simulate ML pricing based on lead characteristics
    let basePrice = 1; // Base 1 credit
    
    // Urgency multiplier
    if (lead.urgency === 'urgent') basePrice *= 1.5;
    else if (lead.urgency === 'medium') basePrice *= 1.2;
    
    // Budget multiplier (higher budget = higher price)
    const budgetMatch = lead.budget_range.match(/R(\d+),?(\d+)?/);
    if (budgetMatch) {
      const budget = parseInt(budgetMatch[1] + (budgetMatch[2] || '000'));
      if (budget > 50000) basePrice *= 1.8;
      else if (budget > 25000) basePrice *= 1.5;
      else if (budget > 10000) basePrice *= 1.2;
    }
    
    // Service category multiplier
    const categoryMultipliers = {
      'Home Renovation': 1.5,
      'Electrical Services': 1.3,
      'Plumbing': 1.4,
      'Landscaping': 1.2
    };
    basePrice *= categoryMultipliers[lead.service_category.name] || 1.0;
    
    // Client rating multiplier
    if (lead.client_rating >= 4.8) basePrice *= 1.2;
    else if (lead.client_rating >= 4.5) basePrice *= 1.1;
    
    // Round to nearest 0.5 and ensure minimum 1 credit
    return Math.max(1, Math.round(basePrice * 2) / 2);
  };

  // Load cached data immediately
  const loadCachedLeads = useCallback(() => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cachedData && cachedTimestamp) {
        const age = Date.now() - parseInt(cachedTimestamp, 10);
        if (age < CACHE_MAX_AGE) {
          const parsed = JSON.parse(cachedData);
          if (parsed.leads && parsed.leads.length > 0) {
            setLeads(parsed.leads);
            if (parsed.leads[0]) {
              setSelectedLead(parsed.leads[0]);
            }
            if (parsed.credits !== undefined) {
              setUserCredits(parsed.credits);
            }
            return true; // Cache loaded successfully
          }
        }
      }
    } catch (error) {
      console.error('Error loading cached leads:', error);
    }
    return false; // No valid cache
  }, [CACHE_KEY, CACHE_TIMESTAMP_KEY]);

  // Transform API response to our format
  const transformLeads = useCallback((leadsData: any[]) => {
    return leadsData.map((lead, index) => ({
      id: lead.id,
      title: lead.service || lead.title || `Service Request ${index + 1}`,
      description: lead.details || lead.masked_details || lead.description || 'Service details available after purchase',
      service_category: { 
        name: lead.service?.split(' • ')[0] || 'General Services', 
        id: lead.id 
      },
      location_city: lead.masked_location?.split(', ')[1] || lead.location_city || 'Location hidden',
      location_suburb: lead.masked_location?.split(', ')[0] || lead.location_suburb || 'Location hidden',
      budget_range: lead.budget || lead.budget_range || 'Budget available',
      urgency: lead.urgency || 'medium',
      timeline: lead.timeline || 'Flexible',
      created_at: lead.created_at || new Date().toISOString(),
      timeAgo: lead.timeAgo || lead.lastActivity || 'Recently posted',
      client_name: lead.masked_name || 'Client Name',
      credit_cost: lead.credits || lead.credit_cost || 1,
      max_providers: lead.max_providers || 5,
      current_responses: lead.current_responses !== undefined ? lead.current_responses : (lead.assigned_providers_count !== undefined ? lead.assigned_providers_count : (lead.responses_count || 0)),
      lead_status: lead.status || 'active',
      client_rating: lead.rating || 4.5,
      client_jobs_posted: 0,
      project_details: {
        property_type: lead.jobSize || 'Standard',
        special_requirements: lead.category || 'General'
      },
      hidden_details: {
        full_name: lead.name || 'Client Name',
        phone: lead.phone || 'Phone available',
        email: lead.email || 'Email available',
        exact_address: lead.location || lead.masked_location || 'Address available'
      },
      isUnlocked: lead.isUnlocked || false
    }));
  }, []);

  const fetchLeads = useCallback(async (isBackgroundRefresh = false) => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    // If background refresh, show refreshing indicator but don't block UI
    if (isBackgroundRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      apiClient.setToken(token);
      
      // Add timeout to prevent infinite loading (reduced to 15s for faster feedback)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      const response = await Promise.race([
        apiClient.get('/api/leads/wallet/available/'),
        timeoutPromise
      ]);
      
      // Handle different response structures
      const leadsData = response.leads || response.data?.leads || [];
      const walletData = response.wallet || response.data?.wallet || {};
      
      if (leadsData.length > 0) {
        const transformedLeads = transformLeads(leadsData);
        
        // Update state
        setLeads(transformedLeads);
        if (transformedLeads[0]) {
          setSelectedLead(transformedLeads[0]);
        }
        
        // Cache the data
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            leads: transformedLeads,
            credits: walletData.credits
          }));
          localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
        } catch (cacheError) {
          console.warn('Failed to cache leads:', cacheError);
        }
      } else {
        // For new providers, show empty state
        setLeads([]);
        setSelectedLead(null);
        // Clear cache if no leads
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      }
      
      // Set credits from wallet data
      if (walletData.credits !== undefined) {
        setUserCredits(walletData.credits);
      }
    } catch (error: any) {
      console.error('❌ Error fetching leads:', error);
      // On error, only clear if it's not a background refresh (keep cached data)
      if (!isBackgroundRefresh) {
        setLeads([]);
        setSelectedLead(null);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, CACHE_KEY, CACHE_TIMESTAMP_KEY, transformLeads]);

  const fetchUserStats = useCallback(async () => {
    if (!token) return;
    
    try {
      apiClient.setToken(token);
      // Use wallet endpoint for consistent credit data
      const response = await apiClient.get('/api/wallet/');
      
      // Get credits from wallet data consistently
      const credits = response.credits || response.data?.credits || 0;
      setUserCredits(credits);
    } catch (error) {
      console.error('❌ Error fetching wallet data:', error);
      // For new users or errors, start with 0 credits
      setUserCredits(0);
    }
  }, [token]);

  useEffect(() => {
    // Only run once when component mounts or when user/token changes
    if (user !== null && token) {
      apiClient.setToken(token);
      
      // Try to load cached data first for instant display
      const cacheLoaded = loadCachedLeads();
      
      // If cache loaded, do background refresh; otherwise do full load
      if (cacheLoaded) {
        setLoading(false); // Show cached data immediately
        // Refresh in background
        fetchLeads(true);
      } else {
        // No cache, do full load
        fetchLeads(false);
      }
      
      fetchUserStats();
    } else if (user === null) {
      // User is not logged in
      setLoading(false);
    }
    // Remove fetchLeads and fetchUserStats from dependencies to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'limited': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const canPurchaseLead = (lead) => {
    return !purchasedLeads.has(lead.id) && 
           lead.current_responses < lead.max_providers && 
           lead.lead_status !== 'closed';
  };

  const purchaseLead = async (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    console.log('🛒 Attempting to purchase lead:', leadId, 'Lead:', lead);
    
    if (!lead) {
      console.error('❌ Lead not found:', leadId);
      showNotification('Lead not found. Please refresh the page.', 'error');
      return;
    }
    
    if (!canPurchaseLead(lead)) {
      console.error('❌ Cannot purchase lead:', {
        alreadyPurchased: purchasedLeads.has(leadId),
        insufficientCredits: userCredits < lead.credit_cost,
        leadFull: lead.current_responses >= lead.max_providers,
        leadClosed: lead.lead_status === 'closed'
      });
      showNotification(`Cannot purchase this lead. You need ${lead.credit_cost} credits and have ${userCredits}.`, 'error');
      return;
    }
    
    try {
      apiClient.setToken(token);
      
      // All leads should be real API leads now, no sample data simulation
      
      // For real leads, use the actual API
      const response = await apiClient.post(`/api/leads/${leadId}/purchase/`);
      
      if (response.success || response.data?.success) {
        setPurchasedLeads(prev => new Set([...prev, leadId]));
        
        // Update credits from API response
        if (response.remaining_credits !== undefined) {
          setUserCredits(response.remaining_credits);
        } else if (response.credits_deducted !== undefined) {
          setUserCredits(prev => prev - response.credits_deducted);
        } else {
          setUserCredits(prev => prev - lead.credit_cost);
        }
        
        // Refresh leads data to get updated counts from API (for accurate display)
        // Fetch fresh data and update both leads list and selected lead
        try {
          apiClient.setToken(token);
          const refreshResponse = await apiClient.get('/api/leads/wallet/available/');
          const refreshedLeadsData = refreshResponse.leads || refreshResponse.data?.leads || [];
          
          if (refreshedLeadsData.length > 0) {
            // Transform and update leads list
            const transformedLeads = refreshedLeadsData.map((lead: any, index: number) => ({
              id: lead.id,
              title: lead.service || lead.title || `Service Request ${index + 1}`,
              description: lead.details || lead.masked_details || lead.description || 'Service details available after purchase',
              service_category: { 
                name: lead.service?.split(' • ')[0] || 'General Services', 
                id: lead.id 
              },
              location_city: lead.masked_location?.split(', ')[1] || lead.location_city || 'Location hidden',
              location_suburb: lead.masked_location?.split(', ')[0] || lead.location_suburb || 'Location hidden',
              budget_range: lead.budget || lead.budget_range || 'Budget available',
              urgency: lead.urgency || 'medium',
              timeline: lead.timeline || 'Flexible',
              created_at: lead.created_at || new Date().toISOString(),
              timeAgo: lead.timeAgo || lead.lastActivity || 'Recently posted',
              client_name: lead.masked_name || 'Client Name',
              credit_cost: lead.credits || lead.credit_cost || 1,
              max_providers: lead.max_providers || 5,
              current_responses: lead.current_responses !== undefined ? lead.current_responses : (lead.assigned_providers_count !== undefined ? lead.assigned_providers_count : (lead.responses_count || 0)),
              lead_status: lead.status || 'active',
              client_rating: lead.rating || 4.5,
              client_jobs_posted: 0,
              project_details: {
                property_type: lead.jobSize || 'Standard',
                special_requirements: lead.category || 'General'
              },
              hidden_details: {
                full_name: lead.name || 'Client Name',
                phone: lead.phone || 'Phone available',
                email: lead.email || 'Email available',
                exact_address: lead.location || lead.masked_location || 'Address available'
              },
              isUnlocked: lead.isUnlocked || false
            }));
            
            setLeads(transformedLeads);
            
            // Update selected lead if it's the one purchased
            if (selectedLead?.id === leadId) {
              const updatedLead = transformedLeads.find((l: any) => l.id === leadId);
              if (updatedLead) {
                setSelectedLead({
                  ...updatedLead,
                  isUnlocked: true
                });
              }
            }
          }
        } catch (refreshError) {
          console.error('Error refreshing leads after purchase:', refreshError);
          // Fallback: just update the local state
          setLeads(prev => prev.map(l => 
            l.id === leadId 
              ? { 
                  ...l, 
                  status: 'unlocked', 
                  isUnlocked: true,
                  current_responses: (l.current_responses || 0) + 1
                }
              : l
          ));
        }
        
        console.log('✅ Lead purchased successfully:', response);
        showNotification(`Lead purchased successfully! ${response.credits_deducted || lead.credit_cost} credits deducted.`, 'success');
        
        // Refresh user stats to update credit balance
        fetchUserStats();
      } else {
        console.error('❌ Purchase failed:', response);
        showNotification(`Purchase failed: ${response.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('❌ Error purchasing lead:', error);
      
      // Show specific error message from API
      let errorMessage = 'Purchase failed. Please try again.';
      let helpText = '';
      // Handle reservation flow (202 Accepted with payment instructions)
      const status = error.response?.status;
      const data = error.response?.data;
      if (status === 202 && data?.reservation) {
        setReserveInfo({
          reservation: data.reservation,
          instructions: data.payment_instructions,
          customer_code: data.customer_code,
          message: data.message,
        });
        showNotification('Lead reserved. Check payment instructions.', 'success');
        return;
      }
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Include help text if available
      if (error.response?.data?.help_text) {
        helpText = error.response.data.help_text;
      }
      
      // Show error message with help text
      if (helpText) {
        showNotification(`${errorMessage}\n\n${helpText}`, 'error');
      } else {
        showNotification(errorMessage, 'error');
      }
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';
    
    const now = new Date();
    const posted = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(posted.getTime())) return 'Invalid date';
    
    const diffMs = now.getTime() - posted.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  // Skeleton loading component
  const LeadSkeleton = () => (
    <div className="p-4 border-b border-gray-200 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  );

  // Show skeleton only if no cached data and still loading
  const showSkeleton = loading && leads.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ProConnectSA</h1>
              <p className="text-gray-600">Find and purchase qualified leads</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-700">{userCredits} Credits</span>
                </div>
              </div>
              <button 
                onClick={() => router.push('/dashboard/wallet')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Buy More Credits
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8 min-h-[calc(100vh-200px)]">
          
          {/* LEFT PANEL: Leads List */}
          <div className="col-span-4 space-y-4">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Available Leads ({leads.length})
                    </h2>
                    <p className="text-sm text-gray-600">Click any lead to view details</p>
                  </div>
                  {refreshing && (
                    <div className="flex items-center text-xs text-blue-600">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                      Refreshing...
                    </div>
                  )}
                </div>
              </div>
              
                <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                  {showSkeleton ? (
                    // Show skeleton while loading (only if no cached data)
                    <div>
                      {[...Array(5)].map((_, i) => (
                        <LeadSkeleton key={i} />
                      ))}
                    </div>
                  ) : leads.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Leads Available</h3>
                      <p className="text-sm text-gray-500">
                        There are currently no leads available in your service categories.
                        <br />
                        Check back later or contact support if you need assistance.
                      </p>
                    </div>
                  ) : (
                    leads.map((lead) => (
                      <div
                        key={lead.id}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-all ${
                          selectedLead?.id === lead.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => setSelectedLead(lead)}
                      >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                        {lead.title}
                      </h3>
                      <div className="flex items-center space-x-1 ml-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(lead.urgency)}`}>
                          {lead.urgency}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {lead.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{lead.location_suburb}, {lead.location_city}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center text-green-600">
                          <DollarSign className="h-3 w-3 mr-1" />
                          <span className="font-medium">{lead.budget_range}</span>
                        </div>
                        <div className="flex items-center text-blue-600">
                          <span className="font-medium">{lead.credit_cost} credits</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{lead.timeAgo || 'Recently posted'}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{lead.current_responses}/{lead.max_providers} responses</span>
                        </div>
                      </div>
                      
                      {lead.current_responses >= lead.max_providers && (
                        <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor('limited')}`}>
                          Lead Full - No longer available
                        </div>
                      )}
                      
                      {purchasedLeads.has(lead.id) && (
                        <div className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                          ✓ Purchased - Contact details unlocked
                        </div>
                      )}
                      </div>
                    </div>
                    ))
                  )}
                </div>
            </div>
          </div>

          {/* CENTER PANEL: Lead Details */}
          <div className="col-span-5">
            {selectedLead ? (
              <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {selectedLead.title}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {selectedLead.service_category.name}
                        </span>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{selectedLead.timeAgo || 'Recently posted'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(selectedLead.urgency)}`}>
                        {selectedLead.urgency} priority
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                  {/* Project Description */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      Project Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedLead.description}
                    </p>
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                      <div className="text-gray-700">
                        <div className="flex items-center mb-1">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{selectedLead.location_suburb}, {selectedLead.location_city}</span>
                        </div>
                        {purchasedLeads.has(selectedLead.id) ? (
                          <div className="text-sm text-green-600 mt-1">
                            ✓ Exact address: {selectedLead.hidden_details.exact_address}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Lock className="h-3 w-3 mr-1" />
                            Exact address hidden until purchased
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Budget Range</h4>
                      <div className="flex items-center text-green-600 font-semibold">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {selectedLead.budget_range}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                      <div className="flex items-center text-gray-700">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedLead.timeline}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Property Type</h4>
                      <div className="text-gray-700">
                        {selectedLead.project_details.property_type}
                      </div>
                    </div>
                  </div>

                  {/* Project Specifications */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Project Details</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {Object.entries(selectedLead.project_details).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600 capitalize">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span className="text-gray-900 font-medium">
                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Client Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Client Information</h4>
                    <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-blue-600" />
                            <span className="font-medium text-blue-900">
                              {purchasedLeads.has(selectedLead.id) 
                                ? selectedLead.hidden_details.full_name
                                : selectedLead.client_name
                              }
                            </span>
                          </div>
                          <div className="flex items-center mt-1 text-sm">
                            <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
                            <span className="text-gray-600">{selectedLead.client_rating} rating</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-gray-600">{selectedLead.client_jobs_posted} jobs posted</span>
                          </div>
                        </div>
                      </div>
                      
                      {purchasedLeads.has(selectedLead.id) ? (
                        <div className="space-y-2 pt-2 border-t border-blue-200">
                          <div className="flex items-center text-green-600">
                            <Phone className="h-4 w-4 mr-2" />
                            <span className="font-medium">{selectedLead.hidden_details.phone}</span>
                          </div>
                          <div className="flex items-center text-green-600">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="font-medium">{selectedLead.hidden_details.email}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-3 text-gray-500 border-t border-blue-200">
                          <Lock className="h-4 w-4 mr-2" />
                          <span className="text-sm">Contact details hidden until purchased</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm h-full flex items-center justify-center">
                <p className="text-gray-500">Select a lead to view details</p>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Purchase Actions */}
          <div className="col-span-3">
            {selectedLead ? (
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Lead Purchase
                </h3>
                
                {/* Lead Status */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Responses</span>
                    <span className="font-medium text-gray-900">
                      {selectedLead.current_responses}/{selectedLead.max_providers}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(selectedLead.current_responses / selectedLead.max_providers) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedLead.max_providers - selectedLead.current_responses} spots remaining
                  </p>
                </div>

                {/* Credit Cost */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-900">Lead Cost</span>
                    <div className="flex items-center text-blue-900">
                      <DollarSign className="h-5 w-5 mr-1" />
                      <span className="text-2xl font-bold">{selectedLead.credit_cost}</span>
                      <span className="text-sm ml-1">credits</span>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700">
                    Unlock full contact details and project information
                  </p>
                </div>

                {/* Purchase Button */}
                <div className="space-y-4">
                  {purchasedLeads.has(selectedLead.id) ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <h4 className="font-medium text-green-900">Lead Purchased!</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Contact details are now visible above
                      </p>
                    </div>
                  ) : selectedLead.current_responses >= selectedLead.max_providers ? (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                      <AlertCircle className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <h4 className="font-medium text-orange-900">Lead Full</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        Maximum providers have already responded
                      </p>
                    </div>
                  ) : userCredits < selectedLead.credit_cost ? (
                    <div className="space-y-3">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <AlertCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                        <h4 className="font-medium text-red-900">Insufficient Credits</h4>
                        <p className="text-sm text-red-700 mt-1">
                          You need {selectedLead.credit_cost} credits
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <button 
                          onClick={() => purchaseLead(selectedLead.id)}
                          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        >
                          Reserve Lead & Get EFT Instructions
                        </button>
                        <button 
                          onClick={() => router.push('/dashboard/wallet')}
                          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                          Buy More Credits
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => purchaseLead(selectedLead.id)}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      Purchase Lead ({selectedLead.credit_cost} Credits)
                    </button>
                  )}
                </div>

                {/* What's Included */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">What's included:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      Client's full name and contact details
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      Exact project location
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      Direct communication with client
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      48-hour response guarantee
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
                <p>Select a lead to see purchase options</p>
              </div>
            )}
          </div>

        </div>
      </div>
      {/* Reserve Instructions Modal */}
      {reserveInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Complete EFT to Unlock This Lead</h3>
              <p className="text-sm text-gray-600 mt-1">{reserveInfo.message}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-900 font-medium">Credits Required</span>
                  <span className="text-blue-900 font-bold">{reserveInfo.reservation.credits_required}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-blue-900 font-medium">Amount Due</span>
                  <span className="text-blue-900 font-bold">R{reserveInfo.reservation.amount_due}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-blue-900 font-medium">Reservation Expires</span>
                  <span className="text-blue-900">{new Date(reserveInfo.reservation.expires_at).toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <h4 className="font-medium text-green-900 mb-2">Bank Details</h4>
                <div className="text-sm text-green-900 space-y-1">
                  <div className="flex justify-between"><span>Bank</span><span>{reserveInfo.instructions.bank_name || 'Nedbank'}</span></div>
                  <div className="flex justify-between"><span>Account</span><span>{reserveInfo.instructions.account_number}</span></div>
                  <div className="flex justify-between"><span>Branch</span><span>{reserveInfo.instructions.branch_code}</span></div>
                  <div className="flex justify-between font-semibold"><span>Reference</span><span>{reserveInfo.reservation.reference_number}</span></div>
                </div>
                <p className="text-xs text-green-700 mt-3">
                  Use the exact reference so we can auto-activate your credits.
                </p>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setReserveInfo(null)}
                className="px-4 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletLeadDashboard;
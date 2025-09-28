import React, { useState, useEffect, useCallback } from 'react';
import { Clock, MapPin, DollarSign, Users, Eye, Lock, CheckCircle, AlertCircle, Star, Calendar, Phone, Mail, User } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { apiClient } from '@/lib/api-simple';

const WalletLeadDashboard = () => {
  const { user, token } = useAuth();
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userCredits, setUserCredits] = useState(0);
  const [purchasedLeads, setPurchasedLeads] = useState(new Set());

  const fetchLeads = useCallback(async () => {
    if (!token) return;
    
    try {
      apiClient.setToken(token);
      const response = await apiClient.get('/api/leads/wallet/available/');
      
      console.log('🔍 API Response:', response); // Debug log
      
      // Handle different response structures
      const leadsData = response.leads || response.data?.leads || [];
      const walletData = response.wallet || response.data?.wallet || {};
      
      if (leadsData.length > 0) {
        setLeads(leadsData);
        setSelectedLead(leadsData[0]);
        console.log('✅ Leads loaded:', leadsData.length); // Debug log
      } else {
        console.log('⚠️ No leads found in response'); // Debug log
      }
      
      // Set credits from wallet data
      if (walletData.credits !== undefined) {
        setUserCredits(walletData.credits);
        console.log('✅ Credits loaded from wallet:', walletData.credits); // Debug log
      }
    } catch (error) {
      console.error('❌ Error fetching leads:', error);
    }
  }, [token]);

  const fetchUserStats = useCallback(async () => {
    if (!token) return;
    
    try {
      apiClient.setToken(token);
      const response = await apiClient.get('/api/auth/stats/');
      
      console.log('🔍 Stats Response:', response); // Debug log
      
      // Handle different response structures for credits
      const credits = response.credits || response.data?.credits || response.wallet?.credits || 0;
      setUserCredits(credits);
      console.log('✅ Credits loaded:', credits); // Debug log
    } catch (error) {
      console.error('❌ Error fetching user stats:', error);
    }
  }, [token]);

  useEffect(() => {
    if (user !== null && token) {
      apiClient.setToken(token);
      fetchLeads();
      fetchUserStats();
      setLoading(false);
    }
  }, [user, token, fetchLeads, fetchUserStats]);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': 
      case 'high': 
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': 
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: 
        return 'bg-green-100 text-green-700 border-green-200';
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
           userCredits >= (lead.credits || lead.credit_cost || 1) &&
           lead.status !== 'closed';
  };

  const purchaseLead = async (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    if (canPurchaseLead(lead)) {
      try {
        apiClient.setToken(token);
        const response = await apiClient.post(`/api/leads/${leadId}/unlock/`);
        
        if (response.success || response.data?.success) {
          setPurchasedLeads(prev => new Set([...prev, leadId]));
          setUserCredits(prev => prev - (lead.credits || lead.credit_cost || 1));
          
          // Update lead status
          setLeads(prev => prev.map(l => 
            l.id === leadId 
              ? { ...l, status: 'unlocked', isUnlocked: true }
              : l
          ));
        }
      } catch (error) {
        console.error('Error purchasing lead:', error);
      }
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recently posted';
    
    // Handle different time formats
    if (typeof dateString === 'string' && dateString.includes('ago')) {
      return dateString; // Already formatted
    }
    
    try {
      const now = new Date();
      const posted = new Date(dateString);
      const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just posted';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      return `${Math.floor(diffInHours / 24)}d ago`;
    } catch (error) {
      return 'Recently posted';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading available leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lead Marketplace</h1>
              <p className="text-gray-600">Find and purchase qualified leads</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-700">{userCredits} Credits</span>
                </div>
              </div>
              <button className="text-gray-500 hover:text-gray-700">
                Buy More Credits
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8 min-h-[calc(100vh-200px)]">
          
          {/* LEFT PANEL: Leads List */}
          <div className="col-span-4 space-y-4">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Available Leads ({leads.length})
                </h2>
                <p className="text-sm text-gray-600">Click any lead to view details</p>
              </div>
              
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-all ${
                      selectedLead?.id === lead.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                        {lead.service || lead.title || 'Service Request'}
                      </h3>
                      <div className="flex items-center space-x-1 ml-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(lead.urgency || 'medium')}`}>
                          {lead.urgency || 'medium'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {lead.details || lead.masked_details || lead.description || 'Service details available after purchase'}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{lead.masked_location || lead.location || 'Location hidden'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center text-green-600">
                          <DollarSign className="h-3 w-3 mr-1" />
                          <span className="font-medium">{lead.budget || lead.budget_range || 'Budget available'}</span>
                        </div>
                        <div className="flex items-center text-blue-600">
                          <span className="font-medium">{lead.credits || lead.credit_cost || 1} credits</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatTimeAgo(lead.timeAgo || lead.lastActivity || lead.created_at)}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{lead.responses_count || 0} responses</span>
                        </div>
                      </div>
                      
                      {purchasedLeads.has(lead.id) && (
                        <div className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                          ✓ Purchased - Contact details unlocked
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
                        {selectedLead.service || selectedLead.title || 'Service Request'}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {selectedLead.category || 'General'}
                        </span>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{formatTimeAgo(selectedLead.timeAgo || selectedLead.lastActivity || selectedLead.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(selectedLead.urgency || 'medium')}`}>
                        {selectedLead.urgency || 'medium'} priority
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
                      {selectedLead.details || selectedLead.masked_details || selectedLead.description || 'Service details available after purchase'}
                    </p>
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                      <div className="text-gray-700">
                        <div className="flex items-center mb-1">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{selectedLead.masked_location || selectedLead.location || 'Location hidden'}</span>
                        </div>
                        {purchasedLeads.has(selectedLead.id) ? (
                          <div className="text-sm text-green-600 mt-1">
                            ✓ Exact address: {selectedLead.location || 'Address available'}
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
                        {selectedLead.budget || selectedLead.budget_range || 'Budget available'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                      <div className="flex items-center text-gray-700">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedLead.timeline || 'Timeline not specified'}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Job Size</h4>
                      <div className="text-gray-700">
                        {selectedLead.jobSize || selectedLead.category || 'Standard'}
                      </div>
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
                                ? (selectedLead.name || 'Client Name')
                                : (selectedLead.masked_name || 'Client Name')
                              }
                            </span>
                          </div>
                          <div className="flex items-center mt-1 text-sm">
                            <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
                            <span className="text-gray-600">{selectedLead.rating || 4.5} rating</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-gray-600">Verified client</span>
                          </div>
                        </div>
                      </div>
                      
                      {purchasedLeads.has(selectedLead.id) ? (
                        <div className="space-y-2 pt-2 border-t border-blue-200">
                          <div className="flex items-center text-green-600">
                            <Phone className="h-4 w-4 mr-2" />
                            <span className="font-medium">{selectedLead.phone || 'Phone available'}</span>
                          </div>
                          <div className="flex items-center text-green-600">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="font-medium">{selectedLead.email || 'Email available'}</span>
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
                      {selectedLead.responses_count || 0} responses
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((selectedLead.responses_count || 0) * 10, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Lead is still available
                  </p>
                </div>

                {/* Credit Cost */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-900">Lead Cost</span>
                    <div className="flex items-center text-blue-900">
                      <DollarSign className="h-5 w-5 mr-1" />
                      <span className="text-2xl font-bold">{selectedLead.credits || selectedLead.credit_cost || 1}</span>
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
                  ) : userCredits < (selectedLead.credits || selectedLead.credit_cost || 1) ? (
                    <div className="space-y-3">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <AlertCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                        <h4 className="font-medium text-red-900">Insufficient Credits</h4>
                        <p className="text-sm text-red-700 mt-1">
                          You need {selectedLead.credits || selectedLead.credit_cost || 1} credits
                        </p>
                      </div>
                      <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                        Buy More Credits
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => purchaseLead(selectedLead.id)}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      Purchase Lead ({(selectedLead.credits || selectedLead.credit_cost || 1)} Credits)
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
    </div>
  );
};

export default WalletLeadDashboard;
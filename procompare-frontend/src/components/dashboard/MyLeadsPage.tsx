"use client";

import React, { useState, useEffect } from 'react';
import {
  Phone, Mail, MapPin, Clock, DollarSign, Star, MessageSquare,
  CheckCircle, XCircle, AlertCircle, Eye, Calendar, User,
  Filter, Search, SortAsc, SortDesc, RefreshCw, ExternalLink
} from 'lucide-react';
import { apiClient } from '@/lib/api-simple';
import { useAuth } from '@/components/AuthProvider';

interface MyLead {
  id: string;
  title: string;
  name: string;
  location: string;
  service: string;
  budget: string;
  credits_spent: number;
  unlocked_at: string;
  status: 'assigned' | 'viewed' | 'purchased' | 'contacted' | 'quoted' | 'won' | 'lost' | 'no_response';
  phone: string;
  email: string;
  description: string;
  urgency: 'urgent' | 'this_week' | 'this_month' | 'flexible';
  timeline: string;
  notes?: string;
  last_contact?: string;
  next_follow_up?: string;
}

const MyLeadsPage = () => {
  const { user, token } = useAuth();
  const [leads, setLeads] = useState<MyLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchMyLeads = async () => {
      if (!user || !token) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        apiClient.setToken(token);
        
        // Try to fetch from API, fallback to mock data
        try {
          const response = await apiClient.get('/api/my-leads/');
          setLeads(response.data?.leads || response.leads || []);
        } catch (apiError) {
          console.log('API not available, using mock data');
          // For now, show mock data since API endpoint might not exist
          setLeads([
          {
            id: '1',
            name: 'John Smith',
            location: 'Cape Town, Western Cape',
            service: 'Plumbing',
            budget: 'R2,500 - R5,000',
            credits_spent: 2,
            unlocked_at: '2024-01-15T10:30:00Z',
            status: 'contacted',
            phone: '+27 82 123 4567',
            email: 'john.smith@email.com',
            description: 'Need a plumber to fix a leaking pipe in the kitchen. The leak is getting worse and needs immediate attention.',
            urgency: 'high',
            timeline: 'ASAP',
            notes: 'Called twice, very interested. Wants quote by tomorrow.',
            last_contact: '2024-01-15T14:30:00Z',
            next_follow_up: '2024-01-16T09:00:00Z'
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            location: 'Johannesburg, Gauteng',
            service: 'Web Design',
            budget: 'R10,000 - R25,000',
            credits_spent: 3,
            unlocked_at: '2024-01-14T16:45:00Z',
            status: 'quoted',
            phone: '+27 83 987 6543',
            email: 'sarah.j@company.co.za',
            description: 'Looking for a web designer to create a new company website. Need e-commerce functionality.',
            urgency: 'medium',
            timeline: 'Within 2 weeks',
            notes: 'Sent detailed proposal. Waiting for feedback.',
            last_contact: '2024-01-15T11:00:00Z',
            next_follow_up: '2024-01-17T10:00:00Z'
          },
          {
            id: '3',
            name: 'Mike Wilson',
            location: 'Durban, KwaZulu-Natal',
            service: 'Electrical',
            budget: 'R1,500 - R3,000',
            credits_spent: 1,
            unlocked_at: '2024-01-13T09:15:00Z',
            status: 'won',
            phone: '+27 84 555 1234',
            email: 'mike.wilson@home.co.za',
            description: 'Need electrical work for new outdoor lighting installation.',
            urgency: 'low',
            timeline: 'Next month',
            notes: 'Job completed successfully. Very happy with the work.',
            last_contact: '2024-01-15T08:00:00Z'
          }
        ]);
        }
      } catch (error) {
        console.error('Failed to fetch my leads:', error);
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchMyLeads();
    }
  }, [user, token]);

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      await apiClient.put(`/api/auth/my-leads/${leadId}/status/`, { status: newStatus });
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId ? { ...lead, status: newStatus as any } : lead
        )
      );
    } catch (error) {
      console.error('Failed to update lead status:', error);
    }
  };

  const addNote = async (leadId: string, note: string) => {
    try {
      await apiClient.post(`/api/auth/my-leads/${leadId}/notes/`, { note });
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId ? { ...lead, notes: note } : lead
        )
      );
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-indigo-100 text-indigo-800';
      case 'purchased': return 'bg-cyan-100 text-cyan-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-purple-100 text-purple-800';
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'no_response': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'this_week': return 'bg-yellow-100 text-yellow-800';
      case 'this_month': return 'bg-blue-100 text-blue-800';
      case 'flexible': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime();
      case 'oldest':
        return new Date(a.unlocked_at).getTime() - new Date(b.unlocked_at).getTime();
      case 'status':
        return a.status.localeCompare(b.status);
      case 'urgency':
        const urgencyOrder = { urgent: 4, this_week: 3, this_month: 2, flexible: 1 };
        return (urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 0) - 
               (urgencyOrder[a.urgency as keyof typeof urgencyOrder] || 0);
      default:
        return 0;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Leads</h1>
        <p className="text-gray-600 mt-2">Manage your purchased leads and track progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Won</p>
              <p className="text-2xl font-bold text-gray-900">
                {leads.filter(lead => lead.status === 'won').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {leads.filter(lead => ['contacted', 'quoted', 'viewed', 'purchased'].includes(lead.status)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Credits Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                {leads.reduce((sum, lead) => sum + lead.credits_spent, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
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

          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="assigned">Assigned</option>
              <option value="viewed">Viewed</option>
              <option value="purchased">Purchased</option>
              <option value="contacted">Contacted</option>
              <option value="quoted">Quoted</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="no_response">No Response</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="status">Status</option>
              <option value="urgency">Urgency</option>
            </select>

            <button
              onClick={() => window.location.reload()}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-600 mb-4">You haven't purchased any leads yet</p>
          <a href="/dashboard/leads" className="text-blue-600 hover:text-blue-700 font-medium">
            Browse available leads
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{lead.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(lead.urgency)}`}>
                      {lead.urgency.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">Client: {lead.name}</p>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    {lead.location}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    Purchased {formatDate(lead.unlocked_at)}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{lead.service}</p>
                  <p className="text-sm text-gray-600">{lead.budget}</p>
                  <p className="text-xs text-gray-500">{lead.credits_spent} credits</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700">{lead.description}</p>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <a href={`tel:${lead.phone}`} className="hover:text-blue-600">
                      {lead.phone}
                    </a>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <a href={`mailto:${lead.email}`} className="hover:text-blue-600">
                      {lead.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {lead.notes && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">{lead.notes}</p>
                </div>
              )}

              {/* Timeline and Follow-up */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Timeline</p>
                  <p className="text-sm font-medium text-gray-900">{lead.timeline}</p>
                </div>
                {lead.last_contact && (
                  <div>
                    <p className="text-xs text-gray-500">Last Contact</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(lead.last_contact)}</p>
                  </div>
                )}
                {lead.next_follow_up && (
                  <div>
                    <p className="text-xs text-gray-500">Next Follow-up</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(lead.next_follow_up)}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <select
                    value={lead.status}
                    onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="assigned">Assigned</option>
                    <option value="viewed">Viewed</option>
                    <option value="purchased">Purchased</option>
                    <option value="contacted">Contacted</option>
                    <option value="quoted">Quoted</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                    <option value="no_response">No Response</option>
                  </select>
                </div>

                <div className="flex space-x-2">
                  <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50">
                    <MessageSquare className="w-4 h-4 mr-1 inline" />
                    Add Note
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <ExternalLink className="w-4 h-4 mr-1 inline" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLeadsPage;








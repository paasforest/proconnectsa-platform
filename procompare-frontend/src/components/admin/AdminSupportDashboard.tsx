"use client";

import React, { useState, useEffect } from 'react';
import { Search, User, MessageCircle, Clock, CheckCircle, AlertCircle, Filter, RefreshCw } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { apiClient } from '@/lib/api-simple';

// Simple utility function to replace @/lib/utils
const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Alert components
const Alert = ({ children, className, variant = "default" }) => {
  const variants = {
    default: "bg-blue-50 border-blue-200 text-blue-800",
    destructive: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800"
  };
  
  return (
    <div className={cn("rounded-lg border p-4", variants[variant], className)}>
      {children}
    </div>
  );
};

const AlertTitle = ({ children, className }) => (
  <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)}>
    {children}
  </h5>
);

const AlertDescription = ({ children, className }) => (
  <div className={cn("text-sm [&_p]:leading-relaxed", className)}>
    {children}
  </div>
);

// Main Dashboard Component
export default function AdminSupportDashboard() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const loadTickets = async () => {
    if (!token) {
      console.error('[Admin Support] ❌ No token available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('[Admin Support] ====== FETCHING TICKETS ======');
      console.log('[Admin Support] Token exists:', !!token);
      console.log('[Admin Support] Token value:', token ? `${token.substring(0, 20)}...` : 'null');
      
      // CRITICAL: Set token before making request
      apiClient.setToken(token);
      console.log('[Admin Support] Token set in apiClient');
      
      // Try fetching with explicit page parameter to avoid pagination issues
      const response = await apiClient.get('/api/support/tickets/?page=1&page_size=100');
      console.log('[Admin Support] ====== RAW RESPONSE ======');
      console.log('[Admin Support] Response type:', typeof response);
      console.log('[Admin Support] Response:', response);
      console.log('[Admin Support] Response keys:', Object.keys(response || {}));
      console.log('[Admin Support] Is array?', Array.isArray(response));
      
      // Handle different response formats:
      // - Paginated: { results: [...], count: N, next: url, previous: url }
      // - List: { tickets: [...] }
      // - Direct array: [...]
      let ticketsList = [];
      if (Array.isArray(response)) {
        ticketsList = response;
        console.log('[Admin Support] ✅ Response is direct array, count:', ticketsList.length);
      } else if (response && response.results && Array.isArray(response.results)) {
        ticketsList = response.results;
        console.log('[Admin Support] ✅ Response is paginated');
        console.log('[Admin Support] Total count:', response.count);
        console.log('[Admin Support] Results count:', ticketsList.length);
        console.log('[Admin Support] Next page:', response.next);
        console.log('[Admin Support] Previous page:', response.previous);
      } else if (response && response.tickets && Array.isArray(response.tickets)) {
        ticketsList = response.tickets;
        console.log('[Admin Support] ✅ Response has tickets key, count:', ticketsList.length);
      } else if (response && response.data && Array.isArray(response.data)) {
        ticketsList = response.data;
        console.log('[Admin Support] ✅ Response has data key, count:', ticketsList.length);
      } else {
        console.warn('[Admin Support] ⚠️ Unknown response format:', response);
        console.warn('[Admin Support] Response structure:', JSON.stringify(response, null, 2));
      }
      
      console.log('[Admin Support] ====== PARSED RESULT ======');
      console.log('[Admin Support] Final tickets list length:', ticketsList.length);
      if (ticketsList.length > 0) {
        console.log('[Admin Support] First ticket:', ticketsList[0]);
        console.log('[Admin Support] First ticket keys:', Object.keys(ticketsList[0]));
      } else {
        console.warn('[Admin Support] ⚠️ NO TICKETS FOUND IN RESPONSE');
        console.warn('[Admin Support] This might mean:');
        console.warn('[Admin Support] 1. Admin user doesn\'t have correct permissions');
        console.warn('[Admin Support] 2. No tickets exist in database');
        console.warn('[Admin Support] 3. API is filtering tickets incorrectly');
      }
      setTickets(ticketsList);
    } catch (error: any) {
      console.error('[Admin Support] ====== ERROR ======');
      console.error('[Admin Support] Failed to load tickets:', error);
      console.error('[Admin Support] Error type:', typeof error);
      console.error('[Admin Support] Error keys:', Object.keys(error || {}));
      if (error.response) {
        console.error('[Admin Support] Error response status:', error.response.status);
        console.error('[Admin Support] Error response statusText:', error.response.statusText);
        console.error('[Admin Support] Error response data:', error.response.data);
      }
      if (error.message) {
        console.error('[Admin Support] Error message:', error.message);
      }
      setTickets([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (token) {
      apiClient.setToken(token);
      loadTickets();
      
      // Auto-refresh tickets every 30 seconds
      const interval = setInterval(() => {
        loadTickets();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [token]);

  const filteredTickets = tickets.filter(ticket => {
    const title = (ticket.title || '').toLowerCase();
    const user_name = (ticket.user_name || ticket.user?.name || '').toLowerCase();
    const user_email = (ticket.user_email || ticket.user?.email || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = title.includes(searchLower) ||
                         user_name.includes(searchLower) ||
                         user_email.includes(searchLower);
    const matchesStatus = statusFilter === 'all' || (ticket.status || '').toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'all' || (ticket.priority || '').toLowerCase() === priorityFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Support Dashboard</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          New Ticket
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Tickets</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Open</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.open}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Resolved</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Support Tickets ({filteredTickets.length})
          </h2>
          <button
            onClick={loadTickets}
            disabled={loading}
            className="flex items-center px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
              <p className="mt-4 text-gray-500">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-6 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                {tickets.length === 0 
                  ? 'No support tickets found. Tickets created by providers will appear here.'
                  : 'No tickets match your filters.'}
              </p>
              {tickets.length === 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  Make sure you're logged in as an admin user with staff permissions.
                </p>
              )}
            </div>
          ) : (
            filteredTickets.map((ticket) => (
            <div key={ticket.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(ticket.status)}
                    <h3 className="text-lg font-medium text-gray-900">
                      {ticket.title}
                    </h3>
                    <span className={cn(
                      "px-2 py-1 text-xs font-medium rounded-full",
                      getPriorityColor(ticket.priority)
                    )}>
                      {ticket.priority}
                    </span>
                  </div>
                  
                  <p className="mt-2 text-gray-600">{ticket.description}</p>
                  
                  <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {ticket.user_name || ticket.user?.name || 'Unknown User'} 
                      {ticket.user_email || ticket.user?.email ? ` (${ticket.user_email || ticket.user?.email})` : ''}
                    </div>
                    {ticket.assigned_to_name && (
                      <div>Assigned to: {ticket.assigned_to_name}</div>
                    )}
                    {ticket.created_at && (
                      <div>Created: {formatDate(ticket.created_at)}</div>
                    )}
                    {ticket.updated_at && (
                      <div>Updated: {formatDate(ticket.updated_at)}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                    Edit
                  </button>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
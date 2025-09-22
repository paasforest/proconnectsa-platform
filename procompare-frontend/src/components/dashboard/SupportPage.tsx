"use client";

import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Plus, Clock, CheckCircle, XCircle, AlertCircle,
  Send, Search, Filter, RefreshCw, ExternalLink, HelpCircle,
  Phone, Mail, Calendar, User, Tag
} from 'lucide-react';
import { apiClient } from '@/lib/api-simple';
import { useSession } from 'next-auth/react';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'account' | 'general';
  created_at: string;
  updated_at: string;
  responses?: Array<{
    id: string;
    message: string;
    is_staff: boolean;
    created_at: string;
  }>;
}

const SupportPage = () => {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [successDetails, setSuccessDetails] = useState<{ticketId: string, timestamp: string} | null>(null);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });
  const [newResponse, setNewResponse] = useState('');

  // Helper function to format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        if (session?.accessToken) {
          apiClient.setToken(session.accessToken);
        }
        const response = await apiClient.get('/api/support/tickets/');
        setTickets(response.results || []);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
        // Mock data for now
        setTickets([
          {
            id: '1',
            title: 'Credits not added after deposit',
            description: 'I made a deposit of R500 yesterday but my credits haven\'t been added yet. The reference was CUS12345678.',
            status: 'open',
            priority: 'high',
            category: 'billing',
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z',
            responses: []
          },
          {
            id: '2',
            title: 'Lead contact information incorrect',
            description: 'I purchased a plumbing lead but the phone number provided is not working.',
            status: 'in_progress',
            priority: 'medium',
            category: 'technical',
            created_at: '2024-01-14T16:45:00Z',
            updated_at: '2024-01-15T09:15:00Z',
            responses: [
              {
                id: '1',
                message: 'Thank you for reporting this issue. We\'re investigating the lead quality and will get back to you within 24 hours.',
                is_staff: true,
                created_at: '2024-01-15T09:15:00Z'
              }
            ]
          },
          {
            id: '3',
            title: 'How to update my services?',
            description: 'I want to add new services to my profile. How do I do this?',
            status: 'resolved',
            priority: 'low',
            category: 'general',
            created_at: '2024-01-13T14:20:00Z',
            updated_at: '2024-01-14T11:30:00Z',
            responses: [
              {
                id: '2',
                message: 'You can update your services by going to the Services page in your dashboard. Click "Add Service" to add new ones.',
                is_staff: true,
                created_at: '2024-01-13T15:45:00Z'
              }
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (session?.accessToken) {
      fetchTickets();
    }
  }, [session?.accessToken]);

  const handleCreateTicket = async () => {
    try {
      if (session?.accessToken) {
        apiClient.setToken(session.accessToken);
      }
      
      const response = await apiClient.post('/api/support/tickets/', newTicket);
      
      setTickets([response, ...tickets]);
      setNewTicket({ title: '', description: '', category: 'general', priority: 'medium' });
      setShowNewTicketModal(false);
      
      // Set success message with details
      setSuccessMessage('Ticket created successfully!');
      setSuccessDetails({
        ticketId: response.id || response.ticket_id || `TICKET-${Date.now()}`,
        timestamp: new Date().toISOString()
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
        setSuccessDetails(null);
      }, 5000);
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert('Failed to create ticket. Please try again.');
    }
  };

  const handleAddResponse = async (ticketId: string) => {
    if (!newResponse.trim()) return;

    try {
      if (session?.accessToken) {
        apiClient.setToken(session.accessToken);
      }
      const response = await apiClient.post(`/api/support/tickets/${ticketId}/responses/`, {
        message: newResponse
      });
      
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, responses: [...(ticket.responses || []), response] }
          : ticket
      ));
      
      setNewResponse('');
    } catch (error) {
      console.error('Failed to add response:', error);
      alert('Failed to add response. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || (ticket.status || 'open') === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Support</h1>
        <p className="text-gray-600 mt-2">Get help and manage your support tickets</p>
        
        {/* Test Success Message Button */}
        <button 
          onClick={() => {
            setSuccessMessage('Test success message!');
            setSuccessDetails({
              ticketId: 'TEST-12345',
              timestamp: new Date().toISOString()
            });
            setTimeout(() => {
              setSuccessMessage('');
              setSuccessDetails(null);
            }, 3000);
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Success Message
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-800 font-medium">{successMessage}</p>
              {/* Debug info */}
              <p className="text-xs text-green-600 mt-1">Debug: successMessage={successMessage}, successDetails={JSON.stringify(successDetails)}</p>
              {successDetails && (
                <div className="mt-2 text-sm text-green-700">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <span className="font-medium">Ticket ID:</span>
                      <span className="ml-1 font-mono text-xs bg-green-100 px-2 py-1 rounded">
                        #{successDetails.ticketId ? successDetails.ticketId.slice(0, 8) : 'N/A'}...
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">Status:</span>
                      <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        OPEN
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-green-600">
                    Created on {formatDateTime(successDetails.timestamp).date} at {formatDateTime(successDetails.timestamp).time}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Help */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HelpCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Help Center</h3>
          </div>
          <p className="text-gray-600 mb-4">Find answers to common questions</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Browse Help Articles
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Contact Us</h3>
          </div>
          <p className="text-gray-600 mb-4">Get in touch with our support team</p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>📞 +27 21 123 4567</p>
            <p>✉️ support@procompare.co.za</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Live Chat</h3>
          </div>
          <p className="text-gray-600 mb-4">Chat with support in real-time</p>
          <button className="text-purple-600 hover:text-purple-700 font-medium">
            Start Chat
          </button>
        </div>
      </div>

      {/* Tickets Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Support Tickets</h2>
              <p className="text-sm text-gray-600">Manage your support requests</p>
            </div>
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tickets..."
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
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
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

        {/* Tickets List */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tickets found</p>
            </div>
          ) : (
            filteredTickets.map((ticket, index) => (
              <div key={ticket.id || `ticket-${index}`} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{ticket.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status || 'open')}`}>
                        {(ticket.status || 'open').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority || 'medium')}`}>
                        {(ticket.priority || 'medium').toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-2 line-clamp-2">{ticket.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>#{ticket.id}</span>
                      <span>•</span>
                      <span>{ticket.category}</span>
                      <span>•</span>
                      <span>Created {formatDate(ticket.created_at)}</span>
                      {ticket.responses && ticket.responses.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{ticket.responses.length} response(s)</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Ticket</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of your issue"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="account">Account</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Please provide detailed information about your issue..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNewTicketModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                disabled={!newTicket.title || !newTicket.description}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{selectedTicket.title}</h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-sm">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTicket.status || 'open')}`}>
                  {(selectedTicket.status || 'open').toUpperCase()}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedTicket.priority || 'medium')}`}>
                  {(selectedTicket.priority || 'medium').toUpperCase()}
                </span>
                <span className="text-gray-500">#{selectedTicket.id}</span>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{selectedTicket.description}</p>
              </div>
              
              {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Responses</h4>
                  <div className="space-y-3">
                    {selectedTicket.responses.map((response) => (
                      <div key={response.id} className={`p-3 rounded-lg ${
                        response.is_staff ? 'bg-blue-50' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {response.is_staff ? 'Support Team' : 'You'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(response.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Add Response</h4>
                <div className="space-y-3">
                  <textarea
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Type your response here..."
                  />
                  <button
                    onClick={() => handleAddResponse(selectedTicket.id)}
                    disabled={!newResponse.trim()}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Response
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPage;








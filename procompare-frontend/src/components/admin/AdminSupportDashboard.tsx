import React, { useState, useEffect } from 'react';
import { Search, User, MessageCircle, Clock, CheckCircle, AlertCircle, Filter } from 'lucide-react';

// Simple utility function to replace @/lib/utils
const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Simple API client to replace @/lib/api-simple
const apiClient = {
  async get(endpoint: string) {
    // Mock API response for demonstration
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (endpoint === '/admin/support/tickets') {
      return {
        tickets: [
          {
            id: 1,
            title: "Login Issues",
            description: "User cannot access account after password reset",
            status: "open",
            priority: "high",
            user: { name: "John Doe", email: "john@example.com" },
            createdAt: "2024-01-15T10:30:00Z",
            updatedAt: "2024-01-15T14:20:00Z",
            assignee: "Sarah Admin"
          },
          {
            id: 2,
            title: "Billing Question",
            description: "Inquiry about subscription charges",
            status: "in-progress",
            priority: "medium",
            user: { name: "Jane Smith", email: "jane@example.com" },
            createdAt: "2024-01-14T09:15:00Z",
            updatedAt: "2024-01-15T11:30:00Z",
            assignee: "Mike Support"
          },
          {
            id: 3,
            title: "Feature Request",
            description: "Request for dark mode theme",
            status: "resolved",
            priority: "low",
            user: { name: "Bob Wilson", email: "bob@example.com" },
            createdAt: "2024-01-13T16:45:00Z",
            updatedAt: "2024-01-14T10:20:00Z",
            assignee: "Lisa Dev"
          }
        ]
      };
    }
    
    return { data: [] };
  },

  async post(endpoint: string, data?: any) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, data };
  }
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
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/support/tickets');
      setTickets(response.tickets || []);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
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
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Support Tickets ({filteredTickets.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredTickets.map((ticket) => (
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
                      {ticket.user.name} ({ticket.user.email})
                    </div>
                    <div>Assigned to: {ticket.assignee}</div>
                    <div>Created: {formatDate(ticket.createdAt)}</div>
                    <div>Updated: {formatDate(ticket.updatedAt)}</div>
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
          ))}
          
          {filteredTickets.length === 0 && (
            <div className="p-12 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No support tickets available'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
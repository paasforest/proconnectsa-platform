"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import {
  Wrench, Bug, Code, Server, Database, AlertTriangle, 
  CheckCircle, Clock, BarChart3, RefreshCw, Search,
  Filter, Eye, Edit, Trash2, Download, Settings
} from 'lucide-react';
import { apiClient } from '@/lib/api-simple';

interface TechnicalTicket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'pending_customer' | 'pending_internal' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  user_name: string;
  user_email: string;
  error_code?: string;
  system_component?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
  age_days: number;
}

interface TechnicalStats {
  total_tickets: number;
  open_tickets: number;
  resolved_tickets: number;
  critical_issues: number;
  avg_resolution_time: number;
  system_uptime: number;
  bug_reports: number;
  feature_requests: number;
  tickets_by_severity: Record<string, number>;
  tickets_by_component: Record<string, number>;
  resolution_trends: Array<{
    week: string;
    resolved: number;
    created: number;
  }>;
}

const TechnicalDashboard = () => {
  const { user, token } = useAuth();
  const [tickets, setTickets] = useState<TechnicalTicket[]>([]);
  const [stats, setStats] = useState<TechnicalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TechnicalTicket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [componentFilter, setComponentFilter] = useState('all');

  useEffect(() => {
    if (token) {
      fetchTechnicalData();
    }
  }, [token]);

  const fetchTechnicalData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      apiClient.setToken(token);

      // Fetch support tickets (technical issues are typically support tickets)
      const ticketsRes = await apiClient.get('/api/support/tickets/');
      const allTickets = ticketsRes.tickets || ticketsRes.results || ticketsRes || [];

      // Filter for technical-related tickets (bugs, technical issues, system errors)
      const technicalTickets = allTickets.filter((ticket: any) => {
        const title = (ticket.title || '').toLowerCase();
        const description = (ticket.description || '').toLowerCase();
        const category = (ticket.category || '').toLowerCase();
        
        return title.includes('bug') || title.includes('error') || title.includes('technical') ||
               title.includes('system') || title.includes('api') || title.includes('database') ||
               description.includes('bug') || description.includes('error') || 
               description.includes('technical') || description.includes('system') ||
               category === 'technical' || category === 'bug' || category === 'system';
      });

      // Transform tickets to TechnicalTicket format
      const transformedTickets: TechnicalTicket[] = technicalTickets.map((ticket: any) => ({
        id: ticket.id || ticket.ticket_id,
        ticket_number: ticket.ticket_number || ticket.id || 'N/A',
        title: ticket.title || 'Untitled',
        description: ticket.description || '',
        status: ticket.status || 'open',
        priority: ticket.priority || 'medium',
        user_name: ticket.user?.name || ticket.user_name || 'Unknown',
        user_email: ticket.user?.email || ticket.user_email || '',
        error_code: ticket.error_code,
        system_component: ticket.system_component || ticket.category || 'general',
        severity: ticket.severity || ticket.priority || 'medium',
        created_at: ticket.created_at || ticket.created_at,
        updated_at: ticket.updated_at || ticket.updated_at,
        age_days: ticket.created_at ? Math.floor((new Date().getTime() - new Date(ticket.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0
      }));

      setTickets(transformedTickets);

      // Calculate stats
      const totalTickets = transformedTickets.length;
      const openTickets = transformedTickets.filter(t => ['open', 'in_progress', 'pending_customer', 'pending_internal'].includes(t.status)).length;
      const resolvedTickets = transformedTickets.filter(t => ['resolved', 'closed'].includes(t.status)).length;
      const criticalIssues = transformedTickets.filter(t => t.severity === 'critical' || t.priority === 'urgent' || t.priority === 'critical').length;
      
      // Calculate average resolution time (for resolved tickets)
      const resolvedWithTimes = transformedTickets.filter(t => ['resolved', 'closed'].includes(t.status) && t.created_at && t.updated_at);
      const avgResolutionTime = resolvedWithTimes.length > 0
        ? resolvedWithTimes.reduce((sum, t) => {
            const created = new Date(t.created_at).getTime();
            const updated = new Date(t.updated_at).getTime();
            return sum + (updated - created) / (1000 * 60 * 60); // hours
          }, 0) / resolvedWithTimes.length
        : 0;

      // Count by severity
      const ticketsBySeverity: Record<string, number> = {};
      transformedTickets.forEach(t => {
        const severity = t.severity || 'medium';
        ticketsBySeverity[severity] = (ticketsBySeverity[severity] || 0) + 1;
      });

      // Count by component
      const ticketsByComponent: Record<string, number> = {};
      transformedTickets.forEach(t => {
        const component = t.system_component || 'general';
        ticketsByComponent[component] = (ticketsByComponent[component] || 0) + 1;
      });

      // Count bug reports vs feature requests
      const bugReports = transformedTickets.filter(t => 
        (t.title || '').toLowerCase().includes('bug') || 
        (t.description || '').toLowerCase().includes('bug')
      ).length;
      const featureRequests = transformedTickets.filter(t => 
        (t.title || '').toLowerCase().includes('feature') || 
        (t.description || '').toLowerCase().includes('feature')
      ).length;

      // Fetch monitoring data for system uptime
      let systemUptime = 99.9;
      try {
        const monitoringRes = await apiClient.get('/api/admin/monitoring/dashboard/');
        // System uptime would come from monitoring data if available
        systemUptime = monitoringRes?.system_health?.uptime || 99.9;
      } catch (e) {
        // Use default if monitoring fails
      }

      setStats({
        total_tickets: totalTickets,
        open_tickets: openTickets,
        resolved_tickets: resolvedTickets,
        critical_issues: criticalIssues,
        avg_resolution_time: Math.round(avgResolutionTime * 10) / 10,
        system_uptime: systemUptime,
        bug_reports: bugReports,
        feature_requests: featureRequests,
        tickets_by_severity: ticketsBySeverity,
        tickets_by_component: ticketsByComponent,
        resolution_trends: [] // Could be populated with historical data if available
      });
    } catch (error: any) {
      console.error('Failed to fetch technical data:', error);
      setTickets([]);
      setStats({
        total_tickets: 0,
        open_tickets: 0,
        resolved_tickets: 0,
        critical_issues: 0,
        avg_resolution_time: 0,
        system_uptime: 99.9,
        bug_reports: 0,
        feature_requests: 0,
        tickets_by_severity: {},
        tickets_by_component: {},
        resolution_trends: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    try {
      await apiClient.patch(`/api/support/tickets/${ticketId}/`, {
        status: status
      });
      
      // Refresh data
      await fetchTechnicalData();
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending_customer': return 'bg-orange-100 text-orange-800';
      case 'pending_internal': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.error_code && ticket.error_code.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesSeverity = severityFilter === 'all' || ticket.severity === severityFilter;
    const matchesComponent = componentFilter === 'all' || ticket.system_component === componentFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesSeverity && matchesComponent;
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Technical Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage technical issues, bugs, and system maintenance</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Issues</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_tickets}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                <p className="text-2xl font-bold text-gray-900">{stats.critical_issues}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Server className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{stats.system_uptime}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avg_resolution_time}h</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Resolution Trends Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolution Trends</h3>
            <div className="h-64 flex items-end space-x-2">
              {stats.resolution_trends.map((week, index) => (
                <div key={week.week} className="flex-1 flex flex-col items-center">
                  <div className="flex space-x-1 mb-2">
                    <div 
                      className="bg-green-500 rounded-t w-full"
                      style={{ height: `${(week.resolved / Math.max(...stats.resolution_trends.map(w => w.resolved))) * 100}px` }}
                      title={`Resolved: ${week.resolved}`}
                    ></div>
                    <div 
                      className="bg-red-500 rounded-t w-full"
                      style={{ height: `${(week.created / Math.max(...stats.resolution_trends.map(w => w.created))) * 100}px` }}
                      title={`Created: ${week.created}`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{week.week}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span className="text-xs text-gray-600">Resolved</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                <span className="text-xs text-gray-600">Created</span>
              </div>
            </div>
          </div>

          {/* Component Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues by Component</h3>
            <div className="space-y-3">
              {Object.entries(stats.tickets_by_component).map(([component, count]) => (
                <div key={component} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{component}</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(count / stats.total_tickets) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search technical tickets..."
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
                <option value="pending_customer">Pending Customer</option>
                <option value="pending_internal">Pending Internal</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="critical">Critical</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={componentFilter}
                onChange={(e) => setComponentFilter(e.target.value)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Components</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="database">Database</option>
                <option value="api">API</option>
              </select>

              <button
                onClick={fetchTechnicalData}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Component
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {ticket.ticket_number}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {ticket.title}
                      </div>
                      {ticket.error_code && (
                        <div className="text-xs text-gray-400 font-mono">
                          {ticket.error_code}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {ticket.user_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {ticket.user_email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ticket.system_component || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ticket.severity ? (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(ticket.severity)}`}>
                        {ticket.severity.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(ticket.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <select
                      value={ticket.status}
                      onChange={(e) => handleUpdateTicketStatus(ticket.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="pending_customer">Pending Customer</option>
                      <option value="pending_internal">Pending Internal</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                <AlertTriangle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Ticket Number:</span>
                  <span className="ml-2">{selectedTicket.ticket_number}</span>
                </div>
                <div>
                  <span className="font-medium">User:</span>
                  <span className="ml-2">{selectedTicket.user_name}</span>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <span className="ml-2">{selectedTicket.user_email}</span>
                </div>
                <div>
                  <span className="font-medium">Component:</span>
                  <span className="ml-2">{selectedTicket.system_component || 'N/A'}</span>
                </div>
                {selectedTicket.error_code && (
                  <div>
                    <span className="font-medium">Error Code:</span>
                    <span className="ml-2 font-mono text-xs">{selectedTicket.error_code}</span>
                  </div>
                )}
                {selectedTicket.severity && (
                  <div>
                    <span className="font-medium">Severity:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(selectedTicket.severity)}`}>
                      {selectedTicket.severity.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{selectedTicket.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalDashboard;








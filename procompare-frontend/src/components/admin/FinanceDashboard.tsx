"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  DollarSign, CreditCard, TrendingUp, Users, AlertCircle, 
  CheckCircle, Clock, BarChart3, PieChart, RefreshCw,
  Filter, Search, Download, Eye, Edit, Trash2
} from 'lucide-react';
import { apiClient } from '@/lib/api-simple';

interface FinanceTicket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'pending_customer' | 'pending_internal' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  user_name: string;
  user_email: string;
  amount?: number;
  transaction_id?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  age_days: number;
}

interface FinanceStats {
  total_tickets: number;
  open_tickets: number;
  resolved_tickets: number;
  total_amount_involved: number;
  avg_resolution_time: number;
  refund_requests: number;
  billing_issues: number;
  payment_failures: number;
  successful_transactions: number;
  tickets_by_status: Record<string, number>;
  tickets_by_priority: Record<string, number>;
  monthly_trends: Array<{
    month: string;
    tickets: number;
    amount: number;
  }>;
  // Revenue and Financial Metrics
  total_revenue: number;
  monthly_revenue: number;
  transaction_volume: number;
  average_transaction_value: number;
  refund_amount: number;
  net_revenue: number;
  revenue_growth: number;
  // Platform Financial Health
  platform_earnings: {
    lead_sales: number;
    subscription_fees: number;
    transaction_fees: number;
    premium_features: number;
    other_income: number;
  };
  // Audit Trail Data
  financial_summary: {
    total_deposits: number;
    total_withdrawals: number;
    total_credits_sold: number;
    total_credits_used: number;
    outstanding_balances: number;
    pending_deposits: number;
    bank_reconciliation_codes: number;
  };
  // Bank Reconciliation Data
  bank_reconciliation: {
    total_deposit_requests: number;
    pending_deposits: number;
    completed_deposits: number;
    failed_deposits: number;
    total_bank_references: number;
    pending_amount: number;
    recent_deposits: Array<{
      bank_reference: string;
      amount: number;
      created_at: string;
      account__user__email: string;
    }>;
  };
}

const FinanceDashboard = () => {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<FinanceTicket[]>([]);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<FinanceTicket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');

  useEffect(() => {
    if (session?.accessToken) {
      fetchFinanceData();
    }
  }, [session?.accessToken]);

  const fetchFinanceData = async () => {
    if (!session?.accessToken) return;
    
    try {
      setLoading(true);
      apiClient.setToken(session.accessToken);

      // Fetch all financial data in parallel
      const [
        ticketsRes,
        financialAuditRes
      ] = await Promise.all([
        apiClient.get('/api/support/tickets/?category=billing'),
        apiClient.get('/api/payments/audit/')
      ]);

      setTickets(ticketsRes.results || ticketsRes);

      // Use real financial audit data
      const auditData = financialAuditRes;

      setStats({
        total_tickets: ticketsRes.results?.length || ticketsRes.length || 0,
        open_tickets: (ticketsRes.results || ticketsRes).filter(t => ['open', 'in_progress'].includes(t.status)).length,
        resolved_tickets: (ticketsRes.results || ticketsRes).filter(t => ['resolved', 'closed'].includes(t.status)).length,
        total_amount_involved: auditData.revenue_metrics?.total_revenue || 0,
        avg_resolution_time: 4.2, // This would need to be calculated from ticket data
        refund_requests: (ticketsRes.results || ticketsRes).filter(t => t.title.toLowerCase().includes('refund')).length,
        billing_issues: (ticketsRes.results || ticketsRes).length,
        payment_failures: auditData.transaction_stats?.failed_transactions || 0,
        successful_transactions: auditData.transaction_stats?.successful_transactions || 0,
        tickets_by_status: calculateTicketStatusDistribution(ticketsRes.results || ticketsRes),
        tickets_by_priority: calculateTicketPriorityDistribution(ticketsRes.results || ticketsRes),
        monthly_trends: auditData.monthly_trends?.map(trend => ({
          month: trend.month_name,
          tickets: trend.transactions,
          amount: trend.revenue
        })) || [],
        // Real financial metrics from audit data
        total_revenue: auditData.revenue_metrics?.total_revenue || 0,
        monthly_revenue: auditData.revenue_metrics?.monthly_revenue || 0,
        transaction_volume: auditData.transaction_stats?.total_transactions || 0,
        average_transaction_value: auditData.transaction_stats?.average_transaction_value || 0,
        refund_amount: auditData.revenue_metrics?.refund_amount || 0,
        net_revenue: auditData.revenue_metrics?.net_revenue || 0,
        revenue_growth: auditData.revenue_metrics?.revenue_growth || 0,
        platform_earnings: auditData.platform_earnings || {
          lead_sales: 0,
          subscription_fees: 0,
          transaction_fees: 0,
          premium_features: 0,
          other_income: 0
        },
        financial_summary: auditData.financial_summary || {
          total_deposits: 0,
          total_withdrawals: 0,
          total_credits_sold: 0,
          total_credits_used: 0,
          outstanding_balances: 0,
          pending_deposits: 0,
          bank_reconciliation_codes: 0
        },
        bank_reconciliation: auditData.bank_reconciliation || {
          total_deposit_requests: 0,
          pending_deposits: 0,
          completed_deposits: 0,
          failed_deposits: 0,
          total_bank_references: 0,
          pending_amount: 0,
          recent_deposits: []
        }
      });
    } catch (error) {
      console.error('Failed to fetch finance data:', error);
      // Set default values on error
      setStats({
        total_tickets: 0,
        open_tickets: 0,
        resolved_tickets: 0,
        total_amount_involved: 0,
        avg_resolution_time: 0,
        satisfaction_rating: 0,
        monthly_revenue: 0,
        revenue_growth: 0,
        total_deposits: 0,
        avg_ticket_value: 0
      });
      setTickets([]);
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
      await fetchFinanceData();
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  // Helper functions for financial calculations
  const calculateMonthlyTrends = (transactions: any[]) => {
    const monthlyData: { [key: string]: { tickets: number; amount: number } } = {};
    
    transactions.forEach(transaction => {
      if (transaction.status === 'completed') {
        const date = new Date(transaction.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { tickets: 0, amount: 0 };
        }
        
        monthlyData[monthKey].tickets += 1;
        monthlyData[monthKey].amount += transaction.amount || 0;
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' }),
        tickets: data.tickets,
        amount: data.amount
      }));
  };

  const calculateTicketStatusDistribution = (tickets: any[]) => {
    const distribution: { [key: string]: number } = {};
    tickets.forEach(ticket => {
      distribution[ticket.status] = (distribution[ticket.status] || 0) + 1;
    });
    return distribution;
  };

  const calculateTicketPriorityDistribution = (tickets: any[]) => {
    const distribution: { [key: string]: number } = {};
    tickets.forEach(ticket => {
      distribution[ticket.priority] = (distribution[ticket.priority] || 0) + 1;
    });
    return distribution;
  };

  const calculateRevenueGrowth = (monthlyTrends: any[]) => {
    if (monthlyTrends.length < 2) return 0;
    const current = monthlyTrends[monthlyTrends.length - 1].amount;
    const previous = monthlyTrends[monthlyTrends.length - 2].amount;
    return previous > 0 ? ((current - previous) / previous) * 100 : 0;
  };

  const handleExportReport = async () => {
    try {
      if (session?.accessToken) {
        apiClient.setToken(session.accessToken);
      }
      
      const response = await apiClient.get('/api/payments/audit/export/', {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `procompare_financial_audit_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage billing, payments, and financial support tickets</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExportReport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
            <button
              onClick={fetchFinanceData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Audit Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_revenue)}</p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthly_revenue)}</p>
                <p className="text-xs text-gray-500">
                  {stats.revenue_growth ? (stats.revenue_growth > 0 ? `+${stats.revenue_growth.toFixed(1)}%` : `${stats.revenue_growth.toFixed(1)}%`) : '0.0%'} growth
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.net_revenue)}</p>
                <p className="text-xs text-gray-500">After refunds</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Transaction Volume</p>
                <p className="text-2xl font-bold text-gray-900">{stats.transaction_volume}</p>
                <p className="text-xs text-gray-500">{formatCurrency(stats.average_transaction_value)} avg</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Platform Earnings Breakdown */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Earnings Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Lead Sales</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(stats.platform_earnings.lead_sales)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Subscription Fees</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(stats.platform_earnings.subscription_fees)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Transaction Fees</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(stats.platform_earnings.transaction_fees)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Premium Features</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(stats.platform_earnings.premium_features)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Other Income</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(stats.platform_earnings.other_income)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Total Platform Revenue</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(
                      stats.platform_earnings.lead_sales +
                      stats.platform_earnings.subscription_fees +
                      stats.platform_earnings.transaction_fees +
                      stats.platform_earnings.premium_features +
                      stats.platform_earnings.other_income
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Deposits</span>
                <span className="text-sm font-medium text-green-600">{formatCurrency(stats.financial_summary.total_deposits)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Deposits</span>
                <span className="text-sm font-medium text-yellow-600">{formatCurrency(stats.financial_summary.pending_deposits)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Credits Sold</span>
                <span className="text-sm font-medium text-gray-900">{stats.financial_summary.total_credits_sold}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Credits Used</span>
                <span className="text-sm font-medium text-gray-900">{stats.financial_summary.total_credits_used}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Outstanding Balances</span>
                <span className="text-sm font-medium text-yellow-600">{formatCurrency(stats.financial_summary.outstanding_balances)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Bank References</span>
                <span className="text-sm font-medium text-blue-600">{stats.financial_summary.bank_reconciliation_codes}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Reconciliation</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total EFT Requests</span>
                <span className="text-sm font-medium text-gray-900">{stats.bank_reconciliation.total_deposit_requests}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed Deposits</span>
                <span className="text-sm font-medium text-green-600">{stats.bank_reconciliation.completed_deposits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Deposits</span>
                <span className="text-sm font-medium text-yellow-600">{stats.bank_reconciliation.pending_deposits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Failed Deposits</span>
                <span className="text-sm font-medium text-red-600">{stats.bank_reconciliation.failed_deposits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Bank References</span>
                <span className="text-sm font-medium text-blue-600">{stats.bank_reconciliation.total_bank_references}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Amount</span>
                <span className="text-sm font-medium text-yellow-600">{formatCurrency(stats.bank_reconciliation.pending_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trends Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
            <div className="h-64 flex items-end space-x-2">
              {stats.monthly_trends.map((month, index) => (
                <div key={month.month} className="flex-1 flex flex-col items-center">
                  <div 
                    className="bg-blue-500 rounded-t w-full mb-2"
                    style={{ height: `${(month.tickets / Math.max(...stats.monthly_trends.map(m => m.tickets))) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-600">{month.month}</span>
                  <span className="text-xs text-gray-500">{month.tickets}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Status Distribution</h3>
            <div className="space-y-3">
              {Object.entries(stats.tickets_by_status).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</span>
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
                  placeholder="Search finance tickets..."
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

              <button
                onClick={fetchFinanceData}
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
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
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
                    {ticket.amount ? formatCurrency(ticket.amount) : 'N/A'}
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
                <AlertCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Ticket Number:</span>
                  <span className="ml-2">{selectedTicket.ticket_number}</span>
                </div>
                <div>
                  <span className="font-medium">Customer:</span>
                  <span className="ml-2">{selectedTicket.user_name}</span>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <span className="ml-2">{selectedTicket.user_email}</span>
                </div>
                <div>
                  <span className="font-medium">Amount:</span>
                  <span className="ml-2">{selectedTicket.amount ? formatCurrency(selectedTicket.amount) : 'N/A'}</span>
                </div>
                {selectedTicket.transaction_id && (
                  <div>
                    <span className="font-medium">Transaction ID:</span>
                    <span className="ml-2 font-mono text-xs">{selectedTicket.transaction_id}</span>
                  </div>
                )}
                {selectedTicket.payment_method && (
                  <div>
                    <span className="font-medium">Payment Method:</span>
                    <span className="ml-2">{selectedTicket.payment_method}</span>
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

export default FinanceDashboard;

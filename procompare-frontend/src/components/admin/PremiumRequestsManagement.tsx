"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Crown, CheckCircle, XCircle, RefreshCw, Filter, Eye, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api-simple';

interface PremiumRequest {
  id: string;
  deposit_id: string;
  provider_id: string;
  provider_email: string;
  provider_name: string;
  business_name: string;
  amount: number;
  plan_type: 'monthly' | 'lifetime';
  status: string;
  reference_number: string;
  bank_reference: string;
  verification_notes: string;
  admin_notes: string;
  created_at: string;
  processed_at?: string;
  processed_by?: string;
  is_premium_active: boolean;
  premium_expires_at?: string;
}

export default function PremiumRequestsManagement() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<PremiumRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [selectedRequest, setSelectedRequest] = useState<PremiumRequest | null>(null);

  useEffect(() => {
    if (token) {
      fetchRequests();
    } else {
      setLoading(false);
      setError('Authentication token not available. Please log in again.');
    }
  }, [token, statusFilter]);

  const fetchRequests = async () => {
    if (!token) {
      setError('Authentication token not available');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Ensure token is set before making request
      apiClient.setToken(token);
      const data = await apiClient.getPremiumRequests(statusFilter);
      setRequests(data.premium_requests || []);
    } catch (err: any) {
      console.error('Failed to fetch premium requests:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load premium requests';
      setError(errorMessage);
      // If 401, suggest re-login
      if (err.response?.status === 401) {
        setError('Session expired. Please log out and log in again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      const notes = adminNotes[requestId] || '';
      
      if (!token) {
        throw new Error('Authentication token not available');
      }
      
      apiClient.setToken(token);
      await apiClient.approvePremiumRequest(requestId, notes);
      
      await fetchRequests();
      setAdminNotes({ ...adminNotes, [requestId]: '' });
      setSelectedRequest(null);
      alert('Premium listing approved and activated!');
    } catch (err: any) {
      console.error('Failed to approve premium request:', err);
      alert(err.response?.data?.error || err.message || 'Failed to approve premium request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      const notes = adminNotes[requestId] || 'Premium listing request rejected';
      
      if (!confirm('Are you sure you want to reject this premium request?')) {
        setProcessingId(null);
        return;
      }
      
      if (!token) {
        throw new Error('Authentication token not available');
      }
      
      apiClient.setToken(token);
      await apiClient.rejectPremiumRequest(requestId, notes);
      
      await fetchRequests();
      setAdminNotes({ ...adminNotes, [requestId]: '' });
      setSelectedRequest(null);
      alert('Premium request rejected');
    } catch (err: any) {
      console.error('Failed to reject premium request:', err);
      alert(err.response?.data?.error || err.message || 'Failed to reject premium request');
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
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

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    };
    const style = badges[status as keyof typeof badges] || badges.pending;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  if (loading && requests.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Premium Listing Requests</h1>
        <p className="text-gray-600">Review and approve premium listing upgrade requests from providers</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
        </div>
        <div className="flex gap-2">
          {['pending', 'completed', 'failed', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={fetchRequests}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Crown className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No premium requests found</p>
          <p className="text-sm text-gray-500 mt-2">
            {statusFilter === 'pending' 
              ? 'No pending premium requests at this time'
              : `No ${statusFilter} premium requests found`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className={`bg-white rounded-lg border p-6 ${
                request.status === 'pending' ? 'border-yellow-200 bg-yellow-50' :
                request.status === 'completed' ? 'border-green-200 bg-green-50' :
                'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Crown className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{request.business_name}</h3>
                    {getStatusBadge(request.status)}
                    {request.is_premium_active && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Provider:</span>
                      <p className="font-medium text-gray-900">{request.provider_name}</p>
                      <p className="text-gray-500 text-xs">{request.provider_email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <p className="font-medium text-gray-900">{formatCurrency(request.amount)}</p>
                      <p className="text-gray-500 text-xs">{request.plan_type === 'lifetime' ? 'Lifetime' : 'Monthly'} plan</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Reference:</span>
                      <p className="font-medium text-gray-900">{request.reference_number}</p>
                      {request.bank_reference && (
                        <p className="text-gray-500 text-xs">Bank: {request.bank_reference}</p>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-600">Requested:</span>
                      <p className="font-medium text-gray-900">{formatDate(request.created_at)}</p>
                      {request.processed_at && (
                        <p className="text-gray-500 text-xs">Processed: {formatDate(request.processed_at)}</p>
                      )}
                    </div>
                  </div>

                  {request.verification_notes && (
                    <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Verification Notes:</p>
                      <p className="text-sm text-gray-900">{request.verification_notes}</p>
                    </div>
                  )}

                  {request.admin_notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Admin Notes:</p>
                      <p className="text-sm text-gray-900">{request.admin_notes}</p>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="mt-4 p-4 bg-white rounded border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admin Notes (optional):
                      </label>
                      <textarea
                        value={adminNotes[request.id] || ''}
                        onChange={(e) => setAdminNotes({ ...adminNotes, [request.id]: e.target.value })}
                        placeholder="Add notes about this approval/rejection..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              </div>

              {request.status === 'pending' && (
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={processingId === request.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === request.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve & Activate Premium
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={processingId === request.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === request.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

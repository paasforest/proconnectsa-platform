"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { FileText, CheckCircle, XCircle, RefreshCw, Filter, Eye, Download, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api-simple';

interface VerificationDocument {
  type: string;
  url: string;
  path: string;
  uploaded_at: string;
}

interface Verification {
  provider_id: string;
  profile_id: string;
  provider_email: string;
  provider_name: string;
  business_name: string;
  verification_status: string;
  document_count: number;
  documents: VerificationDocument[];
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export default function VerificationDocumentsManagement() {
  const { token } = useAuth();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);

  useEffect(() => {
    if (token) {
      apiClient.setToken(token);
      fetchVerifications();
    }
  }, [token, statusFilter]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`https://api.proconnectsa.co.za/api/admin/verifications/?status=${statusFilter}`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setVerifications(data.verifications || []);
    } catch (err: any) {
      console.error('Failed to fetch verifications:', err);
      setError(err.message || 'Failed to load verification documents');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (providerId: string) => {
    try {
      setProcessingId(providerId);
      
      const response = await fetch(`https://api.proconnectsa.co.za/api/admin/verifications/${providerId}/approve/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve verification');
      }
      
      await fetchVerifications();
      setSelectedVerification(null);
      alert('Provider verification approved!');
    } catch (err: any) {
      console.error('Failed to approve verification:', err);
      alert(err.message || 'Failed to approve verification');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (providerId: string) => {
    try {
      setProcessingId(providerId);
      const notes = adminNotes[providerId] || 'Verification rejected';
      
      if (!notes || notes.trim() === '') {
        alert('Please provide a reason for rejection');
        setProcessingId(null);
        return;
      }
      
      if (!confirm('Are you sure you want to reject this verification? The provider will be notified.')) {
        setProcessingId(null);
        return;
      }
      
      const response = await fetch(`https://api.proconnectsa.co.za/api/admin/verifications/${providerId}/reject/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ admin_notes: notes }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject verification');
      }
      
      await fetchVerifications();
      setAdminNotes({ ...adminNotes, [providerId]: '' });
      setSelectedVerification(null);
      alert('Verification rejected');
    } catch (err: any) {
      console.error('Failed to reject verification:', err);
      alert(err.message || 'Failed to reject verification');
    } finally {
      setProcessingId(null);
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

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Review' },
      verified: { bg: 'bg-green-100', text: 'text-green-800', label: 'Verified' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    };
    const style = badges[status as keyof typeof badges] || badges.pending;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      id_document: 'ID Document',
      passport: 'Passport',
      proof_of_address: 'Proof of Address',
      business_registration: 'Business Registration',
      insurance: 'Insurance Certificate',
      other: 'Other Document',
    };
    return labels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getFullDocumentUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    if (url.startsWith('/media/')) return `https://api.proconnectsa.co.za${url}`;
    return `https://api.proconnectsa.co.za/media/${url}`;
  };

  if (loading && verifications.length === 0) {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Provider Verification Documents</h1>
        <p className="text-gray-600">Review and approve verification documents uploaded by providers</p>
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
          {['pending', 'verified', 'rejected', 'all'].map((status) => (
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
          onClick={fetchVerifications}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Verifications List */}
      {verifications.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No verification documents found</p>
          <p className="text-sm text-gray-500 mt-2">
            {statusFilter === 'pending' 
              ? 'No pending verifications at this time'
              : `No ${statusFilter} verifications found`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {verifications.map((verification) => (
            <div
              key={verification.provider_id}
              className={`bg-white rounded-lg border p-6 ${
                verification.verification_status === 'pending' ? 'border-yellow-200 bg-yellow-50' :
                verification.verification_status === 'verified' ? 'border-green-200 bg-green-50' :
                'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{verification.business_name}</h3>
                    {getStatusBadge(verification.verification_status)}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">Provider:</span>
                      <p className="font-medium text-gray-900">{verification.provider_name}</p>
                      <p className="text-gray-500 text-xs">{verification.provider_email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Documents:</span>
                      <p className="font-medium text-gray-900">{verification.document_count} document(s)</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Submitted:</span>
                      <p className="font-medium text-gray-900">{formatDate(verification.created_at)}</p>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Uploaded Documents:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {verification.documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-white rounded border border-gray-200"
                        >
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {getDocumentTypeLabel(doc.type)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(doc.uploaded_at)}
                            </p>
                          </div>
                          <a
                            href={getFullDocumentUrl(doc.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {verification.admin_notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Admin Notes:</p>
                      <p className="text-sm text-gray-900">{verification.admin_notes}</p>
                    </div>
                  )}

                  {verification.verification_status === 'pending' && (
                    <div className="mt-4 p-4 bg-white rounded border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason (required if rejecting):
                      </label>
                      <textarea
                        value={adminNotes[verification.provider_id] || ''}
                        onChange={(e) => setAdminNotes({ ...adminNotes, [verification.provider_id]: e.target.value })}
                        placeholder="Explain why verification is being rejected..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </div>

              {verification.verification_status === 'pending' && (
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => handleApprove(verification.provider_id)}
                    disabled={processingId === verification.provider_id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === verification.provider_id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve Verification
                  </button>
                  <button
                    onClick={() => handleReject(verification.provider_id)}
                    disabled={processingId === verification.provider_id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingId === verification.provider_id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject Verification
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

"use client";

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Clock, DollarSign, Building, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

interface DepositDetailModalProps {
  depositId: string;
  onClose: () => void;
  onAction?: () => void; // Callback to refresh data after action
}

const DepositDetailModal: React.FC<DepositDetailModalProps> = ({ depositId, onClose, onAction }) => {
  const { token } = useAuth();
  const [depositData, setDepositData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNotes, setActionNotes] = useState('');

  useEffect(() => {
    const fetchDepositDetail = async () => {
      if (!token || !depositId) return;

      try {
        setLoading(true);
        const response = await fetch(`https://api.proconnectsa.co.za/api/users/admin/deposits/${depositId}/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch deposit details');
        }

        const data = await response.json();
        setDepositData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load deposit details');
      } finally {
        setLoading(false);
      }
    };

    fetchDepositDetail();
  }, [depositId, token]);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!token || !depositId) return;

    try {
      setActionLoading(true);
      const response = await fetch(`https://api.proconnectsa.co.za/api/users/admin/deposits/${depositId}/action/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          notes: actionNotes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process action');
      }

      // Refresh deposit data
      const fetchResponse = await fetch(`https://api.proconnectsa.co.za/api/users/admin/deposits/${depositId}/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (fetchResponse.ok) {
        const updatedData = await fetchResponse.json();
        setDepositData(updatedData);
      }

      // Call callback to refresh parent component
      if (onAction) {
        onAction();
      }

      // Clear notes
      setActionNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to process action');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !depositData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Deposit Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="text-red-600">{error || 'Deposit not found'}</div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const isPending = depositData.status === 'pending';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Deposit Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className={`rounded-lg p-4 ${
            depositData.status === 'completed' ? 'bg-green-50 border border-green-200' :
            depositData.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {depositData.status === 'completed' ? (
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                ) : depositData.status === 'pending' ? (
                  <Clock className="w-6 h-6 text-yellow-600 mr-3" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 mr-3" />
                )}
                <div>
                  <p className="font-semibold text-gray-900">Status: {depositData.status.toUpperCase()}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Created {depositData.age_hours.toFixed(1)} hours ago
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                depositData.status === 'completed' ? 'bg-green-100 text-green-800' :
                depositData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {depositData.status}
              </span>
            </div>
          </div>

          {/* Deposit Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deposit Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-bold text-2xl text-gray-900 flex items-center mt-1">
                  <DollarSign className="w-5 h-5 mr-2" />
                  R{depositData.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Credits to Activate</p>
                <p className="font-medium text-gray-900 text-xl mt-1">
                  {depositData.credits_to_activate} credits
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reference Number</p>
                <p className="font-medium text-gray-900 font-mono mt-1">
                  {depositData.reference_number}
                </p>
              </div>
              {depositData.bank_reference && (
                <div>
                  <p className="text-sm text-gray-600">Bank Reference</p>
                  <p className="font-medium text-gray-900 font-mono mt-1">
                    {depositData.bank_reference}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Created At</p>
                <p className="font-medium text-gray-900 mt-1">
                  {new Date(depositData.created_at).toLocaleString()}
                </p>
              </div>
              {depositData.processed_at && (
                <div>
                  <p className="text-sm text-gray-600">Processed At</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {new Date(depositData.processed_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* User Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-gray-600 mr-2" />
                <span className="text-sm text-gray-600">Email: </span>
                <span className="font-medium text-gray-900 ml-2">{depositData.user.email}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600">Name: </span>
                <span className="font-medium text-gray-900 ml-2">{depositData.user.name}</span>
              </div>
              {depositData.user.business_name && (
                <div className="flex items-center">
                  <Building className="w-4 h-4 text-gray-600 mr-2" />
                  <span className="text-sm text-gray-600">Business: </span>
                  <span className="font-medium text-gray-900 ml-2">{depositData.user.business_name}</span>
                </div>
              )}
              {depositData.user.verification_status && (
                <div>
                  <span className="text-sm text-gray-600">Verification Status: </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                    depositData.user.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                    depositData.user.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {depositData.user.verification_status}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          {(depositData.admin_notes || depositData.verification_notes) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
              {depositData.admin_notes && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">Admin Notes:</p>
                  <p className="text-gray-900">{depositData.admin_notes}</p>
                </div>
              )}
              {depositData.verification_notes && (
                <div>
                  <p className="text-sm text-gray-600">Verification Notes:</p>
                  <p className="text-gray-900">{depositData.verification_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Action Section (only for pending deposits) */}
          {isPending && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start mb-4">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Take Action</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    This deposit is pending approval. Review the details and take appropriate action.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                    placeholder="Add notes about this action..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction('approve')}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {actionLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Approve Deposit
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {actionLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 mr-2" />
                        Reject Deposit
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositDetailModal;

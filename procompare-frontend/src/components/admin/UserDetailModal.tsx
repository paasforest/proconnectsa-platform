"use client";

import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, MapPin, Building, CheckCircle, XCircle, Clock, DollarSign, CreditCard } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

interface UserDetailModalProps {
  email: string;
  onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ email, onClose }) => {
  const { token } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetail = async () => {
      if (!token || !email) return;

      try {
        setLoading(true);
        const response = await fetch(`https://api.proconnectsa.co.za/api/users/admin/users/${encodeURIComponent(email)}/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }

        const data = await response.json();
        setUserData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetail();
  }, [email, token]);

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

  if (error || !userData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">User Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="text-red-600">{error || 'User not found'}</div>
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

  const { user, provider_profile, deposits, account_status } = userData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900 flex items-center mt-1">
                  <Mail className="w-4 h-4 mr-2" />
                  {user.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">User Type</p>
                <p className="font-medium text-gray-900 capitalize">{user.user_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Status</p>
                <div className="flex items-center mt-1">
                  {user.is_active ? (
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 mr-2" />
                  )}
                  <span className={`font-medium ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Registered</p>
                <p className="font-medium text-gray-900">
                  {new Date(user.date_joined).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Login</p>
                <p className="font-medium text-gray-900">
                  {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Provider Profile */}
          {provider_profile?.exists && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Business Name</p>
                  <p className="font-medium text-gray-900 flex items-center mt-1">
                    <Building className="w-4 h-4 mr-2" />
                    {provider_profile.business_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Verification Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    provider_profile.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                    provider_profile.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {provider_profile.verification_status}
                  </span>
                </div>
                {provider_profile.business_phone && (
                  <div>
                    <p className="text-sm text-gray-600">Business Phone</p>
                    <p className="font-medium text-gray-900 flex items-center mt-1">
                      <Phone className="w-4 h-4 mr-2" />
                      {provider_profile.business_phone}
                    </p>
                  </div>
                )}
                {provider_profile.business_address && (
                  <div>
                    <p className="text-sm text-gray-600">Business Address</p>
                    <p className="font-medium text-gray-900 flex items-center mt-1">
                      <MapPin className="w-4 h-4 mr-2" />
                      {provider_profile.business_address}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Credit Balance</p>
                  <p className="font-medium text-gray-900 flex items-center mt-1">
                    <CreditCard className="w-4 h-4 mr-2" />
                    {provider_profile.credit_balance} credits
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Subscription Tier</p>
                  <p className="font-medium text-gray-900 capitalize">{provider_profile.subscription_tier.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Deposits */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deposit History</h3>
            <div className="mb-4 flex gap-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm text-gray-600">Pending: <strong>{deposits.pending}</strong></span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm text-gray-600">Completed: <strong>{deposits.completed}</strong></span>
              </div>
              <div className="flex items-center">
                <XCircle className="w-4 h-4 text-red-600 mr-2" />
                <span className="text-sm text-gray-600">Failed: <strong>{deposits.failed}</strong></span>
              </div>
            </div>
            {deposits.history.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {deposits.history.map((deposit: any) => (
                  <div key={deposit.id} className="bg-white border border-gray-200 rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">R{deposit.amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Ref: {deposit.reference_number}
                        </p>
                        {deposit.bank_reference && (
                          <p className="text-xs text-gray-600">Bank Ref: {deposit.bank_reference}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          deposit.status === 'completed' ? 'bg-green-100 text-green-800' :
                          deposit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {deposit.status}
                        </span>
                        <p className="text-xs text-gray-600 mt-1">
                          {deposit.age_hours.toFixed(1)}h ago
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No deposits found</p>
            )}
          </div>

          {/* Account Status Summary */}
          <div className="bg-emerald-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                {account_status.has_provider_profile ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400 mr-2" />
                )}
                <span className="text-sm text-gray-700">
                  Has Provider Profile: {account_status.has_provider_profile ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center">
                {account_status.profile_complete ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400 mr-2" />
                )}
                <span className="text-sm text-gray-700">
                  Profile Complete: {account_status.profile_complete ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center">
                {account_status.has_pending_deposits ? (
                  <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                )}
                <span className="text-sm text-gray-700">
                  Pending Deposits: {account_status.has_pending_deposits ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center">
                {account_status.can_purchase_leads ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400 mr-2" />
                )}
                <span className="text-sm text-gray-700">
                  Can Purchase Leads: {account_status.can_purchase_leads ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
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

export default UserDetailModal;

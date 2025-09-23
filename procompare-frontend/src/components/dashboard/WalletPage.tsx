"use client";

import React, { useState, useEffect } from 'react';
import {
  Wallet, Plus, Minus, CreditCard, Banknote, ArrowUpRight, 
  ArrowDownRight, Clock, CheckCircle, XCircle, Copy, ExternalLink,
  RefreshCw, AlertCircle, TrendingUp, DollarSign, Calendar
} from 'lucide-react';
import { apiClient } from '@/lib/api-simple';
import { useSession } from 'next-auth/react';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'lead_purchase' | 'refund';
  amount: number;
  credits: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  reference?: string;
}

interface WalletData {
  balance: number;
  credits: number;
  customer_code: string;
  account_details: {
    bank_name: string;
    account_number: string;
    branch_code: string;
    account_holder: string;
  };
  instructions?: string[];
}

const WalletPage = () => {
  const { data: session } = useSession();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(500);
  const [showBankingDetails, setShowBankingDetails] = useState(false);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        if (!session?.accessToken) {
          console.warn('No access token found, user may not be authenticated');
          setLoading(false);
          return;
        }
        
        apiClient.setToken(session.accessToken);
        const response = await apiClient.get('/api/wallet/');
        setWalletData(response);
      } catch (error) {
        console.error('Failed to fetch wallet data:', error);
        
        // Only show mock data in development mode
        if (process.env.NODE_ENV === 'development') {
          setWalletData({
            balance: 1250.00,
            credits: 25,
            customer_code: 'CUS12345678',
            account_details: {
              bank_name: 'Nedbank',
              account_number: '1313872032',
              branch_code: '198765',
              account_holder: 'ProConnectSA Platform'
            }
          });
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchTransactions = async () => {
      try {
        if (session?.accessToken) {
          apiClient.setToken(session.accessToken);
        }
        const response = await apiClient.get('/api/auth/api/wallet/transactions/');
        setTransactions(response.transactions || []);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        // Mock data for now
        setTransactions([
          {
            id: '1',
            type: 'lead_purchase',
            amount: -100.00,
            credits: -2,
            description: 'Plumbing lead - Cape Town',
            status: 'completed',
            created_at: '2024-01-15T14:30:00Z',
            reference: 'LEAD-001'
          },
          {
            id: '2',
            type: 'deposit',
            amount: 500.00,
            credits: 10,
            description: 'Bank deposit - R500',
            status: 'completed',
            created_at: '2024-01-14T10:15:00Z',
            reference: 'DEP-002'
          },
          {
            id: '3',
            type: 'lead_purchase',
            amount: -150.00,
            credits: -3,
            description: 'Web design lead - Johannesburg',
            status: 'completed',
            created_at: '2024-01-13T16:45:00Z',
            reference: 'LEAD-003'
          },
          {
            id: '4',
            type: 'deposit',
            amount: 1000.00,
            credits: 20,
            description: 'Bank deposit - R1000',
            status: 'completed',
            created_at: '2024-01-12T09:30:00Z',
            reference: 'DEP-004'
          }
        ]);
      }
    };

    // Only fetch data if user is authenticated
    if (session?.accessToken) {
      fetchWalletData();
      fetchTransactions();
    } else {
      setLoading(false);
    }
  }, [session?.accessToken]);

  const handleTopUp = async () => {
    try {
      if (session?.accessToken) {
        apiClient.setToken(session.accessToken);
      }
      const response = await apiClient.post('/api/wallet/top-up/', {
        amount: topUpAmount
      });
      
      if (response.success) {
        setShowTopUpModal(false);
        setShowBankingDetails(true);
        // Store the response data for the banking details modal
        setWalletData(prev => prev ? {
          ...prev,
          account_details: response.account_details,
          customer_code: response.customer_code,
          instructions: response.instructions
        } : null);
        // Refresh wallet data without reloading the page
        setTimeout(() => {
          refreshWalletData();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to initiate top-up:', error);
      alert('Failed to initiate top-up. Please try again.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const refreshWalletData = async () => {
    try {
      if (session?.accessToken) {
        apiClient.setToken(session.accessToken);
      }
      const [walletResponse, transactionsResponse] = await Promise.all([
        apiClient.get('/api/wallet/'),
        apiClient.get('/api/wallet/transactions/')
      ]);
      setWalletData(walletResponse);
      setTransactions(transactionsResponse.transactions || []);
    } catch (error) {
      console.error('Failed to refresh wallet data:', error);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownRight className="w-5 h-5 text-green-600" />;
      case 'withdrawal': return <ArrowUpRight className="w-5 h-5 text-red-600" />;
      case 'lead_purchase': return <Minus className="w-5 h-5 text-orange-600" />;
      case 'refund': return <Plus className="w-5 h-5 text-blue-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-green-600';
      case 'withdrawal': return 'text-red-600';
      case 'lead_purchase': return 'text-orange-600';
      case 'refund': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
        <p className="text-gray-600 mt-2">Manage your credits and view transaction history</p>
      </div>

      {/* Wallet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Credits Balance */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Credits Balance</p>
              <p className="text-3xl font-bold">{walletData?.credits || 0}</p>
              <p className="text-blue-100 text-sm">Available credits</p>
            </div>
            <Wallet className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        {/* Cash Balance */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Cash Balance</p>
              <p className="text-3xl font-bold">R{walletData?.balance?.toFixed(2) || '0.00'}</p>
              <p className="text-green-100 text-sm">Available funds</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-200" />
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Conversion Rate</p>
              <p className="text-3xl font-bold">R50</p>
              <p className="text-purple-100 text-sm">Per credit</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => setShowTopUpModal(true)}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Credits
        </button>
        
        <button
          onClick={() => setShowBankingDetails(true)}
          className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Banknote className="w-5 h-5 mr-2" />
          Banking Details
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Refresh
        </button>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
          <p className="text-sm text-gray-600">All your wallet transactions</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {transactions.length === 0 ? (
            <div className="p-6 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'deposit' ? 'bg-green-100' :
                      transaction.type === 'withdrawal' ? 'bg-red-100' :
                      transaction.type === 'lead_purchase' ? 'bg-orange-100' :
                      'bg-blue-100'
                    }`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(transaction.created_at)}
                        {transaction.reference && ` • ${transaction.reference}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.amount > 0 ? '+' : ''}R{Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {transaction.credits > 0 ? '+' : ''}{transaction.credits} credits
                      </p>
                    </div>
                    
                    <div className="flex items-center">
                      {getStatusIcon(transaction.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top-up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Credits</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (R)
              </label>
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="50"
                step="50"
              />
              <p className="text-sm text-gray-600 mt-1">
                You'll receive {Math.floor(topUpAmount / 50)} credits
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowTopUpModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleTopUp}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banking Details Modal */}
      {showBankingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Banking Details</h3>
              <button
                onClick={() => setShowBankingDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Account Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bank:</span>
                    <span className="text-sm font-medium">{walletData?.account_details.bank_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Account Number:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{walletData?.account_details.account_number}</span>
                      <button
                        onClick={() => copyToClipboard(walletData?.account_details.account_number || '')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Branch Code:</span>
                    <span className="text-sm font-medium">{walletData?.account_details.branch_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Account Holder:</span>
                    <span className="text-sm font-medium">{walletData?.account_details.account_holder}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Customer Reference</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                    {walletData?.customer_code}
                  </span>
                  <button
                    onClick={() => copyToClipboard(walletData?.customer_code || '')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Use this reference when making deposits to ensure automatic credit allocation
                </p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Important Instructions</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Always include your customer reference: {walletData?.customer_code}</li>
                  <li>• Credits are added automatically within 5 minutes</li>
                  <li>• Minimum deposit: R50 (1 credit)</li>
                  <li>• Contact support if credits don't appear within 30 minutes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;









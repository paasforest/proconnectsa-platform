'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

interface WalletData {
  balance: number;
  currency: string;
  last_updated?: string;
}

interface Transaction {
  id: number;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  date: string;
  status: string;
}

interface TopUpData {
  amount: number;
  customer_code: string;
  account_details: {
    bank_name: string;
    account_holder: string;
    account_number: string;
    branch_code: string;
  };
  instructions: string;
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpData, setTopUpData] = useState<TopUpData | null>(null);
  const [topUpLoading, setTopUpLoading] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError('');

      const [walletResponse, transactionsResponse] = await Promise.all([
        apiClient.getWallet(),
        apiClient.getTransactions()
      ]);

      if (walletResponse.success) {
        setWallet(walletResponse.data);
      }

      if (transactionsResponse.success) {
        setTransactions(transactionsResponse.data.transactions || []);
      }

    } catch (err: any) {
      console.error('Wallet load error:', err);
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) < 50) {
      alert('Minimum top-up amount is R50');
      return;
    }

    try {
      setTopUpLoading(true);
      const response = await apiClient.topUpWallet(parseFloat(topUpAmount));

      if (response.success) {
        setTopUpData(response.data);
        setShowTopUp(false);
      } else {
        alert(response.message || 'Top-up failed');
      }
    } catch (err: any) {
      alert(err.message || 'Top-up failed');
    } finally {
      setTopUpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button 
              onClick={loadWalletData}
              className="ml-4 text-red-800 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Wallet Balance */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Wallet Balance</h1>
              <p className="text-3xl font-bold text-green-600">
                {wallet?.currency || 'ZAR'} {wallet?.balance?.toFixed(2) || '0.00'}
              </p>
              {wallet?.last_updated && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {new Date(wallet.last_updated).toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowTopUp(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Top Up Wallet
            </button>
          </div>
        </div>

        {/* Top Up Modal */}
        {showTopUp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Top Up Wallet</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (ZAR)
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="1"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter amount (minimum R50)"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleTopUp}
                    disabled={topUpLoading}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {topUpLoading ? 'Processing...' : 'Continue'}
                  </button>
                  <button
                    onClick={() => {
                      setShowTopUp(false);
                      setTopUpAmount('');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Up Instructions */}
        {topUpData && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Payment Instructions</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 font-medium mb-2">Important: Use this reference code when making payment</p>
              <p className="text-blue-900 text-lg font-mono">{topUpData.customer_code}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Bank Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank:</span>
                    <span className="font-medium">{topUpData.account_details.bank_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Holder:</span>
                    <span className="font-medium">{topUpData.account_details.account_holder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Number:</span>
                    <span className="font-medium font-mono">{topUpData.account_details.account_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Branch Code:</span>
                    <span className="font-medium">{topUpData.account_details.branch_code}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">R{topUpData.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-medium font-mono text-xs">{topUpData.customer_code}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">{topUpData.instructions}</p>
            </div>
            
            <button
              onClick={() => setTopUpData(null)}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
          </div>
          
          {transactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No transactions found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="p-6 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()} at {new Date(transaction.date).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}R{Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}








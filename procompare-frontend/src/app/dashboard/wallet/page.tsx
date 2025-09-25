'use client';

import { useState, useEffect } from 'react';

export default function WalletPage() {
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(1500.00);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Wallet Balance</h1>
              <p className="text-3xl font-bold text-green-600">
                ZAR {balance.toFixed(2)}
              </p>
            </div>
            <div className="space-x-4">
              <button
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Top Up'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          <p className="text-gray-500">No transactions to display</p>
        </div>
      </div>
    </div>
  );
}
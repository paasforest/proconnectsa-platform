'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ErrorBoundary from '@/components/ErrorBoundary';

// Safe API client - handles undefined responses
const safeApiCall = async (apiFunction: () => Promise<any>) => {
  try {
    const response = await apiFunction();
    return response || { success: false, data: null };
  } catch (error) {
    console.error('API call failed:', error);
    return { success: false, error: error.message, data: null };
  }
};

interface UserStats {
  active_leads?: number;
  completed_leads?: number;
  pending_leads?: number;
  credit_balance?: number;
  total_earnings?: number;
  conversion_rate?: number;
}

interface WalletData {
  balance?: number;
  currency?: string;
}

function DashboardContent() {
  const [stats, setStats] = useState<UserStats>({});
  const [wallet, setWallet] = useState<WalletData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    // Only run on client side to avoid hydration issues
    if (typeof window !== 'undefined') {
      loadDashboardData();
    }
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Test if we can reach the API
      const healthCheck = await fetch('https://api.proconnectsa.co.za/api/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!healthCheck.ok) {
        throw new Error('API server is not responding');
      }
      
      // Load stats safely
      const statsResponse = await safeApiCall(async () => {
        const response = await fetch('https://api.proconnectsa.co.za/api/auth/stats/', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        return response.json();
      });

      // Load wallet safely
      const walletResponse = await safeApiCall(async () => {
        const response = await fetch('https://api.proconnectsa.co.za/api/wallet/', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        return response.json();
      });

      // Set data with defaults
      setStats({
        active_leads: 0,
        completed_leads: 0,
        pending_leads: 0,
        credit_balance: 0,
        total_earnings: 0,
        conversion_rate: 0,
        ...statsResponse?.data
      });

      setWallet({
        balance: 0,
        currency: 'ZAR',
        ...walletResponse?.data
      });

    } catch (err: any) {
      console.error('Dashboard load error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="font-bold">Dashboard Error</h3>
            <p>{error}</p>
          </div>
          <button 
            onClick={loadDashboardData}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Try Again
          </button>
          <div className="mt-4">
            <button
              onClick={() => router.push('/login')}
              className="text-indigo-600 hover:text-indigo-800 underline"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back to ProConnectSA</p>
        </div>

        {/* Stats Grid - All values have safe defaults */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Wallet Balance</h3>
            <p className="text-2xl font-bold text-green-600">
              {wallet.currency || 'ZAR'} {(wallet.balance || 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Leads</h3>
            <p className="text-2xl font-bold text-blue-600">
              {stats.active_leads || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Completed Leads</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {stats.completed_leads || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
            <p className="text-2xl font-bold text-purple-600">
              {stats.conversion_rate || 0}%
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/dashboard/wallet')}
                className="w-full text-left p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="font-medium text-green-800">Top Up Wallet</div>
                <div className="text-sm text-green-600">Add credits to your account</div>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard/leads')}
                className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="font-medium text-blue-800">Browse Leads</div>
                <div className="text-sm text-blue-600">Find new opportunities</div>
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <p className="text-gray-500">No recent activity to display</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Account Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Account Type:</span>
                <span className="font-medium">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export wrapped in ErrorBoundary
export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
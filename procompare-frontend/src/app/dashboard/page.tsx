'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { withAuth } from '@/components/AuthProvider';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

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

function DashboardPage({ user }: { user: any }) {
  const [stats, setStats] = useState<UserStats>({
    active_leads: 0,
    completed_leads: 0,
    pending_leads: 0,
    credit_balance: 0,
    total_earnings: 0,
    conversion_rate: 0
  });
  
  const [wallet, setWallet] = useState<WalletData>({
    balance: 0,
    currency: 'ZAR'
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Test API connection first
      const healthResponse = await fetch('https://api.proconnectsa.co.za/api/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!healthResponse.ok) {
        throw new Error('API server is not responding');
      }
      
      // Load stats
      const statsResponse = await fetch('https://api.proconnectsa.co.za/api/auth/stats/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      // Load wallet
      const walletResponse = await fetch('https://api.proconnectsa.co.za/api/wallet/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      // Parse responses safely
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success && statsData.data) {
          setStats({
            active_leads: statsData.data.active_leads || 0,
            completed_leads: statsData.data.completed_leads || 0,
            pending_leads: statsData.data.pending_leads || 0,
            credit_balance: statsData.data.credit_balance || 0,
            total_earnings: statsData.data.total_earnings || 0,
            conversion_rate: statsData.data.conversion_rate || 0
          });
        }
      }

      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        if (walletData.success && walletData.data) {
          setWallet({
            balance: walletData.data.balance || 0,
            currency: walletData.data.currency || 'ZAR'
          });
        }
      }

    } catch (err: any) {
      console.error('Dashboard load error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={loadDashboardData}
                className="text-red-800 underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back to ProConnectSA</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Wallet Balance</h3>
            <p className="text-2xl font-bold text-green-600">
              {wallet.currency} {(wallet.balance || 0).toFixed(2)}
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
            <p className="text-gray-500 text-sm">
              Dashboard is connected to your Flask API backend.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Account Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Backend:</span>
                <span className="text-blue-600 font-medium">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(DashboardPage, ['service_provider']);
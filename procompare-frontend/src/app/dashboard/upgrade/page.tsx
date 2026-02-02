'use client';

import { useState, useEffect } from 'react';
import { withAuth } from '@/components/AuthProvider';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SubscriptionPlans from '@/components/dashboard/SubscriptionPlans';
import { apiClient } from '@/lib/api-simple';
import { useAuth } from '@/components/AuthProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';

function UpgradePageContent() {
  const { token } = useAuth();
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        apiClient.setToken(token);
        const data = await apiClient.get('/api/auth/profile/');
        const tier = (data?.data?.subscription_tier ?? data?.subscription_tier ?? 'pay_as_you_go') as string;
        setCurrentTier(tier);
      } catch {
        setCurrentTier('pay_as_you_go');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleSelectPlan = async (planName: string) => {
    setMessage(null);
    const tier = planName.toLowerCase();
    if (tier === 'enterprise') {
      window.location.href = '/dashboard/support';
      return;
    }
    if (!token) return;
    setUpgrading(true);
    try {
      apiClient.setToken(token);
      const result = await apiClient.post('/api/payments/dashboard/subscription/upgrade/', {
        subscription_tier: tier,
      });
      setMessage({
        type: 'success',
        text: (result as any).message ?? 'Upgrade request received. Complete payment to activate your plan.',
      });
      setCurrentTier(tier);
      if ((result as any).requires_payment && (result as any).amount) {
        setMessage({
          type: 'success',
          text: `Upgrade requires payment of R${(result as any).amount}. Check your email or go to Credits & Wallet for banking details.`,
        });
      }
    } catch (err: any) {
      const data = (err as any).response?.data;
      const errorMsg = data?.error ?? err?.message ?? 'Upgrade request failed. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Upgrade plan</h1>
          <p className="text-gray-600 mt-2">
            Request a premium plan for more leads and better value. Your current plan: <strong>{currentTier?.replace(/_/g, ' ') ?? 'Pay as you go'}</strong>.
          </p>
        </div>

        {message && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            {message.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <SubscriptionPlans
          currentTier={currentTier}
          onSelectPlan={handleSelectPlan}
        />

        {upgrading && (
          <div className="mt-6 text-center text-gray-500 text-sm">
            Processing upgrade…
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function UpgradePage({ user }: { user: any }) {
  return <UpgradePageContent />;
}

export default withAuth(UpgradePage, ['provider', 'service_provider']);

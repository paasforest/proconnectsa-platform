'use client';

import { useState, useEffect } from 'react';
import { withAuth } from '@/components/AuthProvider';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PremiumListingUpgrade from '@/components/dashboard/PremiumListingUpgrade';
import { apiClient } from '@/lib/api-simple';
import { useAuth } from '@/components/AuthProvider';

function UpgradePageContent() {
  const { token } = useAuth();
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        apiClient.setToken(token);
        const data = await apiClient.get('/api/auth/profile/');
        // Handle different response structures
        const profile = data?.data?.provider_profile || data?.provider_profile || data?.data || data;
        const tier = profile?.subscription_tier || 'pay_as_you_go';
        setCurrentTier(tier);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setCurrentTier('pay_as_you_go');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

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
        <PremiumListingUpgrade 
          currentTier={currentTier || 'pay_as_you_go'}
          onUpgradeComplete={() => {
            // Refresh the page to show updated status
            window.location.reload();
          }}
        />
      </div>
    </DashboardLayout>
  );
}

function UpgradePage({ user }: { user: any }) {
  return <UpgradePageContent />;
}

export default withAuth(UpgradePage, ['provider', 'service_provider']);

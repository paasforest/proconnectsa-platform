'use client';

import { useState, useEffect } from 'react';
import { withAuth } from '@/components/AuthProvider';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PremiumListingUpgrade from '@/components/dashboard/PremiumListingUpgrade';
import { apiClient } from '@/lib/api-simple';
import { useAuth } from '@/components/AuthProvider';

function UpgradePageContent() {
  const { user, token } = useAuth();
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      // First, try to get tier from user object (faster, no API call needed)
      if (user?.provider_profile?.subscription_tier) {
        setCurrentTier(user.provider_profile.subscription_tier);
        setLoading(false);
        return;
      }
      
      if (!token) {
        setCurrentTier('pay_as_you_go');
        setLoading(false);
        return;
      }
      
      // If user data not available, fetch from API with timeout
      try {
        apiClient.setToken(token);
        
        // Add timeout to prevent infinite spinning
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        );
        
        const dataPromise = apiClient.get('/api/auth/profile/');
        const data = await Promise.race([dataPromise, timeoutPromise]) as any;
        
        // Handle different response structures
        const userData = data?.data?.user || data?.user || data?.data || data;
        const profile = userData?.provider_profile || data?.data?.provider_profile || data?.provider_profile;
        const tier = profile?.subscription_tier || userData?.subscription_tier || 'pay_as_you_go';
        setCurrentTier(tier);
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        // Log the full error for debugging
        if (error.response) {
          console.error('API Error Response:', error.response.status, error.response.data);
        }
        // If profile fetch fails, default to pay_as_you_go and continue
        // The PremiumListingUpgrade component will handle its own API calls
        setCurrentTier('pay_as_you_go');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, user]);

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

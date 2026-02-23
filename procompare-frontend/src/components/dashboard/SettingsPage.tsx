"use client";

import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Save, Eye, EyeOff, 
  Camera, Upload, CheckCircle, AlertCircle, Star, XCircle, Copy, RefreshCw, Bell
} from 'lucide-react';
import { apiClient } from '@/lib/api-simple';
import { useAuth } from '@/components/AuthProvider';
import GoogleReviewForm from './GoogleReviewForm';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  company_name?: string;
  business_type?: string;
  years_experience?: number;
  bio?: string;
  profile_image?: string;
}

const SettingsPage = () => {
  const { user, token } = useAuth();
  // More robust userType detection - check multiple possible field names
  const userType = (user as any)?.user_type || (user as any)?.userType || '';
  
  // Determine if user is a provider - check multiple sources
  const isProvider = user && (
    (user as any).user_type === 'provider' || 
    (user as any).user_type === 'service_provider' ||
    userType === 'provider' || 
    userType === 'service_provider' ||
    // Fallback: if user has business_name or is on provider dashboard, assume provider
    !!(user as any).business_name
  );
  
  // Set token immediately when component mounts or token changes
  useEffect(() => {
    if (token) {
      apiClient.setToken(token);
    }
  }, [token]);
  const [profile, setProfile] = useState<UserProfile>({
    id: user?.id?.toString() || '',
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    address: '',
    city: user?.city || '',
    province: user?.province || '',
    postal_code: '',
    company_name: user?.business_name || '',
    business_type: user?.primary_service || '',
    years_experience: 0,
    bio: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error' | 'info' | 'warning', text: string} | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>('');
  const [verificationDocs, setVerificationDocs] = useState<Record<string, Array<{url: string; path: string; uploaded_at: string}>>>({});
  const [docType, setDocType] = useState<string>('id_document');
  const [premiumDetails, setPremiumDetails] = useState<any>(null);
  const [isPremiumActive, setIsPremiumActive] = useState<boolean>(false);
  const [loadingPremium, setLoadingPremium] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState<any>(null);
  const [showGoogleReviewForm, setShowGoogleReviewForm] = useState(false);
  const [myGoogleReviews, setMyGoogleReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Token is already set in the useEffect above, but ensure it's set here too
    if (token) {
      apiClient.setToken(token);
    }

    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;
    let premiumInterval: NodeJS.Timeout | null = null;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Set timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted) {
            setLoading(false);
            console.warn('Settings page loading timeout - showing page anyway');
          }
        }, 10000); // 10 second timeout

        const response = await apiClient.get('/api/settings/');
        if (isMounted) {
          if (timeoutId) clearTimeout(timeoutId);
          setProfile(response);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Use user data from authentication instead of hardcoded data
        if (isMounted) {
          if (timeoutId) clearTimeout(timeoutId);
          setProfile({
            id: user?.id?.toString() || '',
            email: user?.email || '',
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            phone: user?.phone || '',
            address: '',
            city: user?.city || '',
            province: user?.province || '',
            postal_code: '',
            company_name: user?.business_name || '',
            business_type: user?.primary_service || '',
            years_experience: 0,
            bio: ''
          });
          setLoading(false);
        }
      }
    };

    if (isProvider) {
      fetchProfile();
      
      // Fetch verification documents
      apiClient
        .getVerificationDocuments()
        .then((res: any) => {
          if (isMounted) {
            setVerificationStatus(res.verification_status || '');
            setVerificationDocs(res.documents || {});
          }
        })
        .catch((err) => {
          console.warn('Failed to load verification documents', err);
        });
      
      // Fetch premium listing status and payment status
      if (token) {
        fetchPremiumStatus();
        
        // Auto-refresh premium status every 30 seconds
        premiumInterval = setInterval(() => {
          if (isMounted) {
            fetchPremiumStatus();
          }
        }, 30000); // Every 30 seconds
        
        // Also fetch provider profile for backward compatibility
        apiClient.get('/api/auth/provider-profile/')
          .then((res: any) => {
            if (isMounted) {
              setIsPremiumActive(res.is_premium_listing_active || false);
            }
          })
          .catch(err => {
            console.warn('Failed to load premium status', err);
          });
        
        // Fetch Google reviews
        apiClient.getMyGoogleReviews()
          .then((reviews: any) => {
            if (isMounted) {
              setMyGoogleReviews(Array.isArray(reviews) ? reviews : []);
            }
          })
          .catch(err => {
            console.warn('Failed to load Google reviews', err);
          });
      }
    } else {
      // For non-providers, just fetch profile
      fetchProfile();
    }

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (premiumInterval) clearInterval(premiumInterval);
    };
  }, [user, token]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await apiClient.put('/api/settings/', profile);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      setSaving(true);
      await apiClient.post('/api/settings/change-password/', passwordData);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setShowPasswordForm(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      console.error('Failed to change password:', error);
      setMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (token) {
        apiClient.setToken(token);
      }

      const response = await apiClient.uploadProfileImage(file);
      setProfile({ ...profile, profile_image: response.image_url });
      setMessage({ type: 'success', text: 'Profile image updated successfully!' });
    } catch (error) {
      console.error('Failed to upload image:', error);
      setMessage({ type: 'error', text: 'Failed to upload image. Please try again.' });
    }
  };

  const handleVerificationUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (token) {
        apiClient.setToken(token);
      }
      const res = await apiClient.uploadVerificationDocument(docType, file);
      setMessage({ type: 'success', text: 'Verification document uploaded.' });
      setVerificationStatus(res.verification_status || verificationStatus);
      const list = await apiClient.getVerificationDocuments();
      setVerificationStatus(list.verification_status || '');
      setVerificationDocs(list.documents || {});
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Failed to upload verification document.' });
    } finally {
      (event.target as HTMLInputElement).value = '';
    }
  };

  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedPremiumPlan, setSelectedPremiumPlan] = useState<'monthly' | 'lifetime' | null>(null);

  const handleRequestPremium = async (planType: 'monthly' | 'lifetime') => {
    if (!token) {
      setMessage({ type: 'error', text: 'Please log in to request premium listing' });
      return;
    }

    if (!planType) {
      setMessage({ type: 'error', text: 'Please select a plan type' });
      return;
    }

    try {
      setLoadingPremium(true);

      // Use the same backend-proxy approach as PremiumListingUpgrade component
      const proxyUrl = '/api/backend-proxy/auth/request-premium-listing';
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          plan_type: planType
        })
      });

      if (!response.ok) {
        let errorData: any = { error: 'Unknown error' };
        try {
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text);
          }
        } catch (e) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error('Premium listing request failed:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url: proxyUrl
        });
        
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();

      // Handle different response structures
      const data = responseData?.data || responseData;
      
      if (data.success || responseData.success) {
        setPremiumDetails(data);
        setSelectedPremiumPlan(planType);
        setShowPremiumModal(true);
        setMessage({ type: 'success', text: 'Premium request created! Please complete the EFT payment.' });
      } else {
        const errorMsg = data.error || responseData.error || 'Failed to create premium request';
        setMessage({ type: 'error', text: errorMsg });
      }
    } catch (error: any) {
      console.error('Premium request error:', error);
      
      let errorMessage = 'Failed to request premium listing';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data) {
        errorMessage = error.response.data.error || 
                      error.response.data.message || 
                      error.response.data.detail ||
                      errorMessage;
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoadingPremium(false);
    }
  };

  const fetchPremiumStatus = async () => {
    if (!token) return;
    
    try {
      apiClient.setToken(token);
      const response = await fetch('/api/backend-proxy/auth/premium-status/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const statusData = data.data || data;
        setPremiumStatus(statusData);
        setIsPremiumActive(statusData.premium_listing?.is_active || false);
        
        // Update premiumDetails if there's a pending request
        if (statusData.deposit) {
          setPremiumDetails({
            reference_number: statusData.deposit.reference_number,
            amount: statusData.deposit.amount,
            plan_type: statusData.deposit.plan_type,
            customer_code: user?.customer_code
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch premium status:', error);
    }
  };

  const handleCheckPremiumPayment = async () => {
    if (!token) {
      setMessage({ type: 'error', text: 'Please log in to check payment status' });
      return;
    }
    
    setLoadingPremium(true);
    try {
      // Fetch fresh status from API
      apiClient.setToken(token);
      const response = await fetch('/api/backend-proxy/auth/premium-status/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const statusData = data.data || data;
      
      // Update state with fresh data
      setPremiumStatus(statusData);
      setIsPremiumActive(statusData.premium_listing?.is_active || false);
      
      // Update premiumDetails if there's a pending request
      if (statusData.deposit) {
        setPremiumDetails({
          reference_number: statusData.deposit.reference_number,
          amount: statusData.deposit.amount,
          plan_type: statusData.deposit.plan_type,
          customer_code: user?.customer_code
        });
      }
      
      // Show appropriate message based on status
      if (statusData.premium_listing?.is_active) {
        setMessage({ 
          type: 'success', 
          text: '🎉 Premium listing is ACTIVE! You can now access unlimited free leads.' 
        });
        setPremiumDetails(null);
      } else if (statusData.deposit?.payment_verified) {
        setMessage({ 
          type: 'info', 
          text: '✅ Payment verified! Your payment has been detected. Admin will approve your premium listing within 24 hours. You\'ll receive an email when it\'s activated.' 
        });
      } else if (statusData.deposit) {
        // Payment not yet verified
        const hoursAgo = statusData.deposit.created_at 
          ? Math.round((Date.now() - new Date(statusData.deposit.created_at).getTime()) / (1000 * 60 * 60))
          : 0;
        
        if (hoursAgo < 1) {
          setMessage({ 
            type: 'info', 
            text: '⏳ Payment status: Pending. If you just made the payment, it may take up to 5 minutes to be detected automatically. Please check again in a few minutes.' 
          });
        } else if (hoursAgo < 24) {
          setMessage({ 
            type: 'info', 
            text: `⏳ Payment status: Still pending verification. Your request was made ${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago. Payment detection can take up to 5 minutes (auto) or 24 hours (manual). Please check again later.` 
          });
        } else {
          setMessage({ 
            type: 'warning', 
            text: `⚠️ Payment status: Still pending after ${Math.round(hoursAgo / 24)} day${Math.round(hoursAgo / 24) > 1 ? 's' : ''}. If you have already made the payment, please contact support at support@proconnectsa.co.za with your reference number: ${statusData.deposit.reference_number}` 
          });
        }
      } else {
        setMessage({ 
          type: 'info', 
          text: 'No premium request found. If you just created a request, please refresh the page.' 
        });
      }
    } catch (error: any) {
      console.error('Failed to check premium payment:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to check payment status: ${error.message || 'Please try again or contact support if the issue persists.'}` 
      });
    } finally {
      setLoadingPremium(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your profile and account settings</p>
      </div>

      {/* Message - Enhanced with better visibility and close button */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-start shadow-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-900 border-2 border-green-400' 
            : message.type === 'info'
            ? 'bg-blue-50 text-blue-900 border-2 border-blue-400'
            : message.type === 'warning'
            ? 'bg-yellow-50 text-yellow-900 border-2 border-yellow-400'
            : 'bg-red-50 text-red-900 border-2 border-red-400'
        }`}>
          <div className="flex-shrink-0 mr-3 mt-0.5">
            {message.type === 'success' ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : message.type === 'info' ? (
              <AlertCircle className="w-6 h-6 text-blue-600" />
            ) : message.type === 'warning' ? (
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-base leading-relaxed">{message.text}</p>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close message"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={profile.first_name}
                  onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profile.last_name}
                  onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile({...profile, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({...profile, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Province
                  </label>
                  <select
                    value={profile.province}
                    onChange={(e) => setProfile({...profile, province: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Province</option>
                    <option value="Western Cape">Western Cape</option>
                    <option value="Gauteng">Gauteng</option>
                    <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                    <option value="Eastern Cape">Eastern Cape</option>
                    <option value="Free State">Free State</option>
                    <option value="Limpopo">Limpopo</option>
                    <option value="Mpumalanga">Mpumalanga</option>
                    <option value="Northern Cape">Northern Cape</option>
                    <option value="North West">North West</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={profile.postal_code}
                    onChange={(e) => setProfile({...profile, postal_code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={profile.company_name || ''}
                  onChange={(e) => setProfile({...profile, company_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <input
                  type="text"
                  value={profile.business_type || ''}
                  onChange={(e) => setProfile({...profile, business_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={profile.years_experience || 0}
                  onChange={(e) => setProfile({...profile, years_experience: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Tell clients about yourself and your experience..."
              />
            </div>
          </div>

          {/* Google Reviews - Provider Only - Moved to Main Content Area */}
          {isProvider && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Submit Google Reviews
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Upload screenshots of your Google Business reviews to display verified reviews on your profile
                </p>
              </div>

              {showGoogleReviewForm ? (
                <div className="mt-4">
                  <GoogleReviewForm
                    onSuccess={() => {
                      setShowGoogleReviewForm(false);
                      // Refresh reviews list
                      if (token) {
                        apiClient.setToken(token);
                        apiClient.getMyGoogleReviews()
                          .then((reviews: any) => {
                            setMyGoogleReviews(Array.isArray(reviews) ? reviews : []);
                          })
                          .catch(err => console.warn('Failed to refresh reviews', err));
                      }
                    }}
                    onCancel={() => setShowGoogleReviewForm(false)}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* My Reviews List */}
                  {myGoogleReviews.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Your Submissions</h4>
                      <div className="space-y-3 mb-4">
                        {myGoogleReviews.map((review: any) => (
                          <div
                            key={review.id}
                            className={`border rounded-lg p-4 ${
                              review.review_status === 'approved'
                                ? 'bg-green-50 border-green-200'
                                : review.review_status === 'rejected'
                                ? 'bg-red-50 border-red-200'
                                : review.review_status === 'banned'
                                ? 'bg-red-100 border-red-300'
                                : 'bg-yellow-50 border-yellow-200'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`w-4 h-4 ${
                                          star <= review.review_rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                                    review.review_status === 'approved'
                                      ? 'bg-green-200 text-green-800'
                                      : review.review_status === 'rejected'
                                      ? 'bg-red-200 text-red-800'
                                      : review.review_status === 'banned'
                                      ? 'bg-red-300 text-red-900'
                                      : 'bg-yellow-200 text-yellow-800'
                                  }`}>
                                    {review.review_status.charAt(0).toUpperCase() + review.review_status.slice(1)}
                                  </span>
                                </div>
                                {review.review_text && (
                                  <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                                    {review.review_text}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500">
                                  Submitted: {new Date(review.submission_date).toLocaleDateString()}
                                </p>
                                {review.admin_notes && (
                                  <p className="text-xs text-red-600 mt-1">
                                    Note: {review.admin_notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                      <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">No Google reviews submitted yet</p>
                      <p className="text-sm mt-1">Click the button below to submit your first Google review</p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setShowGoogleReviewForm(true)}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Submit New Google Review
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                {profile.profile_image ? (
                  <img 
                    src={profile.profile_image} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              
              <input
                type="file"
                id="profile-image"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="profile-image"
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
              >
                <Camera className="w-4 h-4 mr-2" />
                Upload Photo
              </label>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
            
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              Change Password
            </button>
          </div>

          {/* Push Notifications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Push Notifications
            </h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Get instant notifications about new leads, messages, and important updates directly on your device.
              </p>
              
              
              <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Click "Enable Notifications" to allow push notifications</li>
                  <li>You'll receive instant alerts for new leads matching your services</li>
                  <li>Notifications work even when the app is closed</li>
                  <li>You can disable notifications anytime</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Password Change Form */}
          {showPasswordForm && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPasswordForm(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Premium Listing - Provider Only */}
          {isProvider && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Premium Listing</h3>
              
              {isPremiumActive ? (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-semibold text-green-800">Premium Active</span>
                  </div>
                  <p className="text-sm text-green-700 mb-2">
                    Your premium listing is active. You receive unlimited FREE leads and enhanced visibility.
                  </p>
                  {premiumStatus?.premium_listing?.expires_at && (
                    <p className="text-xs text-green-600">
                      Expires: {new Date(premiumStatus.premium_listing.expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : premiumStatus?.has_premium_request ? (
                <div className="mb-4 space-y-4">
                  {/* Step-by-Step Progress Indicator */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Premium Request Progress</h4>
                    <div className="space-y-3">
                      {/* Step 1: Request Created */}
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Step 1: Request Created</p>
                          <p className="text-xs text-gray-500">Your premium request has been created</p>
                        </div>
                      </div>
                      
                      {/* Step 2: Make Payment */}
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          premiumStatus.deposit?.payment_verified 
                            ? 'bg-green-500' 
                            : 'bg-blue-500'
                        }`}>
                          {premiumStatus.deposit?.payment_verified ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <span className="text-white text-sm font-bold">2</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Step 2: Make Payment {!premiumStatus.deposit?.payment_verified && '(Current Step)'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {premiumStatus.deposit?.payment_verified 
                              ? 'Payment completed' 
                              : 'Make EFT payment using the reference below'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Step 3: Payment Verified */}
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          premiumStatus.deposit?.payment_verified 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }`}>
                          {premiumStatus.deposit?.payment_verified ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <span className="text-gray-600 text-sm font-bold">3</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Step 3: Payment Verified</p>
                          <p className="text-xs text-gray-500">
                            {premiumStatus.deposit?.payment_verified 
                              ? 'Payment detected and verified' 
                              : 'Waiting for payment detection (auto: 5 min, manual: 24h)'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Step 4: Admin Approval */}
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 text-sm font-bold">4</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Step 4: Admin Approval</p>
                          <p className="text-xs text-gray-500">Admin will approve once payment is verified (usually within 24 hours)</p>
                        </div>
                      </div>
                      
                      {/* Step 5: Premium Active */}
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 text-sm font-bold">5</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Step 5: Premium Active</p>
                          <p className="text-xs text-gray-500">Premium listing will activate automatically, you'll receive email confirmation</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pending Request Status */}
                  <div className={`p-4 rounded-lg border ${
                    premiumStatus.deposit?.payment_verified 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-start gap-2 mb-2">
                      {premiumStatus.deposit?.payment_verified ? (
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {premiumStatus.deposit?.payment_verified 
                            ? 'Payment Verified - Waiting for Admin Approval' 
                            : 'Current Step: Make Payment'}
                        </h4>
                        <p className={`text-sm mb-3 ${
                          premiumStatus.deposit?.payment_verified 
                            ? 'text-blue-700' 
                            : 'text-yellow-700'
                        }`}>
                          {premiumStatus.deposit?.payment_verified 
                            ? 'Great! Your payment has been detected and verified. An admin will approve your premium listing within 24 hours. You\'ll receive an email when it\'s activated.'
                            : 'Follow these steps to complete your premium listing request:'}
                        </p>
                        
                        {!premiumStatus.deposit?.payment_verified && (
                          <div className="bg-white rounded-lg p-3 mb-3 border border-yellow-200">
                            <p className="text-sm font-medium text-gray-900 mb-2">📋 What to Do Now:</p>
                            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                              <li>Copy the reference number below</li>
                              <li>Make an EFT payment to the Nedbank account shown</li>
                              <li>Use the <strong>EXACT</strong> reference when making payment</li>
                              <li>Click "Check Payment Status" after making payment</li>
                              <li>Wait for admin approval (usually within 24 hours)</li>
                            </ol>
                          </div>
                        )}
                        
                        {/* Timeline Information */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-1">⏱️ Timeline Expectations:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Payment detection: <strong>5 minutes</strong> (auto) or <strong>24 hours</strong> (manual verification)</li>
                            <li>• Admin approval: <strong>Within 24 hours</strong> of payment verification</li>
                            <li>• Total time: <strong>~24-48 hours</strong> from payment to activation</li>
                          </ul>
                        </div>
                        <div className="mt-3 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Reference Number:</span>
                            <span className="font-mono font-semibold">{premiumStatus.deposit?.reference_number}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-semibold">R{premiumStatus.deposit?.amount?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Plan:</span>
                            <span className="capitalize">{premiumStatus.deposit?.plan_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Status:</span>
                            <span className={`font-semibold ${
                              premiumStatus.deposit?.payment_verified ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {premiumStatus.deposit?.payment_verified ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                          {premiumStatus.deposit?.bank_reference && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Bank Reference:</span>
                              <span className="font-mono text-xs">{premiumStatus.deposit.bank_reference}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Requested:</span>
                            <span>{new Date(premiumStatus.deposit?.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                        <button
                          onClick={handleCheckPremiumPayment}
                          disabled={loadingPremium}
                          className="mt-3 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                          <RefreshCw className={`w-5 h-5 ${loadingPremium ? 'animate-spin' : ''}`} />
                          {loadingPremium ? 'Checking Payment Status...' : 'Check Payment Status'}
                        </button>
                        {!loadingPremium && (
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            💡 Click to refresh and check the latest payment status
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Show banking details if not yet paid */}
                  {!premiumStatus.deposit?.payment_verified && (premiumDetails || premiumStatus.deposit) && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-5 shadow-sm">
                      <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-lg">
                        <span>💳</span>
                        EFT Payment Details
                      </h4>
                      <div className="bg-white rounded-lg p-4 mb-3 border-2 border-blue-200 shadow-sm">
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="text-gray-700 font-semibold">Bank:</span>
                            <span className="text-gray-900 font-bold text-base">Nedbank</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="text-gray-700 font-semibold">Account Number:</span>
                            <span className="text-gray-900 font-mono font-bold text-base">1313872032</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="text-gray-700 font-semibold">Branch Code:</span>
                            <span className="text-gray-900 font-bold text-base">198765</span>
                          </div>
                          <div className="flex justify-between items-center py-3 bg-yellow-50 rounded-lg px-3 border-2 border-yellow-400">
                            <span className="text-gray-700 font-bold">Reference Number:</span>
                            <span className="font-mono text-xl bg-yellow-100 px-4 py-2 rounded-lg border-2 border-yellow-500 font-black text-yellow-900">
                              {premiumDetails?.reference_number || premiumStatus.deposit?.reference_number}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                        <p className="text-sm text-yellow-900 font-bold mb-2 flex items-center gap-2">
                          <span>⚠️</span>
                          Critical Instructions:
                        </p>
                        <ul className="text-xs text-yellow-800 space-y-1.5 list-disc list-inside font-medium">
                          <li>Use this <strong className="text-yellow-900">EXACT</strong> reference when making the EFT payment</li>
                          <li>Payment will be <strong>auto-detected within 5 minutes</strong> if reference matches</li>
                          <li>If payment isn't detected, admin will verify manually within 24 hours</li>
                          <li>You'll receive an <strong>email confirmation</strong> when premium is activated</li>
                          <li>Contact support if premium doesn't activate within 48 hours</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    Upgrade to a Premium Listing to get unlimited free leads and enhanced visibility in the public directory.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-700 mb-4 space-y-1">
                    <li>⭐ Unlimited FREE leads (no credit deductions)</li>
                    <li>✓ Enhanced visibility in public directory</li>
                    <li>✓ Priority matching for new leads</li>
                  </ul>
                  <p className="text-gray-800 font-semibold mb-4">
                    Choose your plan:
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <button
                      onClick={() => handleRequestPremium('monthly')}
                      disabled={loadingPremium}
                      className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-center transition-colors"
                    >
                      {loadingPremium ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          <span className="text-sm">Processing...</span>
                        </div>
                      ) : (
                        <>
                          <div className="font-bold text-lg">R299</div>
                          <div className="text-sm">Monthly</div>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleRequestPremium('lifetime')}
                      disabled={loadingPremium}
                      className="px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 text-center transition-colors"
                    >
                      {loadingPremium ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          <span className="text-sm">Processing...</span>
                        </div>
                      ) : (
                        <>
                          <div className="font-bold text-lg">R2,990</div>
                          <div className="text-sm">Lifetime</div>
                        </>
                      )}
                    </button>
                  </div>
                  {!premiumDetails ? (
                    <p className="text-xs text-gray-500 text-center">
                      Click a plan above to get payment details
                    </p>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-blue-800 mb-2">EFT Payment Details</h4>
                      <p className="text-sm text-blue-700 mb-3">
                        Please make an EFT to the following account using the exact reference number.
                        Your premium listing will be activated automatically once payment is confirmed.
                      </p>
                      <div className="mt-3 space-y-1 text-sm text-blue-900">
                        <p><strong>Bank:</strong> {premiumDetails.banking_details?.bank_name || premiumDetails.bank_name || 'Nedbank'}</p>
                        <p><strong>Account Number:</strong> {premiumDetails.banking_details?.account_number || premiumDetails.account_number || '1313872032'}</p>
                        <p><strong>Branch Code:</strong> {premiumDetails.banking_details?.branch_code || premiumDetails.branch_code || '198765'}</p>
                        <p><strong>Reference:</strong> <span className="font-mono text-lg bg-blue-100 px-2 py-1 rounded">{premiumDetails.reference_number || 'N/A'}</span></p>
                        <p className="text-xs text-blue-600 mt-2">
                          (Copy this reference exactly for automatic activation)
                        </p>
                      </div>
                      <button
                        onClick={handleCheckPremiumPayment}
                        disabled={loadingPremium}
                        className="mt-4 w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        <RefreshCw className={`w-5 h-5 ${loadingPremium ? 'animate-spin' : ''}`} />
                        {loadingPremium ? 'Checking Payment Status...' : 'Check Payment Status'}
                      </button>
                      {!loadingPremium && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          💡 Click to refresh and check the latest payment status
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Premium Payment Modal */}
          {showPremiumModal && premiumDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Premium Listing Payment</h3>
                  <button
                    onClick={() => {
                      setShowPremiumModal(false);
                      setSelectedPremiumPlan(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Plan Info */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-2">
                      {selectedPremiumPlan === 'monthly' ? 'Monthly Premium' : 'Lifetime Premium'}
                    </h4>
                    <p className="text-2xl font-bold text-purple-900">
                      R{selectedPremiumPlan === 'monthly' ? '299' : '2,990'}
                      {selectedPremiumPlan === 'monthly' && <span className="text-lg font-normal text-purple-700">/month</span>}
                    </p>
                    <p className="text-sm text-purple-700 mt-2">
                      {selectedPremiumPlan === 'monthly' 
                        ? 'Unlimited FREE leads for 1 month'
                        : 'Unlimited FREE leads forever (lifetime)'}
                    </p>
                  </div>

                  {/* Account Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Account Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Bank:</span>
                        <span className="text-sm font-medium">{premiumDetails.banking_details?.bank_name || premiumDetails.bank_name || 'Nedbank'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Account Number:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{premiumDetails.banking_details?.account_number || premiumDetails.account_number || '1313872032'}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(premiumDetails.banking_details?.account_number || premiumDetails.account_number || '1313872032')}
                            className="text-blue-600 hover:text-blue-700"
                            title="Copy account number"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Branch Code:</span>
                        <span className="text-sm font-medium">{premiumDetails.banking_details?.branch_code || premiumDetails.branch_code || '198765'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Account Holder:</span>
                        <span className="text-sm font-medium">{premiumDetails.banking_details?.account_holder || premiumDetails.account_holder || 'ProConnectSA (Pty) Ltd'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Reference Number - Most Important */}
                  <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">⚠️ Payment Reference (REQUIRED)</h4>
                    <div className="flex items-center justify-between bg-white border-2 border-blue-400 rounded-lg p-3 mb-2">
                      <span className="font-mono text-lg font-bold text-blue-600">
                        {premiumDetails.reference_number || 'N/A'}
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(premiumDetails.reference_number || '')}
                        className="text-blue-600 hover:text-blue-700 ml-2"
                        title="Copy reference number"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-blue-700 font-semibold">
                      ⚠️ IMPORTANT: Use this EXACT reference when making payment. Premium activates automatically once payment is confirmed.
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-900">Amount to Pay:</span>
                      <span className="text-2xl font-bold text-green-600">
                        R{selectedPremiumPlan === 'monthly' ? '299' : '2,990'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Instructions */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">Payment Instructions</h4>
                    <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                      <li>Make an EFT payment of <strong>R{selectedPremiumPlan === 'monthly' ? '299' : '2,990'}</strong> to the account above</li>
                      <li>Use the reference number: <strong className="font-mono">{premiumDetails.reference_number || 'N/A'}</strong></li>
                      <li>Premium listing activates automatically within 5 minutes of payment confirmation</li>
                      <li>You'll receive an email confirmation once activated</li>
                      <li>Contact support if premium doesn't activate within 30 minutes</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setShowPremiumModal(false);
                      setSelectedPremiumPlan(null);
                    }}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* Verification Documents - Provider Only */}
          {isProvider && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Documents</h3>
              
              {verificationStatus && (
                <div className={`mb-4 p-3 rounded-lg ${
                  verificationStatus === 'verified' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : verificationStatus === 'pending'
                    ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  <p className="font-medium">Status: {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="id_document">ID Document (South African ID)</option>
                    <option value="passport">Passport</option>
                    <option value="proof_of_address">Proof of Address</option>
                    <option value="business_registration">Business Registration</option>
                    <option value="insurance">Insurance Certificate</option>
                    <option value="other">Other Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Document
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="verification-document"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleVerificationUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="verification-document"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File (PDF, JPG, PNG - Max 10MB)
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Upload your verification documents. Accepted formats: PDF, JPG, PNG. Maximum file size: 10MB.
                    </p>
                  </div>
                </div>

                {/* Show uploaded documents */}
                {Object.keys(verificationDocs).length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents:</h4>
                    <div className="space-y-2">
                      {Object.entries(verificationDocs).map(([type, docs]) => (
                        <div key={type} className="text-sm">
                          <span className="font-medium capitalize">{type.replace('_', ' ')}:</span>
                          {Array.isArray(docs) && docs.map((doc: any, idx: number) => (
                            <div key={idx} className="ml-4 text-gray-600">
                              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                Document {idx + 1}
                              </a>
                              <span className="text-xs text-gray-500 ml-2">
                                (Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()})
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;








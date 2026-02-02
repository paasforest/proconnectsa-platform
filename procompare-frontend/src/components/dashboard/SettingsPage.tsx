"use client";

import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Save, Eye, EyeOff, 
  Camera, Upload, CheckCircle, AlertCircle, Star, XCircle, Copy
} from 'lucide-react';
import { apiClient } from '@/lib/api-simple';
import { useAuth } from '@/components/AuthProvider';

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
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>('');
  const [verificationDocs, setVerificationDocs] = useState<Record<string, Array<{url: string; path: string; uploaded_at: string}>>>({});
  const [docType, setDocType] = useState<string>('id_document');
  const [premiumDetails, setPremiumDetails] = useState<any>(null);
  const [isPremiumActive, setIsPremiumActive] = useState<boolean>(false);
  const [loadingPremium, setLoadingPremium] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

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

    if (user.userType === 'provider') {
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
      
      // Fetch premium listing status from provider profile
      if (token) {
        apiClient.get('/api/auth/provider-profile/')
          .then((res: any) => {
            if (isMounted) {
              setIsPremiumActive(res.is_premium_listing_active || false);
            }
          })
          .catch(err => {
            console.warn('Failed to load premium status', err);
          });
      }
    } else {
      // For non-providers, just fetch profile
      fetchProfile();
    }

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
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
      const formData = new FormData();
      formData.append('profile_image', file);
      
      const response = await apiClient.post('/api/settings/upload-image/', formData);
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

  const handleRequestPremium = async (planType?: 'monthly' | 'lifetime') => {
    try {
      setLoadingPremium(true);
      // Use GET method as per backend endpoint
      const res = await apiClient.get('/api/auth/premium-listing/request/');
      if (res.success) {
        setPremiumDetails(res);
        // If planType is provided, show modal with that plan selected
        if (planType) {
          setSelectedPremiumPlan(planType);
          setShowPremiumModal(true);
        } else {
          setMessage({ type: 'success', text: 'Premium listing request generated. Please make your EFT.' });
        }
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to generate premium request.' });
      }
    } catch (error: any) {
      console.error('Failed to request premium:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error requesting premium. Please try again.' });
    } finally {
      setLoadingPremium(false);
    }
  };

  const handleCheckPremiumPayment = async () => {
    if (!premiumDetails?.premium_details?.reference_number) {
      setMessage({ type: 'error', text: 'Please request premium listing first to get a reference number.' });
      return;
    }
    try {
      setLoadingPremium(true);
      const res = await apiClient.post('/api/payments/dashboard/check-deposit-by-customer-code/', {
        customer_code: user?.customer_code,
        amount: premiumDetails.premium_details.monthly_cost || 299.00,
        reference_number: premiumDetails.premium_details.reference_number,
      });
      if (res.success && res.new_status === 'premium_active') {
        setIsPremiumActive(true);
        setMessage({ type: 'success', text: '✅ Premium listing activated successfully!' });
        setPremiumDetails(null);
      } else {
        setMessage({ type: 'info', text: res.message || 'Payment not yet detected. Please allow a few minutes for processing.' });
      }
    } catch (error: any) {
      console.error('Failed to check premium payment:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error checking payment. Please try again.' });
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

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {message.text}
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
          {user?.userType === 'provider' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Premium Listing</h3>
              
              {isPremiumActive ? (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-semibold text-green-800">Premium Active</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Your premium listing is active. You receive unlimited FREE leads and enhanced visibility.
                  </p>
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
                      className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-center"
                    >
                      <div className="font-bold text-lg">R299</div>
                      <div className="text-sm">Monthly</div>
                    </button>
                    <button
                      onClick={() => handleRequestPremium('lifetime')}
                      disabled={loadingPremium}
                      className="px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 text-center"
                    >
                      <div className="font-bold text-lg">R2,990</div>
                      <div className="text-sm">Lifetime</div>
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
                        <p><strong>Bank:</strong> {premiumDetails.premium_details?.bank_name || 'Nedbank'}</p>
                        <p><strong>Account Number:</strong> {premiumDetails.premium_details?.account_number || '1313872032'}</p>
                        <p><strong>Branch Code:</strong> {premiumDetails.premium_details?.branch_code || '198765'}</p>
                        <p><strong>Reference:</strong> <span className="font-mono text-lg bg-blue-100 px-2 py-1 rounded">{premiumDetails.premium_details?.reference_number || 'N/A'}</span></p>
                        <p className="text-xs text-blue-600 mt-2">
                          (Copy this reference exactly for automatic activation)
                        </p>
                      </div>
                      <button
                        onClick={handleCheckPremiumPayment}
                        disabled={loadingPremium}
                        className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {loadingPremium ? 'Checking...' : 'Check Payment Status'}
                      </button>
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
                        <span className="text-sm font-medium">{premiumDetails.eft_details?.bank_name || 'Nedbank'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Account Number:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{premiumDetails.eft_details?.account_number || '1313872032'}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(premiumDetails.eft_details?.account_number || '1313872032')}
                            className="text-blue-600 hover:text-blue-700"
                            title="Copy account number"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Branch Code:</span>
                        <span className="text-sm font-medium">{premiumDetails.eft_details?.branch_code || '198765'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Account Holder:</span>
                        <span className="text-sm font-medium">{premiumDetails.eft_details?.account_holder || 'ProConnectSA (Pty) Ltd'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Reference Number - Most Important */}
                  <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">⚠️ Payment Reference (REQUIRED)</h4>
                    <div className="flex items-center justify-between bg-white border-2 border-blue-400 rounded-lg p-3 mb-2">
                      <span className="font-mono text-lg font-bold text-blue-600">
                        {premiumDetails.eft_details?.reference || 'N/A'}
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(premiumDetails.eft_details?.reference || '')}
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
                      <li>Use the reference number: <strong className="font-mono">{premiumDetails.eft_details?.reference || 'N/A'}</strong></li>
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
          {user?.userType === 'provider' && (
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








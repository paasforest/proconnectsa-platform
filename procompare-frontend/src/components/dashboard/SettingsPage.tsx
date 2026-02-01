"use client";

import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Save, Eye, EyeOff, 
  Camera, Upload, CheckCircle, AlertCircle
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
  const [showPremiumRequest, setShowPremiumRequest] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/settings/');
        setProfile(response);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Use user data from authentication instead of hardcoded data
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
      } finally {
        setLoading(false);
      }
    };

    if (user && user.userType === 'provider') {
      fetchProfile();
      apiClient
        .getVerificationDocuments()
        .then((res: any) => {
          setVerificationStatus(res.verification_status || '');
          setVerificationDocs(res.documents || {});
        })
        .catch((err) => {
          console.warn('Failed to load verification documents', err);
        });
      
      // Fetch premium listing details
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'}/api/auth/premium-listing/request/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setPremiumDetails(data);
            }
          })
          .catch(err => {
            console.warn('Failed to load premium details', err);
          });
      }
    }
  }, [user]);

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
              
              {premiumDetails && (
                <>
                  {premiumDetails.is_premium_active ? (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-semibold text-green-800">Premium Active</span>
                      </div>
                      {premiumDetails.premium_status.expires_at && (
                        <p className="text-sm text-green-700">
                          Expires: {new Date(premiumDetails.premium_status.expires_at).toLocaleDateString()}
                        </p>
                      )}
                      {!premiumDetails.premium_status.expires_at && (
                        <p className="text-sm text-green-700">Lifetime Premium</p>
                      )}
                    </div>
                  ) : (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Get unlimited FREE leads, public directory visibility, and featured placement.
                      </p>
                      <button
                        onClick={() => setShowPremiumRequest(!showPremiumRequest)}
                        className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium"
                      >
                        {showPremiumRequest ? 'Hide Details' : 'Request Premium Listing'}
                      </button>
                    </div>
                  )}
                  
                  {showPremiumRequest && !premiumDetails.is_premium_active && premiumDetails.eft_details && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-3">EFT Payment Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bank:</span>
                          <span className="font-medium">{premiumDetails.eft_details.bank_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Account Number:</span>
                          <span className="font-medium font-mono">{premiumDetails.eft_details.account_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Branch Code:</span>
                          <span className="font-medium">{premiumDetails.eft_details.branch_code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-medium text-green-600">{premiumDetails.eft_details.amount}</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-300">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Reference:</span>
                            <span className="font-mono font-bold text-blue-700 bg-white px-2 py-1 rounded">
                              {premiumDetails.eft_details.reference}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            ⚠️ Use this exact reference when making payment
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-blue-300">
                        <h5 className="font-semibold text-gray-900 mb-2">Benefits:</h5>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {premiumDetails.benefits?.map((benefit: string, idx: number) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2">✓</span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-xs text-gray-600 mt-4 italic">
                        After payment, contact support to activate your premium listing.
                      </p>
                    </div>
                  )}
                </>
              )}
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








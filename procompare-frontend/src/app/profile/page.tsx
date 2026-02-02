"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Building2, 
  MapPin, 
  Settings, 
  Shield, 
  CreditCard, 
  Bell, 
  Save,
  Edit,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Copy,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface ProviderProfile {
  id: string;
  business_name: string;
  business_registration: string;
  license_number: string;
  vat_number: string;
  business_phone: string;
  business_email: string;
  business_address: string;
  service_areas: string[];
  service_categories: string[];
  max_travel_distance: number;
  hourly_rate_min: number;
  hourly_rate_max: number;
  minimum_job_value: number;
  subscription_tier: string;
  credit_balance: number;
  customer_code: string;
  verification_status: string;
  average_rating: number;
  total_reviews: number;
  response_time_hours: number;
  job_completion_rate: number;
  bio: string;
  years_experience: number;
  profile_image: string;
  receives_lead_notifications: boolean;
  notification_methods: string[];
}

const SERVICE_CATEGORIES = [
  { value: 'appliance', label: 'Appliance Repair' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'general', label: 'General Maintenance' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'painting', label: 'Painting' },
  { value: 'pool', label: 'Pool Maintenance' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'renovation', label: 'Renovation' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'security', label: 'Security' }
];

const CAPE_TOWN_AREAS = [
  'Cape Town CBD', 'Sea Point', 'Green Point', 'Camps Bay', 'Claremont', 'Newlands',
  'Rondebosch', 'Observatory', 'Woodstock', 'Salt River', 'Gardens', 'V&A Waterfront',
  'Table Mountain', 'Signal Hill', 'Lion\'s Head', 'Hout Bay', 'Constantia', 'Tokai',
  'Bergvliet', 'Wynberg', 'Kenilworth', 'Claremont', 'Harfield Village', 'Mowbray',
  'Rosebank', 'Pinelands', 'Thornton', 'Epping', 'Parow', 'Goodwood', 'Bellville',
  'Durbanville', 'Brackenfell', 'Kuils River', 'Somerset West', 'Stellenbosch',
  'Paarl', 'Wellington', 'Malmesbury', 'Atlantis', 'Milnerton', 'Table View',
  'Bloubergstrand', 'Melkbosstrand', 'Langebaan', 'Saldanha', 'Vredenburg'
];

export default function ProfilePage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!token || user?.userType !== 'provider') {
      router.push('/login');
    }
  }, [token, user?.userType, router]);

  // Fetch profile data
  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'}/api/auth/provider-profile/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure arrays are initialized
        setProfile({
          ...data,
          service_categories: data.service_categories || [],
          service_areas: data.service_areas || []
        });
      } else {
        console.error('Failed to fetch profile:', response.status);
        toast.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'}/api/auth/profile/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'}/api/auth/change-password/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
        })
      });

      if (response.ok) {
        toast.success('Password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Error changing password');
    } finally {
      setSaving(false);
    }
  };

  const copyCustomerCode = () => {
    if (profile?.customer_code) {
      navigator.clipboard.writeText(profile.customer_code);
      toast.success('Customer code copied to clipboard');
    }
  };

  const addServiceArea = (area: string) => {
    if (profile) {
      const currentAreas = profile.service_areas || [];
      if (!currentAreas.includes(area)) {
        setProfile({
          ...profile,
          service_areas: [...currentAreas, area]
        });
      }
    }
  };

  const removeServiceArea = (area: string) => {
    if (profile) {
      const currentAreas = profile.service_areas || [];
      setProfile({
        ...profile,
        service_areas: currentAreas.filter(a => a !== area)
      });
    }
  };

  const addServiceCategory = (category: string) => {
    if (profile) {
      const currentCategories = profile.service_categories || [];
      if (!currentCategories.includes(category)) {
        setProfile({
          ...profile,
          service_categories: [...currentCategories, category]
        });
      }
    }
  };

  const removeServiceCategory = (category: string) => {
    if (profile) {
      const currentCategories = profile.service_categories || [];
      setProfile({
        ...profile,
        service_categories: currentCategories.filter(c => c !== category)
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load your profile information.</p>
          <Button onClick={fetchProfile}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your business profile, services, and account settings
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business_name">Business Name</Label>
                    <Input
                      id="business_name"
                      value={profile.business_name}
                      onChange={(e) => setProfile({...profile, business_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="business_registration">Business Registration</Label>
                    <Input
                      id="business_registration"
                      value={profile.business_registration}
                      onChange={(e) => setProfile({...profile, business_registration: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="license_number">License Number</Label>
                    <Input
                      id="license_number"
                      value={profile.license_number}
                      onChange={(e) => setProfile({...profile, license_number: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vat_number">VAT Number</Label>
                    <Input
                      id="vat_number"
                      value={profile.vat_number}
                      onChange={(e) => setProfile({...profile, vat_number: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business_phone">Business Phone</Label>
                    <Input
                      id="business_phone"
                      value={profile.business_phone}
                      onChange={(e) => setProfile({...profile, business_phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="business_email">Business Email</Label>
                    <Input
                      id="business_email"
                      type="email"
                      value={profile.business_email}
                      onChange={(e) => setProfile({...profile, business_email: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="business_address">Business Address</Label>
                  <Textarea
                    id="business_address"
                    value={profile.business_address}
                    onChange={(e) => setProfile({...profile, business_address: e.target.value})}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    placeholder="Tell clients about your business and experience..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="years_experience">Years of Experience</Label>
                    <Input
                      id="years_experience"
                      type="number"
                      value={profile.years_experience}
                      onChange={(e) => setProfile({...profile, years_experience: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hourly_rate_min">Min Hourly Rate (R)</Label>
                    <Input
                      id="hourly_rate_min"
                      type="number"
                      value={profile.hourly_rate_min}
                      onChange={(e) => setProfile({...profile, hourly_rate_min: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hourly_rate_max">Max Hourly Rate (R)</Label>
                    <Input
                      id="hourly_rate_max"
                      type="number"
                      value={profile.hourly_rate_max}
                      onChange={(e) => setProfile({...profile, hourly_rate_max: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Credit Wallet Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Credit Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Available Credits</p>
                    <p className="text-2xl font-bold text-blue-600">{profile.credit_balance}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Customer Code</p>
                    <div className="flex items-center gap-2">
                      <code className="text-lg font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {profile.customer_code}
                      </code>
                      <Button size="sm" variant="outline" onClick={copyCustomerCode}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Use this code for manual deposits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Service Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Current Services</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(profile.service_categories || []).map((category) => {
                      const serviceInfo = SERVICE_CATEGORIES.find(s => s.value === category);
                      return (
                        <Badge key={category} variant="secondary" className="flex items-center gap-1">
                          {serviceInfo?.label || category}
                          <button
                            onClick={() => removeServiceCategory(category)}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                    {(!profile.service_categories || profile.service_categories.length === 0) && (
                      <p className="text-sm text-gray-500">No services added yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Add New Service</Label>
                  <Select onValueChange={addServiceCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service category" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_CATEGORIES
                        .filter(service => !(profile.service_categories || []).includes(service.value))
                        .map((service) => (
                          <SelectItem key={service.value} value={service.value}>
                            {service.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Service Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Current Service Areas</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(profile.service_areas || []).map((area) => (
                      <Badge key={area} variant="secondary" className="flex items-center gap-1">
                        {area}
                        <button
                          onClick={() => removeServiceArea(area)}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                    {(!profile.service_areas || profile.service_areas.length === 0) && (
                      <p className="text-sm text-gray-500">No service areas added yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Add Service Area (within 50km)</Label>
                  <Select onValueChange={addServiceArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service area" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAPE_TOWN_AREAS
                        .filter(area => !(profile.service_areas || []).includes(area))
                        .map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="max_travel_distance">Max Travel Distance (km)</Label>
                  <Input
                    id="max_travel_distance"
                    type="number"
                    min="1"
                    max="50"
                    value={profile.max_travel_distance}
                    onChange={(e) => setProfile({...profile, max_travel_distance: parseInt(e.target.value) || 50})}
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum 50km from your business address</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>

                <Button onClick={handleChangePassword} disabled={saving}>
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                  Change Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="lead_notifications">Lead Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive notifications for new leads
                    </p>
                  </div>
                  <Switch
                    id="lead_notifications"
                    checked={profile.receives_lead_notifications}
                    onCheckedChange={(checked) => setProfile({...profile, receives_lead_notifications: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <Button onClick={handleSaveProfile} disabled={saving} size="lg">
            {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}








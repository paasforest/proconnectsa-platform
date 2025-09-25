"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Bell, 
  Shield, 
  LogOut, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  User,
  CreditCard,
  MapPin,
  Building2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  lead_alerts: boolean;
  quote_reminders: boolean;
  payment_updates: boolean;
  marketing_emails: boolean;
}

interface PrivacySettings {
  profile_visibility: 'public' | 'private';
  show_contact_info: boolean;
  show_ratings: boolean;
  show_portfolio: boolean;
}

export default function SettingsPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    sms_notifications: true,
    push_notifications: true,
    lead_alerts: true,
    quote_reminders: true,
    payment_updates: true,
    marketing_emails: false
  });
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profile_visibility: 'public',
    show_contact_info: true,
    show_ratings: true,
    show_portfolio: true
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (false) return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  // Fetch settings
  useEffect(() => {
    if (token) {
      fetchSettings();
    }
  }, [session]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'}/api/auth/settings/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || notifications);
        setPrivacy(data.privacy || privacy);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'}/api/auth/settings/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notifications,
          privacy
        })
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!confirm('This will permanently delete all your data. Are you absolutely sure?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'}/api/auth/delete-account/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Account deleted successfully');
        await signOut({ redirect: false });
        router.push('/');
      } else {
        toast.error('Failed to delete account');
      }
    } catch (error) {
      toast.error('Error deleting account');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.push('/profile')}
                >
                  <User className="h-6 w-6" />
                  <span>Edit Profile</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.push('/credits')}
                >
                  <CreditCard className="h-6 w-6" />
                  <span>Manage Credits</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.push('/profile')}
                >
                  <MapPin className="h-6 w-6" />
                  <span>Service Areas</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.push('/profile')}
                >
                  <Building2 className="h-6 w-6" />
                  <span>Services</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email_notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive important updates via email
                    </p>
                  </div>
                  <Switch
                    id="email_notifications"
                    checked={notifications.email_notifications}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, email_notifications: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms_notifications">SMS Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive urgent updates via SMS
                    </p>
                  </div>
                  <Switch
                    id="sms_notifications"
                    checked={notifications.sms_notifications}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, sms_notifications: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push_notifications">Push Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Switch
                    id="push_notifications"
                    checked={notifications.push_notifications}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, push_notifications: checked})
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="lead_alerts">Lead Alerts</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get notified about new leads matching your services
                    </p>
                  </div>
                  <Switch
                    id="lead_alerts"
                    checked={notifications.lead_alerts}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, lead_alerts: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="quote_reminders">Quote Reminders</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Reminders to submit quotes for claimed leads
                    </p>
                  </div>
                  <Switch
                    id="quote_reminders"
                    checked={notifications.quote_reminders}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, quote_reminders: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="payment_updates">Payment Updates</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Updates about payments and credit transactions
                    </p>
                  </div>
                  <Switch
                    id="payment_updates"
                    checked={notifications.payment_updates}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, payment_updates: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketing_emails">Marketing Emails</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive promotional emails and tips
                    </p>
                  </div>
                  <Switch
                    id="marketing_emails"
                    checked={notifications.marketing_emails}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, marketing_emails: checked})
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="profile_visibility">Profile Visibility</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Control who can see your profile
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={privacy.profile_visibility === 'public' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPrivacy({...privacy, profile_visibility: 'public'})}
                  >
                    Public
                  </Button>
                  <Button
                    variant={privacy.profile_visibility === 'private' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPrivacy({...privacy, profile_visibility: 'private'})}
                  >
                    Private
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show_contact_info">Show Contact Information</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Display your contact details to clients
                  </p>
                </div>
                <Switch
                  id="show_contact_info"
                  checked={privacy.show_contact_info}
                  onCheckedChange={(checked) => 
                    setPrivacy({...privacy, show_contact_info: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show_ratings">Show Ratings & Reviews</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Display your ratings and client reviews
                  </p>
                </div>
                <Switch
                  id="show_ratings"
                  checked={privacy.show_ratings}
                  onCheckedChange={(checked) => 
                    setPrivacy({...privacy, show_ratings: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show_portfolio">Show Portfolio</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Display your portfolio images to clients
                  </p>
                </div>
                <Switch
                  id="show_portfolio"
                  checked={privacy.show_portfolio}
                  onCheckedChange={(checked) => 
                    setPrivacy({...privacy, show_portfolio: checked})
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium">Logout</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sign out of your account
                  </p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div>
                  <h3 className="font-medium text-red-900 dark:text-red-100">Delete Account</h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={saving} size="lg">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}








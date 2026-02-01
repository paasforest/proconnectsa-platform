"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, ShoppingCart, Wallet, Settings, 
  HelpCircle, LogOut, Bell, Menu, X, ChevronDown, User,
  Home, Target, CreditCard, Wrench, MessageSquare, BarChart3, Crown
} from 'lucide-react';
import { apiClient } from '@/lib/api-simple';
import PersonalizedHeader from './PersonalizedHeader';

interface UserStats {
  credit_balance: number;
  total_leads: number;
  active_leads: number;
  completed_jobs: number;
  average_rating: number;
  response_rate: number;
}

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  business_name: string;
  phone: string;
  location: string;
  services: string[];
  subscription_tier: string;
  customer_code: string;
  credit_balance: number;
  is_verified: boolean;
}

interface Notification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  priority: string;
}

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Navigation items
  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, current: pathname === '/dashboard' },
    { name: 'Lead Marketplace', href: '/dashboard/leads-dashboard', icon: Target, current: pathname === '/dashboard/leads-dashboard' },
    { name: 'My Purchased Leads', href: '/dashboard/my-leads', icon: ShoppingCart, current: pathname === '/dashboard/my-leads' },
    { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare, current: pathname === '/dashboard/chat' },
    { name: 'Credits & Wallet', href: '/dashboard/wallet', icon: Wallet, current: pathname === '/dashboard/wallet' },
    { name: 'Upgrade plan', href: '/dashboard/upgrade', icon: Crown, current: pathname === '/dashboard/upgrade' },
    { name: 'Services', href: '/dashboard/services', icon: Wrench, current: pathname === '/dashboard/services' },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, current: pathname === '/dashboard/settings' },
    { name: 'Support', href: '/dashboard/support', icon: HelpCircle, current: pathname === '/dashboard/support' },
  ];

  // Fetch user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!token) return;
      
      try {
        apiClient.setToken(token);
        const response = await apiClient.get('/api/auth/stats/');
        setUserStats(response);
      } catch (error) {
        // Handle error silently
      }
    };

    if (user) {
      fetchUserStats();
    }
  }, [user, token]);

  // Fetch user profile for personalization
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) return;
      
      try {
        apiClient.setToken(token);
        const response = await apiClient.get('/api/auth/profile/');
        setUserProfile(response);
      } catch (error) {
        // Handle error silently
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user, token]);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;
      
      try {
        apiClient.setToken(token);
        const response = await apiClient.get('/api/notifications/');
        setNotifications(response.results || response);
      } catch (error) {
        setNotifications([]);
      }
    };

    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  // Fetch notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (!token) return;
      
      try {
        apiClient.setToken(token);
        const response = await apiClient.getNotificationCount();
        setNotificationCount((response as any).unread_count || 0);
      } catch (error) {
        setNotificationCount(0);
      }
    };

    if (user) {
      fetchNotificationCount();
      const interval = setInterval(fetchNotificationCount, 10000);
      return () => clearInterval(interval);
    }
  }, [user, token]);

  const handleLogout = async () => {
    try {
      if (token) {
        try {
          await apiClient.logout();
        } catch (error) {
          // Continue with logout even if backend call fails
        }
      }
      
      logout();
    } catch (error) {
      router.push('/login');
    }
  };

  // Use the accurate count from count API instead of filtering notifications list
  const unreadNotifications = notificationCount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {userProfile?.business_name ? userProfile.business_name.charAt(0) : 'P'}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">
                {userProfile?.business_name || 'Your Business'}
              </h1>
              <p className="text-xs text-gray-500">
                ProConnectSA Lead Marketplace
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </a>
              );
            })}
          </div>

          {/* Logout button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navbar */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Page title */}
            <div className="flex-1 lg:hidden">
              <h1 className="text-lg font-semibold text-gray-900">
                {navigationItems.find(item => item.current)?.name || 'Dashboard'}
              </h1>
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-gray-600 relative"
                >
                  <Bell className="w-6 h-6" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                            !notification.is_read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start">
                            <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                              notification.notification_type === 'lead_assigned' ? 'bg-green-500' :
                              notification.notification_type === 'credit_purchase' ? 'bg-blue-500' : 'bg-orange-500'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Wallet balance */}
              <div className="hidden sm:flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <Wallet className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {userStats?.credit_balance || 0} Credits
                </span>
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-sm font-medium text-gray-700">
                      {userProfile?.business_name || `${userProfile?.first_name} ${userProfile?.last_name}` || user?.email}
                    </span>
                    {userProfile?.business_name && (
                      <p className="text-xs text-gray-500">{userProfile.email}</p>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Profile dropdown menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <a
                        href="/dashboard/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Settings
                      </a>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personalized Header for Providers */}
        {user?.user_type === 'provider' && (
          <PersonalizedHeader
            onRefresh={() => {
              // Refresh user stats and profile
              if (token) {
                apiClient.setToken(token);
                // Trigger a refresh of the data
                window.location.reload();
              }
            }}
            refreshing={false}
            onSettings={() => router.push('/dashboard/settings')}
            onProfile={() => router.push('/profile')}
          />
        )}

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;








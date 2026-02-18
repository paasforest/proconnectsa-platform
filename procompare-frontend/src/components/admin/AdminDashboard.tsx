"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { apiClient } from '@/lib/api-simple';
import {
  LayoutDashboard, MessageSquare, Users, DollarSign, Wrench, 
  Settings, BarChart3, Bell, LogOut, Menu, X, Star, FileText
} from 'lucide-react';
import AdminSupportDashboard from './AdminSupportDashboard';
import StaffManagement from './StaffManagement';
import FinanceDashboard from './FinanceDashboard';
import TechnicalDashboard from './TechnicalDashboard';
import GoogleReviewsModeration from './GoogleReviewsModeration';
import PremiumRequestsManagement from './PremiumRequestsManagement';
import VerificationDocumentsManagement from './VerificationDocumentsManagement';
import UserDetailModal from './UserDetailModal';
import DepositDetailModal from './DepositDetailModal';

type DashboardView = 'overview' | 'support' | 'staff' | 'finance' | 'technical' | 'settings' | 'google-reviews' | 'premium-requests' | 'verifications';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard, current: currentView === 'overview' },
    { id: 'support', name: 'Support Tickets', icon: MessageSquare, current: currentView === 'support' },
    { id: 'google-reviews', name: 'Google Reviews', icon: Star, current: currentView === 'google-reviews' },
    { id: 'premium-requests', name: 'Premium Requests', icon: BarChart3, current: currentView === 'premium-requests' },
    { id: 'verifications', name: 'Verification Docs', icon: FileText, current: currentView === 'verifications' },
    { id: 'staff', name: 'Staff Management', icon: Users, current: currentView === 'staff' },
    { id: 'finance', name: 'Finance', icon: DollarSign, current: currentView === 'finance' },
    { id: 'technical', name: 'Technical', icon: Wrench, current: currentView === 'technical' },
    { id: 'settings', name: 'Settings', icon: Settings, current: currentView === 'settings' },
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'support':
        return <AdminSupportDashboard />;
      case 'google-reviews':
        return <GoogleReviewsModeration />;
      case 'premium-requests':
        return <PremiumRequestsManagement />;
      case 'verifications':
        return <VerificationDocumentsManagement />;
      case 'staff':
        return <StaffManagement />;
      case 'finance':
        return <FinanceDashboard />;
      case 'technical':
        return <TechnicalDashboard />;
      case 'settings':
        return <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p>Settings panel coming soon...</p></div>;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <Sidebar navigation={navigation} currentView={currentView} setCurrentView={setCurrentView} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <Sidebar navigation={navigation} currentView={currentView} setCurrentView={setCurrentView} />
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
};

const Sidebar = ({ navigation, currentView, setCurrentView }: {
  navigation: Array<{ id: string; name: string; icon: any; current: boolean }>;
  currentView: DashboardView;
  setCurrentView: (view: DashboardView) => void;
}) => {
  const { user, logout } = useAuth();

  return (
    <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as DashboardView)}
                className={`${
                  item.current
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`}
              >
                <Icon
                  className={`${
                    item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 flex-shrink-0 h-6 w-6`}
                />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 border-t border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {(user?.first_name || 'A').charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {user ? `${user.first_name} ${user.last_name}` : 'Admin User'}
              </p>
              <p className="text-xs font-medium text-gray-500">
                Administrator
              </p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const OverviewDashboard = () => {
  const { token } = useAuth();
  const [monitoringData, setMonitoringData] = useState<any>(null);
  const [problems, setProblems] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [selectedDepositId, setSelectedDepositId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      apiClient.setToken(token);
      
      // Fetch monitoring dashboard data
      try {
        console.log('[Admin Dashboard] Fetching monitoring data...');
        const monitoringData = await apiClient.get('/api/auth/admin/monitoring/dashboard/');
        console.log('[Admin Dashboard] Raw monitoring response:', monitoringData);
        console.log('[Admin Dashboard] Response type:', typeof monitoringData);
        console.log('[Admin Dashboard] Has data key?', monitoringData?.data !== undefined);
        console.log('[Admin Dashboard] Has registrations?', monitoringData?.registrations !== undefined || monitoringData?.data?.registrations !== undefined);
        
        // Handle both direct response and nested data
        const data = monitoringData?.data || monitoringData;
        console.log('[Admin Dashboard] Processed data:', data);
        console.log('[Admin Dashboard] Registrations total:', data?.registrations?.total);
        console.log('[Admin Dashboard] Registrations details:', data?.registrations?.details);
        
        if (data && typeof data === 'object') {
          setMonitoringData(data);
        } else {
          console.warn('[Admin Dashboard] Invalid data format, setting defaults');
          setMonitoringData({ registrations: { total: 0 }, payments: { total_deposited: 0 }, leads: { new_leads: 0 } });
        }
      } catch (error: any) {
        console.error('[Admin Dashboard] Failed to fetch monitoring dashboard:', error);
        console.error('[Admin Dashboard] Error details:', error.response || error.message);
        // Set empty data on error so UI doesn't show loading forever
        setMonitoringData({ registrations: { total: 0 }, payments: { total_deposited: 0 }, leads: { new_leads: 0 } });
      }
      
      // Fetch problems data
      try {
        const problemsData = await apiClient.get('/api/auth/admin/monitoring/problems/');
        // Handle both direct response and nested data
        if (problemsData && typeof problemsData === 'object') {
          setProblems(problemsData.data || problemsData);
        }
      } catch (error: any) {
        console.error('Failed to fetch problems:', error);
        // Set empty data on error so UI doesn't show loading forever
        setProblems({ problems_detected: 0, warnings: [] });
      }
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-600 mt-2">Welcome to the ProConnectSA Admin Dashboard</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New Registrations</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{monitoringData?.registrations?.total || 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New Deposits</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">R{monitoringData?.payments?.total_deposited || 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New Leads</p>
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{monitoringData?.leads?.new_leads || 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Bell className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Problems Detected</p>
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{problems?.problems_detected || 0}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Problems Alert */}
      {problems && problems.problems_detected > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            ⚠️ {problems.problems_detected} Problem(s) Need Attention
          </h3>
          <div className="space-y-3">
            {problems.problems.map((problem: any, index: number) => (
              <div key={index} className="bg-white rounded p-4 border border-red-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{problem.message}</p>
                    <p className="text-sm text-gray-600 mt-1">{problem.action}</p>
                    
                    {/* Show user emails if available */}
                    {problem.users && problem.users.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Affected Users ({problem.users.length}):</p>
                        <div className="max-h-32 overflow-y-auto">
                          <div className="flex flex-wrap gap-1">
                            {problem.users.slice(0, 10).map((user: any, idx: number) => {
                              const email = typeof user === 'string' ? user : user.email;
                              const businessName = typeof user === 'object' ? user.business_name : null;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedUserEmail(email)}
                                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-700 cursor-pointer transition-colors"
                                  title={businessName ? `Click to view details - ${businessName}` : 'Click to view details'}
                                >
                                  {email}
                                  {businessName && <span className="ml-1 text-gray-500">({businessName})</span>}
                                </button>
                              );
                            })}
                            {problem.users.length > 10 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{problem.users.length - 10} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Show deposit details if available */}
                    {problem.details && problem.details.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Deposit Details ({problem.details.length}):</p>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {problem.details.slice(0, 5).map((detail: any, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedDepositId(detail.deposit_id)}
                              className="text-xs bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded w-full text-left transition-colors"
                              title="Click to view deposit details"
                            >
                              <span className="font-medium">{detail.business_name || detail.user}</span>: R{detail.amount} ({detail.age_hours?.toFixed(1)}h ago)
                              {detail.reference_number && (
                                <span className="text-gray-500 ml-1">- {detail.reference_number}</span>
                              )}
                            </button>
                          ))}
                          {problem.details.length > 5 && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{problem.details.length - 5} more deposits
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    problem.severity === 'high' ? 'bg-red-100 text-red-800' :
                    problem.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {problem.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
              <MessageSquare className="w-5 h-5 mr-3 text-blue-600" />
              <div>
                <div className="font-medium">View All Tickets</div>
                <div className="text-sm text-gray-500">Manage support tickets</div>
              </div>
            </button>
            <button className="w-full flex items-center p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
              <Users className="w-5 h-5 mr-3 text-green-600" />
              <div>
                <div className="font-medium">Manage Staff</div>
                <div className="text-sm text-gray-500">Add or update staff members</div>
              </div>
            </button>
            <button className="w-full flex items-center p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
              <DollarSign className="w-5 h-5 mr-3 text-yellow-600" />
              <div>
                <div className="font-medium">Finance Dashboard</div>
                <div className="text-sm text-gray-500">View financial reports</div>
              </div>
            </button>
            <button className="w-full flex items-center p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
              <Wrench className="w-5 h-5 mr-3 text-purple-600" />
              <div>
                <div className="font-medium">Technical Issues</div>
                <div className="text-sm text-gray-500">Monitor system health</div>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">API Status</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Database</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Email Service</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Active
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Payment Gateway</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Active
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Last Backup</span>
              <span className="text-gray-600">Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedUserEmail && (
        <UserDetailModal
          email={selectedUserEmail}
          onClose={() => {
            setSelectedUserEmail(null);
            fetchDashboardData(); // Refresh data after closing
          }}
        />
      )}
      {selectedDepositId && (
        <DepositDetailModal
          depositId={selectedDepositId}
          onClose={() => {
            setSelectedDepositId(null);
            fetchDashboardData(); // Refresh data after closing
          }}
          onAction={fetchDashboardData} // Refresh data after action
        />
      )}
    </div>
  );
};

export default AdminDashboard;


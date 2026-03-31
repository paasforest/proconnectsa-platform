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
import ProvidersManagement from './ProvidersManagement';

type DashboardView =
  | 'overview'
  | 'providers'
  | 'support'
  | 'staff'
  | 'finance'
  | 'technical'
  | 'settings'
  | 'google-reviews'
  | 'premium-requests'
  | 'verifications';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard, current: currentView === 'overview' },
    { id: 'providers', name: 'Providers', icon: Users, current: currentView === 'providers' },
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
      case 'providers':
        return <ProvidersManagement />;
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
        const monitoringData = await apiClient.get('/api/auth/admin/monitoring/dashboard/');
        const data = monitoringData?.data || monitoringData;
        if (data && typeof data === 'object') {
          setMonitoringData(data);
        } else {
          setMonitoringData({ registrations: { total: 0 }, payments: { total_deposited: 0 }, leads: { new_leads: 0 } });
        }
      } catch (error: any) {
        console.error('[Admin Dashboard] Failed to fetch monitoring dashboard:', error?.response || error?.message);
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
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">New Leads</p>
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{monitoringData?.leads?.new_leads || 0}</p>
              )}
            </div>
          </div>
          {!loading && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              {(monitoringData?.leads?.recent_leads?.length ?? 0) > 0 ? (
                <>
                  <p className="text-xs font-medium text-gray-500 mb-2">Sent by (last 24h)</p>
                  <ul className="space-y-2 max-h-32 overflow-y-auto">
                    {(monitoringData.leads.recent_leads as any[]).slice(0, 8).map((lead: any, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700">
                        <span className="font-medium truncate block" title={lead.title}>{lead.title}</span>
                        <span className="text-gray-500">
                          {lead.client_name ? `${lead.client_name} (${lead.client || '—'})` : (lead.client || '—')}
                        </span>
                        {lead.created_at && (
                          <span className="text-gray-400 text-xs ml-1">
                            {new Date(lead.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-xs text-gray-400">No new leads in the last 24 hours. New submissions will show here with who sent them.</p>
              )}
            </div>
          )}
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
        <div className="mb-6 bg-red-50/80 border border-red-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 shrink-0" />
            {problems.problems_detected} Problem(s) Need Attention
          </h3>
          <div className="space-y-4">
            {problems.problems.map((problem: any, index: number) => (
              <div key={index} className="bg-white rounded-lg border border-red-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{problem.message}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{problem.action}</p>

                    {/* Affected Users: one per row, email + business name */}
                    {problem.users && problem.users.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                          Affected Users ({problem.users.length})
                        </p>
                        <div className="max-h-48 overflow-y-auto rounded border border-gray-100 bg-gray-50/50">
                          <ul className="divide-y divide-gray-100 p-1">
                            {problem.users.slice(0, 20).map((user: any, idx: number) => {
                              const email = typeof user === 'string' ? user : user.email;
                              const businessName = typeof user === 'object' ? user.business_name : null;
                              return (
                                <li key={idx}>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedUserEmail(email)}
                                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors group"
                                    title="View user details"
                                  >
                                    <span className="text-sm text-gray-900 block truncate group-hover:text-blue-600">
                                      {email}
                                    </span>
                                    {businessName && (
                                      <span className="text-xs text-gray-500 block truncate mt-0.5">
                                        {businessName}
                                      </span>
                                    )}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                          {problem.users.length > 20 && (
                            <p className="text-xs text-gray-500 px-3 py-2 border-t border-gray-100 bg-white">
                              +{problem.users.length - 20} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Deposit Details: one card per deposit with clear fields */}
                    {problem.details && problem.details.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                          Deposit Details ({problem.details.length})
                        </p>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                          {problem.details.slice(0, 15).map((detail: any, idx: number) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedDepositId(detail.deposit_id)}
                              className="w-full text-left rounded-lg border border-gray-200 bg-gray-50/80 hover:bg-gray-100 hover:border-gray-300 px-3 py-2.5 transition-colors"
                              title="View deposit details"
                            >
                              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                                <span className="font-medium text-gray-900">
                                  {detail.business_name || detail.user}
                                </span>
                                <span className="text-sm text-gray-700">
                                  R{Number(detail.amount).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 mt-1 text-xs text-gray-500">
                                <span>{detail.age_hours != null ? `${Number(detail.age_hours).toFixed(1)}h ago` : '—'}</span>
                                {detail.reference_number && (
                                  <span className="font-mono truncate" title={detail.reference_number}>
                                    Ref: {detail.reference_number}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                          {problem.details.length > 15 && (
                            <p className="text-xs text-gray-500 py-1">
                              +{problem.details.length - 15} more deposits
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full capitalize ${
                      problem.severity === 'high'
                        ? 'bg-red-100 text-red-800'
                        : problem.severity === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                    }`}
                  >
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


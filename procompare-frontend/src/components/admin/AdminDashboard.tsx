"use client";

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard, MessageSquare, Users, DollarSign, Wrench, 
  Settings, BarChart3, Bell, LogOut, Menu, X
} from 'lucide-react';
import AdminSupportDashboard from './AdminSupportDashboard';
// import StaffManagement from './StaffManagement';
// import FinanceDashboard from './FinanceDashboard';
// import TechnicalDashboard from './TechnicalDashboard';

type DashboardView = 'overview' | 'support' | 'staff' | 'finance' | 'technical' | 'settings';

const AdminDashboard = () => {
  const { data: session } = useSession();
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard, current: currentView === 'overview' },
    { id: 'support', name: 'Support Tickets', icon: MessageSquare, current: currentView === 'support' },
    { id: 'staff', name: 'Staff Management', icon: Users, current: currentView === 'staff' },
    { id: 'finance', name: 'Finance', icon: DollarSign, current: currentView === 'finance' },
    { id: 'technical', name: 'Technical', icon: Wrench, current: currentView === 'technical' },
    { id: 'settings', name: 'Settings', icon: Settings, current: currentView === 'settings' },
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'support':
        return <AdminSupportDashboard />;
      case 'staff':
        return <div className="p-6"><h1 className="text-2xl font-bold">Staff Management</h1><p>Staff management temporarily disabled for deployment.</p></div>;
      case 'finance':
        return <div className="p-6"><h1 className="text-2xl font-bold">Finance Dashboard</h1><p>Finance dashboard temporarily disabled for deployment.</p></div>;
      case 'technical':
        return <div className="p-6"><h1 className="text-2xl font-bold">Technical Dashboard</h1><p>Technical dashboard temporarily disabled for deployment.</p></div>;
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
  const { data: session } = useSession();

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
                  {(session?.user?.name || 'A').charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {session?.user?.name || 'Admin User'}
              </p>
              <p className="text-xs font-medium text-gray-500">
                Administrator
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/admin' })}
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
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-600 mt-2">Welcome to the ProCompare Admin Dashboard</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Staff</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">R125,000</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Satisfaction</p>
              <p className="text-2xl font-bold text-gray-900">4.8/5</p>
            </div>
          </div>
        </div>
      </div>

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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-600">Ticket #ST-20241216-ABC123 resolved</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-600">New staff member John Doe added</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-gray-600">Payment issue reported</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              <span className="text-gray-600">Critical bug detected in API</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-600">System maintenance completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


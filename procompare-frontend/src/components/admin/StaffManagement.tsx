"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import {
  Users, UserPlus, Edit, Trash2, Shield, Phone, Mail, 
  Calendar, Tag, CheckCircle, XCircle, Settings, BarChart3, X
} from 'lucide-react';
import { apiClient } from '@/lib/api-simple';

interface SupportStaff {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
  };
  employee_id: string;
  role: 'agent' | 'senior_agent' | 'supervisor' | 'manager' | 'admin';
  department: 'general' | 'technical' | 'billing' | 'sales' | 'escalation';
  is_active: boolean;
  max_concurrent_tickets: number;
  current_tickets: number;
  specializations: string[];
  languages: string[];
  timezone: string;
  phone: string;
  emergency_contact: string;
  notes: string;
  created_at: string;
}

interface NewStaffData {
  user: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
  };
  profile: {
    employee_id: string;
    role: string;
    department: string;
    max_concurrent_tickets: number;
    specializations: string[];
    languages: string[];
    timezone: string;
    phone: string;
    emergency_contact: string;
    notes: string;
  };
}

const StaffManagement = () => {
  const { user, token } = useAuth();
  const [staff, setStaff] = useState<SupportStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<SupportStaff | null>(null);
  const [newStaff, setNewStaff] = useState<NewStaffData>({
    user: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: ''
    },
    profile: {
      employee_id: '',
      role: 'agent',
      department: 'general',
      max_concurrent_tickets: 10,
      specializations: [],
      languages: ['English'],
      timezone: 'UTC',
      phone: '',
      emergency_contact: '',
      notes: ''
    }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (token) {
      fetchStaff();
    }
  }, [token]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      if (token) {
        apiClient.setToken(token);
      } else {
        return;
      }
      const response = await apiClient.get('/api/support/staff/');
      setStaff(response.staff || response);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    try {
      // Ensure token is set
      if (token) {
        apiClient.setToken(token);
      } else {
        setErrorMessage('Authentication required. Please refresh the page.');
        return;
      }

      // Clear previous messages
      setErrorMessage('');
      setSuccessMessage('');

      // Validate required fields
      if (!newStaff.user.email?.trim() || !newStaff.user.password?.trim() || !newStaff.user.username?.trim()) {
        setErrorMessage('Please fill in all required fields: email, password, and username.');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newStaff.user.email.trim())) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }

      // Validate password strength
      if (newStaff.user.password.trim().length < 8) {
        setErrorMessage('Password must be at least 8 characters long.');
        return;
      }

      // Validate employee ID
      if (!newStaff.profile.employee_id?.trim()) {
        setErrorMessage('Employee ID is required.');
        return;
      }

      // Validate first and last name
      if (!newStaff.user.first_name?.trim() || !newStaff.user.last_name?.trim()) {
        setErrorMessage('First name and last name are required.');
        return;
      }

      // Validate phone format if provided
      if (newStaff.profile.phone?.trim()) {
        const phone = newStaff.profile.phone.trim();
        const phoneRegex = /^(\+27|0)[0-9]{9}$/;
        if (!phoneRegex.test(phone)) {
          setErrorMessage('Phone number must be in format: 0782356734 or +27782356734');
          return;
        }
      }
      
      // Prepare data with proper phone handling
      let userPhone = null;
      if (newStaff.profile.phone?.trim()) {
        // Convert SA phone format: 0782356734 -> +27782356734
        let phone = newStaff.profile.phone.trim();
        if (phone.startsWith('0')) {
          phone = '+27' + phone.substring(1);
        } else if (!phone.startsWith('+27')) {
          phone = '+27' + phone;
        }
        userPhone = phone;
      }

      const staffData = {
        ...newStaff,
        user: {
          ...newStaff.user,
          phone: userPhone
        },
        profile: {
          ...newStaff.profile,
          // Ensure arrays are properly formatted
          specializations: newStaff.profile.specializations || [],
          languages: newStaff.profile.languages || ['English']
        }
      };
      
      const response = await apiClient.post('/api/support/staff/register/', staffData);
      
      // Clear form and close modal
      setNewStaff({
        user: {
          username: '',
          email: '',
          first_name: '',
          last_name: '',
          password: ''
        },
        profile: {
          employee_id: '',
          role: 'agent',
          department: 'general',
          max_concurrent_tickets: 10,
          specializations: [],
          languages: ['English'],
          timezone: 'UTC',
          phone: '',
          emergency_contact: '',
          notes: ''
        }
      });
      
      await fetchStaff();
      setShowAddModal(false);
      setSuccessMessage(`✅ Successfully added staff member: ${staffData.user.first_name} ${staffData.user.last_name} (${staffData.profile.employee_id})`);
      setTimeout(() => setSuccessMessage(''), 8000);
    } catch (error: any) {
      console.error('Failed to add staff:', error);
      console.error('Error details:', error.response?.data);
      console.error('Full error response:', JSON.stringify(error.response?.data, null, 2));
      
      const errorData = error.response?.data;
      let errorMsg = 'Unknown error';
      
      if (errorData?.errors) {
        // Format validation errors nicely
        const errorDetails = [];
        for (const [field, messages] of Object.entries(errorData.errors)) {
          if (Array.isArray(messages)) {
            errorDetails.push(`${field}: ${messages.join(', ')}`);
          } else {
            errorDetails.push(`${field}: ${messages}`);
          }
        }
        errorMsg = errorDetails.join('; ');
      } else if (errorData?.error) {
        errorMsg = errorData.error;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(`Failed to add staff member: ${errorMsg}`);
      setTimeout(() => setErrorMessage(''), 15000);
    }
  };

  const handleUpdateStaff = async (staffId: number, updates: Partial<SupportStaff>) => {
    try {
      await apiClient.put(`/api/support/staff/${staffId}/update/`, updates);
      await fetchStaff();
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update staff:', error);
    }
  };

  const handleDeactivateStaff = async (staffId: number) => {
    try {
      await apiClient.post(`/api/support/staff/${staffId}/deactivate/`);
      await fetchStaff();
    } catch (error) {
      console.error('Failed to deactivate staff:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'senior_agent': return 'bg-green-100 text-green-800';
      case 'agent': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'billing': return 'bg-green-100 text-green-800';
      case 'sales': return 'bg-yellow-100 text-yellow-800';
      case 'escalation': return 'bg-red-100 text-red-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      member.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
        <p className="text-gray-600 mt-2">Manage support staff and their roles</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-green-800">{successMessage}</p>
              <p className="text-xs text-green-600 mt-1">The staff member has been created and a welcome email has been sent.</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSuccessMessage('')}
                className="text-green-400 hover:text-green-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-red-800">{errorMessage}</p>
              <p className="text-xs text-red-600 mt-1">Please check the form and try again.</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setErrorMessage('')}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="sales">Sales</option>
                <option value="escalation">Escalation</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="agent">Agent</option>
                <option value="senior_agent">Senior Agent</option>
                <option value="supervisor">Supervisor</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>

              <button
                onClick={() => {
                  setShowAddModal(true);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Staff
              </button>
            </div>
          </div>
        </div>

        {/* Staff Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((member) => (
              <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {member.user.first_name} {member.user.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">{member.user.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setSelectedStaff(member);
                        setShowEditModal(true);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeactivateStaff(member.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Employee ID:</span>
                    <span className="text-sm font-medium">{member.employee_id}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Role:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}>
                      {member.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Department:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDepartmentColor(member.department)}`}>
                      {member.department.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <div className="flex items-center">
                      {member.is_active ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className="text-sm font-medium">
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Workload:</span>
                    <span className="text-sm font-medium">
                      {member.current_tickets}/{member.max_concurrent_tickets}
                    </span>
                  </div>
                  
                  {member.specializations.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Specializations:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.specializations.map((spec, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Staff Member</h3>
            
            <div className="space-y-6">
              {/* User Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">User Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newStaff.user.username}
                      onChange={(e) => setNewStaff({
                        ...newStaff,
                        user: { ...newStaff.user, username: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={newStaff.user.email}
                      onChange={(e) => setNewStaff({
                        ...newStaff,
                        user: { ...newStaff.user, email: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newStaff.user.first_name}
                      onChange={(e) => setNewStaff({
                        ...newStaff,
                        user: { ...newStaff.user, first_name: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newStaff.user.last_name}
                      onChange={(e) => setNewStaff({
                        ...newStaff,
                        user: { ...newStaff.user, last_name: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter last name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newStaff.user.password}
                      onChange={(e) => setNewStaff({
                        ...newStaff,
                        user: { ...newStaff.user, password: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter password (min 8 characters)"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Profile Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newStaff.profile.employee_id}
                      onChange={(e) => setNewStaff({
                        ...newStaff,
                        profile: { ...newStaff.profile, employee_id: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., EMP001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={newStaff.profile.role}
                      onChange={(e) => setNewStaff({
                        ...newStaff,
                        profile: { ...newStaff.profile, role: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="agent">Agent</option>
                      <option value="senior_agent">Senior Agent</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      value={newStaff.profile.department}
                      onChange={(e) => setNewStaff({
                        ...newStaff,
                        profile: { ...newStaff.profile, department: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="general">General</option>
                      <option value="technical">Technical</option>
                      <option value="billing">Billing</option>
                      <option value="sales">Sales</option>
                      <option value="escalation">Escalation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Concurrent Tickets</label>
                    <input
                      type="number"
                      value={newStaff.profile.max_concurrent_tickets}
                      onChange={(e) => setNewStaff({
                        ...newStaff,
                        profile: { ...newStaff.profile, max_concurrent_tickets: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={newStaff.profile.phone}
                      onChange={(e) => setNewStaff({
                        ...newStaff,
                        profile: { ...newStaff.profile, phone: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select
                      value={newStaff.profile.timezone}
                      onChange={(e) => setNewStaff({
                        ...newStaff,
                        profile: { ...newStaff.profile, timezone: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="UTC">UTC</option>
                      <option value="Africa/Johannesburg">Africa/Johannesburg</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Europe/London">Europe/London</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStaff}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add Staff Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;


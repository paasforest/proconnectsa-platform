'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { redirectToDashboard } from '@/lib/auth-utils';
import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal';
import PasswordResetModal from '@/components/auth/PasswordResetModal';

// Service categories for ML matching
const serviceCategories = [
  'Cleaning', 'Electrical', 'Plumbing', 'Painting', 'Carpentry', 
  'Gardening', 'Handyman', 'Roofing', 'Flooring', 'Tiling',
  'Appliance Repair', 'HVAC', 'Security', 'Landscaping', 'Pool Maintenance',
  'Construction', 'Renovations', 'Farm Fencing', 'Solar Installation',
  'PVC Installation', 'DSTV Installation', 'CCTV Installation', 'Access Control',
  'Satellite Installation', 'Home Automation', 'Alarm Systems', 'Electric Fencing'
];

// Experience levels
const experienceLevels = [
  'Less than 1 year', '1-2 years', '3-5 years', '6-10 years', '11-20 years', '20+ years'
];

// South African provinces
const provinces = [
  'Western Cape', 'Gauteng', 'KwaZulu-Natal', 'Eastern Cape', 
  'Free State', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West'
];

// Major South African cities for service areas
const majorCities = [
  'Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth', 
  'Bloemfontein', 'East London', 'Pietermaritzburg', 'Nelspruit', 
  'Polokwane', 'Kimberley', 'Rustenburg', 'Welkom', 'Potchefstroom'
];

export default function RegisterPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup'); // Add auth mode state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic info
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    user_type: 'client',
    phone_number: '', // Full number with +27 prefix
    city: '',
    suburb: '',
    province: '',
    latitude: '',
    longitude: '',
    
    // Provider info for ML services
    business_name: '',
    business_address: '',
    business_phone: '',
    business_email: '',
    primary_service: '',
    service_categories: [] as string[],
    service_areas: [] as string[],
    max_travel_distance: 30,
    years_experience: '',
    service_description: '',
    hourly_rate_min: '',
    hourly_rate_max: '',
    minimum_job_value: '',
    terms_accepted: false,
    privacy_accepted: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [message, setMessage] = useState(''); // Add message state for login
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    let cleaned = value.replace(/\D/g, '');
    
    // If it starts with 27, keep it
    // If it starts with 0, replace with 27
    // Otherwise, prepend 27
    if (cleaned.startsWith('27')) {
      cleaned = cleaned.substring(0, 11); // +27 + 9 digits = 11 digits total (without +)
    } else if (cleaned.startsWith('0')) {
      cleaned = '27' + cleaned.substring(1, 10); // Replace 0 with 27, keep next 9 digits
    } else if (cleaned.length > 0) {
      cleaned = '27' + cleaned.substring(0, 9); // Prepend 27, keep first 9 digits
    }
    
    // Ensure we have exactly 11 digits (27 + 9 digits)
    if (cleaned.length === 11 && cleaned.startsWith('27')) {
      return `+${cleaned}`;
    }
    
    return cleaned ? `+${cleaned}` : '';
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      phone_number: formatted
    }));
  };

  const validateStep1 = () => {
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.password_confirm) {
      setError('Please fill in all required fields');
      return false;
    }
    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!formData.city || !formData.suburb || !formData.province) {
      setError('Please provide your location information');
      return false;
    }
    if (!formData.terms_accepted || !formData.privacy_accepted) {
      setError('Please accept the terms and conditions to continue');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (formData.user_type === 'provider') {
      if (!formData.business_name || !formData.primary_service || !formData.service_description) {
        setError('Please fill in all required provider fields');
        return false;
      }
      if (formData.service_categories.length === 0) {
        setError('Please select at least one service category');
        return false;
      }
      if (formData.service_areas.length === 0) {
        setError('Please select at least one service area');
        return false;
      }
      // Terms are already checked in Step 1, but double-check for providers
      if (!formData.terms_accepted || !formData.privacy_accepted) {
        setError('Please accept the terms and conditions');
        return false;
      }
    }
    return true;
  };

  // Add login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (!formData.email || !formData.password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }

      const loginResponse = await fetch('https://api.proconnectsa.co.za/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await loginResponse.json();

      if (data.success && data.token) {
        // Store authentication data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Show success message
        setMessage('🎉 Login successful! Redirecting to your dashboard...');
        setError(''); // Clear any previous errors
        
        // Get user type from response and redirect
        const userType = data.user?.user_type;
        
        // Route to appropriate dashboard based on user type with a small delay to show the message
        const dashboardPath = redirectToDashboard(userType);
        setTimeout(() => {
        window.location.replace(dashboardPath);
        }, 2000); // Show message for 2 seconds before redirect
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('🚀 Registration form submitted', {
      user_type: formData.user_type,
      currentStep,
      terms_accepted: formData.terms_accepted,
      privacy_accepted: formData.privacy_accepted
    });

    // Validate Step 1
    if (!validateStep1()) {
      console.error('❌ Step 1 validation failed');
      return;
    }

    // Validate Step 2 (only for providers)
    if (!validateStep2()) {
      console.error('❌ Step 2 validation failed');
      return;
    }

    console.log('✅ All validations passed, submitting to API...');
    setLoading(true);

    try {
      // Prepare data for API
      const apiData = {
        username: formData.email,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        first_name: formData.first_name,
        last_name: formData.last_name,
        user_type: formData.user_type,
        phone: formData.phone_number || null,
        city: formData.city,
        suburb: formData.suburb,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };

      // Add provider-specific data for ML services
      if (formData.user_type === 'provider') {
        Object.assign(apiData, {
          business_name: formData.business_name,
          business_address: formData.business_address,
          business_phone: formData.phone_number || null,
          business_email: formData.business_email || formData.email,
          primary_service: formData.primary_service,
          service_categories: formData.service_categories,
          service_areas: formData.service_areas,
          max_travel_distance: parseInt(formData.max_travel_distance.toString()),
          years_experience: formData.years_experience,
          service_description: formData.service_description,
          hourly_rate_min: formData.hourly_rate_min ? parseFloat(formData.hourly_rate_min) : null,
          hourly_rate_max: formData.hourly_rate_max ? parseFloat(formData.hourly_rate_max) : null,
          minimum_job_value: formData.minimum_job_value ? parseFloat(formData.minimum_job_value) : null
        });
      }

      console.log('📤 Sending registration data to API:', {
        ...apiData,
        password: '***hidden***',
        password_confirm: '***hidden***'
      });

      const response = await fetch('https://api.proconnectsa.co.za/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      console.log('📥 API Response status:', response.status, response.statusText);

      const data = await response.json();
      console.log('📥 API Response data:', data);

      if (response.ok) {
        // Store the email for login
        const registeredEmail = formData.email;
        
        setSuccess('🎉 Registration successful! Your account has been created. You can now sign in below.');
        setError(''); // Clear any previous errors
        // Switch to login mode instead of redirecting
        setAuthMode('login');
        // Clear the form data but keep the email for convenience
        setFormData({
          first_name: '',
          last_name: '',
          email: registeredEmail, // Keep email for login convenience
          password: '',
          password_confirm: '',
          user_type: 'client',
          phone_number: '',
          city: '',
          suburb: '',
          province: '',
          latitude: '',
          longitude: '',
          business_name: '',
          business_address: '',
          business_phone: '',
          business_email: '',
          primary_service: '',
          service_categories: [],
          service_areas: [],
          max_travel_distance: 50,
          years_experience: '',
          service_description: '',
          hourly_rate_min: '',
          hourly_rate_max: '',
          minimum_job_value: '',
          terms_accepted: false,
          privacy_accepted: false
        });
      } else {
        // Handle various error response formats from backend
        let errorMessage = 'Registration failed. Please try again.';
        
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          errorMessage = errorMessages.join(', ');
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.username || data.email || data.password || data.password_confirm || data.phone) {
          // Handle field-specific errors from Django REST Framework
          const fieldErrors = [];
          if (data.username) fieldErrors.push(`Username: ${data.username.join(', ')}`);
          if (data.email) fieldErrors.push(`Email: ${data.email.join(', ')}`);
          if (data.password) fieldErrors.push(`Password: ${data.password.join(', ')}`);
          if (data.password_confirm) fieldErrors.push(`Password Confirm: ${data.password_confirm.join(', ')}`);
          if (data.phone) fieldErrors.push(`Phone: ${data.phone.join(', ')}`);
          if (data.first_name) fieldErrors.push(`First Name: ${data.first_name.join(', ')}`);
          if (data.last_name) fieldErrors.push(`Last Name: ${data.last_name.join(', ')}`);
          errorMessage = fieldErrors.join('; ');
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Join{' '}
          <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            ProConnectSA
          </span>
        </h2>
        <p className="text-gray-600">
          Start earning with South Africa's premium service marketplace
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            name="first_name"
            type="text"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
            placeholder="First Name"
            value={formData.first_name}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            name="last_name"
            type="text"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
            placeholder="Last Name"
            value={formData.last_name}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
          placeholder="your@email.com"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Password *
        </label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password *
        </label>
        <div className="relative">
          <input
            name="password_confirm"
            type={showPasswordConfirm ? "text" : "password"}
            required
            autoComplete="new-password"
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
            placeholder="Confirm Password"
            value={formData.password_confirm}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            tabIndex={-1}
          >
            {showPasswordConfirm ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Account Type *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData({...formData, user_type: 'client'})}
            className={`p-4 border-2 rounded-lg text-center transition-colors ${
              formData.user_type === 'client'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-2xl mb-2">👤</div>
            <div className="font-medium">Client</div>
            <div className="text-sm text-gray-600">Looking for services</div>
          </button>
          
          <button
            type="button"
            onClick={() => setFormData({...formData, user_type: 'provider'})}
            className={`p-4 border-2 rounded-lg text-center transition-colors ${
              formData.user_type === 'provider'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-2xl mb-2">🔧</div>
            <div className="font-medium">Service Provider</div>
            <div className="text-sm text-gray-600">Offering services</div>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number *
        </label>
            <input
              name="phone_number"
              type="tel"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
          placeholder="e.g., 0812345678 or +27812345678"
              value={formData.phone_number}
          onChange={handlePhoneChange}
          required
            />
        <p className="text-xs text-gray-500 mt-1">
          Format: +27XXXXXXXXX (South African mobile number)
          {formData.phone_number && <span className="ml-2 font-medium text-emerald-600">✓ {formData.phone_number}</span>}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
        </label>
        <input
          name="city"
          type="text"
            required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
        />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Suburb *
          </label>
          <input
            name="suburb"
            type="text"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
            placeholder="Suburb"
            value={formData.suburb}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Province *
        </label>
        <select
          name="province"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
          value={formData.province}
          onChange={handleChange}
        >
          <option value="">Select province</option>
          {provinces.map((province) => (
            <option key={province} value={province}>{province}</option>
          ))}
        </select>
      </div>

      {/* Terms and Conditions - Show for all users */}
      <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Terms & Conditions</h3>
        <div className="space-y-3">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              name="terms_accepted"
              required
              checked={formData.terms_accepted}
              onChange={handleChange}
              className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">
              I have read and agree to the <a href="/how-it-works" target="_blank" className="text-emerald-600 hover:underline">Terms of Service</a> *
            </span>
          </label>
          
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              name="privacy_accepted"
              required
              checked={formData.privacy_accepted}
              onChange={handleChange}
              className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-gray-700">
              I have read and agree to the <a href="/how-it-works" target="_blank" className="text-emerald-600 hover:underline">Privacy Policy</a> *
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  // Add login form render function
  const renderLoginForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back to{' '}
          <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            ProConnectSA
          </span>
        </h2>
        <p className="text-gray-600">
          Sign in to your account and start earning
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
          placeholder="your@email.com"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password *
        </label>
        <div className="relative">
          <input
            name="password"
            type={showLoginPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
            placeholder="Your password"
            value={formData.password}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowLoginPassword(!showLoginPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            tabIndex={-1}
          >
            {showLoginPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Forgot your password?
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Complete Your{' '}
          <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Professional Profile
          </span>
        </h2>
        <p className="text-gray-600">
          Help us match you with the perfect leads using AI
        </p>
      </div>

      {/* Business Information */}
      <div className="bg-gradient-to-br from-emerald-50 to-blue-50 p-6 rounded-xl border border-emerald-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
          Business Information
        </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
        </label>
        <input
          name="business_name"
          type="text"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
          placeholder="Your business name"
          value={formData.business_name}
          onChange={handleChange}
        />
      </div>

        <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Address *
        </label>
          <textarea
            name="business_address"
            rows={2}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
            placeholder="Full business address"
            value={formData.business_address}
          onChange={handleChange}
          />
      </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Phone
        </label>
            <input
              name="business_phone"
              type="tel"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
              placeholder="Business phone number"
              value={formData.business_phone}
          onChange={handleChange}
            />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Email
        </label>
            <input
              name="business_email"
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
              placeholder="Business email"
              value={formData.business_email}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Service Information */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Service *
          </label>
            <select
            name="primary_service"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
            value={formData.primary_service}
              onChange={handleChange}
            >
            <option value="">Select primary service</option>
            {serviceCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Categories * (Select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {serviceCategories.map((category) => (
              <label key={category} className="flex items-center">
            <input
                  type="checkbox"
                  value={category}
                  checked={formData.service_categories.includes(category)}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        service_categories: [...formData.service_categories, value]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        service_categories: formData.service_categories.filter(c => c !== value)
                      });
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">{category}</span>
              </label>
            ))}
          </div>
      </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Areas * (Where do you provide services?)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {majorCities.map((area) => (
              <label key={area} className="flex items-center">
          <input
                  type="checkbox"
                  value={area}
                  checked={formData.service_areas.includes(area)}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        service_areas: [...formData.service_areas, value]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        service_areas: formData.service_areas.filter(a => a !== value)
                      });
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">{area}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Travel Distance (km) *
          </label>
          <select
            name="max_travel_distance"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
            value={formData.max_travel_distance}
            onChange={handleChange}
          >
            <option value="10">10 km</option>
            <option value="20">20 km</option>
            <option value="30">30 km</option>
            <option value="50">50 km</option>
            <option value="100">100 km</option>
            <option value="200">200+ km</option>
          </select>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience *
          </label>
          <select
            name="years_experience"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
            value={formData.years_experience}
            onChange={handleChange}
          >
            <option value="">Select experience level</option>
            {experienceLevels.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
      </div>

        <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Description *
        </label>
        <textarea
          name="service_description"
          rows={3}
            required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
            placeholder="Describe your services and expertise"
          value={formData.service_description}
          onChange={handleChange}
        />
        </div>
      </div>

      {/* Pricing Information */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing Information</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
              Hourly Rate (Min) - R
          </label>
          <input
              name="hourly_rate_min"
              type="number"
              step="0.01"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
              placeholder="150.00"
              value={formData.hourly_rate_min}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
              Hourly Rate (Max) - R
          </label>
            <input
              name="hourly_rate_max"
              type="number"
              step="0.01"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
              placeholder="300.00"
              value={formData.hourly_rate_max}
            onChange={handleChange}
            />
        </div>
      </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Job Value - R
          </label>
          <input
            name="minimum_job_value"
            type="number"
            step="0.01"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white focus:text-gray-900 transition-colors bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
            placeholder="500.00"
            value={formData.minimum_job_value}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Note: Terms & Conditions already accepted in Step 1 */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-6">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-emerald-800">Terms & Conditions Accepted</p>
            <p className="text-xs text-emerald-700 mt-1">You accepted the Terms of Service and Privacy Policy in Step 1.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            <span className="text-emerald-600">ProConnect</span>
            <span className="text-gray-900">SA</span>
              </h1>
          <p className="text-lg text-gray-600">
            South Africa's Premium Service Marketplace
          </p>
          </div>
        </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl border border-gray-200 sm:rounded-2xl sm:px-10">
          {/* Auth Mode Tabs */}
          <div className="mb-8">
            <div className="flex bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-1 border border-emerald-200">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setCurrentStep(1);
                  setError('');
                  // Don't clear success message if it's a registration success
                  if (!success.includes('Registration successful')) {
                  setSuccess('');
                  }
                  setMessage('');
                }}
                className={`flex-1 py-3 px-6 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  authMode === 'login'
                    ? 'bg-white text-emerald-700 shadow-lg border border-emerald-200'
                    : 'text-gray-600 hover:text-emerald-700 hover:bg-white/50'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setCurrentStep(1);
                  setError('');
                  setSuccess('');
                  setMessage('');
                }}
                className={`flex-1 py-3 px-6 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  authMode === 'signup'
                    ? 'bg-white text-emerald-700 shadow-lg border border-emerald-200'
                    : 'text-gray-600 hover:text-emerald-700 hover:bg-white/50'
                }`}
              >
                Sign Up
              </button>
              </div>
            </div>

          {/* Progress indicator for signup only */}
          {authMode === 'signup' && (
                <div className="mb-8">
              <div className="flex items-center justify-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                  currentStep >= 1 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                  </div>
                <div className={`w-20 h-2 rounded-full ${currentStep >= 2 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gray-200'}`}></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                  currentStep >= 2 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
              </div>
              <div className="flex justify-between mt-3 text-sm font-medium text-gray-600">
                <span>Basic Info</span>
                <span>{formData.user_type === 'provider' ? 'Provider Details' : 'Complete'}</span>
                  </div>
                </div>
              )}

          {/* Error and Success Messages */}
              {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              {success && (
            <div className="mb-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{success}</p>
                </div>
              </div>
                </div>
              )}

              {message && (
            <div className="mb-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">{message}</p>
                </div>
              </div>
                </div>
              )}

          <form onSubmit={authMode === 'login' ? handleLogin : handleSubmit} className="space-y-6">
            {authMode === 'login' ? (
              renderLoginForm()
            ) : (
              <>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
              </>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between">
              {authMode === 'signup' && currentStep > 1 && (
                    <button
                      type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all duration-200"
                    >
                      Previous
                    </button>
                  )}

              <div className="ml-auto">
                {authMode === 'login' ? (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transition-all duration-200"
                  >
                    {loading && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {loading ? 'Signing In...' : 'Sign In'}
                  </button>
                ) : currentStep < 2 && formData.user_type === 'provider' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep1()) {
                        setCurrentStep(2);
                      }
                    }}
                    className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-lg transition-all duration-200"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transition-all duration-200"
                  >
                    {loading && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                )}
              </div>
                </div>
              </form>

          <div className="mt-6 text-center">
            {authMode === 'login' ? (
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setCurrentStep(1);
                    setError('');
                    setSuccess('');
                    setMessage('');
                  }}
                  className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Sign up here
                </button>
              </p>
            ) : (
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setCurrentStep(1);
                    setError('');
                    // Don't clear success message if it's a registration success
                    if (!success.includes('Registration successful')) {
                    setSuccess('');
                    }
                    setMessage('');
                  }}
                  className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                    Sign in here
                </button>
                </p>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSuccess={(email, token) => {
          setShowForgotPassword(false);
          setResetEmail(email);
          setResetToken(token);
          setShowPasswordReset(true);
        }}
      />

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={showPasswordReset}
        onClose={() => {
          setShowPasswordReset(false);
          setResetEmail('');
          setResetToken('');
        }}
        email={resetEmail}
        resetToken={resetToken}
        onSuccess={() => {
          setMessage('Password reset successfully! You can now log in with your new password.');
          setAuthMode('login');
        }}
      />
    </div>
  );
}

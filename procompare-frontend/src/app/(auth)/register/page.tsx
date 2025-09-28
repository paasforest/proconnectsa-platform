'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Service categories for ML matching
const serviceCategories = [
  'Cleaning', 'Electrical', 'Plumbing', 'Painting', 'Carpentry', 
  'Gardening', 'Handyman', 'Roofing', 'Flooring', 'Tiling',
  'Appliance Repair', 'HVAC', 'Security', 'Landscaping', 'Pool Maintenance'
];

// Experience levels
const experienceLevels = [
  'Less than 1 year', '1-2 years', '3-5 years', '6-10 years', '11-20 years', '20+ years'
];

// South African area codes
const areaCodes = [
  { code: '+27', name: 'South Africa (+27)' },
  { code: '+2711', name: 'Johannesburg (+2711)' },
  { code: '+2721', name: 'Cape Town (+2721)' },
  { code: '+2731', name: 'Durban (+2731)' },
  { code: '+2712', name: 'Pretoria (+2712)' },
  { code: '+2741', name: 'Port Elizabeth (+2741)' },
  { code: '+2751', name: 'Bloemfontein (+2751)' }
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
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic info
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    user_type: 'client',
    area_code: '+27',
    phone_number: '',
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

  const getFullPhoneNumber = () => {
    if (formData.area_code && formData.phone_number) {
      return `${formData.area_code}${formData.phone_number}`;
    }
    return '';
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
    }
    if (!formData.terms_accepted || !formData.privacy_accepted) {
      setError('Please accept the terms and conditions');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateStep1() || !validateStep2()) {
      return;
    }

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
        phone: getFullPhoneNumber() || null,
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
          business_phone: getFullPhoneNumber() || null,
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

      console.log('🚀 Sending registration data:', apiData);

      const response = await fetch('https://api.proconnectsa.co.za/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        console.error('Registration error:', data);
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          setError(errorMessages.join(', '));
        } else if (data.error) {
          setError(data.error);
        } else {
          setError('Registration failed. Please try again.');
        }
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Create your account
        </h2>
        <p className="text-gray-600">
          Join ProConnectSA Lead Marketplace
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
          <input
            name="password"
            type="password"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password *
          </label>
          <input
            name="password_confirm"
            type="password"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            placeholder="Confirm Password"
            value={formData.password_confirm}
            onChange={handleChange}
          />
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
          Phone Number
        </label>
        <div className="flex gap-2">
          <div className="w-1/3">
            <select
              name="area_code"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
              value={formData.area_code}
              onChange={handleChange}
            >
              {areaCodes.map((area) => (
                <option key={area.code} value={area.code}>{area.name}</option>
              ))}
            </select>
          </div>
          <div className="w-2/3">
            <input
              name="phone_number"
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="e.g., 123456789"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Full number: {getFullPhoneNumber() || 'Not provided'}
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          value={formData.province}
          onChange={handleChange}
        >
          <option value="">Select province</option>
          {provinces.map((province) => (
            <option key={province} value={province}>{province}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Service Provider Details
        </h2>
        <p className="text-gray-600">
          Complete your profile for ML-powered lead matching
        </p>
      </div>

      {/* Business Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            name="business_name"
            type="text"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            placeholder="500.00"
            value={formData.minimum_job_value}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-4">
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
              I have read and agree to the <a href="/how-it-works" className="text-emerald-600 hover:underline">Terms of Service</a>
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
              I have read and agree to the <a href="/how-it-works" className="text-emerald-600 hover:underline">Privacy Policy</a>
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">ProConnectSA</h1>
          <p className="mt-2 text-sm text-gray-600">
            Lead Marketplace - Find and Purchase Qualified Leads
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Basic Info</span>
              <span>{formData.user_type === 'provider' ? 'Provider Details' : 'Complete'}</span>
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}

            {/* Navigation buttons */}
            <div className="flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  Previous
                </button>
              )}
              
              <div className="ml-auto">
                {currentStep < 2 && formData.user_type === 'provider' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep1()) {
                        setCurrentStep(2);
                      }
                    }}
                    className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

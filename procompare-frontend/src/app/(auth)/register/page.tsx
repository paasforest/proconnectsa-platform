'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Service categories for providers
const serviceCategories = [
  'Plumbing', 'Electrical', 'HVAC', 'Carpentry', 'Painting', 'Roofing',
  'Flooring', 'Landscaping', 'Cleaning', 'Moving', 'Appliance Repair',
  'Handyman', 'Pool Maintenance', 'Security', 'IT Support', 'Web Design',
  'Marketing', 'Accounting', 'Legal', 'Consulting', 'Other'
];

// South African provinces
const provinces = [
  'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West'
];

// South African area codes
const areaCodes = [
  { code: '+27', name: 'South Africa (+27)' },
  { code: '+2711', name: 'Johannesburg (011)' },
  { code: '+2712', name: 'Pretoria (012)' },
  { code: '+2713', name: 'Mpumalanga (013)' },
  { code: '+2714', name: 'Rustenburg (014)' },
  { code: '+2715', name: 'Polokwane (015)' },
  { code: '+2716', name: 'Nelspruit (016)' },
  { code: '+2717', name: 'Ermelo (017)' },
  { code: '+2718', name: 'Potchefstroom (018)' },
  { code: '+2721', name: 'Cape Town (021)' },
  { code: '+2722', name: 'Malmesbury (022)' },
  { code: '+2723', name: 'Worcester (023)' },
  { code: '+2724', name: 'Kimberley (024)' },
  { code: '+2725', name: 'Port Elizabeth (025)' },
  { code: '+2727', name: 'East London (027)' },
  { code: '+2728', name: 'George (028)' },
  { code: '+2731', name: 'Durban (031)' },
  { code: '+2732', name: 'Pietermaritzburg (032)' },
  { code: '+2733', name: 'Newcastle (033)' },
  { code: '+2734', name: 'Ladysmith (034)' },
  { code: '+2735', name: 'Dundee (035)' },
  { code: '+2736', name: 'Glencoe (036)' },
  { code: '+2737', name: 'Hluhluwe (037)' },
  { code: '+2738', name: 'Richards Bay (038)' },
  { code: '+2739', name: 'Port Shepstone (039)' },
  { code: '+2740', name: 'Umtata (040)' },
  { code: '+2741', name: 'Queenstown (041)' },
  { code: '+2742', name: 'Grahamstown (042)' },
  { code: '+2743', name: 'Port Alfred (043)' },
  { code: '+2744', name: 'Graaff-Reinet (044)' },
  { code: '+2745', name: 'Uitenhage (045)' },
  { code: '+2746', name: 'Grahamstown (046)' },
  { code: '+2747', name: 'Alice (047)' },
  { code: '+2748', name: 'Butterworth (048)' },
  { code: '+2749', name: 'Cofimvaba (049)' },
  { code: '+2751', name: 'Bloemfontein (051)' },
  { code: '+2752', name: 'Thaba Nchu (052)' },
  { code: '+2753', name: 'Bethlehem (053)' },
  { code: '+2754', name: 'Welkom (054)' },
  { code: '+2755', name: 'Kroonstad (055)' },
  { code: '+2756', name: 'Parys (056)' },
  { code: '+2757', name: 'Bothaville (057)' },
  { code: '+2758', name: 'Ventersburg (058)' },
  { code: '+2759', name: 'Sasolburg (059)' }
];

// Experience levels
const experienceLevels = [
  'Less than 1 year', '1-2 years', '3-5 years', '6-10 years', '11-20 years', '20+ years'
];

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic info (supported by backend)
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
  
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (name === 'secondary_services' || name === 'service_areas') {
      // Handle multi-select arrays
      const currentArray = formData[name as keyof typeof formData] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      setFormData({
        ...formData,
        [name]: newArray
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Debug logging
    if (name === 'user_type') {
      console.log('User type changed to:', value);
      console.log('Current step:', currentStep);
      console.log('Total steps:', getTotalSteps());
    }
  };

  const nextStep = () => {
    if (currentStep < getTotalSteps()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getTotalSteps = () => {
    return formData.user_type === 'provider' ? 2 : 1;
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.first_name && formData.last_name && formData.email && 
               formData.password && formData.password_confirm && formData.user_type;
      case 2:
        return formData.business_name && formData.primary_service && 
               formData.city && formData.province && formData.phone_number && 
               formData.terms_accepted && formData.privacy_accepted;
      default:
        return true;
    }
  };

  // Combine area code and phone number for backend
  const getFullPhoneNumber = () => {
    if (!formData.phone_number) return '';
    return `${formData.area_code}${formData.phone_number}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If not on final step, go to next step
    if (currentStep < getTotalSteps()) {
      nextStep();
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    // Client-side validation
    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Prepare data for API - include provider-specific data
      const apiData = {
        username: formData.email, // Use email as username
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm, // Add password confirmation
        first_name: formData.first_name,
        last_name: formData.last_name,
        user_type: formData.user_type,
        phone: getFullPhoneNumber(),
        city: formData.city,
        suburb: formData.suburb,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };

      // Add provider-specific data if user is a service provider
      if (formData.user_type === 'provider') {
        apiData.business_name = formData.business_name;
        apiData.business_address = formData.business_address;
        apiData.business_phone = getFullPhoneNumber();
        apiData.business_email = formData.business_email;
        apiData.primary_service = formData.primary_service;
        apiData.service_categories = formData.service_categories;
        apiData.service_areas = formData.service_areas;
        apiData.max_travel_distance = parseInt(formData.max_travel_distance.toString());
        apiData.years_experience = formData.years_experience;
        apiData.service_description = formData.service_description;
        apiData.hourly_rate_min = formData.hourly_rate_min ? parseFloat(formData.hourly_rate_min) : null;
        apiData.hourly_rate_max = formData.hourly_rate_max ? parseFloat(formData.hourly_rate_max) : null;
        apiData.minimum_job_value = formData.minimum_job_value ? parseFloat(formData.minimum_job_value) : null;
      }


      // Direct API call to Flask backend
      const response = await fetch('https://api.proconnectsa.co.za/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Registration successful!');
        setTimeout(() => {
          router.push('/login?message=Registration successful, please login');
        }, 2000);
      } else {
        // Handle validation errors from backend
        if (data.errors) {
          const errorMessages = Object.entries(data.errors).map(([field, messages]) => {
            return `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
          }).join('\n');
          setError(`Registration failed:\n${errorMessages}`);
        } else {
          setError(data.message || data.detail || 'Registration failed');
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
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
          Join ProConnectSA today
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name
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
            Last Name
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
          Email Address
        </label>
        <input
          name="email"
          type="email"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Account Type
        </label>
        <select
          name="user_type"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          value={formData.user_type}
          onChange={handleChange}
        >
          <option value="client">Client (Looking for services)</option>
          <option value="provider">Service Provider (Offering services)</option>
        </select>
        {formData.user_type === 'provider' && (
          <p className="text-sm text-emerald-600 mt-2">
            ✓ Service providers will be asked additional questions in the next step
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
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
          Confirm Password
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number (Optional)
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          City (Optional)
        </label>
        <input
          name="city"
          type="text"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
        />
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
          Tell us about your services
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Name
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Service
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Years of Experience
        </label>
        <select
          name="years_experience"
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
            City
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
            Province
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Description
        </label>
        <textarea
          name="service_description"
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          placeholder="Briefly describe your services"
          value={formData.service_description}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
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
            Province
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col justify-center px-12 py-20">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">P</span>
                </div>
                <span className="text-white font-bold text-3xl">ProConnectSA</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Join ProConnectSA
              </h1>
              <p className="text-xl text-emerald-100 leading-relaxed">
                Connect with South Africa's best service providers or offer your services to quality clients.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-emerald-100">Free to Join</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-emerald-100">Verified Members</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-emerald-100">Secure Platform</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">ProConnectSA</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8 border-0">
              {/* Progress Bar */}
              {getTotalSteps() > 1 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Step {currentStep} of {getTotalSteps()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.round((currentStep / getTotalSteps()) * 100)}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentStep / getTotalSteps()) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}

                <div className="flex justify-between mt-8">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                  ) : (
                    <div></div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !isStepValid(currentStep)}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {currentStep === getTotalSteps() ? 'Creating Account...' : 'Loading...'}
                      </div>
                    ) : (
                      currentStep === getTotalSteps() ? 'Create Account' : 
                      formData.user_type === 'provider' ? 'Continue to Provider Details' : 'Next'
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
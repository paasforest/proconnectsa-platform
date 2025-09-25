'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Separate component that uses useSearchParams
function LoginContent() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const router = useRouter();

  // Remove useSearchParams for now to avoid Next.js 15 issues
  useEffect(() => {
    // Check for URL message manually
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlMessage = urlParams.get('message');
      if (urlMessage) {
        setMessage(urlMessage);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.email || !formData.password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }

      console.log('Testing API connection...');
      const testResponse = await fetch('https://api.proconnectsa.co.za/api/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!testResponse.ok) {
        throw new Error('Cannot connect to API server');
      }

      console.log('API connection successful, attempting login...');
      
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
      console.log('Login response:', data);

      if (data.success && data.data?.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
        
        console.log('Login successful, redirecting to dashboard...');
        router.push('/dashboard');
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 px-4">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ProConnectSA Platform
          </p>
        </div>

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center space-y-2">
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Don't have an account? Sign up
            </Link>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <p className="font-medium text-yellow-800 mb-1">Test Credentials:</p>
              <p className="text-yellow-700">Email: admin@proconnectsa.co.za</p>
              <p className="text-yellow-700">Password: admin123</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main page component - no Suspense needed since we removed useSearchParams
export default function LoginPage() {
  return <LoginContent />;
}
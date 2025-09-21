'use client'

import { useState } from 'react'

export default function DebugLoginPage() {
  const [email, setEmail] = useState('tshepochabalala220@gmail.com')
  const [password, setPassword] = useState('Hopemabuka@2022')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testDirectBackend = async () => {
    setLoading(true)
    setResult('Testing direct backend connection...\n')
    
    try {
      const response = await fetch('http://128.140.123.48:8000/api/auth/backend-login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      const data = await response.text()
      setResult(prev => prev + `Direct Backend Response (${response.status}):\n${data}\n\n`)
    } catch (error: any) {
      setResult(prev => prev + `Direct Backend Error: ${error.message}\n\n`)
    }
    
    setLoading(false)
  }

  const testVercelProxy = async () => {
    setLoading(true)
    setResult('Testing Vercel proxy...\n')
    
    try {
      const response = await fetch('/api/debug-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      const data = await response.json()
      setResult(prev => prev + `Vercel Proxy Response (${response.status}):\n${JSON.stringify(data, null, 2)}\n\n`)
    } catch (error: any) {
      setResult(prev => prev + `Vercel Proxy Error: ${error.message}\n\n`)
    }
    
    setLoading(false)
  }

  const testFullProxy = async () => {
    setLoading(true)
    setResult('Testing full proxy route...\n')
    
    try {
      const response = await fetch('/api/proxy/api/auth/backend-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      const data = await response.text()
      setResult(prev => prev + `Full Proxy Response (${response.status}):\n${data}\n\n`)
    } catch (error: any) {
      setResult(prev => prev + `Full Proxy Error: ${error.message}\n\n`)
    }
    
    setLoading(false)
  }

  const testNextAuth = async () => {
    setLoading(true)
    setResult('Testing NextAuth login...\n')
    
    try {
      const { signIn } = await import('next-auth/react')
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      
      setResult(prev => prev + `NextAuth Result:\n${JSON.stringify(result, null, 2)}\n\n`)
    } catch (error: any) {
      setResult(prev => prev + `NextAuth Error: ${error.message}\n\n`)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">🔧 Login Debug Tool</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Test Credentials</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  />
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <button
                  onClick={testDirectBackend}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  1. Test Direct Backend
                </button>
                
                <button
                  onClick={testVercelProxy}
                  disabled={loading}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  2. Test Debug Proxy
                </button>
                
                <button
                  onClick={testFullProxy}
                  disabled={loading}
                  className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  3. Test Full Proxy Route
                </button>
                
                <button
                  onClick={testNextAuth}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  4. Test NextAuth
                </button>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Test Results</h2>
              <div className="bg-gray-900 text-green-400 p-4 rounded-md h-96 overflow-y-auto font-mono text-sm">
                <pre>{result || 'Click a test button to see results...'}</pre>
              </div>
              
              <button
                onClick={() => setResult('')}
                className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Clear Results
              </button>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Instructions:</h3>
            <ol className="list-decimal list-inside text-yellow-700 space-y-1">
              <li>Test Direct Backend - Should work if backend is running</li>
              <li>Test Debug Proxy - Tests if Vercel can reach backend</li>
              <li>Test Full Proxy Route - Tests the actual proxy route used by NextAuth</li>
              <li>Test NextAuth - Tests the complete login flow</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

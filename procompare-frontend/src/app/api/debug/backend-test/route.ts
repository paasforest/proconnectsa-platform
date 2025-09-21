import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://128.140.123.48:8000'
    
    console.log('🔍 Testing backend connectivity from Vercel...')
    console.log('🔍 Environment variables:', {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '***SET***' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV
    })
    
    // Test health endpoint
    const healthResponse = await fetch(`${API_URL}/health/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const healthData = await healthResponse.json()
    
    // Test backend-login endpoint
    const loginResponse = await fetch(`${API_URL}/api/auth/backend-login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@proconnectsa.co.za',
        password: 'admin123',
      }),
    })

    const loginData = await loginResponse.text()
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      backend_url: API_URL,
      environment_vars: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET,
        NODE_ENV: process.env.NODE_ENV
      },
      health_test: {
        status: healthResponse.status,
        data: healthData
      },
      login_test: {
        status: loginResponse.status,
        headers: Object.fromEntries(loginResponse.headers.entries()),
        raw_response: loginData,
        parsed_response: loginResponse.ok ? JSON.parse(loginData) : null
      }
    })
  } catch (error) {
    console.error('🚨 Backend connectivity test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

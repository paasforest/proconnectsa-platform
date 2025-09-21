import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('🔑 Vercel API: Backend login attempt for:', email)

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password required'
      }, { status: 400 })
    }

    // Call Hetzner backend from Vercel server
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://128.140.123.48:8000'
    console.log('🔑 Vercel API: Calling backend at:', API_URL)
    
    const response = await fetch(`${API_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-ProConnectSA/1.0'
      },
      body: JSON.stringify({ email, password }),
      // Add timeout for production
      signal: AbortSignal.timeout(15000)
    })

    console.log('📡 Vercel API: Backend response status:', response.status)

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Vercel API: Backend success:', data.success)
      return NextResponse.json(data)
    } else {
      const errorData = await response.json().catch(() => ({ message: 'Login failed' }))
      console.log('❌ Vercel API: Backend error:', errorData)
      return NextResponse.json({
        success: false,
        message: errorData.message || 'Invalid credentials'
      }, { status: response.status })
    }

  } catch (error) {
    console.error('💥 Vercel API: Backend login error:', error)
    console.error('💥 Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error)
    })
    
    return NextResponse.json({
      success: false,
      message: 'Authentication service unavailable',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}

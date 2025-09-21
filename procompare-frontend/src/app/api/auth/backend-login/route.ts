import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password required'
      }, { status: 400 })
    }

    // Call Hetzner backend from Vercel server
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://128.140.123.48:8000'
    
    const response = await fetch(`${API_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      // Add timeout for production
      signal: AbortSignal.timeout(15000)
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      const errorData = await response.json().catch(() => ({ message: 'Login failed' }))
      return NextResponse.json({
        success: false,
        message: errorData.message || 'Invalid credentials'
      }, { status: response.status })
    }

  } catch (error) {
    console.error('Backend login error:', error)
    return NextResponse.json({
      success: false,
      message: 'Authentication service unavailable'
    }, { status: 503 })
  }
}

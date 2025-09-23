import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 })
    }

    // Call the real Django backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'
    
    try {
      const response = await fetch(`${backendUrl}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        return NextResponse.json({
          success: true,
          user: data.user,
          token: data.token,
          message: data.message || 'Login successful'
        }, { status: 200 })
      } else {
        return NextResponse.json({
          success: false,
          message: data.message || 'Invalid credentials'
        }, { status: response.status })
      }
    } catch (backendError) {
      console.error('Django backend error:', backendError)
      return NextResponse.json({
        success: false,
        message: 'Unable to connect to authentication service'
      }, { status: 503 })
    }
    
  } catch (error) {
    console.error('Backend login proxy error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

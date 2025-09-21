import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Direct test of backend connectivity
    const response = await fetch('http://128.140.123.48:8000/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()
    
    return NextResponse.json({
      backend_reachable: response.ok,
      backend_response: data,
      status_code: response.status,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      backend_reachable: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}

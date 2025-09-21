import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🧪 [App Router] Testing Django connection...')
    
    const response = await fetch('http://128.140.123.48:8000/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000)
    })

    const result = await response.json()
    
    return NextResponse.json({
      django_status: response.status,
      django_response: result,
      success: response.ok,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      success: false,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Django test endpoint - use POST with email/password',
    backend_url: 'http://128.140.123.48:8000/api/auth/login/',
    timestamp: new Date().toISOString()
  })
}

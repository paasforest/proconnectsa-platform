import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://128.140.123.48:8000'

export async function GET(request: NextRequest) {
  console.log('🔍 Debug proxy called')
  
  try {
    console.log('🌐 Testing connection to:', BACKEND_URL)
    
    // Simple test to backend
    const response = await fetch(`${BACKEND_URL}/api/auth/profile/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    console.log('📡 Backend response status:', response.status)
    const data = await response.text()
    console.log('📄 Backend response:', data)
    
    return NextResponse.json({
      status: 'success',
      backendUrl: BACKEND_URL,
      backendStatus: response.status,
      backendResponse: data,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('🚨 Debug proxy error:', error)
    
    return NextResponse.json({
      status: 'error',
      error: error.message,
      backendUrl: BACKEND_URL,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('🔍 Debug proxy POST called')
  
  try {
    const body = await request.json()
    console.log('📤 Request body:', body)
    
    // Test login endpoint specifically
    const response = await fetch(`${BACKEND_URL}/api/auth/backend-login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    
    console.log('📡 Backend response status:', response.status)
    const data = await response.text()
    console.log('📄 Backend response:', data)
    
    return NextResponse.json({
      status: 'success',
      backendUrl: BACKEND_URL,
      backendStatus: response.status,
      backendResponse: data,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('🚨 Debug proxy POST error:', error)
    
    return NextResponse.json({
      status: 'error',
      error: error.message,
      backendUrl: BACKEND_URL,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

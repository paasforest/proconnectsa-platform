import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://128.140.123.48:8000'
    console.log('🔍 Testing backend connection to:', API_URL)
    
    const response = await fetch(`${API_URL}/health/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      backend_url: API_URL,
      backend_response: data,
      response_status: response.status,
      can_reach_backend: response.ok
    })
  } catch (error) {
    console.error('❌ Backend connection test failed:', error)
    return NextResponse.json({
      success: false,
      backend_url: process.env.NEXT_PUBLIC_API_URL || 'http://128.140.123.48:8000',
      error: error instanceof Error ? error.message : 'Unknown error',
      can_reach_backend: false
    }, { status: 500 })
  }
}

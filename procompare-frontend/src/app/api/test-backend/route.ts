import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('http://128.140.123.48:8000/api/auth/backend-login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@proconnectsa.co.za',
        password: 'admin123'
      })
    })
    
    const data = await response.text()
    
    return NextResponse.json({
      status: response.status,
      data: data,
      reachable: true
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      reachable: false
    })
  }
}
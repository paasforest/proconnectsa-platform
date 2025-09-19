import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Token ')) {
      return NextResponse.json({
        error: 'Authentication required'
      }, { status: 401 })
    }

    const token = authHeader.replace('Token ', '')
    
    // Call the Django backend to get stats
    const response = await fetch('http://localhost:8000/api/auth/stats/', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('Django API returned:', data.credit_balance)
      const nextResponse = NextResponse.json(data, { status: 200 })
      // Add cache-busting headers
      nextResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      nextResponse.headers.set('Pragma', 'no-cache')
      nextResponse.headers.set('Expires', '0')
      return nextResponse
    } else {
      // Return mock stats if backend fails
      return NextResponse.json({
        total_leads: 0,
        active_leads: 0,
        completed_jobs: 0,
        average_rating: 0,
        response_rate: 0,
        credit_balance: 150
      }, { status: 200 })
    }
    
  } catch (error) {
    console.error('Stats API error:', error)
    
    // Return mock stats on error
    return NextResponse.json({
      total_leads: 0,
      active_leads: 0,
      completed_jobs: 0,
      average_rating: 0,
      response_rate: 0,
      credit_balance: 150
    }, { status: 200 })
  }
}



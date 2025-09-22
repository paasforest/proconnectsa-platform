import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test backend connectivity
    const backendUrl = 'http://128.140.123.48:8000/health/'
    
    console.log('🔍 [Health] Testing backend connectivity...')
    console.log(`🔍 [Health] Backend URL: ${backendUrl}`)
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    
    console.log(`📡 [Health] Backend response status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ [Health] Backend is healthy:', data)
      
      return NextResponse.json({
        status: 'healthy',
        backend: {
          url: backendUrl,
          status: response.status,
          data: data
        },
        timestamp: new Date().toISOString()
      })
    } else {
      console.log('❌ [Health] Backend returned error status:', response.status)
      
      return NextResponse.json({
        status: 'unhealthy',
        backend: {
          url: backendUrl,
          status: response.status,
          error: 'Backend returned error status'
        },
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }
    
  } catch (error: any) {
    console.log('💥 [Health] Backend connectivity error:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      backend: {
        url: 'http://128.140.123.48:8000/health/',
        error: error.message,
        type: error.name
      },
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}
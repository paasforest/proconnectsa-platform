import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://128.140.123.48:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  return handleRequest(request, params, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  return handleRequest(request, params, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  return handleRequest(request, params, 'PUT')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  return handleRequest(request, params, 'PATCH')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  return handleRequest(request, params, 'DELETE')
}

async function handleRequest(
  request: NextRequest,
  params: { slug: string[] },
  method: string
) {
  try {
    // Reconstruct the API path with trailing slash for Django compatibility
    const apiPath = '/' + params.slug.join('/') + '/'
    const backendUrl = `${BACKEND_URL}${apiPath}`
    
    console.log(`🔄 Proxying ${method} request to: ${backendUrl}`)
    
    // Forward headers (excluding host and other problematic headers)
    const headers: Record<string, string> = {}
    
    // Copy relevant headers
    const relevantHeaders = [
      'authorization',
      'content-type',
      'accept',
      'user-agent',
      'x-requested-with'
    ]
    
    relevantHeaders.forEach(headerName => {
      const value = request.headers.get(headerName)
      if (value) {
        headers[headerName] = value
      }
    })
    
    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers,
    }
    
    // Add body for non-GET requests
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        const body = await request.text()
        if (body) {
          requestOptions.body = body
        }
      } catch (error) {
        console.warn('Could not read request body:', error)
      }
    }
    
    // Add query parameters
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    const finalUrl = queryString ? `${backendUrl}?${queryString}` : backendUrl
    
    console.log(`📤 Forwarding request:`, {
      url: finalUrl,
      method,
      headers,
      hasBody: !!requestOptions.body
    })
    
    // Make the request to backend with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch(finalUrl, {
      ...requestOptions,
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    console.log(`📥 Backend response: ${response.status}`)
    
    // Get response body
    const responseText = await response.text()
    
    // Parse JSON if possible
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = responseText
    }
    
    console.log(`✅ Proxy response:`, responseData)
    
    // Return the response with appropriate headers
    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        // Add CORS headers
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
    
  } catch (error: any) {
    console.error('🚨 Proxy error:', error)
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 504 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Proxy error',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}

import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handleRequest(request, resolvedParams.path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handleRequest(request, resolvedParams.path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handleRequest(request, resolvedParams.path, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handleRequest(request, resolvedParams.path, 'DELETE')
}

async function handleRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join('/')
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'
    const url = `${backendUrl}/api/${path}`
    
    // Get request body for POST/PUT requests
    let body: string | undefined
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      body = await request.text()
    }

    // Extract authorization header from request
    const authHeader = request.headers.get('authorization')
    
    // Forward the request to the backend
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    // Add authorization if present
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
    })

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type')
    let data
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      return NextResponse.json(
        { error: `Server returned non-JSON: ${text}` },
        { status: response.status }
      )
    }
    
    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('Backend proxy error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to connect to backend service' },
      { status: 503 }
    )
  }
}

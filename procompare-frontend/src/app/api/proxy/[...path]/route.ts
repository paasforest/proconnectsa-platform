import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params.path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params.path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params.path, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params.path, 'DELETE')
}

async function handleProxy(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const backendUrl = `http://128.140.123.48:8000/${pathSegments.join('/')}`
    
    console.log(`🔄 Proxying ${method} request to: ${backendUrl}`)
    
    const body = ['POST', 'PUT'].includes(method) ? await request.text() : undefined
    
    const response = await fetch(backendUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Forward auth headers if needed
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
      body
    })
    
    const data = await response.text()
    console.log(`✅ Backend response ${response.status} for ${backendUrl}`)
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error(`❌ Proxy error for ${pathSegments.join('/')}:`, error)
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'

console.log('🧪 Simple test route loaded at:', new Date().toISOString())

export async function GET() {
  console.log('🧪 Test GET endpoint called')
  return NextResponse.json({
    message: 'API routes are working!',
    timestamp: new Date().toISOString(),
    route: 'GET /api/test'
  })
}

export async function POST(request: NextRequest) {
  console.log('🧪 Test POST endpoint called')
  const body = await request.json()
  return NextResponse.json({
    message: 'POST request received',
    received: body,
    timestamp: new Date().toISOString(),
    route: 'POST /api/test'
  })
}


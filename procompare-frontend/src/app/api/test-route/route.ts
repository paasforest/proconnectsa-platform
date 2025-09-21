import { NextRequest, NextResponse } from 'next/server'

console.log('🧪 TEST ROUTE LOADED:', new Date().toISOString())

export async function GET(request: NextRequest) {
  console.log('🧪 TEST ROUTE GET called')
  return NextResponse.json({
    message: 'Test route is working!',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  console.log('🧪 TEST ROUTE POST called')
  return NextResponse.json({
    message: 'Test route POST is working!',
    timestamp: new Date().toISOString()
  })
}

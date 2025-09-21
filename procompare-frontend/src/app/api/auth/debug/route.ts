import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // This will help us debug environment variables
  const envCheck = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET (length: ' + process.env.NEXTAUTH_SECRET.length + ')' : 'NOT SET',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
  }
  
  console.log('🔍 Environment Variables Check:', envCheck)
  
  return NextResponse.json({
    message: 'Environment check',
    environment: envCheck,
    timestamp: new Date().toISOString()
  })
}

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🏥 Health check requested')
  
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    nextjs: 'running',
    nodejs: process.version,
    environment: process.env.NODE_ENV,
    nextauth_url: process.env.NEXTAUTH_URL,
    nextauth_secret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET'
  })
}

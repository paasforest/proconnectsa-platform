import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🏥 [App Router] Health check requested')
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    router: 'App Router',
    nextjs: '15+',
    nodejs: process.version,
    environment: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set'
    },
    routes_check: {
      nextauth_route: 'Should be at /app/api/auth/[...nextauth]/route.ts',
      health_route: 'This endpoint is working ✅'
    }
  })
}

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API route is working!',
    timestamp: new Date().toISOString(),
    backend_url: process.env.NEXT_PUBLIC_API_URL || 'http://128.140.123.48:8000'
  });
}

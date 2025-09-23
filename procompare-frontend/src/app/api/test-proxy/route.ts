import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API proxy test working!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
}

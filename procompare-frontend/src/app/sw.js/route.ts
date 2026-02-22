import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Read the service worker file from public directory
    const swPath = join(process.cwd(), 'public', 'sw.js');
    const swContent = readFileSync(swPath, 'utf-8');

    // Return with correct headers for service worker
    return new NextResponse(swContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
        'Service-Worker-Allowed': '/',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error serving service worker:', error);
    return new NextResponse('Service worker not found', { status: 404 });
  }
}

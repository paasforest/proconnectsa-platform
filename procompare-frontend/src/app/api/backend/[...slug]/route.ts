import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://128.140.123.48:8000';

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  const url = `${BACKEND_URL}/api/${slug}`;
  const searchParams = request.nextUrl.searchParams.toString();
  const fullUrl = searchParams ? `${url}?${searchParams}` : url;

  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': request.headers.get('origin') || 'https://proconnectsa-platform.vercel.app',
      },
    });

    const data = await response.json();
    
    // Add CORS headers to the response
    const nextResponse = NextResponse.json(data, { status: response.status });
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return nextResponse;
  } catch (error) {
    console.error('Backend API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data from backend' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  const url = `${BACKEND_URL}/api/${slug}`;
  const body = await request.json();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': request.headers.get('origin') || 'https://proconnectsa-platform.vercel.app',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    // Add CORS headers to the response
    const nextResponse = NextResponse.json(data, { status: response.status });
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return nextResponse;
  } catch (error) {
    console.error('Backend API Error:', error);
    return NextResponse.json({ error: 'Failed to post data to backend' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  const url = `${BACKEND_URL}/api/${slug}`;
  const body = await request.json();

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Origin': request.headers.get('origin') || 'https://proconnectsa-platform.vercel.app',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    // Add CORS headers to the response
    const nextResponse = NextResponse.json(data, { status: response.status });
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return nextResponse;
  } catch (error) {
    console.error('Backend API Error:', error);
    return NextResponse.json({ error: 'Failed to update data in backend' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  const url = `${BACKEND_URL}/api/${slug}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Origin': request.headers.get('origin') || 'https://proconnectsa-platform.vercel.app',
      },
    });

    const data = await response.json();
    
    // Add CORS headers to the response
    const nextResponse = NextResponse.json(data, { status: response.status });
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return nextResponse;
  } catch (error) {
    console.error('Backend API Error:', error);
    return NextResponse.json({ error: 'Failed to delete data from backend' }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  // Handle preflight requests
  const nextResponse = new NextResponse(null, { status: 200 });
  nextResponse.headers.set('Access-Control-Allow-Origin', '*');
  nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return nextResponse;
}

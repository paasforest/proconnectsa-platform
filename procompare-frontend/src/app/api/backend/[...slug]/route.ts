import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://128.140.123.48:8000';

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  const url = `${BACKEND_URL}/api/${slug}`;
  const searchParams = request.nextUrl.searchParams.toString();
  const fullUrl = searchParams ? `${url}?${searchParams}` : url;

  try {
    console.log('API Proxy: Fetching from:', fullUrl);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': request.headers.get('origin') || 'https://proconnectsa-platform.vercel.app',
      },
    });

    console.log('API Proxy: Response status:', response.status);
    
    if (!response.ok) {
      console.error('API Proxy: Backend returned error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('API Proxy: Error response:', errorText);
    }

    const data = await response.json();
    console.log('API Proxy: Response data:', data);
    
    // Add CORS headers to the response
    const nextResponse = NextResponse.json(data, { status: response.status });
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return nextResponse;
  } catch (error) {
    console.error('API Proxy: Fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch data from backend', 
      details: error instanceof Error ? error.message : 'Unknown error',
      url: fullUrl
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  const url = `${BACKEND_URL}/api/${slug}`;
  const body = await request.json();

  try {
    console.log('API Proxy: POST to:', url);
    
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
    return NextResponse.json({ error: 'Failed to update data on backend' }, { status: 500 });
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
    return NextResponse.json({ error: 'Failed to delete data on backend' }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
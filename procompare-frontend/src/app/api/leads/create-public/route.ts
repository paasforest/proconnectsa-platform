import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 API Route: Received POST request to create-public');
    console.log('🔍 Request headers:', Object.fromEntries(request.headers.entries()));

    const leadData = await request.json();
    console.log('📥 Received lead data:', JSON.stringify(leadData, null, 2));

    // Check if Django backend is running
    console.log('🔍 Checking Django backend connectivity...');
    
    try {
      const healthCheck = await fetch('http://localhost:8000/health/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('🏥 Django health check status:', healthCheck.status);
      
      if (!healthCheck.ok) {
        console.error('❌ Django backend is not responding');
        return NextResponse.json(
          {
            error: 'Django backend is not running',
            status: 503,
            details: 'Please start Django backend on port 8000'
          },
          { status: 503 }
        );
      }
    } catch (healthError) {
      console.error('❌ Cannot connect to Django backend:', healthError);
      return NextResponse.json(
        {
          error: 'Cannot connect to Django backend',
          status: 503,
          details: healthError.message
        },
        { status: 503 }
      );
    }

    // Forward to local Django backend (your "Flask server")
    console.log('📤 Forwarding to Django backend...');
    const backendResponse = await fetch('http://localhost:8000/api/leads/create-public/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });

    console.log('🔗 Django response status:', backendResponse.status);
    console.log('🔗 Django response headers:', Object.fromEntries(backendResponse.headers.entries()));

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Django error response:', errorText);

      return NextResponse.json(
        {
          error: 'Failed to create lead in backend',
          status: backendResponse.status,
          details: errorText,
          leadData: leadData
        },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();
    console.log('✅ Django success response:', JSON.stringify(result, null, 2));

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('❌ API Route error:', error);
    console.error('❌ Error stack:', error.stack);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'GET method not allowed on this endpoint' },
    { status: 405 }
  );
}

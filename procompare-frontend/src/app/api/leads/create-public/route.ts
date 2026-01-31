import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {

    const leadData = await request.json();

    // Check if Django backend is running
    
        try {
        // Use production API URL for production, localhost for development
        const backendUrl = process.env.NODE_ENV === 'production' 
          ? 'https://api.proconnectsa.co.za' 
          : 'http://localhost:8000';
          
          const healthCheck = await fetch(`${backendUrl}/health/`, {
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

        // Forward to Django backend (environment-aware URL)
        console.log('📤 Forwarding to Django backend...');
        const backendUrl = process.env.NODE_ENV === 'production' 
          ? 'https://api.proconnectsa.co.za' 
          : 'http://localhost:8000';
    
    const backendResponse = await fetch(`${backendUrl}/api/leads/create-public/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Required by backend `PublicEndpointPermission` for lead creation
        'X-API-Key': 'proconnectsa_lead_creation_2024',
      },
      body: JSON.stringify(leadData),
    });


        if (!backendResponse.ok) {
          const errorText = await backendResponse.text();
          console.error('❌ Django error response:', errorText);

          return NextResponse.json(
            {
              error: 'Failed to create lead in Django backend',
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

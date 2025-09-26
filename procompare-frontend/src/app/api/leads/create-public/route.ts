import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 API Route: Received POST request to create-public');
    
    const leadData = await request.json();
    console.log('📥 Received lead data:', leadData);
    
    // Forward directly to your Django backend
    const backendResponse = await fetch('https://api.proconnectsa.co.za/api/leads/create-public/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });

    console.log('🔗 Django response status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Django error:', errorText);
      
      return NextResponse.json(
        { 
          error: 'Failed to create lead in backend',
          status: backendResponse.status,
          details: errorText 
        },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();
    console.log('✅ Django success:', result);
    
    return NextResponse.json(result, { status: 201 });
    
  } catch (error) {
    console.error('❌ API Route error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message 
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

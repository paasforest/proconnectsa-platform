import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za';
const REQUEST_TIMEOUT_MS = 15000;

export async function POST(request: NextRequest) {
  try {
    const leadData = await request.json();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const backendResponse = await fetch(`${BACKEND_URL}/api/leads/create-public/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'proconnectsa_lead_creation_2024',
        },
        body: JSON.stringify(leadData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await backendResponse.text();
      let parsed: unknown = null;
      try {
        parsed = responseText ? JSON.parse(responseText) : null;
      } catch {
        // Backend may return non-JSON for some errors
      }

      if (!backendResponse.ok) {
        // Pass through backend validation/error structure for frontend to display
        const errorBody = parsed && typeof parsed === 'object'
          ? parsed
          : { error: 'Failed to create lead', details: responseText || `HTTP ${backendResponse.status}` };

        return NextResponse.json(errorBody, { status: backendResponse.status });
      }

      const result = parsed ?? {};
      return NextResponse.json(result, { status: 201 });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      const err = fetchError as Error & { name?: string };
      if (err?.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout', message: 'The server took too long to respond. Please try again.' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    const err = error as Error;
    console.error('Lead creation proxy error:', err?.message);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production'
          ? 'Unable to process your request. Please try again later.'
          : err?.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'GET method not allowed on this endpoint' }, { status: 405 });
}

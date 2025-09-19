import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Call the backend API to send password reset email
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/password-reset/request/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, method: 'email' }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { message: errorData.message || 'Failed to send reset email' },
        { status: response.status }
      )
    }

    // Always return success for security (don't reveal if email exists)
    return NextResponse.json(
      { message: 'If an account with that email exists, we\'ve sent you a password reset link.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

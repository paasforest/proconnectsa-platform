import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { userStore } from '@/lib/user-store'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = loginSchema.parse(body)
    
    // For now, we'll just return a success response
    // In a real app, you would:
    // 1. Check if user exists
    // 2. Verify password hash
    // 3. Generate JWT token
    // 4. Set session cookie
    
    console.log('Login attempt:', {
      email: validatedData.email
    })
    
    // Call the Django backend to authenticate
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://128.140.123.48:8000'
    const response = await fetch(`${API_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: validatedData.email,
        password: validatedData.password,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        success: true,
        message: 'Login successful!',
        user: data.user,
        token: data.token
      }, { status: 200 })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 })
    }
    
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: error.issues?.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        })) || []
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Login failed. Please try again.'
    }, { status: 500 })
  }
}



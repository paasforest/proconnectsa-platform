import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { userStore } from '@/lib/user-store'

const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  city: z.string().min(1, 'City is required'),
  suburb: z.string().min(1, 'Suburb is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  user_type: z.enum(['client', 'provider'])
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    
    // Validate the request body
    const validatedData = registerSchema.parse(body)
    
    // Check if user already exists
    const existingUser = userStore.findByEmail(validatedData.email)
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'An account with this email already exists'
      }, { status: 409 })
    }
    
    // Create the user
    const newUser = await userStore.createUser({
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      name: `${validatedData.first_name} ${validatedData.last_name}`,
      email: validatedData.email,
      phone: validatedData.phone,
      city: validatedData.city,
      suburb: validatedData.suburb,
      password: validatedData.password, // In real app, hash this
      user_type: validatedData.user_type,
      role: validatedData.user_type || 'client', // Set role based on user_type
      emailVerified: false // New users start with unverified email
    })
    
    console.log('Registration successful:', {
      email: newUser.email,
      user_type: newUser.user_type,
      name: `${newUser.first_name} ${newUser.last_name}`
    })
    
    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: newUser.id,
        email: newUser.email,
        user_type: newUser.user_type,
        name: `${newUser.first_name} ${newUser.last_name}`
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Registration error:', error)
    
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
      message: 'Registration failed. Please try again.'
    }, { status: 500 })
  }
}

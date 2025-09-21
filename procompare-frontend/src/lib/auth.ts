import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import CredentialsProvider from "next-auth/providers/credentials"

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
const JWT_EXPIRES_IN = '7d'

export interface User {
  id: string
  email: string
  name: string
  role?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthToken {
  userId: string
  email: string
  role?: string
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(payload: AuthToken): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Verify JWT token
export function verifyToken(token: string): AuthToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthToken
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// Extract token from request headers
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Also check cookies
  const tokenCookie = request.cookies.get('auth-token')
  return tokenCookie?.value || null
}

// Get current user from request
export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  const token = getTokenFromRequest(request)
  if (!token) return null
  
  const decoded = verifyToken(token)
  if (!decoded) return null
  
  // In a real app, you'd fetch from database
  // For now, return mock user based on token
  return {
    id: decoded.userId,
    email: decoded.email,
    name: decoded.email.split('@')[0],
    role: decoded.role || 'user',
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

// Middleware to protect routes
export async function requireAuth(request: NextRequest): Promise<{ user: User } | { error: string, status: number }> {
  const user = await getCurrentUser(request)
  
  if (!user) {
    return { error: 'Unauthorized', status: 401 }
  }
  
  return { user }
}

// Role-based access control
export async function requireRole(request: NextRequest, requiredRole: string): Promise<{ user: User } | { error: string, status: number }> {
  const authResult = await requireAuth(request)
  
  if ('error' in authResult) {
    return authResult
  }
  
  const { user } = authResult
  if (user.role !== requiredRole) {
    return { error: 'Forbidden', status: 403 }
  }
  
  return { user }
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' }
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' }
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' }
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' }
  }
  
  return { valid: true }
}

// Generate reset token
export function generateResetToken(): string {
  return jwt.sign(
    { type: 'password-reset', timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: '1h' }
  )
}

// Verify reset token
export function verifyResetToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.type === 'password-reset'
  } catch (error) {
    return false
  }
}

// NextAuth configuration for API routes
export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Use internal Vercel API route as proxy to backend
          const baseUrl = process.env.NEXTAUTH_URL || 'https://proconnectsa.co.za'
          const apiUrl = `${baseUrl}/api/auth/backend-login`
          
          console.log('🔑 NextAuth: Using Vercel API proxy:', apiUrl)
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            // Add timeout for reliability
            signal: AbortSignal.timeout(15000)
          })

          console.log('📡 NextAuth: Vercel API response status:', response.status)

          if (response.ok) {
            const data = await response.json()
            console.log('📦 NextAuth: Vercel API response data:', data)
            
            if (data.success && data.user) {
              const user = {
                id: String(data.user.id),
                email: data.user.email,
                name: `${data.user.first_name || 'User'} ${data.user.last_name || 'Name'}`,
                userType: data.user.user_type,
                token: data.token
              }
              console.log('✅ NextAuth: User object created:', user)
              return user
            }
          } else {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
            console.log('❌ NextAuth: Vercel API error:', errorData)
          }
          
          return null
        } catch (error) {
          console.error('💥 NextAuth authorization failed:', error)
          console.error('💥 Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error)
          })
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        console.log('🎫 NextAuth JWT: Adding user to token:', user)
        token.userType = user.userType
        token.backendToken = user.token
      }
      return token
    },
    async session({ session, token }: any) {
      console.log('🎭 NextAuth Session: Creating session for token:', token)
      session.user.userType = token.userType
      session.user.backendToken = token.backendToken
      return session
    },
    async redirect({ url, baseUrl }: any) {
      console.log('🔀 NextAuth Redirect: url =', url, 'baseUrl =', baseUrl)
      // Redirect to dashboard after successful login
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
  },
  pages: {
    signIn: '/login',
    error: '/api/auth/error',
  },
}
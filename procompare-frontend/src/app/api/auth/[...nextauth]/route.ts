import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

console.log('🔥 [NextAuth] Route loaded at:', new Date().toISOString())

const authOptions: NextAuthOptions = {
  debug: true, // Enable debug mode
  
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        console.log('🔍 [NextAuth] authorize() called')
        console.log(`📧 [NextAuth] Email: ${credentials?.email}`)
        
        // Validate credentials exist
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ [NextAuth] Missing email or password')
          return null
        }

        try {
          console.log('🔄 [NextAuth] Attempting Hetzner backend login...')
          console.log('🔄 [NextAuth] Backend URL: http://128.140.123.48:8000/api/auth/login/')
          
          // Call your Hetzner backend (not localhost!)
          const response = await fetch('http://128.140.123.48:8000/api/auth/login/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(10000) // 10 second timeout
          })

          console.log(`📡 [NextAuth] Backend response status: ${response.status}`)
          console.log(`📡 [NextAuth] Backend response headers:`, Object.fromEntries(response.headers.entries()))

          if (!response.ok) {
            const errorText = await response.text()
            console.log(`❌ [NextAuth] Backend error response: ${errorText}`)
            return null
          }

          const userData = await response.json()
          console.log('✅ [NextAuth] Backend login successful!')
          console.log(`👤 [NextAuth] User data:`, userData)

          // Handle Flask API response format
          if (userData && userData.success && userData.user) {
            const user = {
              id: userData.user.id?.toString() || Date.now().toString(),
              email: userData.user.email,
              name: `${userData.user.first_name} ${userData.user.last_name}`.trim() || userData.user.email,
              roles: [userData.user.user_type || 'user'],
              accessToken: userData.token
            }
            
            console.log(`✅ [NextAuth] Returning user:`, user)
            return user
          }

          console.log('❌ [NextAuth] Invalid user data from backend')
          return null

        } catch (error: any) {
          console.log(`💥 [NextAuth] Error during authorization:`, error)
          
          if (error.name === 'AbortError') {
            console.log('⏰ [NextAuth] Backend request timed out')
          } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.log('🚫 [NextAuth] Cannot connect to Hetzner backend')
            console.log('🔍 [NextAuth] Check if backend is running on http://128.140.123.48:8000')
          }
          
          return null
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      console.log('🔍 [NextAuth] JWT callback triggered')
      
      // First time JWT callback runs, user object is available
      if (user) {
        console.log('📝 [NextAuth] Adding user data to JWT token')
        token.accessToken = (user as any).accessToken
        token.roles = (user as any).roles
      }
      
      return token
    },

    async session({ session, token }) {
      console.log('🔍 [NextAuth] Session callback triggered')
      
      // Send properties to the client
      if (token) {
        (session as any).accessToken = token.accessToken;
        (session.user as any).roles = token.roles
      }
      
      console.log('📤 [NextAuth] Final session:', session)
      return session
    }
  },

  pages: {
    signIn: '/login', // Your login page
    error: '/login',   // Redirect errors to login
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Add events for debugging
  events: {
    async signIn(message) {
      console.log('🎉 [NextAuth] SignIn event triggered:', message.user.email)
    },
    async signOut(message) {
      console.log('👋 [NextAuth] SignOut event triggered')
    },
    async session(message) {
      console.log('📱 [NextAuth] Session event triggered')
    }
  }
}

// Create the NextAuth handler
const handler = NextAuth(authOptions)

// Export the handler for both GET and POST requests (App Router format)
export { handler as GET, handler as POST }
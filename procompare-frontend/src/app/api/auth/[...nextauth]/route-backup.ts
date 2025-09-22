import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Environment Variables Debug Logging
console.log('🔍 NextAuth Route Loaded at:', new Date().toISOString())
console.log('🔍 Environment Variables on Auth Route:')
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET')
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
console.log('🔍 Route file is being executed!')

// Define the auth configuration
const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      
      async authorize(credentials, req) {
        console.log('🔥 AUTHORIZE FUNCTION CALLED! This means NextAuth is working!')
        console.log('🔥 Timestamp:', new Date().toISOString())
        console.log('🔐 NextAuth authorize called for:', credentials?.email)
        console.log('🔐 Full credentials object:', { ...credentials, password: '***' })
        console.log('🔐 Request headers:', req?.headers || 'No headers')
        console.log('🔐 Environment check:', {
          NEXTAUTH_URL: process.env.NEXTAUTH_URL,
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
          NODE_ENV: process.env.NODE_ENV
        })
        
        // Validate input
        if (!credentials?.email || !credentials?.password) {
          console.error("❌ Missing credentials - email:", !!credentials?.email, "password:", !!credentials?.password)
          return null
        }

        // TEMPORARY: Return a test user to see if NextAuth works
        console.log('🧪 TEMPORARY TEST: Returning mock user without backend call')
        return {
          id: '123',
          email: credentials.email,
          name: 'Test User',
          role: 'user'
        }

        try {
          // Use Vercel proxy route to bypass mixed content issues
          const loginUrl = '/api/auth/backend-login/'
          
          console.log(`🌐 Step 1: Preparing to call backend at: ${loginUrl}`)
          console.log(`📤 Step 2: Sending data:`, { email: credentials.email, password: '***' })
          console.log(`🕒 Step 3: Starting fetch request at:`, new Date().toISOString())
          
          const response = await fetch(loginUrl, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })
          
          console.log(`🕒 Step 4: Fetch completed at:`, new Date().toISOString())
          console.log(`📡 Step 5: Backend response status: ${response.status}`)
          console.log(`📡 Step 6: Backend response headers:`, Object.fromEntries(response.headers.entries()))
          console.log(`📡 Step 7: Response OK?`, response.ok)
          
          if (!response.ok) {
            console.error(`❌ Step 8: Backend returned non-OK status ${response.status}`)
            
            const errorText = await response.text()
            console.error('❌ Step 9: Backend error response:', errorText)
            console.error('❌ Step 10: Returning null due to error response')
            
            return null
          }
          
          console.log(`✅ Step 8: Response OK, reading response body...`)
          
          // Get response text first
          const responseText = await response.text()
          console.log('📄 Step 9: Raw backend response length:', responseText.length)
          console.log('📄 Step 10: Raw backend response:', responseText)
          
          // Parse JSON
          let userData
          try {
            console.log('🔄 Step 11: Attempting to parse JSON...')
            userData = JSON.parse(responseText)
            console.log('✅ Step 12: Successfully parsed user data:', userData)
          } catch (parseError) {
            console.error('❌ Step 12: JSON parse error:', parseError)
            console.error('❌ Response text that failed to parse:', responseText)
            console.error('❌ Returning null due to parse error')
            return null
          }
          
          // Handle proxy response format (which forwards Flask API response)
          console.log('🔄 Step 13: Checking response format...')
          console.log('🔍 userData exists?', !!userData)
          console.log('🔍 userData.success?', userData?.success)
          
          if (!userData || !userData.success) {
            console.error('❌ Step 14: Login failed - API returned unsuccessful response')
            console.error('❌ Full response data:', userData)
            console.error('❌ Returning null due to unsuccessful response')
            return null
          }
          
          console.log('✅ Step 14: Response indicates success, extracting user data...')
          
          const user = userData.user
          console.log('🔍 Step 15: Extracted user object:', user)
          console.log('🔍 User has id?', !!user?.id)
          console.log('🔍 User has email?', !!user?.email)
          
          if (!user || !user.id || !user.email) {
            console.error('❌ Step 16: Invalid user data - missing required fields')
            console.error('❌ User object:', user)
            console.error('❌ Returning null due to missing user data')
            return null
          }
          
          console.log('✅ Step 16: User data valid, creating NextAuth user object...')
          
          // Create user object for NextAuth
          const userObject = {
            id: String(user.id),
            email: user.email,
            name: `${user.first_name} ${user.last_name}`.trim() || user.email,
            role: user.user_type || 'user',
          }
          
          console.log('🎯 Step 17: Final user object for NextAuth:', userObject)
          console.log('✅ Step 18: Returning user object to NextAuth - LOGIN SUCCESS!')
          return userObject
          
        } catch (error) {
          console.error('🚨 CRITICAL ERROR in authorize function at step:', new Date().toISOString())
          console.error('🚨 Error type:', error?.constructor?.name)
          console.error('🚨 Error message:', error?.message)
          console.error('🚨 Error stack:', error?.stack)
          console.error('🚨 Full error object:', error)
          console.error('🚨 Returning null due to exception - LOGIN FAILED!')
          
          // Return null on any error
          return null
        }
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      console.log('🔑 JWT CALLBACK START - Timestamp:', new Date().toISOString())
      console.log('🔑 JWT - Received user object:', user)
      console.log('🔑 JWT - Existing token before update:', token)
      console.log('🔑 JWT - User exists?', !!user)
      
      if (user) {
        console.log('🔑 JWT - Updating token with user data...')
        token.id = user.id
        token.role = user.role
        token.email = user.email
        token.name = user.name
        console.log('🔑 JWT - Token updated with user data')
      } else {
        console.log('🔑 JWT - No user object, keeping existing token')
      }
      
      console.log('🔑 JWT - Final token:', token)
      console.log('🔑 JWT CALLBACK END - Success!')
      return token
    },
    
    async session({ session, token }) {
      console.log('👤 SESSION CALLBACK START - Timestamp:', new Date().toISOString())
      console.log('👤 Session - Received token:', token)
      console.log('👤 Session - Existing session before update:', session)
      console.log('👤 Session - Token exists?', !!token)
      
      if (token) {
        console.log('👤 Session - Updating session with token data...')
        session.user.id = token.id as string
        session.user.role = token.role as string
        console.log('👤 Session - Session updated with token data')
      } else {
        console.log('👤 Session - No token, keeping existing session')
      }
      
      console.log('👤 Session - Final session:', session)
      console.log('👤 SESSION CALLBACK END - Success!')
      return session
    }
  },
  
  session: {
    strategy: "jwt" as const,
  },
  
  pages: {
    signIn: '/login',
  },
  
  // Enable debug mode
  debug: true,
  
  // Custom logger
  logger: {
    error(code, metadata) {
      console.error('🚨 NextAuth Error Code:', code)
      console.error('🚨 NextAuth Error Metadata:', metadata)
    },
    warn(code) {
      console.warn('⚠️ NextAuth Warning:', code)
    },
    debug(code, metadata) {
      console.log('🐛 NextAuth Debug:', code, metadata)
    }
  }
}

// Create the handler
const handler = NextAuth(authOptions)

// Export for App Router
export { handler as GET, handler as POST }
















import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Environment Variables Debug Logging
console.log('🔍 Environment Variables on Auth Route:')
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET')
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)

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
        console.log('🔐 NextAuth authorize called for:', credentials?.email)
        
        // Validate input
        if (!credentials?.email || !credentials?.password) {
          console.error("❌ Missing credentials")
          return null
        }

        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://128.140.123.48:8000'
          const loginUrl = `${API_URL}/api/auth/backend-login/`
          
          console.log(`🌐 Calling backend: ${loginUrl}`)
          console.log(`📤 Sending data:`, { email: credentials.email, password: '***' })
          
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
          
          console.log(`📡 Backend response status: ${response.status}`)
          console.log(`📡 Backend response headers:`, Object.fromEntries(response.headers.entries()))
          
          if (!response.ok) {
            console.error(`❌ Backend returned ${response.status}`)
            
            const errorText = await response.text()
            console.error('❌ Backend error response:', errorText)
            
            return null
          }
          
          // Get response text first
          const responseText = await response.text()
          console.log('📄 Raw backend response:', responseText)
          
          // Parse JSON
          let userData
          try {
            userData = JSON.parse(responseText)
            console.log('✅ Parsed user data:', userData)
          } catch (parseError) {
            console.error('❌ JSON parse error:', parseError)
            console.error('❌ Response text was:', responseText)
            return null
          }
          
          // Validate required fields
          if (!userData || !userData.id || !userData.email) {
            console.error('❌ Invalid user data - missing id or email:', userData)
            return null
          }
          
          // Create user object for NextAuth
          const userObject = {
            id: String(userData.id),
            email: userData.email,
            name: userData.name || userData.email,
            role: userData.role || 'user',
          }
          
          console.log('🎯 Returning user object to NextAuth:', userObject)
          return userObject
          
        } catch (error) {
          console.error('🚨 Exception in authorize function:', error)
          console.error('🚨 Error stack:', error.stack)
          
          // Return null on any error
          return null
        }
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      console.log('🔑 JWT callback triggered')
      console.log('🔑 JWT - user:', user)
      console.log('🔑 JWT - token before:', token)
      
      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email
        token.name = user.name
      }
      
      console.log('🔑 JWT - token after:', token)
      return token
    },
    
    async session({ session, token }) {
      console.log('👤 Session callback triggered')
      console.log('👤 Session - token:', token)
      console.log('👤 Session - session before:', session)
      
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      
      console.log('👤 Session - session after:', session)
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















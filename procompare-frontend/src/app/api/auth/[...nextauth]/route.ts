import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

console.log('🔥 [App Router] NextAuth route.ts loaded at:', new Date().toISOString())

const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        console.log('🔍 [App Router] NextAuth authorize() called')
        console.log(`📤 [App Router] Credentials: email=${credentials?.email}`)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ [App Router] Missing credentials')
          return null
        }

        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 15000)

          console.log('📡 [App Router] Calling Hetzner backend...')
          console.log(`📡 [App Router] Backend URL: http://128.140.123.48:8000/api/auth/login/`)

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
            signal: controller.signal
          })

          clearTimeout(timeoutId)

          console.log(`📡 [App Router] Backend status: ${response.status}`)
          console.log(`📡 [App Router] Backend headers: ${JSON.stringify([...response.headers.entries()])}`)
          
          if (!response.ok) {
            const errorText = await response.text()
            console.log(`❌ [App Router] Backend error: ${errorText}`)
            return null
          }

          const userData = await response.json()
          console.log('✅ [App Router] Backend success')
          console.log(`👤 [App Router] User data: ${JSON.stringify(userData, null, 2)}`)

          if (userData && userData.success && userData.user) {
            const authUser = {
              id: String(userData.user.id || Date.now()),
              email: userData.user.email,
              name: `${userData.user.first_name} ${userData.user.last_name}`.trim() || userData.user.email,
              accessToken: userData.token,
              roles: [userData.user.user_type || 'user']
            }
            console.log(`✅ [App Router] Returning user: ${JSON.stringify(authUser, null, 2)}`)
            return authUser
          }

          console.log('❌ [App Router] Invalid user data from backend')
          return null

        } catch (error: any) {
          console.log(`💥 [App Router] Error: ${error.message}`)
          console.log(`💥 [App Router] Error type: ${error.name}`)
          
          if (error.name === 'AbortError') {
            console.log('⏰ [App Router] Backend timeout')
          }
          
          return null
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      console.log('🔍 [App Router] JWT callback')
      
      if (user) {
        token.accessToken = (user as any).accessToken
        token.roles = (user as any).roles
        console.log('✅ [App Router] JWT updated')
      }
      
      return token
    },

    async session({ session, token }) {
      console.log('🔍 [App Router] Session callback')
      
      if (token) {
        (session as any).accessToken = token.accessToken;
        (session.user as any).roles = token.roles
        console.log('✅ [App Router] Session updated')
      }
      
      return session
    }
  },

  pages: {
    signIn: '/login',
    error: '/login'
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  events: {
    async signIn(message) {
      console.log('🎉 [App Router] SignIn event:', message.user.email)
    },
    async signOut(message) {
      console.log('👋 [App Router] SignOut event')
    },
  },
}

const handler = NextAuth(authOptions)

// App Router requires named exports
export { handler as GET, handler as POST }
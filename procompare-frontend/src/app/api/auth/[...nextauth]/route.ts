import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

console.log('🔥 NEXTAUTH ROUTE LOADED:', new Date().toISOString())

const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔥 AUTHORIZE CALLED for:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        try {
          // Call your Hetzner backend directly (this should work from server-side)
          const response = await fetch('http://128.140.123.48:8000/api/auth/login/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          console.log('🌐 Backend response status:', response.status)

          if (response.ok) {
            const userData = await response.json()
            console.log('✅ Backend success:', userData)
            
            if (userData.success && userData.user) {
              return {
                id: String(userData.user.id),
                email: userData.user.email,
                name: `${userData.user.first_name} ${userData.user.last_name}`.trim() || userData.user.email,
                role: userData.user.user_type || 'user',
                accessToken: userData.token,
              }
            }
          }
          
          console.log('❌ Backend authentication failed')
          return null
        } catch (error) {
          console.error('🚨 Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.accessToken = user.accessToken
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.accessToken = token.accessToken
      }
      return session
    }
  },
  session: {
    strategy: 'jwt' as const
  },
  pages: {
    signIn: '/login'
  },
  debug: process.env.NODE_ENV === 'development'
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
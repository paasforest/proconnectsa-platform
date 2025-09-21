import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const authOptions = {
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
          console.log('❌ NextAuth: Missing credentials')
          return null
        }

        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://128.140.123.48:8000'
          console.log('🔑 NextAuth: Attempting login to:', API_URL)
          
          const response = await fetch(`${API_URL}/api/auth/login/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          console.log('📡 NextAuth: Response status:', response.status)
          
          if (response.ok) {
            const data = await response.json()
            console.log('📦 NextAuth: Response data:', data)
            
            if (data.success && data.user) {
              const user = {
                id: String(data.user.id),
                email: data.user.email,
                name: `${data.user.first_name || 'User'} ${data.user.last_name || 'Name'}`,
                userType: data.user.user_type,
                token: data.token
              }
              console.log('✅ NextAuth: User created:', user)
              return user
            }
          } else {
            const errorData = await response.json()
            console.log('❌ NextAuth: Login failed:', errorData)
          }
          return null
        } catch (error) {
          console.error('💥 NextAuth authorize error:', error)
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

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }















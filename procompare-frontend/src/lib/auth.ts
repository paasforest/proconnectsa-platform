import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('NextAuth: Missing credentials')
          return null
        }

        try {
          // Call Django backend to authenticate
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://128.140.123.48:8000'
          console.log('NextAuth: Attempting login for:', credentials.email)
          
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

          console.log('NextAuth: Django response status:', response.status)

          if (response.ok) {
            const data = await response.json()
            console.log('NextAuth: Django response data:', data)
            
            if (data.success && data.user) {
              const user = {
                id: data.user.id.toString(),
                email: data.user.email,
                name: `${data.user.first_name} ${data.user.last_name}`,
                userType: data.user.user_type,
                subscriptionTier: data.user.subscription_tier || 'basic',
                accessToken: data.token,
              }
              console.log('NextAuth: Returning user:', user)
              return user
            }
          } else {
            const errorData = await response.text()
            console.log('NextAuth: Django error response:', errorData)
          }
        } catch (error) {
          console.error('NextAuth authorize error:', error)
        }

        console.log('NextAuth: Authentication failed')
        return null
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect:', { url, baseUrl })
      // Always redirect to home page after login
      return baseUrl
    },
    async jwt({ token, user }) {
      console.log('NextAuth JWT callback:', { token: !!token, user: !!user })
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (user) {
        token.accessToken = user.accessToken
        token.userType = user.userType
        token.subscriptionTier = user.subscriptionTier
      }
      return token
    },
    async session({ session, token }) {
      console.log('NextAuth session callback:', { session: !!session, token: !!token })
      // Send properties to the client
      session.accessToken = token.accessToken
      session.user.userType = token.userType
      session.user.subscriptionTier = token.subscriptionTier
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}




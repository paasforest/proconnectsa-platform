import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
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
          // Call Django backend to authenticate
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://128.140.123.48:8000'
          
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
          
          const response = await fetch(`${API_URL}/api/auth/login/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            signal: controller.signal,
          })
          
          clearTimeout(timeoutId)

          // Get response text first to avoid consuming the stream twice
          const responseText = await response.text()

          if (response.ok) {
            try {
              const data = JSON.parse(responseText)
              
              if (data.success && data.user) {
                const user = {
                  id: data.user.id.toString(),
                  email: data.user.email,
                  name: `${data.user.first_name} ${data.user.last_name}`,
                  userType: data.user.user_type,
                  subscriptionTier: data.user.subscription_tier || 'basic',
                  accessToken: data.token,
                }
                return user
              }
            } catch (jsonError) {
              console.error('NextAuth: JSON parse error:', jsonError)
            }
          }
        } catch (error) {
          console.error('NextAuth authorize error:', error)
        }

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
      // Always redirect to home page after login
      return baseUrl
    },
    async jwt({ token, user }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (user) {
        token.accessToken = user.accessToken
        token.userType = user.userType
        token.subscriptionTier = user.subscriptionTier
      }
      return token
    },
    async session({ session, token }) {
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
})

export { handler as GET, handler as POST }

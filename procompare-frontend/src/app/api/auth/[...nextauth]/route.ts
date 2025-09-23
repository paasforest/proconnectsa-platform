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
          // Use our secure proxy route instead of calling backend directly
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/backend-login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          const data = await response.json()
          
          if (data.success && data.user) {
            return {
              id: data.user.id.toString(),
              email: data.user.email,
              name: `${data.user.first_name} ${data.user.last_name}`,
              userType: data.user.user_type,
              subscriptionTier: data.user.subscription_tier || 'basic',
              accessToken: data.token,
            }
          }
        } catch (error) {
          // Silent error handling for security
          console.error('Login error:', error)
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

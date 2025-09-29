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
            const user = {
              id: data.user.id.toString(),
              email: data.user.email,
              name: data.user.name || `${data.user.first_name} ${data.user.last_name}`,
              userType: data.user.user_type,
              subscriptionTier: data.user.subscription_tier || 'basic',
              accessToken: data.token,
            }
            return user
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
    async redirect({ url, baseUrl, token }) {
      // Since we're using direct API client authentication, 
      // let the client-side handle redirects
      
      // If URL is provided and it's a relative URL, use it
      if (url && url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // If URL is provided and it's from the same origin, use it
      if (url && url.startsWith(baseUrl)) {
        return url
      }
      
      // Default redirect to dashboard (let client-side handle user type routing)
      return `${baseUrl}/dashboard`
    },
    async jwt({ token, user }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (user) {
        token.accessToken = user.accessToken || ''
        token.userType = user.userType || 'client'
        token.subscriptionTier = user.subscriptionTier || 'basic'
      }
      
      // Ensure token has default values to prevent hydration mismatches
      token.accessToken = token.accessToken || ''
      token.userType = token.userType || 'client'
      token.subscriptionTier = token.subscriptionTier || 'basic'
      
      return token
    },
    async session({ session, token }) {
      // Send properties to the client with safe defaults to prevent hydration mismatches
      session.accessToken = token.accessToken || ''
      session.user.userType = token.userType || 'client'
      session.user.subscriptionTier = token.subscriptionTier || 'basic'
      
      // Ensure user object has all required properties
      if (!session.user.name) {
        session.user.name = session.user.email?.split('@')[0] || 'User'
      }
      
      
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }

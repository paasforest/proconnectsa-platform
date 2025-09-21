import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

console.log('🔥 MINIMAL NEXTAUTH ROUTE LOADED:', new Date().toISOString())

const authOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret',
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        console.log('🔥 MINIMAL AUTHORIZE CALLED!')
        console.log('🔥 Email:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        // Test with your specific credentials
        if (credentials.email === 'tshepochabalala220@gmail.com' || 
            credentials.email === 'admin@proconnectsa.co.za') {
          console.log('✅ Valid test user - returning success')
          return {
            id: '1',
            email: credentials.email,
            name: 'Test User',
            role: 'user'
          }
        }

        console.log('❌ Invalid credentials')
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    }
  },
  session: {
    strategy: "jwt" as const
  },
  pages: {
    signIn: '/login'
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
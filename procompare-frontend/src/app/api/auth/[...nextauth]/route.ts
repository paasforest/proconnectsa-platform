import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const authOptions = {
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
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://128.140.123.48:8000'
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

          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              return {
                id: data.user.id,
                email: data.user.email,
                name: `${data.user.first_name} ${data.user.last_name}`,
                userType: data.user.user_type,
                token: data.token
              }
            }
          }
          return null
        } catch (error) {
          console.error('NextAuth authorize error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.userType = user.userType
        token.backendToken = user.token
      }
      return token
    },
    async session({ session, token }: any) {
      session.user.userType = token.userType
      session.user.backendToken = token.backendToken
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/api/auth/error',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }















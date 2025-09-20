import NextAuth from "next-auth"

// Mock auth options since we don't have NextAuth fully configured
const authOptions = {
  providers: [],
  callbacks: {
    session: async ({ session }: any) => session,
    jwt: async ({ token }: any) => token,
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }















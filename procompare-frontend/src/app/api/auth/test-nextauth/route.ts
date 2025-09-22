import { NextRequest, NextResponse } from 'next/server'
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

console.log('🧪 SIMPLE NEXTAUTH TEST LOADED:', new Date().toISOString())

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🧪 SIMPLE NEXTAUTH AUTHORIZE CALLED!')
        console.log('🧪 Email:', credentials?.email)
        
        // Always return a test user
        return {
          id: '1',
          email: credentials?.email || 'test@example.com',
          name: 'Test User'
        }
      }
    })
  ]
})

export { handler as GET, handler as POST }


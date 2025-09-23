import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Redirect to login if no token
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Allow access to public routes
        const publicRoutes = [
          "/",
          "/login",
          "/register",
          "/how-it-works",
          "/services",
          "/providers",
          "/about",
          "/contact",
          "/privacy",
          "/terms",
          "/request-quote",
          "/business-services",
          "/register-provider",
        ]

        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true
        }

        // Require authentication for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/client/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/leads/:path*",
  ],
}















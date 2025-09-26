import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to public routes
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/how-it-works",
    "/services",
    "/providers",
    "/contact",
    "/request-quote",
    "/business-services",
    "/register-provider",
  ]

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes, let the client-side handle authentication
  // This allows our API client to manage authentication instead of NextAuth
  return NextResponse.next()
}

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















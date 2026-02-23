import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // NEVER interfere with Next.js internals or static files
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname === '/firebase-messaging-sw.js' || // Firebase messaging service worker
    pathname === '/sw.js' || // Main service worker
    pathname === '/manifest.json' || // PWA manifest
    pathname.includes('.') // Static files have extensions
  ) {
    return NextResponse.next()
  }

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
    '/((?!firebase-messaging-sw.js|_next|favicon|icon-|manifest|sw.js).*)',
  ],
}















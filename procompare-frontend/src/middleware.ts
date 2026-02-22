import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // NEVER interfere with Next.js internals or static files
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
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
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sw.js (service worker)
     * - manifest.json (PWA manifest)
     * - icon-*.png (PWA icons)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|icon-.*\\.png).*)',
  ],
}















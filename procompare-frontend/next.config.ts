import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // www redirect
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'proconnectsa.co.za' }],
        destination: 'https://www.proconnectsa.co.za/:path*',
        permanent: true,
      },
      // Legacy pages
      { source: '/pricing', destination: '/about', permanent: true },
      { source: '/press', destination: '/about', permanent: true },
      { source: '/for-pros', destination: '/contact', permanent: true },
      { source: '/locksmith/login', destination: '/', permanent: true },
      { source: '/locksmith/dashboard', destination: '/', permanent: true },
      { source: '/locksmith/payment', destination: '/', permanent: true },
      { source: '/providers/:slug/login', destination: '/', permanent: true },
      // Old register/dashboard flows → contact
      { source: '/register', destination: '/contact', permanent: true },
      { source: '/register-provider', destination: '/contact', permanent: true },
      { source: '/register-business', destination: '/contact', permanent: true },
      { source: '/dashboard/:path*', destination: '/', permanent: false },
      { source: '/login', destination: '/', permanent: false },
      // Old provider ID routes → new slug routes (handled in page)
      { source: '/providers/browse', destination: '/providers/browse', permanent: false },
    ]
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ]
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.proconnectsa.co.za' },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
}

export default nextConfig

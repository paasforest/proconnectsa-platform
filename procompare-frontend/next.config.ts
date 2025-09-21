import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za',
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://proconnectsa.co.za',
    NEXT_PUBLIC_APP_NAME: 'ProConnectSA',
  },
  
  // API routes configuration
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*', // Keep NextAuth routes local
      },
      {
        source: '/api/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'}/api/:path*`,
      },
    ]
  },

  // Headers for CORS and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Image optimization
  images: {
    domains: ['api.proconnectsa.co.za', 'proconnectsa.co.za'],
    formats: ['image/webp', 'image/avif'],
  },

  // Experimental features
  experimental: {
    optimizeCss: false, // Disable CSS optimization to avoid critters issues
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Output configuration for Vercel
  output: 'standalone',
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // ESLint configuration for build
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. Remove this once linting issues are resolved.
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration for build
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors. Remove this once type issues are resolved.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

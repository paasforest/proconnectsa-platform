'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Metadata } from 'next';

// Note: This is a client component, so metadata must be set via Head or layout
// For client components, we'll handle this in the layout or use next/head

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified auth page
    router.replace('/register');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}

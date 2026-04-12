'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified auth page
    router.replace('/register');
  }, [router]);

  return (
    <div className="w-full flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" aria-hidden />
        <p className="mt-4 text-muted-foreground">Redirecting to sign in…</p>
      </div>
    </div>
  );
}

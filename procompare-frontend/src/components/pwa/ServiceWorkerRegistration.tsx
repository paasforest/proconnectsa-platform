"use client";

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register service worker (both development and production for testing)
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      // Register service worker with error handling
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[SW] Service Worker registered:', registration);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available, prompt user to refresh
                  console.log('[SW] New service worker available');
                  // You can show a toast notification here if needed
                }
              });
            }
          });
        })
        .catch((error) => {
          // Don't crash the app if service worker fails - it's optional
          console.warn('[SW] Service Worker registration failed (non-critical):', error.message || error);
          // Service worker is optional - app will work without it
        });
    }
  }, []);

  return null;
}

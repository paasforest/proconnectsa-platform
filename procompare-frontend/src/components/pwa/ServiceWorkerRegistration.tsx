"use client";

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Only register service worker in production or if explicitly enabled
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator)
    ) {
      return;
    }

    // Small delay to ensure page is fully loaded
    const timeoutId = setTimeout(() => {
      try {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('[SW] Service Worker registered:', registration);

            // Check for updates periodically (only if registration succeeded)
            const updateInterval = setInterval(() => {
              registration.update().catch((err) => {
                console.warn('[SW] Update check failed:', err);
                clearInterval(updateInterval);
              });
            }, 60 * 60 * 1000); // Check every hour

            // Handle updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[SW] New service worker available');
                  }
                });
              }
            });
          })
          .catch((error) => {
            // Service worker is optional - app will work without it
            console.warn('[SW] Service Worker registration failed (non-critical):', error.message || error);
          });
      } catch (error) {
        console.warn('[SW] Service Worker setup error (non-critical):', error);
      }
    }, 1000); // Wait 1 second after page load

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return null;
}

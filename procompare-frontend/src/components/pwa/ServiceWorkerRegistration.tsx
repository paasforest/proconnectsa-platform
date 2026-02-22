"use client";

import { useEffect, useState } from 'react';
import { UpdateBanner } from './UpdateBanner';

// Version key for localStorage
const APP_VERSION_KEY = 'proconnectsa_app_version';
const UPDATE_DISMISSED_KEY = 'proconnectsa_update_dismissed';

export function ServiceWorkerRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

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
          .then((reg) => {
            console.log('[SW] Service Worker registered:', reg);
            setRegistration(reg);

            // Get current app version from service worker or use timestamp
            const currentVersion = new Date().getTime().toString();
            const storedVersion = localStorage.getItem(APP_VERSION_KEY);
            
            // Check if update was dismissed recently (within last 5 minutes)
            const dismissedTime = localStorage.getItem(UPDATE_DISMISSED_KEY);
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;
            
            if (dismissedTime && (now - parseInt(dismissedTime)) < fiveMinutes) {
              console.log('[SW] Update dismissed recently, skipping check');
            } else {
              // Check for updates immediately
              checkForUpdates(reg);
            }

            // Check for updates periodically (every 30 minutes)
            const updateInterval = setInterval(() => {
              checkForUpdates(reg);
            }, 30 * 60 * 1000); // Check every 30 minutes

            // Handle updates found
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      // New service worker available, show update banner
                      console.log('[SW] New service worker available');
                      setUpdateAvailable(true);
                      // Store new version
                      localStorage.setItem(APP_VERSION_KEY, currentVersion);
                    } else {
                      // First time installation
                      console.log('[SW] Service Worker installed for the first time');
                      localStorage.setItem(APP_VERSION_KEY, currentVersion);
                    }
                  }
                });
              }
            });

            // Check on page visibility change (when user returns to app)
            document.addEventListener('visibilitychange', () => {
              if (!document.hidden) {
                checkForUpdates(reg);
              }
            });

            // Store interval ID for cleanup
            (reg as any)._updateInterval = updateInterval;
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
      if (registration && (registration as any)._updateInterval) {
        clearInterval((registration as any)._updateInterval);
      }
    };
  }, []);

  const checkForUpdates = async (reg: ServiceWorkerRegistration) => {
    try {
      await reg.update();
      // If update found, the 'updatefound' event will fire
    } catch (err) {
      console.warn('[SW] Update check failed:', err);
    }
  };

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Tell the service worker to skip waiting and activate
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    // Reload the page
    window.location.reload();
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
    // Store dismissal time
    localStorage.setItem(UPDATE_DISMISSED_KEY, Date.now().toString());
  };

  return (
    <>
      {updateAvailable && (
        <UpdateBanner onUpdate={handleUpdate} onDismiss={handleDismiss} />
      )}
    </>
  );
}

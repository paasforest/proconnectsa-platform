=== FILE: procompare-frontend/src/components/pwa/PushNotificationManager.tsx ===
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { subscribeToPushNotifications, unsubscribeFromPushNotifications, onForegroundMessage } from '@/lib/firebase';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PushNotificationManager() {
  // ALL hooks must be at the top level - no conditional hook calls
  const { user, token } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isMounted, setIsMounted] = useState(false);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsMounted(true);
    
    // Check Firebase configuration inside useEffect (not during render)
    if (typeof window !== 'undefined') {
      const firebaseConfigured = !!(
        process.env.NEXT_PUBLIC_FIREBASE_API || 
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY
      ) && !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      setIsFirebaseReady(firebaseConfigured);
    }
  }, []);

  useEffect(() => {
    // ALL browser checks go INSIDE the hook - never conditionally call hooks
    if (typeof window === 'undefined') return;
    if (!isMounted) return;
    if (!isFirebaseReady) return;
    if (!('Notification' in window)) return;

    // Check current permission status
    try {
      setPermission(Notification.permission);
    } catch (error) {
      console.warn('Error checking notification permission:', error);
      setPermission('default');
    }

    // Listen for foreground messages (only if permission is granted)
    let unsubscribe: (() => void) | null = null;
    
    try {
      if (Notification.permission === 'granted') {
        unsubscribe = onForegroundMessage((payload) => {
          // Show notification even when app is open
          if (payload?.notification && Notification.permission === 'granted') {
            try {
              new Notification(payload.notification.title, {
                body: payload.notification.body,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                tag: payload.data?.lead_id || 'notification',
                data: payload.data,
              });
            } catch (error) {
              console.error('Error showing notification:', error);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error setting up foreground message listener:', error);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isMounted, isFirebaseReady]);

  const handleSubscribe = async () => {
    if (!user || !token) {
      console.warn('User not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      const success = await subscribeToPushNotifications(token);
      if (success) {
        setIsSubscribed(true);
        if (typeof window !== 'undefined' && 'Notification' in window) {
          try {
            setPermission(Notification.permission);
          } catch (error) {
            console.warn('Error updating permission state:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      // Don't crash the app, just log the error
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await unsubscribeFromPushNotifications(token);
      if (success) {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      // Don't crash the app, just log the error
    } finally {
      setIsLoading(false);
    }
  };

  // Early return AFTER all hooks are called - this is safe
  // Don't show if user is not authenticated, not mounted, or Firebase not ready
  if (!user || !token || !isMounted || !isFirebaseReady) {
    return null;
  }

  // Ensure permission is always defined (safety check)
  const currentPermission = permission || 'default';

  // Show helpful instructions if permission is denied
  if (currentPermission === 'denied') {
    const isChrome = typeof window !== 'undefined' && /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isFirefox = typeof window !== 'undefined' && /Firefox/.test(navigator.userAgent);
    const isSafari = typeof window !== 'undefined' && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isEdge = typeof window !== 'undefined' && /Edg/.test(navigator.userAgent);
    
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <BellOff className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-yellow-900 mb-2">Notifications are blocked</h4>
            <p className="text-sm text-yellow-800 mb-3">
              To enable push notifications, you need to allow them in your browser settings.
            </p>
            
            <div className="bg-white rounded p-3 text-xs text-yellow-900">
              <p className="font-medium mb-2">How to enable notifications:</p>
              {isChrome || isEdge ? (
                <ol className="list-decimal list-inside space-y-1">
                  <li>Click the lock icon (🔒) or info icon (ℹ️) in the address bar</li>
                  <li>Find "Notifications" in the permissions list</li>
                  <li>Change it from "Block" to "Allow"</li>
                  <li>Refresh this page</li>
                </ol>
              ) : isFirefox ? (
                <ol className="list-decimal list-inside space-y-1">
                  <li>Click the lock icon (🔒) in the address bar</li>
                  <li>Click "More Information"</li>
                  <li>Go to the "Permissions" tab</li>
                  <li>Find "Notifications" and change it to "Allow"</li>
                  <li>Refresh this page</li>
                </ol>
              ) : isSafari ? (
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to Safari → Settings → Websites</li>
                  <li>Click "Notifications" in the left sidebar</li>
                  <li>Find this website and change it to "Allow"</li>
                  <li>Refresh this page</li>
                </ol>
              ) : (
                <ol className="list-decimal list-inside space-y-1">
                  <li>Click the lock or info icon in the address bar</li>
                  <li>Look for "Notifications" or "Site Settings"</li>
                  <li>Change notifications from "Block" to "Allow"</li>
                  <li>Refresh this page</li>
                </ol>
              )}
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-xs px-3 py-1.5 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
            >
              Refresh Page After Enabling
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show subscribe button if not subscribed
  if (!isSubscribed && currentPermission !== 'granted') {
    return (
      <Button
        onClick={handleSubscribe}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="text-xs"
      >
        <Bell className="h-3 w-3 mr-1" />
        {isLoading ? 'Enabling...' : 'Enable Notifications'}
      </Button>
    );
  }

  // Show unsubscribe button if subscribed
  if (isSubscribed || currentPermission === 'granted') {
    return (
      <Button
        onClick={handleUnsubscribe}
        disabled={isLoading}
        variant="ghost"
        size="sm"
        className="text-xs text-green-600"
      >
        <Bell className="h-3 w-3 mr-1" />
        {isLoading ? 'Disabling...' : 'Notifications Enabled'}
      </Button>
    );
  }

  return null;
}
=== END ===

=== FILE: procompare-frontend/src/lib/firebase.ts ===
/**
 * Firebase Cloud Messaging (FCM) Configuration
 */
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging, isSupported } from 'firebase/messaging';

// Firebase configuration from environment variables
// Using NEXT_PUBLIC_FIREBASE_API (without KEY) to avoid Vercel naming issues
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export const initializeFirebase = (): FirebaseApp | null => {
  if (typeof window === 'undefined') {
    return null; // Server-side rendering
  }

  // Check if Firebase config is valid
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('Firebase configuration is missing. Push notifications will be disabled.');
    return null;
  }

  try {
    if (!app) {
      const apps = getApps();
      if (apps.length === 0) {
        app = initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully');
      } else {
        app = apps[0];
      }
    }
    return app;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    return null;
  }
};

export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  if (typeof window === 'undefined') {
    return null; // Server-side rendering
  }

  if (messaging) {
    return messaging;
  }

  // Check if messaging is supported
  const supported = await isSupported();
  if (!supported) {
    console.warn('Firebase Messaging is not supported in this browser');
    return null;
  }

  try {
    const app = initializeFirebase();
    if (!app) {
      return null;
    }

    messaging = getMessaging(app);
    return messaging;
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
    return null;
  }
};

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return null;
    }

    // Request permission
    let permission = Notification.permission;
    
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // Get FCM messaging instance
    const messagingInstance = await getFirebaseMessaging();
    if (!messagingInstance) {
      console.error('Firebase Messaging not available');
      return null;
    }

    // Get VAPID key from environment
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('VAPID key not configured');
      return null;
    }

    // Get FCM token
    const token = await getToken(messagingInstance, {
      vapidKey: vapidKey,
    });

    if (token) {
      console.log('FCM token obtained:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.warn('No FCM token available');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

/**
 * Subscribe to push notifications and send token to backend
 */
export const subscribeToPushNotifications = async (apiToken: string): Promise<boolean> => {
  try {
    const fcmToken = await requestNotificationPermission();
    
    if (!fcmToken) {
      return false;
    }

    // Detect device type
    const userAgent = navigator.userAgent;
    let deviceType = 'web';
    if (/Android/i.test(userAgent)) {
      deviceType = 'android';
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      deviceType = 'ios';
    }

    // Send token to backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'}/api/notifications/push/subscribe/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiToken}`,
      },
      body: JSON.stringify({
        token: fcmToken,
        device_type: deviceType,
        user_agent: userAgent,
      }),
    });

    if (response.ok) {
      console.log('Successfully subscribed to push notifications');
      return true;
    } else {
      const error = await response.json();
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return false;
  }
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPushNotifications = async (apiToken: string, token?: string): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'}/api/notifications/push/unsubscribe/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiToken}`,
      },
      body: JSON.stringify({
        token: token || null,
      }),
    });

    if (response.layout.tsx ===
import type { Metadata } from "next";
import { Providers } from "@/components/providers/Providers";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/components/AuthProvider";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { PushNotificationManager } from "@/components/pwa/PushNotificationManager";
import "./globals.css";

// Use system fonts instead of Google Fonts to avoid network issues
const inter = {
  variable: "--font-inter",
  className: "font-sans"
};

export const metadata: Metadata = {
  title: "Local Service Providers in South Africa | Get Free Quotes | ProConnectSA",
  description: "Find trusted local service providers in Johannesburg, Cape Town, Durban, Pretoria, and across South Africa. Compare free quotes from verified plumbers, electricians, cleaners, and more. No obligation to hire.",
  keywords: "local service providers South Africa, get quotes, trusted professionals, compare services, plumbers, electricians, service providers near me",
  authors: [{ name: "ProConnectSA Team" }],
  creator: "ProConnectSA",
  publisher: "ProConnectSA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.proconnectsa.co.za"),
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ProConnectSA",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "Local Service Providers in South Africa | Get Free Quotes | ProConnectSA",
    description: "Find trusted local service providers in South Africa. Compare free quotes from verified professionals. No obligation to hire.",
    url: "https://www.proconnectsa.co.za",
    siteName: "ProConnectSA",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Local Service Providers in South Africa | ProConnectSA",
    description: "Find trusted local service providers. Compare free quotes from verified professionals across South Africa.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <ServiceWorkerRegistration />
        <ErrorBoundary>
          <AuthProvider>
            <Providers>
              {children}
              <Toaster />
              <InstallPrompt />
              <PushNotificationManager />
            </Providers>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
=== END ===

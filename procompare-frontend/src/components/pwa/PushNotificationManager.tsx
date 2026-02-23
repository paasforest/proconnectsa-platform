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
  // Double-check that permission state exists and is valid
  const currentPermission: NotificationPermission = 
    (typeof permission !== 'undefined' && permission) 
      ? permission 
      : (typeof window !== 'undefined' && 'Notification' in window 
          ? Notification.permission 
          : 'default');

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

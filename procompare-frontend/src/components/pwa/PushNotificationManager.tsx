"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { subscribeToPushNotifications, unsubscribeFromPushNotifications, onForegroundMessage } from '@/lib/firebase';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PushNotificationManager() {
  const { user, token } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check current permission status
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }

    // Listen for foreground messages
    const unsubscribe = onForegroundMessage((payload) => {
      // Show notification even when app is open
      if (payload.notification) {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: payload.data?.lead_id || 'notification',
          data: payload.data,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

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
        setPermission('granted');
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show if user is not authenticated
  if (!user || !token) {
    return null;
  }

  // Don't show if permission is denied
  if (permission === 'denied') {
    return (
      <div className="text-xs text-gray-500 p-2">
        <BellOff className="h-4 w-4 inline mr-1" />
        Notifications blocked. Enable in browser settings.
      </div>
    );
  }

  // Show subscribe button if not subscribed
  if (!isSubscribed && permission !== 'granted') {
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
  if (isSubscribed || permission === 'granted') {
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

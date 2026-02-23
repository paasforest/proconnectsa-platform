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

  // Check if Firebase config is valid - ALL required fields must be present
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.messagingSenderId) {
    console.warn('Firebase configuration is incomplete. Missing:', {
      apiKey: !firebaseConfig.apiKey,
      projectId: !firebaseConfig.projectId,
      messagingSenderId: !firebaseConfig.messagingSenderId,
    });
    console.warn('Push notifications will be disabled. Please set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID in your environment variables.');
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

    // Request permission - ensure Notification API is available
    if (!('Notification' in window)) {
      console.warn('Notification API not available');
      return null;
    }
    
    let permission: NotificationPermission = Notification.permission;
    
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

    if (response.ok) {
      console.log('Successfully unsubscribed from push notifications');
      return true;
    } else {
      const error = await response.json();
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
};

/**
 * Listen for foreground messages (when app is open)
 */
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (typeof window === 'undefined') {
    return () => {}; // Server-side rendering
  }

  let unsubscribe: (() => void) | null = null;

  getFirebaseMessaging()
    .then((messagingInstance) => {
      if (messagingInstance) {
        try {
          onMessage(messagingInstance, (payload) => {
            console.log('Foreground message received:', payload);
            callback(payload);
          });
        } catch (error) {
          console.error('Error setting up foreground message listener:', error);
        }
      }
    })
    .catch((error) => {
      console.error('Error getting Firebase Messaging for foreground messages:', error);
    });

  // Return cleanup function
  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
};

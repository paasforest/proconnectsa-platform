// procompare-frontend/src/lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// ─── App initialisation ───────────────────────────────────────────────────────

function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return null
  try {
    return getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  } catch {
    return null
  }
}

// ─── Messaging ────────────────────────────────────────────────────────────────

async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (typeof window === 'undefined') return null
  const { isSupported } = await import('firebase/messaging')
  const supported = await isSupported()
  if (!supported) return null
  const firebaseApp = getFirebaseApp()
  if (!firebaseApp) return null
  try {
    return getMessaging(firebaseApp)
  } catch {
    return null
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getFCMToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  if (!('Notification' in window)) return null

  // Note: variable intentionally named notifPerm to avoid minifier collisions
  const notifPerm = await Notification.requestPermission()
  if (notifPerm !== 'granted') return null

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  if (!vapidKey) return null

  const messagingInstance = await getFirebaseMessaging()
  if (!messagingInstance) return null

  try {
    return await getToken(messagingInstance, { vapidKey })
  } catch {
    return null
  }
}

export async function registerFCMToken(apiToken: string): Promise<boolean> {
  console.log('[Firebase] Starting FCM token registration...')
  
  const fcmToken = await getFCMToken()
  if (!fcmToken) {
    console.error('[Firebase] Failed to get FCM token')
    return false
  }

  console.log('[Firebase] FCM token obtained:', fcmToken.substring(0, 20) + '...')
  console.log('[Firebase] Registering token with backend...')

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.proconnectsa.co.za'
    const url = `${apiUrl}/api/notifications/push/subscribe/`
    
    console.log('[Firebase] POST to:', url)
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${apiToken}`,
      },
      body: JSON.stringify({ token: fcmToken }),
    })
    
    console.log('[Firebase] Response status:', res.status, res.statusText)
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error('[Firebase] Registration failed:', errorText)
      return false
    }
    
    const data = await res.json()
    console.log('[Firebase] Registration successful:', data)
    return true
  } catch (error) {
    console.error('[Firebase] Registration error:', error)
    return false
  }
}

export async function onForegroundMessage(
  callback: (payload: any) => void
): Promise<(() => void) | null> {
  const messagingInstance = await getFirebaseMessaging()
  if (!messagingInstance) return null
  return onMessage(messagingInstance, callback)
}

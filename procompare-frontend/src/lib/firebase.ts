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
  console.log('[Firebase] getFCMToken() called')
  
  if (typeof window === 'undefined') {
    console.log('[Firebase] Window undefined, returning null')
    return null
  }
  
  if (!('Notification' in window)) {
    console.log('[Firebase] Notification API not available, returning null')
    return null
  }

  // Check current permission first
  const currentPermission = Notification.permission
  console.log('[Firebase] Current notification permission:', currentPermission)
  
  // Note: variable intentionally named notifPerm to avoid minifier collisions
  let notifPerm: NotificationPermission = currentPermission
  if (currentPermission === 'default') {
    console.log('[Firebase] Requesting notification permission...')
    notifPerm = await Notification.requestPermission()
    console.log('[Firebase] Permission result:', notifPerm)
  }
  
  if (notifPerm !== 'granted') {
    console.error('[Firebase] Notification permission not granted:', notifPerm)
    return null
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  if (!vapidKey) {
    console.error('[Firebase] VAPID key missing!')
    return null
  }
  console.log('[Firebase] VAPID key found:', vapidKey.substring(0, 10) + '...')

  console.log('[Firebase] Getting Firebase messaging instance...')
  const messagingInstance = await getFirebaseMessaging()
  if (!messagingInstance) {
    console.error('[Firebase] Failed to get messaging instance')
    return null
  }
  console.log('[Firebase] Messaging instance obtained')

  try {
    console.log('[Firebase] Calling getToken()...')
    const token = await getToken(messagingInstance, { vapidKey })
    if (token) {
      console.log('[Firebase] ✅ FCM token obtained:', token.substring(0, 30) + '...')
      return token
    } else {
      console.error('[Firebase] getToken() returned null/empty')
      return null
    }
  } catch (error: any) {
    console.error('[Firebase] ❌ getToken() error:', error)
    console.error('[Firebase] Error details:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      stack: error?.stack?.substring(0, 200)
    })
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

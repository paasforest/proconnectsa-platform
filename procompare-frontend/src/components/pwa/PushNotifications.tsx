// procompare-frontend/src/components/pwa/PushNotifications.tsx
'use client'

import { useEffect } from 'react'
import { registerFCMToken, onForegroundMessage } from '@/lib/firebase'
import { useAuth } from '@/components/AuthProvider'
import { toast } from 'sonner'

export default function PushNotifications() {
  // Log immediately when component renders
  console.log('[PushNotifications] ===== COMPONENT RENDERED =====')
  
  const { user, token } = useAuth()
  
  console.log('[PushNotifications] After useAuth - User:', user?.email || 'NO USER', 'Token:', !!token)

  useEffect(() => {
    console.log('[PushNotifications] ===== COMPONENT MOUNTED =====')
    console.log('[PushNotifications] User:', user?.email || 'NO USER')
    console.log('[PushNotifications] User type:', (user as any)?.user_type || 'NO TYPE')
    console.log('[PushNotifications] Token:', !!token, token ? token.substring(0, 20) + '...' : 'NO TOKEN')
    console.log('[PushNotifications] Window:', typeof window !== 'undefined' ? 'OK' : 'UNDEFINED')
    console.log('[PushNotifications] Notification support:', 'Notification' in window ? 'YES' : 'NO')
    
    if (!user || !token) {
      console.log('[PushNotifications] ❌ Missing user or token, skipping registration')
      return
    }
    if (typeof window === 'undefined') {
      console.log('[PushNotifications] ❌ Window undefined, skipping')
      return
    }
    if (!('Notification' in window)) {
      console.log('[PushNotifications] ❌ Notifications not supported, skipping')
      return
    }

    console.log('[PushNotifications] ✅ All conditions met, starting registration...')
    
    // Check VAPID key
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    console.log('[PushNotifications] VAPID key:', vapidKey ? 'SET (' + vapidKey.substring(0, 10) + '...)' : 'MISSING!')
    
    if (!vapidKey) {
      console.error('[PushNotifications] ❌ VAPID key is missing! Cannot register FCM token.')
      return
    }
    
    // Register FCM token with backend
    registerFCMToken(token).then((success) => {
      if (success) {
        console.log('[PushNotifications] ✅✅✅ Registered successfully!')
      } else {
        console.error('[PushNotifications] ❌❌❌ Registration failed - check Firebase logs above')
      }
    }).catch((error) => {
      console.error('[PushNotifications] ❌ Registration error:', error)
    })

    // Handle foreground messages as toasts
    let unsubscribe: (() => void) | null = null

    onForegroundMessage((payload) => {
      const title = payload?.notification?.title || 'New notification'
      const body = payload?.notification?.body || ''
      const leadId = payload?.data?.lead_id

      toast(title, {
        description: body,
        action: leadId ? {
          label: 'View Lead',
          onClick: () => {
            window.location.href = `/provider/leads/${leadId}`
          }
        } : undefined,
      })
    }).then((unsub) => {
      unsubscribe = unsub
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [user, token])

  // Renders nothing — purely functional
  return null
}

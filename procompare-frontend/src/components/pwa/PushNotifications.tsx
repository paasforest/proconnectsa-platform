// procompare-frontend/src/components/pwa/PushNotifications.tsx
'use client'

import { useEffect } from 'react'
import { registerFCMToken, onForegroundMessage } from '@/lib/firebase'
import { useAuth } from '@/components/AuthProvider'
import { toast } from 'sonner'

export default function PushNotifications() {
  const { user, token } = useAuth()

  useEffect(() => {
    console.log('[PushNotifications] Component mounted, checking conditions...')
    console.log('[PushNotifications] User:', user?.email, 'Token:', !!token)
    
    if (!user || !token) {
      console.log('[PushNotifications] Missing user or token, skipping registration')
      return
    }
    if (typeof window === 'undefined') {
      console.log('[PushNotifications] Window undefined, skipping')
      return
    }
    if (!('Notification' in window)) {
      console.log('[PushNotifications] Notifications not supported, skipping')
      return
    }

    console.log('[PushNotifications] All conditions met, starting registration...')
    
    // Register FCM token with backend
    registerFCMToken(token).then((success) => {
      if (success) {
        console.log('[PushNotifications] ✅ Registered successfully')
      } else {
        console.error('[PushNotifications] ❌ Registration failed')
      }
    }).catch((error) => {
      console.error('[PushNotifications] Registration error:', error)
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

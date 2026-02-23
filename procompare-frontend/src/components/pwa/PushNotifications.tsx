// procompare-frontend/src/components/pwa/PushNotifications.tsx
'use client'

import { useEffect } from 'react'
import { registerFCMToken, onForegroundMessage } from '@/lib/firebase'
import { useAuth } from '@/components/AuthProvider'
import { toast } from 'sonner'

export default function PushNotifications() {
  const { user, token } = useAuth()

  useEffect(() => {
    if (!user || !token) return
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return

    // Register FCM token with backend
    registerFCMToken(token).then((success) => {
      if (success) {
        console.log('[Push] Registered successfully')
      }
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

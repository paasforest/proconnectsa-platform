'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  data?: any
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  isConnected: boolean
}

export function useNotifications(): UseNotificationsReturn {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [ws, setWs] = useState<WebSocket | null>(null)

  // WebSocket connection
  useEffect(() => {
    const token = (session as any)?.accessToken || (session as any)?.token;
    if (!token) return

    let websocket: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null

    // Add a small delay to prevent WebSocket from interfering with login
    const connectTimeout = setTimeout(() => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/notifications/`
      
      const connect = () => {
        try {
          websocket = new WebSocket(wsUrl)
          
          websocket.onopen = () => {
            console.log('WebSocket connected')
            setIsConnected(true)
            // Send authentication token
            websocket?.send(JSON.stringify({
              type: 'auth',
              token: token
            }))
          }
          
          websocket.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data)
              
              if (data.type === 'notification') {
                const notification = data.notification
                setNotifications(prev => [notification, ...prev])
                setUnreadCount(prev => prev + 1)
                
                // Show toast notification
                toast.info(notification.title, {
                  description: notification.message,
                  action: {
                    label: 'View',
                    onClick: () => markAsRead(notification.id)
                  }
                })
              }
            } catch (error) {
              console.error('Error parsing WebSocket message:', error)
            }
          }
          
          websocket.onclose = (event) => {
            console.log('WebSocket closed:', event.code, event.reason)
            setIsConnected(false)
            
            // Only reconnect if it wasn't a manual close
            if (event.code !== 1000 && token) {
              reconnectTimeout = setTimeout(() => {
                console.log('Attempting to reconnect WebSocket...')
                connect()
              }, 5000)
            }
          }
          
          websocket.onerror = (error) => {
            console.warn('WebSocket connection error (non-critical):', error)
            setIsConnected(false)
          }
          
          setWs(websocket)
        } catch (error) {
          console.error('Failed to create WebSocket connection:', error)
          setIsConnected(false)
        }
      }
      
      connect()
    }, 1000) // 1 second delay
    
    return () => {
      clearTimeout(connectTimeout)
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      if (websocket) {
        websocket.close(1000, 'Component unmounting')
      }
    }
  }, [(session as any)?.accessToken, (session as any)?.token])

  const markAsRead = useCallback(async (id: string) => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      // API call
      const token = (session as any)?.accessToken || (session as any)?.token;
      const response = await fetch(`/api/notifications/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ is_read: true })
      })
      
      if (!response.ok) {
        // Revert on error
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, is_read: false } : n)
        )
        setUnreadCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [(session as any)?.accessToken, (session as any)?.token])

  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      )
      setUnreadCount(0)
      
      // API call
      const token = (session as any)?.accessToken || (session as any)?.token;
      const response = await fetch('/api/notifications/mark-all-read/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      })
      
      if (!response.ok) {
        // Revert on error
        setNotifications(prev => 
          prev.map(n => ({ ...n, is_read: false }))
        )
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [(session as any)?.accessToken, (session as any)?.token])

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isConnected
  }
}










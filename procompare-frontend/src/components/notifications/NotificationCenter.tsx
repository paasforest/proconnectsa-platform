"use client"

import { useState, useEffect } from "react"
import { Bell, X, CheckCircle, AlertCircle, Info, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

interface Notification {
  id: string
  type: 'lead' | 'quote' | 'payment' | 'review' | 'system'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  priority: 'low' | 'medium' | 'high'
  actionUrl?: string
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Get token from custom auth
        const token = localStorage.getItem('token')
        
        if (token) {
          const response = await fetch('/api/notifications/', {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            const apiNotifications = data.results || data
            
            // Transform API notifications to component format
            const transformedNotifications = apiNotifications.map((notification: any) => ({
              id: notification.id,
              type: notification.notification_type === 'lead_assigned' ? 'lead' :
                    notification.notification_type === 'credit_purchase' ? 'payment' :
                    notification.notification_type === 'quote_received' ? 'quote' : 'system',
              title: notification.title,
              message: notification.message,
              timestamp: new Date(notification.created_at).toLocaleString(),
              isRead: notification.is_read,
              priority: notification.priority,
              actionUrl: notification.lead ? `/provider/leads/${notification.lead}` : undefined
            }))
            
            setNotifications(transformedNotifications)
            setUnreadCount(transformedNotifications.filter(n => !n.isRead).length)
          }
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
        // Fallback to empty array on error
        setNotifications([])
        setUnreadCount(0)
      }
    }

    fetchNotifications()
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'lead': return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'quote': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'payment': return <DollarSign className="h-4 w-4 text-yellow-500" />
      case 'review': return <Info className="h-4 w-4 text-purple-500" />
      case 'system': return <AlertCircle className="h-4 w-4 text-orange-500" />
      default: return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-500'
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    )
    setUnreadCount(0)
    toast.success("All notifications marked as read")
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id)
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      return prev.filter(n => n.id !== id)
    })
    toast.success("Notification deleted")
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-96 z-50">
          <Card className="shadow-lg border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                          !notification.isRead ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                        } hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium ${
                                !notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'
                              }`}>
                                {notification.title}
                              </p>
                              <div className="flex items-center space-x-1">
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteNotification(notification.id)}
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-muted-foreground">
                                {notification.timestamp}
                              </p>
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs h-6 px-2"
                                >
                                  Mark as read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}











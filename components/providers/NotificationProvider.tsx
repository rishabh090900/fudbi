'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase/config'

interface NotificationContextType {
  permission: NotificationPermission
  token: string | null
  requestPermission: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPermission(Notification.permission)
    }

    // Listen for messages
    onMessageListener().then((payload: any) => {
      console.log('Received foreground message:', payload)
      if (payload.notification) {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/icon-192.png',
        })
      }
    })
  }, [])

  const requestPermission = async () => {
    const fcmToken = await requestNotificationPermission()
    if (fcmToken) {
      setToken(fcmToken)
      setPermission('granted')
      
      // Save token to backend
      await fetch('/api/notifications/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: fcmToken }),
      })
    }
  }

  return (
    <NotificationContext.Provider value={{ permission, token, requestPermission }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

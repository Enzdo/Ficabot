import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

/**
 * Composable for real-time user notifications using SSE (Server-Sent Events)
 *
 * Usage:
 * const { notifications, unreadCount, connect, disconnect, markAsRead } = useUserNotifications()
 */
export const useUserNotifications = () => {
  const authStore = useAuthStore()
  const toast = useToast()
  const notifications = ref<any[]>([])
  const unreadCount = ref(0)
  const isConnected = ref(false)
  let eventSource: EventSource | null = null

  /**
   * Connect to SSE stream
   */
  const connect = () => {
    if (isConnected.value || !authStore.token) return

    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseUrl || 'http://localhost:3333'
    const url = `${baseURL}/user/notifications/stream`

    eventSource = new EventSource(url, {
      withCredentials: true,
    })

    // Connection opened
    eventSource.addEventListener('open', () => {
      console.log('[UserNotifications] SSE connected')
      isConnected.value = true
    })

    // Message received
    eventSource.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'connected') {
          console.log('[UserNotifications] Stream connected')
        } else if (data.type === 'notifications') {
          // New notifications received
          const oldCount = unreadCount.value
          notifications.value = data.data
          unreadCount.value = data.count

          // Show toast for new notifications
          if (data.count > oldCount && data.data.length > 0) {
            const latestNotif = data.data[0]
            toast.success(latestNotif.title, {
              description: latestNotif.message,
              duration: 5000,
            })

            // Play notification sound if supported
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(latestNotif.title, {
                body: latestNotif.message,
                icon: '/icon.png',
              })
            }
          }
        } else if (data.type === 'heartbeat') {
          // Keep-alive heartbeat
          console.log('[UserNotifications] Heartbeat')
        }
      } catch (error) {
        console.error('[UserNotifications] Parse error:', error)
      }
    })

    // Error handling
    eventSource.addEventListener('error', (error) => {
      console.error('[UserNotifications] SSE error:', error)
      isConnected.value = false

      // Reconnect after 5 seconds
      setTimeout(() => {
        if (authStore.token) {
          connect()
        }
      }, 5000)
    })
  }

  /**
   * Disconnect from SSE stream
   */
  const disconnect = () => {
    if (eventSource) {
      eventSource.close()
      eventSource = null
      isConnected.value = false
      console.log('[UserNotifications] SSE disconnected')
    }
  }

  /**
   * Mark notification as read
   */
  const markAsRead = async (notificationId: number) => {
    const api = useApi()
    const response = await api.put(`/user/notifications/${notificationId}/read`, {})

    if (response.success) {
      // Remove from unread list
      notifications.value = notifications.value.filter((n) => n.id !== notificationId)
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    const api = useApi()
    const response = await api.put('/user/notifications/mark-all-read', {})

    if (response.success) {
      notifications.value = []
      unreadCount.value = 0
    }
  }

  /**
   * Fetch unread count (fallback if SSE not connected)
   */
  const fetchUnreadCount = async () => {
    const api = useApi()
    const response = await api.get('/user/notifications/unread-count')

    if (response.success) {
      unreadCount.value = response.data.count
    }
  }

  /**
   * Request notification permission
   */
  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  // Auto-connect on mount if authenticated
  onMounted(() => {
    if (authStore.token) {
      connect()
      requestPermission()
    }
  })

  // Auto-disconnect on unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    notifications,
    unreadCount,
    isConnected,
    connect,
    disconnect,
    markAsRead,
    markAllAsRead,
    fetchUnreadCount,
    requestPermission,
  }
}

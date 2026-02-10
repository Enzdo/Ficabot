import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

/**
 * Composable for real-time notifications using SSE (Server-Sent Events)
 *
 * Usage:
 * const { notifications, unreadCount, connect, disconnect, markAsRead } = useNotifications()
 */
export const useNotifications = () => {
  const authStore = useAuthStore()
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
    const url = `${baseURL}/notifications/stream`

    eventSource = new EventSource(url, {
      withCredentials: true,
    })

    // Connection opened
    eventSource.addEventListener('open', () => {
      console.log('[Notifications] SSE connected')
      isConnected.value = true
    })

    // Message received
    eventSource.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'connected') {
          console.log('[Notifications] Stream connected')
        } else if (data.type === 'notifications') {
          // New notifications received
          notifications.value = data.data
          unreadCount.value = data.count

          // Play notification sound if supported
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Nouvelle notification', {
              body: `Vous avez ${data.count} nouvelle(s) notification(s)`,
              icon: '/icon.png',
            })
          }
        } else if (data.type === 'heartbeat') {
          // Keep-alive heartbeat
          console.log('[Notifications] Heartbeat')
        }
      } catch (error) {
        console.error('[Notifications] Parse error:', error)
      }
    })

    // Error handling
    eventSource.addEventListener('error', (error) => {
      console.error('[Notifications] SSE error:', error)
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
      console.log('[Notifications] SSE disconnected')
    }
  }

  /**
   * Mark notification as read
   */
  const markAsRead = async (notificationId: number) => {
    const api = useApi()
    const response = await api.put(`/notifications/${notificationId}/read`, {})

    if (response.success) {
      // Remove from unread list
      notifications.value = notifications.value.filter(n => n.id !== notificationId)
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    const api = useApi()
    const response = await api.put('/notifications/mark-all-read', {})

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
    const response = await api.get('/notifications/unread-count')

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

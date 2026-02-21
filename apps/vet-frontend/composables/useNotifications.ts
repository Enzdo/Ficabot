import { ref, onMounted, onUnmounted } from 'vue'

export const useNotifications = () => {
  const authStore = useVetAuthStore()
  const api = useVetApi()
  const notifications = ref<any[]>([])
  const unreadCount = ref(0)
  const isConnected = ref(false)
  let eventSource: EventSource | null = null

  const connect = () => {
    if (import.meta.server || isConnected.value || !authStore.token) return

    const config = useRuntimeConfig()
    const baseURL = config.public.apiBase || 'http://localhost:3333'
    const url = `${baseURL}/notifications/stream?token=${authStore.token}`

    eventSource = new EventSource(url)

    eventSource.addEventListener('open', () => {
      isConnected.value = true
    })

    eventSource.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'notifications') {
          notifications.value = data.data
          unreadCount.value = data.count
        }
      } catch (error) {
        console.error('[Notifications] Parse error:', error)
      }
    })

    eventSource.addEventListener('error', () => {
      isConnected.value = false
      setTimeout(() => {
        if (authStore.token) {
          connect()
        }
      }, 5000)
    })
  }

  const disconnect = () => {
    if (eventSource) {
      eventSource.close()
      eventSource = null
      isConnected.value = false
    }
  }

  const markAsRead = async (notificationId: number) => {
    const response = await api.put(`/notifications/${notificationId}/read`, {})
    if (response.success) {
      notifications.value = notifications.value.filter(n => n.id !== notificationId)
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  const markAllAsRead = async () => {
    const response = await api.put('/notifications/mark-all-read', {})
    if (response.success) {
      notifications.value = []
      unreadCount.value = 0
    }
  }

  const fetchUnreadCount = async () => {
    const response = await api.get('/notifications/unread-count')
    if (response.success && response.data) {
      unreadCount.value = (response.data as any).count
    }
  }

  const fetchNotifications = async () => {
    const response = await api.get('/vet/notifications')
    if (response.success && response.data) {
      notifications.value = response.data as any[]
      unreadCount.value = (response.data as any[]).length
    }
  }

  onMounted(() => {
    if (authStore.token) {
      fetchNotifications()
      fetchUnreadCount()
    }
  })

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
    fetchNotifications,
  }
}

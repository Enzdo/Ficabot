export const useOnlineStatus = () => {
    const isOnline = ref(navigator.onLine)
    const wasOffline = ref(!navigator.onLine)

    const handleOnline = () => {
        isOnline.value = true

        // Only show notification if was previously offline
        if (wasOffline.value) {
            const toast = useToast()
            toast.success('🟢 Connexion rétablie')
            wasOffline.value = false
        }
    }

    const handleOffline = () => {
        isOnline.value = false
        wasOffline.value = true

        const toast = useToast()
        toast.warning('🔴 Hors ligne - Vérifiez votre connexion')
    }

    onMounted(() => {
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
    })

    onUnmounted(() => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
    })

    return {
        isOnline: readonly(isOnline),
        wasOffline: readonly(wasOffline)
    }
}

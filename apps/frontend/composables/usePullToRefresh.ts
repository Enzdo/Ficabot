import { ref, onMounted, onUnmounted } from 'vue'

export const usePullToRefresh = (
    containerRef: Ref<HTMLElement | null>,
    onRefresh: () => Promise<void>
) => {
    const pulling = ref(false)
    const refreshing = ref(false)
    const pullDistance = ref(0)
    const threshold = 80 // Minimum pull distance to trigger refresh

    let startY = 0
    let currentY = 0

    const handleTouchStart = (e: TouchEvent) => {
        // Only start pull-to-refresh if scrolled to top
        if (containerRef.value && containerRef.value.scrollTop === 0) {
            startY = e.touches[0].clientY
            pulling.value = true
        }
    }

    const handleTouchMove = (e: TouchEvent) => {
        if (!pulling.value || refreshing.value) return

        currentY = e.touches[0].clientY
        const diff = currentY - startY

        // Only allow pulling down (positive diff)
        if (diff > 0) {
            // Dampen effect: use sqrt for non-linear resistance
            pullDistance.value = Math.min(Math.sqrt(diff) * 10, 120)

            // Prevent default scroll if pulling
            if (pullDistance.value > 10) {
                e.preventDefault()
            }
        }
    }

    const handleTouchEnd = async () => {
        if (!pulling.value) return

        pulling.value = false

        // Trigger refresh if pulled past threshold
        if (pullDistance.value >= threshold && !refreshing.value) {
            refreshing.value = true

            try {
                await onRefresh()
            } catch (error) {
                console.error('Refresh error:', error)
            } finally {
                refreshing.value = false
                pullDistance.value = 0
            }
        } else {
            // Animate back to 0
            const start = pullDistance.value
            const duration = 200
            const startTime = Date.now()

            const animate = () => {
                const elapsed = Date.now() - startTime
                const progress = Math.min(elapsed / duration, 1)
                pullDistance.value = start * (1 - progress)

                if (progress < 1) {
                    requestAnimationFrame(animate)
                }
            }

            requestAnimationFrame(animate)
        }
    }

    onMounted(() => {
        if (containerRef.value) {
            containerRef.value.addEventListener('touchstart', handleTouchStart, { passive: true })
            containerRef.value.addEventListener('touchmove', handleTouchMove, { passive: false })
            containerRef.value.addEventListener('touchend', handleTouchEnd, { passive: true })
        }
    })

    onUnmounted(() => {
        if (containerRef.value) {
            containerRef.value.removeEventListener('touchstart', handleTouchStart)
            containerRef.value.removeEventListener('touchmove', handleTouchMove)
            containerRef.value.removeEventListener('touchend', handleTouchEnd)
        }
    })

    return {
        pulling,
        refreshing,
        pullDistance,
        isTriggered: computed(() => pullDistance.value >= threshold)
    }
}

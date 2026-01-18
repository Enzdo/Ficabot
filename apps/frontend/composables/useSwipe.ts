import { ref } from 'vue'

interface SwipeOptions {
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    onSwipeUp?: () => void
    onSwipeDown?: () => void
    threshold?: number
}

export const useSwipe = (element: Ref<HTMLElement | null>, options: SwipeOptions) => {
    const { threshold = 50 } = options

    let startX = 0
    let startY = 0
    let startTime = 0

    const handleTouchStart = (e: TouchEvent) => {
        startX = e.touches[0].clientX
        startY = e.touches[0].clientY
        startTime = Date.now()
    }

    const handleTouchEnd = (e: TouchEvent) => {
        const endX = e.changedTouches[0].clientX
        const endY = e.changedTouches[0].clientY
        const diffX = endX - startX
        const diffY = endY - startY
        const diffTime = Date.now() - startTime

        // Only trigger if swipe was fast enough (< 300ms)
        if (diffTime > 300) return

        // Determine if horizontal or vertical swipe
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0 && options.onSwipeRight) {
                    options.onSwipeRight()
                } else if (diffX < 0 && options.onSwipeLeft) {
                    options.onSwipeLeft()
                }
            }
        } else {
            // Vertical swipe
            if (Math.abs(diffY) > threshold) {
                if (diffY > 0 && options.onSwipeDown) {
                    options.onSwipeDown()
                } else if (diffY < 0 && options.onSwipeUp) {
                    options.onSwipeUp()
                }
            }
        }
    }

    onMounted(() => {
        if (element.value) {
            element.value.addEventListener('touchstart', handleTouchStart, { passive: true })
            element.value.addEventListener('touchend', handleTouchEnd, { passive: true })
        }
    })

    onUnmounted(() => {
        if (element.value) {
            element.value.removeEventListener('touchstart', handleTouchStart)
            element.value.removeEventListener('touchend', handleTouchEnd)
        }
    })

    return {
        handleTouchStart,
        handleTouchEnd
    }
}

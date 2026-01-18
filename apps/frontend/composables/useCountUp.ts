export const useCountUp = (
    target: Ref<number>,
    duration = 1000,
    options: {
        delay?: number
        onComplete?: () => void
    } = {}
) => {
    const current = ref(0)
    const isAnimating = ref(false)

    const { delay = 0, onComplete } = options

    const animate = (targetValue: number) => {
        if (isAnimating.value) return

        const start = current.value
        const startTime = Date.now() + delay

        isAnimating.value = true

        const step = () => {
            const now = Date.now()

            if (now < startTime) {
                requestAnimationFrame(step)
                return
            }

            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)

            // Easing function: ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            current.value = Math.round(start + (targetValue - start) * eased)

            if (progress < 1) {
                requestAnimationFrame(step)
            } else {
                isAnimating.value = false
                if (onComplete) onComplete()
            }
        }

        requestAnimationFrame(step)
    }

    watch(
        target,
        (newValue) => {
            animate(newValue)
        },
        { immediate: true }
    )

    return {
        current: readonly(current),
        isAnimating: readonly(isAnimating)
    }
}

import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface LazyImageOptions {
    /**
     * URL of the image to load
     */
    src: string

    /**
     * Placeholder image URL (shown while loading)
     */
    placeholder?: string

    /**
     * Fallback image URL (shown if src fails to load)
     */
    fallback?: string

    /**
     * Root margin for Intersection Observer
     * @default '50px'
     */
    rootMargin?: string

    /**
     * Threshold for Intersection Observer
     * @default 0.01
     */
    threshold?: number
}

/**
 * Composable for lazy loading images with Intersection Observer
 * 
 * @example
 * ```vue
 * <script setup>
 * const { imageSrc, isLoading, hasError } = useLazyImage({
 *   src: '/path/to/image.jpg',
 *   placeholder: '/path/to/placeholder.jpg',
 *   fallback: '/path/to/fallback.jpg'
 * })
 * </script>
 * 
 * <template>
 *   <img 
 *     :src="imageSrc" 
 *     :class="{ 'blur-sm': isLoading }"
 *   />
 * </template>
 * ```
 */
export const useLazyImage = (options: LazyImageOptions) => {
    const {
        src,
        placeholder,
        fallback = '/avatars/placeholder.png', // Default fallback
        rootMargin = '50px',
        threshold = 0.01
    } = options

    const imageSrc = ref(placeholder || '')
    const isLoading = ref(true)
    const hasError = ref(false)
    const imgElement: Ref<HTMLImageElement | null> = ref(null)

    let observer: IntersectionObserver | null = null

    const loadImage = () => {
        if (!src) {
            imageSrc.value = fallback
            isLoading.value = false
            hasError.value = true
            return
        }

        const img = new Image()

        img.onload = () => {
            imageSrc.value = src
            isLoading.value = false
            hasError.value = false
        }

        img.onerror = () => {
            imageSrc.value = fallback
            isLoading.value = false
            hasError.value = true
        }

        img.src = src
    }

    const observe = (element: HTMLImageElement) => {
        if (!element) return

        // If IntersectionObserver is not supported, load immediately
        if (!('IntersectionObserver' in window)) {
            loadImage()
            return
        }

        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        loadImage()
                        if (observer && imgElement.value) {
                            observer.unobserve(imgElement.value)
                        }
                    }
                })
            },
            {
                rootMargin,
                threshold
            }
        )

        observer.observe(element)
    }

    const setRef = (el: HTMLImageElement | null) => {
        imgElement.value = el
        if (el) {
            observe(el)
        }
    }

    onUnmounted(() => {
        if (observer && imgElement.value) {
            observer.unobserve(imgElement.value)
            observer.disconnect()
        }
    })

    return {
        imageSrc,
        isLoading,
        hasError,
        setRef
    }
}

/**
 * Vue directive for lazy loading images
 * 
 * @example
 * ```vue
 * <img v-lazy="'/path/to/image.jpg'" />
 * ```
 */
export const vLazy = {
    mounted(el: HTMLImageElement, binding: any) {
        const src = binding.value
        const placeholder = binding.arg || ''

        const { setRef, imageSrc } = useLazyImage({ src, placeholder })

        // Set up watcher to update src
        const updateSrc = (newSrc: string) => {
            el.src = newSrc
        }

        setRef(el)

        // Simple reactive update (for directive usage)
        const interval = setInterval(() => {
            if (imageSrc.value && imageSrc.value !== el.src) {
                updateSrc(imageSrc.value)
                clearInterval(interval)
            }
        }, 100)

            // Cleanup - store interval on element
            ; (el as any)._lazyClearInterval = interval
    },

    unmounted(el: any) {
        if (el._lazyClearInterval) {
            clearInterval(el._lazyClearInterval)
        }
    }
}

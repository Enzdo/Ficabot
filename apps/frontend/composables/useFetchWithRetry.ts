import { ref } from 'vue'
import { useOnlineStatus } from '~/composables/useOnlineStatus' // Assuming this path, adjust if necessary

interface RetryOptions {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    onRetry?: (attempt: number, maxRetries: number) => void
}

export const useFetchWithRetry = () => {
    const onlineStatus = useOnlineStatus()
    const isOnline = onlineStatus?.isOnline || ref(true)

    /**
     * Fetch with exponential backoff retry
     */
    const fetchWithRetry = async <T>(
        url: string,
        options: any = {},
        retryOptions: RetryOptions = {}
    ): Promise<T> => {
        const {
            maxRetries = 3,
            initialDelay = 1000,
            maxDelay = 8000,
            onRetry
        } = retryOptions

        let lastError: Error | null = null

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                // If offline, wait for online before attempting
                if (!isOnline.value && attempt > 0) {
                    await new Promise((resolve) => {
                        const checkOnline = () => {
                            if (isOnline.value) {
                                resolve(true)
                            } else {
                                setTimeout(checkOnline, 1000)
                            }
                        }
                        checkOnline()
                    })
                }

                // Wait before retry (exponential backoff)
                if (attempt > 0) {
                    const delay = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay)

                    if (onRetry) {
                        onRetry(attempt, maxRetries)
                    }

                    await new Promise(resolve => setTimeout(resolve, delay))
                }

                // Attempt fetch
                const response = await $fetch<T>(url, options)
                return response
            } catch (error: any) {
                lastError = error

                // Don't retry on 4xx errors (client errors)
                if (error.status >= 400 && error.status < 500) {
                    throw error
                }

                // Don't retry on last attempt
                if (attempt === maxRetries) {
                    break
                }

                // Continue retrying on 5xx errors or network errors
                console.warn(`Fetch attempt ${attempt + 1} failed, retrying...`, error)
            }
        }

        // All retries exhausted
        throw lastError || new Error('Fetch failed after retries')
    }

    return {
        fetchWithRetry
    }
}

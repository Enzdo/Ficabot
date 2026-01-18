interface CacheEntry<T> {
    data: T
    timestamp: number
    lat?: number
    lng?: number
    radius?: number
}

const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

export const useMapCache = () => {
    const fromCache = ref(false)

    /**
     * Generate cache key from coordinates (rounded to avoid cache misses)
     */
    const getCacheKey = (lat: number, lng: number, radius: number): string => {
        const roundedLat = Math.round(lat * 100) / 100
        const roundedLng = Math.round(lng * 100) / 100
        const roundedRadius = Math.round(radius / 1000) // Round to nearest km
        return `map_${roundedLat}_${roundedLng}_${roundedRadius}`
    }

    /**
     * Get cached data if valid
     */
    const get = <T>(lat: number, lng: number, radius: number): T | null => {
        try {
            const key = getCacheKey(lat, lng, radius)
            const cached = localStorage.getItem(key)

            if (!cached) return null

            const entry: CacheEntry<T> = JSON.parse(cached)
            const now = Date.now()

            // Check expiration
            if (now - entry.timestamp > CACHE_DURATION) {
                localStorage.removeItem(key)
                return null
            }

            fromCache.value = true
            return entry.data
        } catch (error) {
            console.error('Cache get error:', error)
            return null
        }
    }

    /**
     * Set cache data
     */
    const set = <T>(lat: number, lng: number, radius: number, data: T): void => {
        try {
            const key = getCacheKey(lat, lng, radius)
            const entry: CacheEntry<T> = {
                data,
                timestamp: Date.now(),
                lat,
                lng,
                radius
            }

            localStorage.setItem(key, JSON.stringify(entry))
            fromCache.value = false
        } catch (error) {
            console.error('Cache set error:', error)
            // If localStorage is full, clear old entries
            if (error instanceof DOMException && error.code === 22) {
                clearOld()
                // Try again
                try {
                    const key = getCacheKey(lat, lng, radius)
                    const entry: CacheEntry<T> = {
                        data,
                        timestamp: Date.now(),
                        lat,
                        lng,
                        radius
                    }
                    localStorage.setItem(key, JSON.stringify(entry))
                } catch {
                    // Give up
                }
            }
        }
    }

    /**
     * Clear expired cache entries
     */
    const clearOld = (): void => {
        const now = Date.now()
        const keysToRemove: string[] = []

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('map_')) {
                try {
                    const entry = JSON.parse(localStorage.getItem(key)!)
                    if (now - entry.timestamp > CACHE_DURATION) {
                        keysToRemove.push(key)
                    }
                } catch {
                    keysToRemove.push(key)
                }
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key))
    }

    /**
     * Clear all map cache
     */
    const clearAll = (): void => {
        const keys: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('map_')) {
                keys.push(key)
            }
        }
        keys.forEach(key => localStorage.removeItem(key))
    }

    return {
        get,
        set,
        clearOld,
        clearAll,
        fromCache: readonly(fromCache)
    }
}

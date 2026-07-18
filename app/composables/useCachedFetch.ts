import { ref } from 'vue'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

// Global in-memory cache preserved across client-side menu navigations
const memoryCache = new Map<string, CacheEntry<any>>()

export const useCachedFetch = () => {
  const { fetchWithAuth } = useApi()

  /**
   * Fetch data with SWR (Stale-While-Revalidate) strategy.
   * Immediately returns cached data if available, then updates in the background.
   */
  async function fetchWithCache<T>(
    url: string,
    options: {
      ttl?: number // Cache valid duration in ms (default 5 minutes)
      forceRefresh?: boolean
      onRevalidated?: (freshData: T) => void
    } = {}
  ): Promise<{ data: T; isCached: boolean }> {
    const { ttl = 5 * 60 * 1000, forceRefresh = false, onRevalidated } = options
    const now = Date.now()
    const cached = memoryCache.get(url)

    if (!forceRefresh && cached && now - cached.timestamp < ttl) {
      // Revalidate in background asynchronously
      fetchWithAuth<T>(url)
        .then((res: any) => {
          if (res?.success) {
            memoryCache.set(url, { data: res, timestamp: Date.now() })
            if (onRevalidated) {
              onRevalidated(res)
            }
          }
        })
        .catch(() => {})

      return { data: cached.data as T, isCached: true }
    }

    // Fetch from server if no cache exists or cache expired
    const res = await fetchWithAuth<T>(url)
    if ((res as any)?.success) {
      memoryCache.set(url, { data: res, timestamp: Date.now() })
    }
    return { data: res, isCached: false }
  }

  /**
   * Invalidate specific cache keys or clear all cache (e.g. after POST / PUT / DELETE)
   */
  function invalidateCache(pattern?: string | RegExp) {
    if (!pattern) {
      memoryCache.clear()
      return
    }
    for (const key of memoryCache.keys()) {
      const shouldDelete = typeof pattern === 'string' ? key.includes(pattern) : pattern.test(key)
      if (shouldDelete) {
        memoryCache.delete(key)
      }
    }
  }

  /**
   * Manually update cache entry
   */
  function setCache<T>(url: string, data: T) {
    memoryCache.set(url, { data, timestamp: Date.now() })
  }

  return {
    fetchWithCache,
    invalidateCache,
    setCache
  }
}

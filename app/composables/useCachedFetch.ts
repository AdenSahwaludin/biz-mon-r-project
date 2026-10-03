interface CacheEntry<T> {
  data: T
  timestamp: number
}

// Global in-memory cache preserved across client-side menu navigations
const memoryCache = new Map<string, CacheEntry<any>>()
// Dedup request yang sedang berjalan: URL sama -> pakai promise yang sama
const inflight = new Map<string, Promise<any>>()

const LS_PREFIX = 'pb_cache_v1::'
const STALE_LIMIT = 24 * 60 * 60 * 1000 // stale masih boleh dipakai instan sampai 24 jam

function getTTL(url: string): number {
  if (url.includes('/businesses') || url.includes('/branches')) return 30 * 60 * 1000
  if (url.includes('/products') || url.includes('/categories')) return 10 * 60 * 1000
  if (url.includes('/reports') || url.includes('/transactions')) return 2 * 60 * 1000
  return 5 * 60 * 1000
}

function lsKey(url: string) {
  return LS_PREFIX + url
}

function readLS(url: string): CacheEntry<any> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(lsKey(url))
    if (!raw) return null
    const parsed = JSON.parse(raw) as CacheEntry<any>
    if (!parsed || typeof parsed.timestamp !== 'number' || !('data' in parsed)) return null
    return parsed
  } catch {
    return null
  }
}

function writeLS(url: string, entry: CacheEntry<any>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(lsKey(url), JSON.stringify(entry))
  } catch {
    // Kuota penuh / private mode: bersihkan cache lama sekali, lalu coba lagi
    try {
      const keys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(LS_PREFIX)) keys.push(k)
      }
      // Hapus yang paling lama: batasi 60 entri
      if (keys.length > 60) {
        keys.slice(0, keys.length - 60).forEach((k) => localStorage.removeItem(k))
        localStorage.setItem(lsKey(url), JSON.stringify(entry))
      }
    } catch {}
  }
}

function removeLS(pattern?: string | RegExp) {
  if (typeof window === 'undefined') return
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(LS_PREFIX)) keys.push(k)
    }
    for (const k of keys) {
      const url = k.slice(LS_PREFIX.length)
      const shouldDelete =
        !pattern ||
        (typeof pattern === 'string' ? url.includes(pattern) : pattern.test(url))
      if (shouldDelete) localStorage.removeItem(k)
    }
  } catch {}
}

// Dipakai saat logout / 401: hapus semua cache (memori + localStorage)
// agar user berikutnya di device shared tidak melihat data stale user sebelumnya.
export function clearPersistentCache() {
  memoryCache.clear()
  removeLS()
}

// Hydrate memory dari localStorage sekali saat client start (biar reload tetap satset)
let hydrated = false
function hydrateOnce() {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const now = Date.now()
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k || !k.startsWith(LS_PREFIX)) continue
      try {
        const raw = localStorage.getItem(k)
        if (!raw) continue
        const parsed = JSON.parse(raw) as CacheEntry<any>
        if (parsed && typeof parsed.timestamp === 'number' && now - parsed.timestamp < STALE_LIMIT) {
          memoryCache.set(k.slice(LS_PREFIX.length), parsed)
        } else {
          localStorage.removeItem(k)
        }
      } catch {
        try { localStorage.removeItem(k) } catch {}
      }
    }
  } catch {}
}

export const useCachedFetch = () => {
  const { fetchWithAuth } = useApi()
  if (typeof window !== 'undefined') hydrateOnce()

  function setEntry(url: string, data: any) {
    const entry = { data, timestamp: Date.now() }
    memoryCache.set(url, entry)
    writeLS(url, entry)
  }

  async function fetchFresh<T>(url: string): Promise<T> {
    const existing = inflight.get(url)
    if (existing) return existing as Promise<T>
    const p = (async () => {
      try {
        const res = await fetchWithAuth<T>(url)
        if ((res as any)?.success) setEntry(url, res)
        return res
      } finally {
        inflight.delete(url)
      }
    })()
    inflight.set(url, p)
    return p
  }

  /**
   * Fetch data with SWR (Stale-While-Revalidate) strategy.
   * - Kalau ada cache (memori/localStorage) langsung return instan, revalidasi di background.
   * - forceRefresh=true dipakai setelah mutation -> ambil fresh.
   * Tradeoff sesuai request: loading agak lama di awal (warmup), habis itu satset.
   */
  async function fetchWithCache<T>(
    url: string,
    options: {
      ttl?: number // Cache valid duration in ms (default per-endpoint)
      forceRefresh?: boolean
      onRevalidated?: (freshData: T) => void
    } = {}
  ): Promise<{ data: T; isCached: boolean }> {
    const { forceRefresh = false, onRevalidated } = options
    const ttl = options.ttl ?? getTTL(url)
    const now = Date.now()

    if (!forceRefresh) {
      let cached = memoryCache.get(url)
      if (!cached) {
        const fromLS = readLS(url)
        if (fromLS) {
          memoryCache.set(url, fromLS)
          cached = fromLS
        }
      }
      if (cached) {
        const age = now - cached.timestamp
        if (age < STALE_LIMIT) {
          // Masih fresh (< TTL): pakai cache tanpa revalidate (hemat query Turso)
          // Sudah stale tapi < 24 jam: return instan + revalidate background (satset)
          if (age >= ttl) {
            fetchFresh<T>(url)
              .then((res: any) => {
                if (res?.success && onRevalidated) onRevalidated(res)
              })
              .catch(() => {})
          }
          return { data: cached.data as T, isCached: true }
        }
      }
    }

    // Tidak ada cache / forceRefresh / staleKadaluarsa: ambil fresh (loading di depan)
    const res = await fetchFresh<T>(url)
    // fetchFresh sudah setEntry kalau success; panggil onRevalidated juga biar konsisten
    if ((res as any)?.success && onRevalidated && forceRefresh) {
      try { onRevalidated(res) } catch {}
    }
    return { data: res, isCached: false }
  }

  /**
   * Invalidate specific cache keys or clear all cache (e.g. after POST / PUT / DELETE)
   */
  function invalidateCache(pattern?: string | RegExp) {
    if (!pattern) {
      memoryCache.clear()
      removeLS()
      return
    }
    for (const key of Array.from(memoryCache.keys())) {
      const shouldDelete = typeof pattern === 'string' ? key.includes(pattern) : pattern.test(key)
      if (shouldDelete) memoryCache.delete(key)
    }
    removeLS(pattern)
  }

  /**
   * Manually update cache entry
   */
  function setCache<T>(url: string, data: T) {
    setEntry(url, data)
  }

  /**
   * Warmup tanpa await: isi cache di background saat idle (dipakai plugin warmup & setelah login)
   */
  function prefetch(urls: string[]) {
    if (typeof window === 'undefined') return
    for (const url of urls) {
      const cached = memoryCache.get(url)
      if (cached && Date.now() - cached.timestamp < getTTL(url)) continue
      if (inflight.has(url)) continue
      fetchFresh(url).catch(() => {})
    }
  }

  return {
    fetchWithCache,
    invalidateCache,
    setCache,
    prefetch
  }
}

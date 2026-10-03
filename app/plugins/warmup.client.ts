// Warmup: tukar loading agak lama di awal dengan navigasi satset setelahnya.
// - Isi persistent SWR cache (products, categories, businesses, branches) saat idle
// - Preload JS chunks route utama biar pindah halaman tidak unduh ulang
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  const token = useCookie('auth_token')
  if (!token.value) return

  let done = false
  const run = async () => {
    if (done) return
    done = true
    try {
      const { prefetch } = useCachedFetch()
      // 1. Master data paling sering dipakai POS & filter (masuk persistent cache)
      prefetch(['/businesses', '/branches', '/products', '/categories'])

      // 2. Preload JS chunks route utama (transaksi = halaman paling kritis kasir)
      const routes = ['/transaksi', '/dashboard', '/produk', '/laporan/harian', '/riwayat-transaksi', '/laporan']
      for (const r of routes) {
        try {
          await preloadRouteComponents(r)
        } catch {}
      }

      // 3. Data dashboard cabang aktif (kalau sudah dipilih) — biar buka dashboard satset
      try {
        const biz = useBusinessStore()
        if (!biz.businesses.length) await biz.fetchAll()
        const branchId = biz.activeBranchId
        if (branchId) {
          const q = `?branchId=${branchId}`
          prefetch([
            `/reports/omzet${q}`,
            `/reports/best-sellers${q}`,
            `/transactions?branchId=${branchId}&limit=5`
          ])
        } else {
          prefetch(['/reports/omzet', '/reports/best-sellers', '/transactions?limit=5'])
        }
      } catch {}
    } catch {}
  }

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    ;(window as any).requestIdleCallback(run, { timeout: 2500 })
  } else {
    setTimeout(run, 1200)
  }
})

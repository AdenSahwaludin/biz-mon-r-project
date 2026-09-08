import { ref, onMounted, onUnmounted } from 'vue'

export interface QueuedTransaction {
  id: string
  payload: any
  createdAt: string
  clientMutationId: string
}

const STORAGE_KEY = 'pantau_bisnis_offline_queue'
const offlineQueue = ref<QueuedTransaction[]>([])
const isSyncing = ref(false)

export const useOfflineQueue = () => {
  const { fetchWithAuth } = useApi()

  function loadQueue() {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        // Migrasi antrean lama yang belum punya clientMutationId
        offlineQueue.value = (Array.isArray(parsed) ? parsed : []).map((q: any) => ({
          id: q.id,
          payload: q.payload?.clientMutationId
            ? q.payload
            : { ...(q.payload || {}), clientMutationId: q.clientMutationId || q.id },
          createdAt: q.createdAt,
          clientMutationId: q.clientMutationId || q.payload?.clientMutationId || q.id
        }))
      }
    } catch (e) {
      offlineQueue.value = []
    }
  }

  function saveQueue() {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(offlineQueue.value))
    } catch (e) {}
  }

  function enqueueTransaction(payload: any): QueuedTransaction {
    // Pakai clientMutationId dari payload jika ada (retry sama = id sama),
    // agar backend bisa dedup saat sudah support penuh
    const clientMutationId: string =
      payload?.clientMutationId ||
      `OFFLINE-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    // Dedup: jangan antre dua kali untuk mutation yang sama
    const existing = offlineQueue.value.find((q) => q.clientMutationId === clientMutationId)
    if (existing) return existing
    const offlineId = `OFFLINE-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    const item: QueuedTransaction = {
      id: offlineId,
      payload: { ...payload, clientMutationId },
      createdAt: new Date().toISOString(),
      clientMutationId
    }
    offlineQueue.value.push(item)
    saveQueue()
    return item
  }

  async function syncOfflineQueue() {
    if (isSyncing.value || offlineQueue.value.length === 0) return
    if (typeof navigator !== 'undefined' && !navigator.onLine) return

    isSyncing.value = true
    const remaining: QueuedTransaction[] = []
    const seen = new Set<string>()

    for (const item of offlineQueue.value) {
      const key = item.clientMutationId || item.id
      // Dedup dalam satu batch sync
      if (seen.has(key)) continue
      seen.add(key)
      try {
        const res = await fetchWithAuth<any>('/transactions', {
          method: 'POST',
          body: item.payload
        })
        if (!res?.success) {
          // 409 = duplikat (sudah tersimpan saat percobaan sebelumnya) → anggap sukses
          const status = (res as any)?.statusCode ?? (res as any)?.status
          if (status !== 409) {
            remaining.push(item)
          }
        }
      } catch (e: any) {
        const status = e?.data?.statusCode ?? e?.statusCode ?? e?.response?.status
        if (status === 409) {
          // Sudah tersimpan di server, jangan antre lagi
          continue
        }
        remaining.push(item)
      }
    }

    offlineQueue.value = remaining
    saveQueue()
    isSyncing.value = false
  }

  function handleOnline() {
    syncOfflineQueue()
  }

  onMounted(() => {
    loadQueue()
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      if (navigator.onLine && offlineQueue.value.length > 0) {
        syncOfflineQueue()
      }
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline)
    }
  })

  return {
    offlineQueue,
    isSyncing,
    enqueueTransaction,
    syncOfflineQueue
  }
}

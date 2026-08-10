import { ref, onMounted } from 'vue'

export interface QueuedTransaction {
  id: string
  payload: any
  createdAt: string
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
        offlineQueue.value = JSON.parse(raw)
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
    const offlineId = `OFFLINE-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    const item: QueuedTransaction = {
      id: offlineId,
      payload,
      createdAt: new Date().toISOString()
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

    for (const item of offlineQueue.value) {
      try {
        const res = await fetchWithAuth<any>('/transactions', {
          method: 'POST',
          body: item.payload
        })
        if (!res?.success) {
          remaining.push(item)
        }
      } catch (e) {
        remaining.push(item)
      }
    }

    offlineQueue.value = remaining
    saveQueue()
    isSyncing.value = false
  }

  onMounted(() => {
    loadQueue()
    if (typeof window !== 'undefined') {
      window.addEventListener('online', syncOfflineQueue)
      if (navigator.onLine && offlineQueue.value.length > 0) {
        syncOfflineQueue()
      }
    }
  })

  return {
    offlineQueue,
    isSyncing,
    enqueueTransaction,
    syncOfflineQueue
  }
}

<template>
  <div>
    <!-- Filter Toolbar -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
      <!-- Top Row: Search Bar & Branch Dropdown -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <!-- Search Input -->
        <div class="relative md:col-span-2">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            v-model="search"
            type="text"
            placeholder="Cari ID transaksi atau nama kasir..."
            class="w-full pl-10 pr-9 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <button
            v-if="search"
            @click="search = ''"
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full hover:bg-gray-100"
            title="Hapus"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Filter Cabang -->
        <select v-model="filterBranchId" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white font-medium truncate">
          <option value="">Semua Cabang</option>
          <optgroup v-for="biz in businessList" :key="biz.id" :label="biz.name">
            <option v-for="branch in biz.branches" :key="branch.id" :value="branch.id">
              {{ biz.name }} - {{ branch.name }}
            </option>
          </optgroup>
        </select>
      </div>

      <!-- Bottom Row: Filter Method & Quick Date Selectors -->
      <div class="flex flex-wrap items-center gap-3 pt-1 border-t border-gray-100">
        <!-- Filter Pembayaran -->
        <div class="w-full sm:w-auto">
          <select v-model="filterMethod" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white font-medium truncate">
            <option value="">Semua Metode Pembayaran</option>
            <option value="CASH">Tunai</option>
            <option value="QRIS">QRIS</option>
          </select>
        </div>

        <!-- Filter Periode Quick Buttons -->
        <div class="flex flex-wrap items-center gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600">
          <button
            v-for="p in [
              { key: 'month', label: 'Bulan Ini' },
              { key: 'all', label: 'Semua Data' },
              { key: 'today', label: 'Hari Ini' },
              { key: '7days', label: '7 Hari Terakhir' },
              { key: '30days', label: '30 Hari' },
              { key: 'custom', label: 'Kustom Tanggal' }
            ]"
            :key="p.key"
            @click="filterPeriod = p.key"
            class="px-2.5 py-1.5 rounded-md transition-colors"
            :class="filterPeriod === p.key ? 'bg-white text-primary-600 shadow-2xs' : 'hover:bg-gray-200/60'"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <!-- Custom Date Pickers (if Kustom Tanggal selected) -->
      <Transition name="fade">
        <div v-if="filterPeriod === 'custom'" class="flex flex-wrap items-center gap-3 pt-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-500">Dari:</span>
            <input v-model="startDate" type="date" class="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs outline-none bg-white" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-500">Sampai:</span>
            <input v-model="endDate" type="date" class="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs outline-none bg-white" />
          </div>
          <button @click="startDate = ''; endDate = ''" class="text-xs font-semibold text-gray-500 hover:text-gray-700 underline">
            Reset Tanggal
          </button>
        </div>
      </Transition>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-500">Memuat transaksi...</p>
    </div>

    <template v-else>
      <!-- Desktop Table -->
      <div class="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200 select-none">
              <th @click="toggleSort('createdAt')" class="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4 cursor-pointer hover:bg-gray-100 hover:text-gray-700 transition-colors group">
                <div class="flex items-center gap-1.5">
                  <span>Tanggal</span>
                  <ArrowUp v-if="sortField === 'createdAt' && sortDirection === 'asc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                  <ArrowDown v-else-if="sortField === 'createdAt' && sortDirection === 'desc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </th>

              <th @click="toggleSort('branch')" class="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4 cursor-pointer hover:bg-gray-100 hover:text-gray-700 transition-colors group">
                <div class="flex items-center gap-1.5">
                  <span>Cabang</span>
                  <ArrowUp v-if="sortField === 'branch' && sortDirection === 'asc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                  <ArrowDown v-else-if="sortField === 'branch' && sortDirection === 'desc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </th>

              <th @click="toggleSort('cashier')" class="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4 cursor-pointer hover:bg-gray-100 hover:text-gray-700 transition-colors group">
                <div class="flex items-center gap-1.5">
                  <span>Kasir</span>
                  <ArrowUp v-if="sortField === 'cashier' && sortDirection === 'asc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                  <ArrowDown v-else-if="sortField === 'cashier' && sortDirection === 'desc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </th>

              <th @click="toggleSort('total')" class="text-right text-xs font-semibold text-gray-500 uppercase py-3 px-4 cursor-pointer hover:bg-gray-100 hover:text-gray-700 transition-colors group">
                <div class="flex items-center justify-end gap-1.5">
                  <span>Total</span>
                  <ArrowUp v-if="sortField === 'total' && sortDirection === 'asc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                  <ArrowDown v-else-if="sortField === 'total' && sortDirection === 'desc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </th>

              <th @click="toggleSort('paymentMethod')" class="text-center text-xs font-semibold text-gray-500 uppercase py-3 px-4 cursor-pointer hover:bg-gray-100 hover:text-gray-700 transition-colors group">
                <div class="flex items-center justify-center gap-1.5">
                  <span>Metode</span>
                  <ArrowUp v-if="sortField === 'paymentMethod' && sortDirection === 'asc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                  <ArrowDown v-else-if="sortField === 'paymentMethod' && sortDirection === 'desc'" class="w-3.5 h-3.5 text-primary-600 shrink-0" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </th>

              <th v-if="auth.isAdmin" class="text-center text-xs font-semibold text-gray-500 uppercase py-3 px-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="trx in paginatedData"
              :key="trx.id"
              @click="navigateTo(`/transaksi/${encodeURIComponent(trx.id)}`)"
              class="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td class="py-3 px-4 text-sm font-medium text-gray-900">{{ fmt.formatDateTime(trx.createdAt) }}</td>
              <td class="py-3 px-4 text-sm text-gray-600">{{ trx.branch?.business?.name }} - {{ trx.branch?.name }}</td>
              <td class="py-3 px-4 text-sm text-gray-600">{{ trx.cashier?.name }}</td>
              <td class="py-3 px-4 text-sm font-medium text-gray-900 text-right">{{ fmt.format(trx.total) }}</td>
              <td class="py-3 px-4 text-sm text-gray-500 text-center">
                <span
                  class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="trx.paymentMethod === 'QRIS' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'"
                >
                  {{ trx.paymentMethod }}
                </span>
              </td>
              <td v-if="auth.isAdmin" class="py-3 px-4 text-center" @click.stop>
                <button
                  @click="confirmDelete(trx)"
                  class="text-gray-400 hover:text-red-500 transition-colors p-1"
                  title="Hapus Transaksi"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!paginatedData.length" class="py-12 text-center">
          <ClipboardList class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500 font-medium">Tidak ada data transaksi yang cocok</p>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div class="sm:hidden space-y-3">
        <div
          v-for="trx in paginatedData"
          :key="trx.id"
          @click="navigateTo(`/transaksi/${encodeURIComponent(trx.id)}`)"
          class="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md cursor-pointer transition-shadow"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-mono font-bold text-primary-600">{{ trx.id }}</span>
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              :class="trx.paymentMethod === 'QRIS' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'"
            >
              {{ trx.paymentMethod }}
            </span>
          </div>
          <div class="flex items-baseline justify-between">
            <p class="text-base font-bold text-gray-900">{{ fmt.format(trx.total) }}</p>
            <p class="text-xs text-gray-400">{{ fmt.formatDateTime(trx.createdAt) }}</p>
          </div>
          <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
            <span>Kasir: <strong class="text-gray-700">{{ trx.cashier?.name }}</strong></span>
            <span>{{ trx.branch?.name }}</span>
          </div>
        </div>
        <div v-if="!paginatedData.length" class="py-12 text-center bg-white rounded-xl border border-gray-200">
          <ClipboardList class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500 font-medium">Tidak ada data transaksi yang cocok</p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 bg-white rounded-xl border border-gray-200 px-4 py-3">
        <p class="text-sm text-gray-500">{{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, filteredData.length) }} dari {{ filteredData.length }}</p>
        <div class="flex gap-1">
          <button @click="page = Math.max(1, page - 1)" :disabled="page === 1" class="px-3 py-1 text-sm border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40">←</button>
          <button v-for="p in visiblePages" :key="p" @click="page = p" class="px-3 py-1 text-sm rounded-md" :class="p === page ? 'bg-primary-600 text-white' : 'border border-gray-200 hover:bg-gray-50'">{{ p }}</button>
          <button @click="page = Math.min(totalPages, page + 1)" :disabled="page === totalPages" class="px-3 py-1 text-sm border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40">→</button>
        </div>
      </div>
    </template>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="deleteTarget" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl">
            <h3 class="text-lg font-bold text-gray-900 mb-2">Hapus Transaksi</h3>
            <p class="text-sm text-gray-500 mb-5">
              Apakah Anda yakin ingin menghapus transaksi <strong>{{ deleteTarget.id }}</strong>? Stok produk dalam transaksi ini akan dikembalikan.
            </p>
            <div class="flex gap-3">
              <button @click="deleteTarget = null" class="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button @click="doDelete" :disabled="isDeleting" class="flex-1 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50">
                {{ isDeleting ? 'Menghapus...' : 'Hapus' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Search, ClipboardList, Trash2, X, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-vue-next'

const auth = useAuthStore()
const bizStore = useBusinessStore()
const businessList = computed(() => bizStore.groupedBusinesses)
const fmt = useFormatCurrency()
const toast = useToastStore()
const { fetchWithAuth } = useApi()
const { fetchWithCache, invalidateCache } = useCachedFetch()

const search = ref('')
const filterBranchId = ref(bizStore.activeBranchId || '')
const filterMethod = ref('')
const filterPeriod = ref('month')
const startDate = ref('')
const endDate = ref('')
const sortField = ref<'createdAt' | 'branch' | 'cashier' | 'total' | 'paymentMethod' | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')

const page = ref(1)
const perPage = 10
const isLoading = ref(false)
const isDeleting = ref(false)
const deleteTarget = ref<any | null>(null)

const transactions = ref<any[]>([])

onMounted(async () => {
  if (businessList.value.length === 0) {
    await bizStore.fetchAll()
  }
  if (!filterBranchId.value && bizStore.activeBranchId) {
    filterBranchId.value = bizStore.activeBranchId
  }
  await fetchTransactions()
})

watch(filterBranchId, async () => {
  await fetchTransactions()
})

watch(() => bizStore.activeBranchId, async (newBranch) => {
  if (newBranch && filterBranchId.value !== newBranch) {
    filterBranchId.value = newBranch
    await fetchTransactions()
  }
})

async function fetchTransactions(forceRefresh = false) {
  if (transactions.value.length === 0) {
    isLoading.value = true
  }
  try {
    let url = '/transactions'
    if (filterBranchId.value) {
      url += `?branchId=${filterBranchId.value}`
    }
    const res = await fetchWithCache<any>(url, {
      forceRefresh,
      onRevalidated: (fresh) => {
        if (fresh.success) transactions.value = fresh.data
      }
    })
    if (res.data?.success) {
      transactions.value = res.data.data
    }
  } catch (error) {
    toast.error('Gagal memuat riwayat transaksi')
  } finally {
    isLoading.value = false
  }
}

function toggleSort(field: 'createdAt' | 'branch' | 'cashier' | 'total' | 'paymentMethod') {
  if (sortField.value === field) {
    if (sortDirection.value === 'asc') {
      sortDirection.value = 'desc'
    } else {
      sortField.value = null
      sortDirection.value = 'asc'
    }
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
  page.value = 1
}

function confirmDelete(trx: any) {
  deleteTarget.value = trx
}

async function doDelete() {
  if (!deleteTarget.value) return
  isDeleting.value = true
  try {
    const res = await fetchWithAuth<any>(`/transactions/${deleteTarget.value.id}`, {
      method: 'DELETE'
    })
    if (res.success) {
      toast.success('Transaksi berhasil dihapus dan stok telah dikembalikan')
      deleteTarget.value = null
      invalidateCache('/transactions')
      invalidateCache('/products')
      await fetchTransactions(true)
    } else {
      toast.error(res.message || 'Gagal menghapus transaksi')
    }
  } catch (e: any) {
    toast.error(e.data?.message || 'Gagal menghapus transaksi')
  } finally {
    isDeleting.value = false
  }
}

const filteredData = computed(() => {
  let data = [...transactions.value]

  if (search.value) {
    const q = search.value.toLowerCase()
    data = data.filter((t) => 
      t.id?.toLowerCase().includes(q) || 
      t.cashier?.name?.toLowerCase().includes(q)
    )
  }

  if (filterMethod.value) {
    data = data.filter((t) => t.paymentMethod === filterMethod.value)
  }

  if (filterPeriod.value !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

    if (filterPeriod.value === 'custom') {
      if (startDate.value) {
        const start = new Date(startDate.value).getTime()
        data = data.filter((t) => new Date(t.createdAt).getTime() >= start)
      }
      if (endDate.value) {
        const end = new Date(endDate.value).getTime() + (24 * 60 * 60 * 1000 - 1)
        data = data.filter((t) => new Date(t.createdAt).getTime() <= end)
      }
    } else if (filterPeriod.value === 'month') {
      const nowMonth = now.getMonth()
      const nowYear = now.getFullYear()
      data = data.filter((t) => {
        const d = new Date(t.createdAt)
        return d.getMonth() === nowMonth && d.getFullYear() === nowYear
      })
    } else if (filterPeriod.value === 'today') {
      data = data.filter((t) => new Date(t.createdAt).getTime() >= today)
    } else if (filterPeriod.value === '7days') {
      const past7 = today - (7 * 24 * 60 * 60 * 1000)
      data = data.filter((t) => new Date(t.createdAt).getTime() >= past7)
    } else if (filterPeriod.value === '30days') {
      const past30 = today - (30 * 24 * 60 * 60 * 1000)
      data = data.filter((t) => new Date(t.createdAt).getTime() >= past30)
    }
  }

  if (sortField.value) {
    data.sort((a, b) => {
      let valA: any
      let valB: any

      switch (sortField.value) {
        case 'createdAt':
          valA = new Date(a.createdAt).getTime()
          valB = new Date(b.createdAt).getTime()
          break
        case 'branch':
          valA = `${a.branch?.business?.name || ''} ${a.branch?.name || ''}`
          valB = `${b.branch?.business?.name || ''} ${b.branch?.name || ''}`
          break
        case 'cashier':
          valA = a.cashier?.name || ''
          valB = b.cashier?.name || ''
          break
        case 'total':
          valA = a.total || 0
          valB = b.total || 0
          break
        case 'paymentMethod':
          valA = a.paymentMethod || ''
          valB = b.paymentMethod || ''
          break
      }

      if (typeof valA === 'string') {
        const comp = valA.localeCompare(valB, 'id', { sensitivity: 'base', numeric: true })
        return sortDirection.value === 'asc' ? comp : -comp
      } else {
        return sortDirection.value === 'asc' ? valA - valB : valB - valA
      }
    })
  }

  return data
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / perPage))
const paginatedData = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredData.value.slice(start, start + perPage)
})
const visiblePages = computed(() => {
  const pages: number[] = []
  for (let i = Math.max(1, page.value - 2); i <= Math.min(totalPages.value, page.value + 2); i++) pages.push(i)
  return pages
})

watch([search, filterMethod, filterPeriod, startDate, endDate], () => { page.value = 1 })
</script>

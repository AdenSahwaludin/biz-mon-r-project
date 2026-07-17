<template>
  <div>
    <!-- Toolbar -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Search -->
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            v-model="search"
            type="text"
            placeholder="Cari ID transaksi atau kasir..."
            class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
        <!-- Filters -->
        <select v-if="auth.isAdmin" v-model="filterBranchId" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">Semua Cabang</option>
          <optgroup v-for="biz in businessList" :key="biz.id" :label="biz.name">
            <option v-for="branch in biz.branches" :key="branch.id" :value="branch.id">
              {{ branch.name }}
            </option>
          </optgroup>
        </select>
      </div>
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
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">ID</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Tanggal</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Cabang</th>
              <th class="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Kasir</th>
              <th class="text-right text-xs font-medium text-gray-500 uppercase py-3 px-4">Total</th>
              <th class="text-center text-xs font-medium text-gray-500 uppercase py-3 px-4">Metode</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="trx in paginatedData"
              :key="trx.id"
              @click="navigateTo(`/transaksi/${trx.id}`)"
              class="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td class="py-3 px-4 text-sm font-medium text-primary-600">{{ trx.id }}</td>
              <td class="py-3 px-4 text-sm text-gray-600">{{ fmt.formatDateTime(trx.createdAt) }}</td>
              <td class="py-3 px-4 text-sm text-gray-600">{{ trx.branch.business.name }} - {{ trx.branch.name }}</td>
              <td class="py-3 px-4 text-sm text-gray-600">{{ trx.cashier.name }}</td>
              <td class="py-3 px-4 text-sm font-medium text-gray-900 text-right">{{ fmt.format(trx.total) }}</td>
              <td class="py-3 px-4 text-sm text-gray-500 text-center">{{ trx.paymentMethod }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="!paginatedData.length" class="py-12 text-center">
          <ClipboardList class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500 font-medium">Belum ada transaksi</p>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div class="sm:hidden space-y-3">
        <div v-if="!paginatedData.length" class="bg-white rounded-xl border border-gray-200 py-12 text-center">
          <ClipboardList class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500 font-medium">Belum ada transaksi</p>
        </div>
        <div
          v-for="trx in paginatedData"
          :key="trx.id"
          @click="navigateTo(`/transaksi/${trx.id}`)"
          class="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md cursor-pointer transition-shadow"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-primary-600">{{ trx.id }}</span>
            <span class="text-xs font-medium px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
              Selesai
            </span>
          </div>
          <p class="text-xs text-gray-500">{{ fmt.formatDateTime(trx.createdAt) }}</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ trx.branch.business.name }} · {{ trx.cashier.name }} · {{ trx.paymentMethod }}</p>
          <p class="text-base font-bold text-gray-900 mt-2">{{ fmt.format(trx.total) }}</p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 bg-white rounded-xl border border-gray-200 px-4 py-3">
        <p class="text-sm text-gray-500">
          Menampilkan {{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, filteredData.length) }} dari {{ filteredData.length }}
        </p>
        <div class="flex gap-1">
          <button @click="page = Math.max(1, page - 1)" :disabled="page === 1" class="px-3 py-1 text-sm border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">←</button>
          <button
            v-for="p in visiblePages"
            :key="p"
            @click="page = p"
            class="px-3 py-1 text-sm rounded-md transition-colors"
            :class="p === page ? 'bg-primary-600 text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'"
          >{{ p }}</button>
          <button @click="page = Math.min(totalPages, page + 1)" :disabled="page === totalPages" class="px-3 py-1 text-sm border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">→</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Search, ClipboardList } from 'lucide-vue-next'

const auth = useAuthStore()
const bizStore = useBusinessStore()
const businessList = computed(() => bizStore.groupedBusinesses)
const fmt = useFormatCurrency()
const toast = useToastStore()
const { fetchWithAuth } = useApi()

const search = ref('')
const filterBranchId = ref('')
const page = ref(1)
const perPage = 10
const isLoading = ref(true)

const transactions = ref<any[]>([])

onMounted(async () => {
  if (businessList.value.length === 0) {
    await bizStore.fetchAll()
  }
  await fetchTransactions()
})

watch(filterBranchId, async () => {
  await fetchTransactions()
})

async function fetchTransactions() {
  isLoading.value = true
  try {
    const url = filterBranchId.value ? `/transactions?branchId=${filterBranchId.value}` : `/transactions`
    const res = await fetchWithAuth<any>(url)
    if (res.success) {
      transactions.value = res.data
    }
  } catch (error) {
    toast.error('Gagal memuat transaksi')
  } finally {
    isLoading.value = false
  }
}

const filteredData = computed(() => {
  let data = [...transactions.value]

  if (search.value) {
    const q = search.value.toLowerCase()
    data = data.filter((t) => t.id.toLowerCase().includes(q) || t.cashier.name.toLowerCase().includes(q))
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
  const total = totalPages.value
  const current = page.value
  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
    pages.push(i)
  }
  return pages
})

watch([search, filterBranchId], () => { page.value = 1 })
</script>

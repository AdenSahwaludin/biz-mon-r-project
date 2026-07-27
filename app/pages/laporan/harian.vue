<template>
  <div class="space-y-6">
    <!-- Top Filter Bar -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-2xs">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Title & Subtitle -->
        <div>
          <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar class="w-5 h-5 text-primary-600" />
            <span>Laporan Penjualan Harian {{ auth.isKaryawan && (auth.user?.name || auth.user?.username) ? `(Kasir: ${auth.user?.name || auth.user?.username})` : '' }}</span>
          </h2>
          <p class="text-xs text-gray-500 mt-0.5">
            {{ auth.isKaryawan ? `Penutupan kas dan rekapitulasi transaksi harian ${auth.user?.name || auth.user?.username || ''}` : 'Penutupan kas dan rekapitulasi penjualan per hari' }}
          </p>
        </div>

        <!-- Controls: Quick Date, Date Picker, Branch Filter -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              @click="setToday"
              class="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors"
              :class="selectedDate === todayStr ? 'bg-white text-primary-600 shadow-2xs' : 'text-gray-600 hover:text-gray-900'"
            >
              Hari Ini
            </button>
            <button
              @click="setYesterday"
              class="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors"
              :class="selectedDate === yesterdayStr ? 'bg-white text-primary-600 shadow-2xs' : 'text-gray-600 hover:text-gray-900'"
            >
              Kemarin
            </button>
          </div>

          <input
            v-model="selectedDate"
            type="date"
            class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />

          <select v-model="filterBranchId" class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500 bg-white">
            <option value="">{{ auth.isKaryawan ? 'Semua Cabang Saya' : 'Semua Cabang' }}</option>
            <optgroup v-for="biz in businessList" :key="biz.id" :label="biz.name">
              <option v-for="branch in biz.branches" :key="branch.id" :value="branch.id">
                {{ biz.name }} - {{ branch.name }}
              </option>
            </optgroup>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12 bg-white rounded-xl border border-gray-200">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent mb-2"></div>
      <p class="text-sm text-gray-500 font-medium">Memuat laporan harian...</p>
    </div>

    <template v-else>
      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Omzet Hari Ini -->
        <div class="bg-white rounded-xl border border-primary-200 p-5 shadow-2xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-primary-700 uppercase tracking-wider">Total Omzet Harian</span>
            <div class="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <Coins class="w-4 h-4" />
            </div>
          </div>
          <p class="text-xl font-bold text-gray-900">{{ fmt.format(dailySummary.totalOmzet) }}</p>
          <p class="text-xs text-primary-600 mt-1 font-medium">Akumulasi omzet terdaftar</p>
        </div>

        <!-- Pendapatan Tunai -->
        <div class="bg-white rounded-xl border border-emerald-200 bg-emerald-50/20 p-5 shadow-2xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-emerald-700 uppercase tracking-wider">Pendapatan Tunai</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Banknote class="w-4 h-4" />
            </div>
          </div>
          <p class="text-xl font-bold text-emerald-950">{{ fmt.format(dailySummary.cashRevenue) }}</p>
          <p class="text-xs text-emerald-600 mt-1 font-medium">{{ dailySummary.cashCount }} Transaksi Tunai</p>
        </div>

        <!-- Pendapatan QRIS -->
        <div class="bg-white rounded-xl border border-blue-200 bg-blue-50/20 p-5 shadow-2xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-blue-700 uppercase tracking-wider">Pendapatan QRIS</span>
            <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <QrCode class="w-4 h-4" />
            </div>
          </div>
          <p class="text-xl font-bold text-blue-950">{{ fmt.format(dailySummary.qrisRevenue) }}</p>
          <p class="text-xs text-blue-600 mt-1 font-medium">{{ dailySummary.qrisCount }} Transaksi QRIS</p>
        </div>

        <!-- Total Transaksi -->
        <div class="bg-white rounded-xl border border-purple-200 bg-purple-50/20 p-5 shadow-2xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-purple-700 uppercase tracking-wider">Total Transaksi</span>
            <div class="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Receipt class="w-4 h-4" />
            </div>
          </div>
          <p class="text-xl font-bold text-purple-950">{{ dailySummary.transactionCount }} Transaksi</p>
          <p class="text-xs text-purple-600 mt-1 font-medium">Transaksi Berhasil Diproses</p>
        </div>
      </div>

      <!-- Hourly Chart & Cashier Shift Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Jam Operasional Sales Chart -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-2xs">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
              <Clock class="w-4 h-4 text-gray-500" />
              <span>Grafik Penjualan per Jam</span>
            </h3>
            <span class="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">Operasional Harian</span>
          </div>
          <div class="h-64">
            <Bar v-if="hourlyChartData.labels.length" :data="hourlyChartData" :options="hourlyChartOptions" />
            <div v-else class="h-full flex items-center justify-center text-gray-400 text-sm">
              Tidak ada data transaksi pada tanggal ini.
            </div>
          </div>
        </div>

        <!-- Cashier Shift Summary Table -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 class="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users class="w-4 h-4 text-gray-500" />
              <span>Rekapitulasi Per Kasir</span>
            </h3>
            <div v-if="cashierSummary.length > 0" class="space-y-3">
              <div v-for="c in cashierSummary" :key="c.name" class="p-3.5 border border-gray-200/80 rounded-xl bg-gray-50/60 space-y-2.5">
                <!-- Top Row: Cashier Avatar, Name, Total -->
                <div class="flex items-center justify-between gap-2 border-b border-gray-200/70 pb-2">
                  <div class="flex items-center gap-2 min-w-0">
                    <div class="w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {{ c.name.charAt(0).toUpperCase() }}
                    </div>
                    <span class="text-sm font-bold text-gray-900 truncate">{{ c.name }}</span>
                  </div>
                  <span class="text-sm font-black text-gray-900 shrink-0">{{ fmt.format(c.total) }}</span>
                </div>

                <!-- Bottom Row: Count & Badges -->
                <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span class="font-medium text-gray-500">{{ c.count }} Transaksi</span>
                  
                  <div class="flex flex-wrap items-center gap-1.5 font-medium">
                    <span class="px-2 py-0.5 rounded-md bg-emerald-100/90 text-emerald-800 font-semibold text-[11px]">
                      Tunai: {{ fmt.format(c.cash) }}
                    </span>
                    <span class="px-2 py-0.5 rounded-md bg-blue-100/90 text-blue-800 font-semibold text-[11px]">
                      QRIS: {{ fmt.format(c.qris) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-10 text-gray-400 text-sm">
              Belum ada transaksi kasir.
            </div>
          </div>
        </div>
      </div>

      <!-- Daily Transactions & Products Breakdown Tables -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Daily Transactions Table (2 Cols) -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs flex flex-col justify-between">
          <div>
            <div class="p-4 sm:p-5 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 class="text-base font-bold text-gray-900">Daftar Transaksi ({{ fmt.formatDate(selectedDate) }})</h3>
                <p class="text-xs text-gray-500 mt-0.5">Total {{ dailyTransactions.length }} invoice yang diproses</p>
              </div>

              <div class="flex items-center gap-2">
                <button @click="exportPdf" class="px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 shadow-2xs">
                  <FileText class="w-3.5 h-3.5 text-gray-600" /> PDF Laporan Harian
                </button>
                <button @click="exportCsv" class="px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 shadow-2xs">
                  <Download class="w-3.5 h-3.5 text-gray-600" /> Export CSV
                </button>
              </div>
            </div>

            <!-- Table Desktop (No. Invoice Column Removed) -->
            <div class="hidden sm:block overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-gray-50/80 border-b border-gray-200">
                    <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Jam</th>
                    <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Kasir</th>
                    <th class="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Pembayaran</th>
                    <th class="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Nominal</th>
                    <th class="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="trx in displayedTransactions" :key="trx.id" class="hover:bg-gray-50/80 transition-colors">
                    <td class="py-3 px-4 text-sm font-semibold text-gray-800">{{ formatTimeOnly(trx.createdAt) }} WIB</td>
                    <td class="py-3 px-4 text-sm text-gray-800 font-medium">{{ trx.cashier?.name || '—' }}</td>
                    <td class="py-3 px-4 text-center">
                      <span
                        class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold"
                        :class="trx.paymentMethod === 'QRIS' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'"
                      >
                        {{ trx.paymentMethod === 'QRIS' ? 'QRIS' : 'Tunai' }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-sm font-bold text-gray-900 text-right">{{ fmt.format(trx.total) }}</td>
                    <td class="py-3 px-4 text-center">
                      <button @click="navigateTo(`/transaksi/${encodeURIComponent(trx.id)}`)" class="text-xs font-semibold text-primary-600 hover:text-primary-800 hover:underline">
                        Detail →
                      </button>
                    </td>
                  </tr>
                  <tr v-if="dailyTransactions.length === 0">
                    <td colspan="5" class="py-10 text-center text-gray-400 text-sm font-medium">
                      Tidak ada transaksi pada tanggal ini.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile Cards -->
            <div class="sm:hidden divide-y divide-gray-100">
              <div
                v-for="trx in displayedTransactions"
                :key="trx.id"
                @click="navigateTo(`/transaksi/${encodeURIComponent(trx.id)}`)"
                class="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-bold text-gray-900">{{ formatTimeOnly(trx.createdAt) }} WIB</span>
                  <span class="text-sm font-black text-gray-900">{{ fmt.format(trx.total) }}</span>
                </div>
                <div class="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <span>Kasir: {{ trx.cashier?.name || '—' }}</span>
                  <span :class="trx.paymentMethod === 'QRIS' ? 'text-blue-600 font-bold' : 'text-emerald-600 font-bold'">
                    {{ trx.paymentMethod === 'QRIS' ? 'QRIS' : 'Tunai' }}
                  </span>
                </div>
              </div>
              <div v-if="dailyTransactions.length === 0" class="p-8 text-center text-gray-400 text-sm">
                Tidak ada transaksi pada tanggal ini.
              </div>
            </div>
          </div>

          <!-- Transaction Pagination (+10 Increments) -->
          <div v-if="dailyTransactions.length > visibleTrxLimit" class="p-3.5 bg-gray-50/70 border-t border-gray-200 flex items-center justify-between">
            <span class="text-xs font-medium text-gray-500">Menampilkan {{ displayedTransactions.length }} dari {{ dailyTransactions.length }} transaksi</span>
            <button
              @click="visibleTrxLimit += 10"
              class="px-3.5 py-1.5 text-xs font-bold text-primary-600 bg-white border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors shadow-2xs"
            >
              Lihat Selanjutnya (+10 Transaksi)
            </button>
          </div>
          <div v-else-if="dailyTransactions.length > 10" class="p-3.5 bg-gray-50/70 border-t border-gray-200 flex items-center justify-between">
            <span class="text-xs font-medium text-gray-500">Menampilkan seluruh {{ dailyTransactions.length }} transaksi</span>
            <button
              @click="visibleTrxLimit = 10"
              class="px-3.5 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors shadow-2xs"
            >
              Tampilkan 10 Awal
            </button>
          </div>
        </div>

        <!-- Product Sales Breakdown (Limited to 10 by default, +10 Increments) -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
                <Package class="w-4 h-4 text-gray-500" />
                <span>Rincian Produk Terjual</span>
              </h3>
              <span v-if="productBreakdown.length > 0" class="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                Top {{ displayedProducts.length }} dari {{ productBreakdown.length }}
              </span>
            </div>

            <div v-if="productBreakdown.length > 0" class="space-y-2.5">
              <div v-for="(prod, idx) in displayedProducts" :key="prod.name" class="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                <div class="flex items-center gap-2.5 min-w-0">
                  <span class="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0">{{ idx + 1 }}</span>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-gray-900 truncate">{{ prod.name }}</p>
                    <p class="text-xs text-gray-400">{{ prod.qty }} item terjual</p>
                  </div>
                </div>
                <span class="text-sm font-bold text-gray-900 shrink-0 ml-2">{{ fmt.format(prod.total) }}</span>
              </div>
            </div>
            <div v-else class="text-center py-10 text-gray-400 text-sm">
              Belum ada data penjualan produk.
            </div>
          </div>

          <!-- Product Breakdown Pagination (+10 Increments) -->
          <div v-if="productBreakdown.length > visibleProductLimit" class="mt-4 pt-3 border-t border-gray-100 text-center">
            <button
              @click="visibleProductLimit += 10"
              class="text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors"
            >
              Lihat Selanjutnya (+10 Produk)
            </button>
          </div>
          <div v-else-if="productBreakdown.length > 10" class="mt-4 pt-3 border-t border-gray-100 text-center">
            <button
              @click="visibleProductLimit = 10"
              class="text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
            >
              Tampilkan 10 Produk Teratas
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Calendar, Coins, Banknote, QrCode, Receipt, Clock, Users, Package, FileText, Download } from 'lucide-vue-next'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const auth = useAuthStore()
const bizStore = useBusinessStore()

const businessList = computed(() => {
  const activeList = bizStore.activeGroupedBusinesses
  if (!auth.isKaryawan) {
    return activeList
  }

  const assignedBranchIds = new Set(
    (auth.userBranches && auth.userBranches.length > 0)
      ? auth.userBranches.map((b: any) => b.id)
      : (auth.userBranch ? [auth.userBranch.id] : [])
  )

  return activeList
    .map(b => ({
      ...b,
      branches: b.branches.filter(br => assignedBranchIds.has(br.id))
    }))
    .filter(b => b.branches.length > 0)
})
const fmt = useFormatCurrency()
const toast = useToastStore()
const { fetchWithAuth } = useApi()

const now = new Date()
const todayStr = now.toISOString().split('T')[0]

const yesterday = new Date(now)
yesterday.setDate(yesterday.getDate() - 1)
const yesterdayStr = yesterday.toISOString().split('T')[0]

const selectedDate = ref(todayStr)
const filterBranchId = ref(bizStore.activeBranchId || '')
const isLoading = ref(false)

const dailyTransactions = ref<any[]>([])
const visibleTrxLimit = ref(10)
const visibleProductLimit = ref(10)

function setToday() {
  selectedDate.value = todayStr
}

function setYesterday() {
  selectedDate.value = yesterdayStr
}

function formatTimeOnly(dateStr: string) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function getHexColor(colorStr?: string) {
  if (!colorStr) return '#3B82F6'
  if (colorStr.includes('emerald')) return '#059669'
  if (colorStr.includes('orange')) return '#EA580C'
  if (colorStr.includes('amber')) return '#D97706'
  if (colorStr.includes('rose')) return '#E11D48'
  if (colorStr.includes('blue')) return '#2563EB'
  if (colorStr.includes('purple')) return '#7C3AED'
  if (colorStr.startsWith('#')) return colorStr
  return '#3B82F6'
}

onMounted(async () => {
  if (businessList.value.length === 0) {
    await bizStore.fetchAll()
  }
  if (!filterBranchId.value && bizStore.activeBranchId) {
    filterBranchId.value = bizStore.activeBranchId
  }
  await fetchDailyReport()
})

watch([selectedDate, filterBranchId], async () => {
  visibleTrxLimit.value = 10
  visibleProductLimit.value = 10
  await fetchDailyReport()
})

watch(() => bizStore.activeBranchId, (newBranch) => {
  if (newBranch && filterBranchId.value !== newBranch) {
    filterBranchId.value = newBranch
  }
})

async function fetchDailyReport() {
  isLoading.value = true
  try {
    let url = `/transactions?startDate=${selectedDate.value}&endDate=${selectedDate.value}`
    if (filterBranchId.value) {
      url += `&branchId=${filterBranchId.value}`
    }
    const res = await fetchWithAuth<any>(url)
    if (res.success) {
      dailyTransactions.value = res.data || []
    }
  } catch (error) {
    toast.error('Gagal memuat laporan harian')
  } finally {
    isLoading.value = false
  }
}

const dailySummary = computed(() => {
  let totalOmzet = 0
  let cashRevenue = 0
  let qrisRevenue = 0
  let cashCount = 0
  let qrisCount = 0

  dailyTransactions.value.forEach((trx: any) => {
    totalOmzet += trx.total || 0
    if (trx.paymentMethod === 'QRIS') {
      qrisRevenue += trx.total || 0
      qrisCount++
    } else {
      cashRevenue += trx.total || 0
      cashCount++
    }
  })

  return {
    totalOmzet,
    cashRevenue,
    qrisRevenue,
    cashCount,
    qrisCount,
    transactionCount: dailyTransactions.value.length
  }
})

const rataRataTransaksi = computed(() => {
  return dailySummary.value.transactionCount > 0
    ? Math.round(dailySummary.value.totalOmzet / dailySummary.value.transactionCount)
    : 0
})

const cashierSummary = computed(() => {
  const map: Record<string, { name: string, count: number, total: number, cash: number, qris: number }> = {}

  dailyTransactions.value.forEach((trx: any) => {
    const cName = trx.cashier?.name || 'Kasir'
    if (!map[cName]) {
      map[cName] = { name: cName, count: 0, total: 0, cash: 0, qris: 0 }
    }
    map[cName].count++
    map[cName].total += trx.total || 0
    if (trx.paymentMethod === 'QRIS') {
      map[cName].qris += trx.total || 0
    } else {
      map[cName].cash += trx.total || 0
    }
  })

  return Object.values(map).sort((a, b) => b.total - a.total)
})

const productBreakdown = computed(() => {
  const map: Record<string, { name: string, price: number, qty: number, total: number }> = {}

  dailyTransactions.value.forEach((trx: any) => {
    if (trx.details) {
      trx.details.forEach((det: any) => {
        const pName = det.product?.name || 'Produk'
        const price = det.price || 0
        const qty = det.qty || 0
        const subtotal = det.subtotal || (price * qty)

        if (!map[pName]) {
          map[pName] = { name: pName, price, qty: 0, total: 0 }
        }
        map[pName].qty += qty
        map[pName].total += subtotal
      })
    }
  })

  return Object.values(map).sort((a, b) => b.qty - a.qty)
})

const displayedTransactions = computed(() => {
  return dailyTransactions.value.slice(0, visibleTrxLimit.value)
})

const displayedProducts = computed(() => {
  return productBreakdown.value.slice(0, visibleProductLimit.value)
})

const hourlyChartData = computed(() => {
  const hours = Array.from({ length: 15 }, (_, i) => i + 8) // 08:00 to 22:00
  const labels = hours.map(h => `${h.toString().padStart(2, '0')}:00`)
  const data = hours.map(h => {
    return dailyTransactions.value.reduce((acc, trx) => {
      const tHour = new Date(trx.createdAt).getHours()
      return tHour === h ? acc + (trx.total || 0) : acc
    }, 0)
  })

  const themeHex = getHexColor(bizStore.activeBusiness?.color)

  return {
    labels,
    datasets: [
      {
        label: 'Omzet per Jam',
        data,
        backgroundColor: themeHex + 'D9',
        hoverBackgroundColor: themeHex,
        borderColor: themeHex,
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  }
})

const hourlyChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => fmt.format(ctx.raw)
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (val: any) => fmt.formatShort(val)
      },
      grid: { color: '#f3f4f6' }
    },
    x: { grid: { display: false } }
  }
}

function exportPdf() {
  const printWin = window.open('', '_blank')
  if (!printWin) {
    toast.error('Gagal membuka jendela cetak. Izinkan pop-up browser.')
    return
  }

  let activeBranchName = 'Semua Cabang'
  if (filterBranchId.value) {
    for (const b of businessList.value) {
      const found = b.branches?.find((br: any) => br.id === filterBranchId.value)
      if (found) {
        activeBranchName = `${b.name} - ${found.name}`
        break
      }
    }
  } else if (bizStore.activeBranch) {
    activeBranchName = `${bizStore.activeBusiness?.name} - ${bizStore.activeBranch?.name}`
  }

  const tableRowsHtml = dailyTransactions.value.map((trx: any) => `
    <tr>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">${trx.id}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb;">${formatTimeOnly(trx.createdAt)}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb;">${trx.cashier?.name || '—'}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${trx.paymentMethod}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${fmt.format(trx.total)}</td>
    </tr>
  `).join('')

  const prodRowsHtml = productBreakdown.value.map((p: any) => `
    <tr>
      <td style="padding: 6px 10px; border-bottom: 1px solid #f3f4f6;">${p.name}</td>
      <td style="padding: 6px 10px; border-bottom: 1px solid #f3f4f6; text-align: center;">${p.qty}</td>
      <td style="padding: 6px 10px; border-bottom: 1px solid #f3f4f6; text-align: right;">${fmt.format(p.total)}</td>
    </tr>
  `).join('')

  printWin.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Laporan Penjualan Harian - ${selectedDate.value}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1f2937; }
          .header { border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 22px; font-weight: bold; }
          .subtitle { font-size: 13px; color: #6b7280; }
          .stats { display: flex; gap: 10px; margin-bottom: 20px; }
          .stat { flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; background: #f9fafb; }
          .stat-title { font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: bold; }
          .stat-val { font-size: 18px; font-weight: bold; margin-top: 4px; }
          .grid { display: flex; gap: 20px; }
          .col { flex: 1; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          th { background: #f3f4f6; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #e5e7eb; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">PantauBisnis — Laporan Harian</div>
            <div class="subtitle">Cabang: ${activeBranchName} | Tanggal: ${fmt.formatDate(selectedDate.value)}</div>
          </div>
        </div>

        <div class="stats">
          <div class="stat">
            <div class="stat-title">Total Omzet</div>
            <div class="stat-val">${fmt.format(dailySummary.value.totalOmzet)}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Pendapatan Tunai</div>
            <div class="stat-val" style="color: #059669;">${fmt.format(dailySummary.value.cashRevenue)}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Pendapatan QRIS</div>
            <div class="stat-val" style="color: #2563eb;">${fmt.format(dailySummary.value.qrisRevenue)}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Total Transaksi</div>
            <div class="stat-val">${dailySummary.value.transactionCount}</div>
          </div>
        </div>

        <div class="grid">
          <div class="col" style="flex: 2;">
            <h4 style="margin: 0 0 5px 0;">Daftar Transaksi</h4>
            <table>
              <thead>
                <tr>
                  <th>No. Invoice</th>
                  <th>Jam</th>
                  <th>Kasir</th>
                  <th style="text-align: center;">Bayar</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>${tableRowsHtml}</tbody>
            </table>
          </div>
          <div class="col" style="flex: 1;">
            <h4 style="margin: 0 0 5px 0;">Ringkasan Produk</h4>
            <table>
              <thead>
                <tr>
                  <th>Produk</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>${prodRowsHtml}</tbody>
            </table>
          </div>
        </div>
      </body>
    </html>
  `)
  printWin.document.close()
  setTimeout(() => {
    printWin.focus()
    printWin.print()
  }, 250)
}

function exportCsv() {
  let csvContent = `Laporan Penjualan Harian - Tanggal ${selectedDate.value}\n`
  csvContent += `No Invoice,Jam,Kasir,Metode Pembayaran,Total Nominal (Rp)\n`

  dailyTransactions.value.forEach((trx: any) => {
    csvContent += `"${trx.id}","${formatTimeOnly(trx.createdAt)}","${trx.cashier?.name || ''}","${trx.paymentMethod}",${trx.total}\n`
  })

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `Laporan-Harian-${selectedDate.value}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toast.success('Berhasil mengunduh CSV Laporan Harian')
}
</script>

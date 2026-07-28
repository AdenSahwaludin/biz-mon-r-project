<template>
  <div>
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-500">Memuat dashboard...</p>
    </div>

    <template v-else>
      <!-- Stat Cards (Identical to Laporan Harian) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Total Omzet -->
        <div class="bg-white rounded-xl border border-primary-200 p-5 shadow-2xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-primary-700 uppercase tracking-wider">Total Omzet</span>
            <div class="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <Coins class="w-4 h-4" />
            </div>
          </div>
          <p class="text-xl font-bold text-gray-900">{{ fmt.format(summary.totalOmzet || summary.daily || 0) }}</p>
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
          <p class="text-xl font-bold text-emerald-950">{{ fmt.format(summary.cashRevenue || 0) }}</p>
          <p class="text-xs text-emerald-600 mt-1 font-medium">{{ cashCount }} Transaksi Tunai</p>
        </div>

        <!-- Pendapatan QRIS -->
        <div class="bg-white rounded-xl border border-blue-200 bg-blue-50/20 p-5 shadow-2xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-blue-700 uppercase tracking-wider">Pendapatan QRIS</span>
            <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <QrCode class="w-4 h-4" />
            </div>
          </div>
          <p class="text-xl font-bold text-blue-950">{{ fmt.format(summary.qrisRevenue || 0) }}</p>
          <p class="text-xs text-blue-600 mt-1 font-medium">{{ qrisCount }} Transaksi QRIS</p>
        </div>

        <!-- Total Transaksi -->
        <div class="bg-white rounded-xl border border-purple-200 bg-purple-50/20 p-5 shadow-2xs">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-purple-700 uppercase tracking-wider">Total Transaksi</span>
            <div class="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Receipt class="w-4 h-4" />
            </div>
          </div>
          <p class="text-xl font-bold text-purple-950">{{ summary.transactionCount || 0 }} Transaksi</p>
          <p class="text-xs text-purple-600 mt-1 font-medium">Transaksi Berhasil Diproses</p>
        </div>
      </div>

      <!-- Chart + Top Products -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <!-- Chart -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-2xs">
          <h3 class="text-base font-bold text-gray-900 mb-4">Tren Penjualan (Harian)</h3>
          <div class="h-64">
            <Bar v-if="chartData.labels.length" :data="chartData" :options="chartOptions" />
            <div v-else class="h-full flex items-center justify-center text-gray-400">
              Belum ada data penjualan.
            </div>
          </div>
        </div>

        <!-- Top Products -->
        <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs">
          <h3 class="text-base font-bold text-gray-900 mb-4">Produk Terlaris</h3>
          <div v-if="topBestSellers.length > 0" class="space-y-3">
            <div v-for="(prod, i) in topBestSellers" :key="prod.id || prod.name" class="flex items-center gap-3">
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                :class="i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400'"
              >
                {{ i + 1 }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate">{{ prod.name }}</p>
                <p class="text-xs text-gray-500 font-medium">{{ prod.qty || prod.totalSold || 0 }} item terjual</p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-400 text-sm">
            Belum ada penjualan.
          </div>
        </div>
      </div>

      <!-- Recent Transactions (With Payment Method Column) -->
      <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-gray-900">Transaksi Terbaru</h3>
          <NuxtLink to="/transaksi/riwayat" class="text-xs font-bold text-primary-600 hover:text-primary-700">
            Lihat Semua →
          </NuxtLink>
        </div>

        <!-- Desktop Table -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200 bg-gray-50/80">
                <th class="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Waktu</th>
                <th class="text-left text-xs font-semibold text-gray-500 uppercase py-3 px-4">Kasir</th>
                <th class="text-center text-xs font-semibold text-gray-500 uppercase py-3 px-4">Pembayaran</th>
                <th class="text-right text-xs font-semibold text-gray-500 uppercase py-3 px-4">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="trx in recentTransactions"
                :key="trx.id"
                @click="navigateTo(`/riwayat-transaksi/${encodeURIComponent(trx.id)}`)"
                class="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td class="py-3 px-4 text-sm font-semibold text-gray-900">{{ fmt.formatDateTime(trx.createdAt) }}</td>
                <td class="py-3 px-4 text-sm text-gray-700 font-medium">{{ trx.cashier?.name || '—' }}</td>
                <td class="py-3 px-4 text-center">
                  <span
                    class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold"
                    :class="trx.paymentMethod === 'QRIS' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'"
                  >
                    {{ trx.paymentMethod === 'QRIS' ? 'QRIS' : 'Tunai' }}
                  </span>
                </td>
                <td class="py-3 px-4 text-sm text-gray-900 font-bold text-right">{{ fmt.format(trx.total) }}</td>
              </tr>
              <tr v-if="!recentTransactions.length">
                <td colspan="4" class="py-8 text-center text-gray-500 text-sm">Belum ada transaksi.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="sm:hidden space-y-3">
          <div
            v-for="trx in recentTransactions"
            :key="trx.id"
            @click="navigateTo(`/riwayat-transaksi/${encodeURIComponent(trx.id)}`)"
            class="p-3.5 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-gray-900">{{ fmt.formatDateTime(trx.createdAt) }}</span>
              <span class="text-sm font-black text-gray-900">{{ fmt.format(trx.total) }}</span>
            </div>
            <div class="flex items-center justify-between text-xs text-gray-500 mt-1">
              <span>Kasir: {{ trx.cashier?.name || '—' }}</span>
              <span :class="trx.paymentMethod === 'QRIS' ? 'text-blue-600 font-bold' : 'text-emerald-600 font-bold'">
                {{ trx.paymentMethod === 'QRIS' ? 'QRIS' : 'Tunai' }}
              </span>
            </div>
          </div>
          <div v-if="!recentTransactions.length" class="text-center py-6 text-gray-500 text-sm border border-gray-100 rounded-lg">
            Belum ada transaksi.
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
import { Coins, Banknote, QrCode, Receipt } from 'lucide-vue-next'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const bizStore = useBusinessStore()
const fmt = useFormatCurrency()
const { fetchWithCache } = useCachedFetch()
const toast = useToastStore()

const isLoading = ref(false)

const summary = ref<any>({})
const timeseries = ref<any[]>([])
const bestSellers = ref<any[]>([])
const recentTransactions = ref<any[]>([])

function getHexColor(colorStr?: string) {
  if (!colorStr) return '#3B82F6'
  if (colorStr.startsWith('#')) return colorStr
  if (colorStr.includes('orange')) return '#F97316'
  if (colorStr.includes('amber')) return '#F59E0B'
  if (colorStr.includes('rose')) return '#F43F5E'
  if (colorStr.includes('emerald')) return '#10B981'
  if (colorStr.includes('blue')) return '#3B82F6'
  if (colorStr.includes('purple') || colorStr.includes('violet')) return '#8B5CF6'
  if (colorStr.includes('pink')) return '#EC4899'
  if (colorStr.includes('cyan')) return '#06B6D4'
  if (colorStr.includes('indigo')) return '#6366F1'
  return colorStr
}

const chartData = computed(() => {
  const hexColor = getHexColor(bizStore.activeBusiness?.color)
  const recentDays = timeseries.value.slice(-7)
  
  return {
    labels: recentDays.map((d: any) => fmt.formatDateShort(d.tanggal)),
    datasets: [
      {
        label: 'Omzet',
        data: recentDays.map((d: any) => d.omzet),
        backgroundColor: hexColor + 'D9',
        hoverBackgroundColor: hexColor,
        borderColor: hexColor,
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  }
})

onMounted(async () => {
  if (bizStore.businesses.length === 0) {
    await bizStore.fetchAll()
  }
  await fetchDashboardData()
})

const cashCount = computed(() => {
  if (summary.value.cashCount !== undefined) return summary.value.cashCount
  return Math.round((summary.value.transactionCount || 0) * 0.6)
})

const qrisCount = computed(() => {
  if (summary.value.qrisCount !== undefined) return summary.value.qrisCount
  return Math.max(0, (summary.value.transactionCount || 0) - cashCount.value)
})

const topBestSellers = computed(() => bestSellers.value.slice(0, 5))

watch(() => bizStore.activeBranchId, async () => {
  await fetchDashboardData(true)
})

async function fetchDashboardData(forceRefresh = false) {
  const branchId = bizStore.activeBranchId
  const queryParam = branchId ? `?branchId=${branchId}` : ''

  if (!timeseries.value.length && !forceRefresh) {
    isLoading.value = true
  }

  try {
    const [omzetRes, sellersRes, trxRes] = await Promise.all([
      fetchWithCache<any>(`/reports/omzet${queryParam}`, {
        forceRefresh,
        onRevalidated: (fresh) => {
          if (fresh.success) {
            summary.value = fresh.data.summary || {}
            timeseries.value = fresh.data.timeseries || []
          }
        }
      }),
      fetchWithCache<any>(`/reports/best-sellers${queryParam}`, {
        forceRefresh,
        onRevalidated: (fresh) => {
          if (fresh.success) bestSellers.value = fresh.data || []
        }
      }),
      fetchWithCache<any>(`/transactions${queryParam}&limit=5`, {
        forceRefresh,
        onRevalidated: (fresh) => {
          if (fresh.success) recentTransactions.value = fresh.data || []
        }
      })
    ])

    if (omzetRes.data?.success) {
      summary.value = omzetRes.data.data.summary || {}
      timeseries.value = omzetRes.data.data.timeseries || []
    }
    if (sellersRes.data?.success) {
      bestSellers.value = sellersRes.data.data || []
    }
    if (trxRes.data?.success) {
      recentTransactions.value = trxRes.data.data || []
    }
  } catch (e) {
    toast.error('Gagal memuat dashboard')
  } finally {
    isLoading.value = false
  }
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => fmt.format(ctx.raw),
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: any) => fmt.formatShort(value),
      },
      grid: { color: '#f3f4f6' },
    },
    x: {
      grid: { display: false },
    },
  },
}
</script>

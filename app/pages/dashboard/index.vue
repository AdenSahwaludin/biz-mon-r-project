<template>
  <div>
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-500">Memuat dashboard...</p>
    </div>

    <template v-else>
      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div v-for="stat in stats" :key="stat.label" class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-3">
            <component :is="stat.icon" class="w-6 h-6 text-gray-500" />
            <span
              v-if="stat.change !== undefined"
              class="text-xs font-medium px-2 py-0.5 rounded-full"
              :class="stat.change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
            >
              {{ stat.change >= 0 ? '▲' : '▼' }} {{ Math.abs(stat.change) }}%
            </span>
          </div>
          <p class="text-sm text-gray-500 mb-1">{{ stat.label }}</p>
          <p class="text-xl font-bold text-gray-900">{{ stat.value }}</p>
        </div>
      </div>

      <!-- Chart + Top Products -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <!-- Chart -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 class="text-base font-semibold text-gray-900 mb-4">Tren Penjualan (Harian)</h3>
          <div class="h-64">
            <Bar v-if="chartData.labels.length" :data="chartData" :options="chartOptions" />
            <div v-else class="h-full flex items-center justify-center text-gray-400">
              Belum ada data penjualan.
            </div>
          </div>
        </div>

        <!-- Top Products -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h3 class="text-base font-semibold text-gray-900 mb-4">Produk Terlaris</h3>
          <div v-if="bestSellers.length > 0" class="space-y-3">
            <div v-for="(prod, i) in bestSellers" :key="prod.id" class="flex items-center gap-3">
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                :class="i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400'"
              >
                {{ i + 1 }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ prod.name }}</p>
                <p class="text-xs text-gray-400">{{ prod.totalSold }} terjual</p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-400 text-sm">
            Belum ada penjualan.
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold text-gray-900">Transaksi Terbaru</h3>
          <NuxtLink to="/transaksi/riwayat" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Lihat Semua →
          </NuxtLink>
        </div>

        <!-- Desktop Table -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">ID</th>
                <th class="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Waktu</th>
                <th class="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Kasir</th>
                <th class="text-right text-xs font-medium text-gray-500 uppercase py-3 px-4">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="trx in recentTransactions"
                :key="trx.id"
                @click="navigateTo(`/transaksi/${trx.id}`)"
                class="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td class="py-3 px-4 text-sm font-medium text-primary-600">{{ trx.id }}</td>
                <td class="py-3 px-4 text-sm text-gray-600">{{ fmt.formatDateTime(trx.createdAt) }}</td>
                <td class="py-3 px-4 text-sm text-gray-600">{{ trx.cashier?.name }}</td>
                <td class="py-3 px-4 text-sm text-gray-900 font-medium text-right">{{ fmt.format(trx.total) }}</td>
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
            @click="navigateTo(`/transaksi/${trx.id}`)"
            class="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-primary-600">{{ trx.id }}</span>
              <span class="text-sm font-semibold text-gray-900">{{ fmt.format(trx.total) }}</span>
            </div>
            <p class="text-xs text-gray-500">{{ fmt.formatDateTime(trx.createdAt) }} · {{ trx.cashier?.name }}</p>
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
import { ref, computed, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Coins, Calendar, CalendarDays, Receipt } from 'lucide-vue-next'

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
  if (!colorStr) return '#4F46E5'
  if (colorStr.includes('orange')) return '#EA580C'
  if (colorStr.includes('amber')) return '#D97706'
  if (colorStr.includes('rose')) return '#E11D48'
  if (colorStr.includes('emerald')) return '#059669'
  if (colorStr.includes('blue')) return '#2563EB'
  return '#4F46E5'
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

const stats = computed(() => {
  return [
    { icon: Coins, label: 'Omzet Hari Ini', value: fmt.format(summary.value.daily || 0) },
    { icon: Calendar, label: 'Omzet 7 Hari', value: fmt.format(summary.value.weekly || 0) },
    { icon: CalendarDays, label: 'Omzet 30 Hari', value: fmt.format(summary.value.monthly || 0) },
    { icon: Receipt, label: 'Total Transaksi', value: (summary.value.transactionCount || 0).toString() },
  ]
})

watch(() => bizStore.activeBranchId, async () => {
  await fetchDashboardData()
})

async function fetchDashboardData() {
  const branchId = bizStore.activeBranchId
  const queryParam = branchId ? `?branchId=${branchId}` : ''

  if (!timeseries.value.length) {
    isLoading.value = true
  }

  try {
    const [omzetRes, sellersRes, trxRes] = await Promise.all([
      fetchWithCache<any>(`/reports/omzet${queryParam}`, {
        forceRefresh: true,
        onRevalidated: (fresh) => {
          if (fresh.success) {
            summary.value = fresh.data.summary || {}
            timeseries.value = fresh.data.timeseries || []
          }
        }
      }),
      fetchWithCache<any>(`/reports/best-sellers${queryParam}`, {
        forceRefresh: true,
        onRevalidated: (fresh) => {
          if (fresh.success) bestSellers.value = fresh.data || []
        }
      }),
      fetchWithCache<any>(`/transactions${queryParam}&limit=5`, {
        forceRefresh: true,
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

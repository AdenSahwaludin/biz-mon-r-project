<template>
  <div>
    <!-- Filters Toolbar -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
      <div class="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
        <!-- Filter Cabang (Default ke Cabang Aktif) -->
        <select v-model="filterBranchId" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white">
          <option value="">Semua Cabang</option>
          <optgroup v-for="biz in businessList" :key="biz.id" :label="biz.name">
            <option v-for="branch in biz.branches" :key="branch.id" :value="branch.id">
              {{ biz.name }} - {{ branch.name }}
            </option>
          </optgroup>
        </select>

        <!-- Filter Periode Waktu -->
        <select v-model="filterPeriod" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white">
          <option value="all">Semua Data (Bulan Ini)</option>
          <option value="today">Hari Ini</option>
          <option value="7days">7 Hari Terakhir</option>
          <option value="30days">30 Hari Terakhir</option>
          <option value="month">Bulan Ini</option>
          <option value="custom">Kustom Tanggal</option>
        </select>

        <!-- Filter Metode Pembayaran (Hanya Tunai & QRIS) -->
        <select v-model="filterPaymentMethod" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white">
          <option value="">Semua Metode Pembayaran</option>
          <option value="Tunai">Tunai</option>
          <option value="QRIS">QRIS</option>
        </select>
      </div>

      <!-- Custom Date Range Picker -->
      <Transition name="fade">
        <div v-if="filterPeriod === 'custom'" class="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-gray-100">
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <span class="text-xs text-gray-500 font-medium whitespace-nowrap">Dari:</span>
            <input
              v-model="startDate"
              type="date"
              class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white w-full sm:w-auto"
            />
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <span class="text-xs text-gray-500 font-medium whitespace-nowrap">Sampai:</span>
            <input
              v-model="endDate"
              type="date"
              class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white w-full sm:w-auto"
            />
          </div>
          <button
            v-if="startDate || endDate"
            @click="startDate = ''; endDate = ''"
            class="text-xs text-gray-500 hover:text-red-500 font-medium underline"
          >
            Reset Tanggal
          </button>
        </div>
      </Transition>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-500">Memuat laporan...</p>
    </div>

    <template v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <p class="text-sm text-gray-500 mb-1">Total Omzet</p>
          <p class="text-2xl font-bold text-gray-900">{{ fmt.format(filteredSummary.totalOmzet) }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <p class="text-sm text-gray-500 mb-1">Jumlah Transaksi</p>
          <p class="text-2xl font-bold text-gray-900">{{ filteredSummary.transactionCount }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <p class="text-sm text-gray-500 mb-1">Rata-rata per Transaksi</p>
          <p class="text-2xl font-bold text-gray-900">{{ fmt.format(rataRata) }}</p>
        </div>
      </div>

      <!-- Chart Card -->
      <div class="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold text-gray-900">Tren Penjualan</h3>
          <div class="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            <button @click="chartMode = 'omzet'" class="px-3 py-1 text-xs font-medium rounded-md transition-colors" :class="chartMode === 'omzet' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'">Omzet</button>
            <button @click="chartMode = 'transaksi'" class="px-3 py-1 text-xs font-medium rounded-md transition-colors" :class="chartMode === 'transaksi' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'">Transaksi</button>
          </div>
        </div>
        <div class="h-64">
          <Line v-if="lineChartData.labels.length" :data="lineChartData" :options="lineChartOptions" />
          <div v-else class="h-full flex items-center justify-center text-gray-400">
            Belum ada data untuk ditampilkan.
          </div>
        </div>
      </div>

      <!-- Detail Table Section with Moved Omzet Sort Filter -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <div class="p-4 sm:p-5 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 class="text-base font-semibold text-gray-900">Detail Laporan Harian</h3>
          
          <div class="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            <!-- Filter Omzet / Sorting Dipindahkan ke Sini -->
            <select v-model="detailSortBy" class="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium outline-none bg-white focus:ring-2 focus:ring-primary-500">
              <option value="newest">Tanggal Terbaru</option>
              <option value="oldest">Tanggal Terlama</option>
              <option value="highest">Omzet Tertinggi</option>
              <option value="lowest">Omzet Terendah</option>
            </select>

            <div class="flex gap-2">
              <button @click="exportReport('pdf')" class="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Export PDF</button>
              <button @click="exportReport('csv')" class="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Export CSV</button>
            </div>
          </div>
        </div>

        <!-- Desktop Table -->
        <table class="w-full hidden sm:table">
          <thead>
            <tr class="bg-gray-50">
              <th class="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Tanggal</th>
              <th class="text-center text-xs font-medium text-gray-500 uppercase py-3 px-4">Transaksi</th>
              <th class="text-right text-xs font-medium text-gray-500 uppercase py-3 px-4">Omzet</th>
              <th class="text-right text-xs font-medium text-gray-500 uppercase py-3 px-4">Rata-rata</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in sortedReportData" :key="row.tanggal" class="border-t border-gray-50 hover:bg-gray-50">
              <td class="py-3 px-4 text-sm text-gray-700 font-medium">{{ fmt.formatDate(row.tanggal) }}</td>
              <td class="py-3 px-4 text-sm text-gray-700 text-center font-medium">{{ row.transaksi }}</td>
              <td class="py-3 px-4 text-sm font-bold text-gray-900 text-right">{{ fmt.format(row.omzet) }}</td>
              <td class="py-3 px-4 text-sm text-gray-700 text-right">{{ fmt.format(row.transaksi > 0 ? Math.round(row.omzet / row.transaksi) : 0) }}</td>
            </tr>
            <tr v-if="!sortedReportData.length">
              <td colspan="4" class="py-6 text-center text-gray-500 text-sm">Tidak ada data transaksi yang sesuai filter.</td>
            </tr>
          </tbody>
        </table>

        <!-- Mobile View -->
        <div class="sm:hidden divide-y divide-gray-100">
          <div v-for="row in sortedReportData" :key="row.tanggal" class="p-4">
            <p class="text-sm font-medium text-gray-900">{{ fmt.formatDate(row.tanggal) }}</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-xs text-gray-500">{{ row.transaksi }} transaksi</span>
              <span class="text-sm font-semibold text-gray-900">{{ fmt.format(row.omzet) }}</span>
            </div>
          </div>
          <div v-if="!sortedReportData.length" class="p-4 text-center text-gray-500 text-sm">
            Tidak ada data transaksi yang sesuai filter.
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const bizStore = useBusinessStore()
const businessList = computed(() => bizStore.groupedBusinesses)

const fmt = useFormatCurrency()
const toast = useToastStore()
const { fetchWithCache } = useCachedFetch()

// Default branch filter matches active branch selected in header
const filterBranchId = ref(bizStore.activeBranchId || '')
const filterPeriod = ref('all')
const startDate = ref('')
const endDate = ref('')
const filterPaymentMethod = ref('')
const detailSortBy = ref('newest')

const chartMode = ref<'omzet' | 'transaksi'>('omzet')
const isLoading = ref(false)

const rawReportData = ref<any[]>([])

onMounted(async () => {
  if (businessList.value.length === 0) {
    await bizStore.fetchAll()
  }
  if (!filterBranchId.value && bizStore.activeBranchId) {
    filterBranchId.value = bizStore.activeBranchId
  }
  await fetchReport()
})

watch([filterBranchId, filterPaymentMethod], async () => {
  await fetchReport()
})

watch(() => bizStore.activeBranchId, async (newBranch) => {
  if (newBranch) {
    filterBranchId.value = newBranch
    await fetchReport()
  }
})

async function fetchReport() {
  if (!rawReportData.value.length) {
    isLoading.value = true
  }
  try {
    const activeB = filterBranchId.value
    let url = activeB ? `/reports/omzet?branchId=${activeB}` : `/reports/omzet`
    if (filterPaymentMethod.value) {
      url += (url.includes('?') ? '&' : '?') + `paymentMethod=${filterPaymentMethod.value}`
    }

    const res = await fetchWithCache<any>(url, {
      forceRefresh: true,
      onRevalidated: (fresh) => {
        if (fresh.success) {
          rawReportData.value = fresh.data.timeseries || []
        }
      }
    })
    
    if (res.data?.success) {
      rawReportData.value = res.data.data.timeseries || []
    }
  } catch (error) {
    toast.error('Gagal memuat laporan')
  } finally {
    isLoading.value = false
  }
}

const filteredReportData = computed(() => {
  let list = [...rawReportData.value]

  // Filter Periode
  if (filterPeriod.value !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

    if (filterPeriod.value === 'custom') {
      if (startDate.value) {
        const startMs = new Date(startDate.value + 'T00:00:00').getTime()
        list = list.filter((r) => new Date(r.tanggal).getTime() >= startMs)
      }
      if (endDate.value) {
        const endMs = new Date(endDate.value + 'T23:59:59').getTime()
        list = list.filter((r) => new Date(r.tanggal).getTime() <= endMs)
      }
    } else {
      list = list.filter((r) => {
        const rowTime = new Date(r.tanggal).getTime()
        if (filterPeriod.value === 'today') {
          return rowTime >= today
        } else if (filterPeriod.value === '7days') {
          return rowTime >= (today - 7 * 24 * 60 * 60 * 1000)
        } else if (filterPeriod.value === '30days') {
          return rowTime >= (today - 30 * 24 * 60 * 60 * 1000)
        } else if (filterPeriod.value === 'month') {
          const rowDate = new Date(r.tanggal)
          return rowDate.getMonth() === now.getMonth() && rowDate.getFullYear() === now.getFullYear()
        }
        return true
      })
    }
  }

  return list
})

const sortedReportData = computed(() => {
  let list = [...filteredReportData.value]

  if (detailSortBy.value === 'newest') {
    list.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
  } else if (detailSortBy.value === 'oldest') {
    list.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
  } else if (detailSortBy.value === 'highest') {
    list.sort((a, b) => b.omzet - a.omzet)
  } else if (detailSortBy.value === 'lowest') {
    list.sort((a, b) => a.omzet - b.omzet)
  }

  return list
})

const filteredSummary = computed(() => {
  const totalOmzet = filteredReportData.value.reduce((acc, curr) => acc + (curr.omzet || 0), 0)
  const transactionCount = filteredReportData.value.reduce((acc, curr) => acc + (curr.transaksi || 0), 0)
  return { totalOmzet, transactionCount }
})

const rataRata = computed(() => filteredSummary.value.transactionCount ? Math.round(filteredSummary.value.totalOmzet / filteredSummary.value.transactionCount) : 0)

function getHexColor(colorStr?: string) {
  if (!colorStr) return '#4F46E5'
  if (colorStr.includes('orange')) return '#EA580C'
  if (colorStr.includes('amber')) return '#D97706'
  if (colorStr.includes('rose')) return '#E11D48'
  if (colorStr.includes('emerald')) return '#059669'
  if (colorStr.includes('blue')) return '#2563EB'
  return '#4F46E5'
}

const lineChartData = computed(() => {
  const themeColor = getHexColor(bizStore.activeBusiness?.color)
  // Re-sort chronologically for chart display
  const chronological = [...filteredReportData.value].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())

  return {
    labels: chronological.map((r) => fmt.formatDateShort(r.tanggal)),
    datasets: [
      {
        label: chartMode.value === 'omzet' ? 'Omzet' : 'Transaksi',
        data: chronological.map((r) => chartMode.value === 'omzet' ? r.omzet : r.transaksi),
        borderColor: themeColor,
        backgroundColor: themeColor + '20',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: themeColor,
      },
    ],
  }
})

const lineChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => chartMode.value === 'omzet' ? fmt.format(ctx.raw) : `${ctx.raw} transaksi`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: any) => chartMode.value === 'omzet' ? fmt.formatShort(value) : value,
      },
      grid: { color: '#f3f4f6' },
    },
    x: { grid: { display: false } },
  },
}))

function exportReport(type: string) {
  toast.success(`Fitur Export ${type.toUpperCase()} akan segera hadir`)
}
</script>

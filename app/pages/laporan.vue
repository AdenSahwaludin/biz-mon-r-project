<template>
  <div>
    <!-- Filters -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <div class="flex flex-col sm:flex-row gap-3 items-stretch">
        <select v-model="filterBranchId" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">Semua Cabang</option>
          <optgroup v-for="biz in businessList" :key="biz.id" :label="biz.name">
            <option v-for="branch in biz.branches" :key="branch.id" :value="branch.id">
              {{ branch.name }}
            </option>
          </optgroup>
        </select>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-500">Memuat laporan...</p>
    </div>

    <template v-else>
      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <p class="text-sm text-gray-500 mb-1">Total Omzet</p>
          <p class="text-2xl font-bold text-gray-900">{{ fmt.format(summary.totalOmzet || 0) }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <p class="text-sm text-gray-500 mb-1">Jumlah Transaksi</p>
          <p class="text-2xl font-bold text-gray-900">{{ summary.transactionCount || 0 }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <p class="text-sm text-gray-500 mb-1">Rata-rata per Transaksi</p>
          <p class="text-2xl font-bold text-gray-900">{{ fmt.format(rataRata) }}</p>
        </div>
      </div>

      <!-- Chart -->
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

      <!-- Detail Table -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <div class="p-5 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">Detail Laporan</h3>
          <div class="flex gap-2">
            <button @click="exportReport('pdf')" class="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Export PDF</button>
            <button @click="exportReport('csv')" class="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Export CSV</button>
          </div>
        </div>

        <!-- Desktop -->
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
            <tr v-for="row in reportData" :key="row.tanggal" class="border-t border-gray-50 hover:bg-gray-50">
              <td class="py-3 px-4 text-sm text-gray-700">{{ fmt.formatDate(row.tanggal) }}</td>
              <td class="py-3 px-4 text-sm text-gray-700 text-center">{{ row.transaksi }}</td>
              <td class="py-3 px-4 text-sm font-medium text-gray-900 text-right">{{ fmt.format(row.omzet) }}</td>
              <td class="py-3 px-4 text-sm text-gray-700 text-right">{{ fmt.format(Math.round(row.omzet / row.transaksi)) }}</td>
            </tr>
            <tr v-if="!reportData.length">
              <td colspan="4" class="py-6 text-center text-gray-500 text-sm">Tidak ada data transaksi.</td>
            </tr>
          </tbody>
        </table>

        <!-- Mobile -->
        <div class="sm:hidden divide-y divide-gray-100">
          <div v-for="row in reportData" :key="row.tanggal" class="p-4">
            <p class="text-sm font-medium text-gray-900">{{ fmt.formatDate(row.tanggal) }}</p>
            <div class="flex items-center justify-between mt-1">
              <span class="text-xs text-gray-500">{{ row.transaksi }} transaksi</span>
              <span class="text-sm font-semibold text-gray-900">{{ fmt.format(row.omzet) }}</span>
            </div>
          </div>
          <div v-if="!reportData.length" class="p-4 text-center text-gray-500 text-sm">
            Tidak ada data transaksi.
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
const bizStore = useBusinessStore()
const businessList = computed(() => bizStore.groupedBusinesses)

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const fmt = useFormatCurrency()
const toast = useToastStore()
const { fetchWithAuth } = useApi()

const filterBranchId = ref('')
const chartMode = ref<'omzet' | 'transaksi'>('omzet')
const isLoading = ref(false)

const reportData = ref<any[]>([])
const summary = ref<any>({})

onMounted(async () => {
  if (businessList.value.length === 0) {
    await bizStore.fetchAll()
  }
  await fetchReport()
})

watch(filterBranchId, async () => {
  await fetchReport()
})

async function fetchReport() {
  isLoading.value = true
  try {
    const url = filterBranchId.value ? `/reports/omzet?branchId=${filterBranchId.value}` : `/reports/omzet`
    const res = await fetchWithAuth<any>(url)
    
    if (res.success) {
      summary.value = res.data.summary || {}
      reportData.value = res.data.timeseries || []
    }
  } catch (error) {
    toast.error('Gagal memuat laporan')
  } finally {
    isLoading.value = false
  }
}

const rataRata = computed(() => summary.value.transactionCount ? Math.round(summary.value.totalOmzet / summary.value.transactionCount) : 0)

const lineChartData = computed(() => ({
  labels: reportData.value.map((r) => fmt.formatDateShort(r.tanggal)),
  datasets: [
    {
      label: chartMode.value === 'omzet' ? 'Omzet' : 'Transaksi',
      data: reportData.value.map((r) => chartMode.value === 'omzet' ? r.omzet : r.transaksi),
      borderColor: '#4F46E5',
      backgroundColor: '#4F46E520',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#4F46E5',
    },
  ],
}))

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

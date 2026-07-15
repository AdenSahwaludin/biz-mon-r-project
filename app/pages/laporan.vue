<template>
  <div>
    <!-- Filters -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <div class="flex flex-col sm:flex-row gap-3 items-stretch">
        <select v-model="filterBisnis" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">Semua Bisnis</option>
          <option v-for="b in businessList" :key="b.slug" :value="b.nama">{{ b.nama }}</option>
        </select>
        <select v-model="filterPeriode" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="harian">Harian</option>
          <option value="mingguan">Mingguan</option>
          <option value="bulanan">Bulanan</option>
        </select>
        <div class="flex gap-2 flex-1">
          <input v-model="dateFrom" type="date" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          <input v-model="dateTo" type="date" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-sm text-gray-500 mb-1">Total Omzet</p>
        <p class="text-2xl font-bold text-gray-900">{{ fmt.format(totalOmzet) }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-sm text-gray-500 mb-1">Jumlah Transaksi</p>
        <p class="text-2xl font-bold text-gray-900">{{ totalTransaksi }}</p>
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
        <Line :data="lineChartData" :options="lineChartOptions" />
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
            <td class="py-3 px-4 text-sm text-gray-700 text-right">{{ fmt.format(row.rata_rata) }}</td>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { businessList } from '~/data/dashboard'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const fmt = useFormatCurrency()
const toast = useToastStore()

const filterBisnis = ref('')
const filterPeriode = ref('harian')
const dateFrom = ref('2026-07-09')
const dateTo = ref('2026-07-15')
const chartMode = ref<'omzet' | 'transaksi'>('omzet')

const reportData = ref([
  { tanggal: '2026-07-09', transaksi: 25, omzet: 680000, rata_rata: 27200 },
  { tanggal: '2026-07-10', transaksi: 28, omzet: 720000, rata_rata: 25714 },
  { tanggal: '2026-07-11', transaksi: 22, omzet: 550000, rata_rata: 25000 },
  { tanggal: '2026-07-12', transaksi: 35, omzet: 890000, rata_rata: 25429 },
  { tanggal: '2026-07-13', transaksi: 30, omzet: 760000, rata_rata: 25333 },
  { tanggal: '2026-07-14', transaksi: 33, omzet: 830000, rata_rata: 25152 },
  { tanggal: '2026-07-15', transaksi: 32, omzet: 850000, rata_rata: 26563 },
])

const totalOmzet = computed(() => reportData.value.reduce((s, r) => s + r.omzet, 0))
const totalTransaksi = computed(() => reportData.value.reduce((s, r) => s + r.transaksi, 0))
const rataRata = computed(() => totalTransaksi.value ? Math.round(totalOmzet.value / totalTransaksi.value) : 0)

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

const lineChartOptions = {
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
}

function exportReport(type: string) {
  toast.success(`Laporan ${type.toUpperCase()} berhasil diunduh`)
}
</script>

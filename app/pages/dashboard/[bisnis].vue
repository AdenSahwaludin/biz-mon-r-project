<template>
  <div>
    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <div v-for="stat in stats" :key="stat.label" class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-3">
          <component :is="stat.icon" class="w-6 h-6 text-gray-500" />
          <span
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
        <h3 class="text-base font-semibold text-gray-900 mb-4">Grafik Penjualan 7 Hari Terakhir</h3>
        <div class="h-64">
          <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Top Products -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-base font-semibold text-gray-900 mb-4">Produk Terlaris</h3>
        <div class="space-y-3">
          <div v-for="(prod, i) in data?.produk_terlaris" :key="prod.nama" class="flex items-center gap-3">
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              :class="i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400'"
            >
              {{ i + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ prod.nama }}</p>
              <p class="text-xs text-gray-400">{{ prod.terjual }} terjual</p>
            </div>
          </div>
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
              <th class="text-center text-xs font-medium text-gray-500 uppercase py-3 px-4">Status</th>
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
              <td class="py-3 px-4 text-sm text-gray-600">{{ fmt.formatDateTime(trx.tanggal) }}</td>
              <td class="py-3 px-4 text-sm text-gray-600">{{ trx.kasir }}</td>
              <td class="py-3 px-4 text-sm text-gray-900 font-medium text-right">{{ fmt.format(trx.total) }}</td>
              <td class="py-3 px-4 text-center">
                <span
                  class="text-xs font-medium px-2 py-0.5 rounded-full"
                  :class="trx.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                >
                  {{ trx.status }}
                </span>
              </td>
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
            <span
              class="text-xs font-medium px-2 py-0.5 rounded-full"
              :class="trx.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
            >{{ trx.status }}</span>
          </div>
          <p class="text-xs text-gray-500">{{ fmt.formatDateTime(trx.tanggal) }} · {{ trx.kasir }}</p>
          <p class="text-sm font-semibold text-gray-900 mt-1">{{ fmt.format(trx.total) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { dashboardData } from '~/data/dashboard'
import { transactions } from '~/data/transactions'
import { Coins, Calendar, CalendarDays, Receipt } from 'lucide-vue-next'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const route = useRoute()
const bizStore = useBusinessStore()
const fmt = useFormatCurrency()

const bisnis = computed(() => route.params.bisnis as string)

// Set active business
watchEffect(() => {
  if (bisnis.value) {
    bizStore.setBisnis(bisnis.value)
  }
})

const data = computed(() => dashboardData[bisnis.value])

const stats = computed(() => {
  if (!data.value) return []
  return [
    { icon: Coins, label: 'Omzet Hari Ini', value: fmt.format(data.value.omzet_hari_ini), change: data.value.perubahan_omzet_harian },
    { icon: Calendar, label: 'Omzet Minggu Ini', value: fmt.format(data.value.omzet_minggu_ini), change: 8 },
    { icon: CalendarDays, label: 'Omzet Bulan Ini', value: fmt.format(data.value.omzet_bulan_ini), change: 15 },
    { icon: Receipt, label: 'Transaksi Hari Ini', value: data.value.jumlah_transaksi_hari_ini.toString(), change: 5 },
  ]
})

const chartData = computed(() => {
  if (!data.value) return null
  const bizColor = data.value.color
  return {
    labels: data.value.grafik_penjualan_7_hari.map((d) => d.hari),
    datasets: [
      {
        label: 'Omzet',
        data: data.value.grafik_penjualan_7_hari.map((d) => d.omzet),
        backgroundColor: bizColor + '30',
        borderColor: bizColor,
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  }
})

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

const recentTransactions = computed(() => {
  if (!data.value) return []
  return transactions
    .filter((t) => t.bisnis === data.value.bisnis)
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 5)
})
</script>

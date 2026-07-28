<template>
  <div>
    <!-- Filters Toolbar (Responsive Grid) -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        <!-- Filter Cabang -->
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Cabang / Bisnis</label>
          <select v-model="filterBranchId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white">
            <option value="">Semua Cabang</option>
            <optgroup v-for="biz in businessList" :key="biz.id" :label="biz.name">
              <option v-for="branch in biz.branches" :key="branch.id" :value="branch.id">
                {{ biz.name }} - {{ branch.name }}
              </option>
            </optgroup>
          </select>
        </div>

        <!-- Filter Periode Waktu -->
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Periode Tanggal</label>
          <select v-model="filterPeriod" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white font-medium">
            <option value="month">Bulan Ini</option>
            <option value="all">Semua Data</option>
            <option value="today">Hari Ini</option>
            <option value="7days">7 Hari Terakhir</option>
            <option value="30days">30 Hari Terakhir</option>
            <option value="custom">Kustom Tanggal</option>
          </select>
        </div>

        <!-- Filter Metode Pembayaran (Hanya Tunai & QRIS) -->
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Metode Pembayaran</label>
          <select v-model="filterPaymentMethod" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white">
            <option value="">Semua Metode Pembayaran</option>
            <option value="Tunai">Tunai</option>
            <option value="QRIS">QRIS</option>
          </select>
        </div>
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
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Omzet</p>
          <p class="text-2xl font-bold text-gray-900">{{ fmt.format(filteredSummary.totalOmzet) }}</p>
        </div>
        <div class="bg-white rounded-xl border border-emerald-100 bg-emerald-50/20 p-5">
          <p class="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Pendapatan Tunai</p>
          <p class="text-2xl font-bold text-emerald-900">{{ fmt.format(filteredSummary.totalCash) }}</p>
        </div>
        <div class="bg-white rounded-xl border border-blue-100 bg-blue-50/20 p-5">
          <p class="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Pendapatan QRIS</p>
          <p class="text-2xl font-bold text-blue-900">{{ fmt.format(filteredSummary.totalQris) }}</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Transaksi</p>
          <p class="text-2xl font-bold text-gray-900">{{ filteredSummary.transactionCount }}</p>
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

      <!-- Detail Table Section -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <div class="p-4 sm:p-5 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 class="text-base font-semibold text-gray-900">Detail Rekapitulasi Omzet</h3>
          
          <div class="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            <!-- Filter Omzet / Sorting -->
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
const { fetchWithCache } = useCachedFetch()

// Default branch filter matches active branch selected in header
const filterBranchId = ref(bizStore.activeBranchId || '')
const filterPeriod = ref('month')
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
  await fetchReport(true)
})

watch(() => bizStore.activeBranchId, (newBranch) => {
  if (newBranch && filterBranchId.value !== newBranch) {
    filterBranchId.value = newBranch
  }
})

async function fetchReport(forceRefresh = false) {
  if (!rawReportData.value.length && !forceRefresh) {
    isLoading.value = true
  }
  try {
    const activeB = filterBranchId.value
    let url = activeB ? `/reports/omzet?branchId=${activeB}` : `/reports/omzet`
    if (filterPaymentMethod.value) {
      url += (url.includes('?') ? '&' : '?') + `paymentMethod=${filterPaymentMethod.value}`
    }

    const res = await fetchWithCache<any>(url, {
      forceRefresh,
      onRevalidated: (fresh) => {
        if (fresh?.success && fresh.data?.timeseries) {
          rawReportData.value = fresh.data.timeseries || []
        }
      }
    })
    
    if (res.data?.success && res.data.data?.timeseries) {
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
  const totalCash = filteredReportData.value.reduce((acc, curr) => acc + (curr.cash || 0), 0)
  const totalQris = filteredReportData.value.reduce((acc, curr) => acc + (curr.qris || 0), 0)
  const transactionCount = filteredReportData.value.reduce((acc, curr) => acc + (curr.transaksi || 0), 0)
  return { totalOmzet, totalCash, totalQris, transactionCount }
})

const rataRata = computed(() => filteredSummary.value.transactionCount ? Math.round(filteredSummary.value.totalOmzet / filteredSummary.value.transactionCount) : 0)

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

  const dateLabel = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  if (type === 'csv') {
    const headers = ['Tanggal', 'Jumlah Transaksi', 'Total Omzet (Rp)', 'Rata-rata per Transaksi (Rp)']
    const rows = sortedReportData.value.map((row: any) => {
      const avg = row.transaksi > 0 ? Math.round(row.omzet / row.transaksi) : 0
      return [
        `"${fmt.formatDate(row.tanggal)}"`,
        row.transaksi,
        row.omzet,
        avg
      ]
    })

    // UTF-8 BOM \uFEFF and sep=; directive ensures Excel automatically splits into separate columns A, B, C, D
    const csvContent = '\uFEFFsep=;\n' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const dateStr = new Date().toISOString().split('T')[0]
    link.setAttribute('href', url)
    link.setAttribute('download', `Laporan_Penjualan_${activeBranchName.replace(/[\s\/-]+/g, '_')}_${dateStr}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Berhasil mendownload Laporan CSV')
  } else if (type === 'pdf') {
    const printWin = window.open('', '_blank')
    if (!printWin) {
      toast.error('Gagal membuka jendela cetak. Izinkan pop-up browser.')
      return
    }

    const tableRowsHtml = sortedReportData.value.map((row: any, idx: number) => {
      const avg = row.transaksi > 0 ? Math.round(row.omzet / row.transaksi) : 0
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc'
      return `
        <tr style="background-color: ${bg};">
          <td style="padding: 9px 12px; border-bottom: 1px solid #f1f5f9; font-size: 11px; font-weight: 500;">${fmt.formatDate(row.tanggal)}</td>
          <td style="padding: 9px 12px; border-bottom: 1px solid #f1f5f9; font-size: 11px; text-align: center;">${row.transaksi}</td>
          <td style="padding: 9px 12px; border-bottom: 1px solid #f1f5f9; font-size: 11px; text-align: right; font-weight: 600; color: #0f172a;">${fmt.format(row.omzet)}</td>
          <td style="padding: 9px 12px; border-bottom: 1px solid #f1f5f9; font-size: 11px; text-align: right; color: #475569;">${fmt.format(avg)}</td>
        </tr>
      `
    }).join('')

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Penjualan — ${activeBranchName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px 40px; color: #1e293b; background: #ffffff; margin: 0; }
            .brand-line { font-size: 11px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; }
            .title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
            .subtitle { font-size: 13px; color: #64748b; margin: 0; }
            .meta { font-size: 11px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; text-align: right; }
            .stats { display: flex; gap: 16px; margin-bottom: 24px; }
            .stat-card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; }
            .stat-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 6px; }
            .stat-val { font-size: 18px; font-weight: 700; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th { background: #f8fafc; text-align: left; padding: 10px 12px; font-size: 10px; font-weight: 600; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; border-bottom: 1.5px solid #cbd5e1; }
            tfoot tr td { background: #f8fafc; font-weight: 700; border-top: 2px solid #cbd5e1; padding: 10px 12px; font-size: 11px; color: #0f172a; }
            .footer-note { margin-top: 32px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 10px; color: #94a3b8; }
            @media print {
              body { padding: 0; }
              @page { size: A4; margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand-line">PANTAU BISNIS</div>
              <h1 class="title">Laporan Penjualan</h1>
              <p class="subtitle">Cabang: <strong>${activeBranchName}</strong></p>
            </div>
            <div class="meta">
              <p style="margin:0 0 2px;">Tanggal Cetak: <strong>${dateLabel}</strong></p>
              <p style="margin:0;">Status: <strong>Dokumen Resmi</strong></p>
            </div>
          </div>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-label">Total Omzet</div>
              <div class="stat-val">${fmt.format(filteredSummary.value.totalOmzet)}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Jumlah Transaksi</div>
              <div class="stat-val">${filteredSummary.value.transactionCount}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Rata-rata / Transaksi</div>
              <div class="stat-val">${fmt.format(rataRata.value)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th style="text-align: center;">Transaksi</th>
                <th style="text-align: right;">Omzet</th>
                <th style="text-align: right;">Rata-rata</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td>TOTAL PERIODE INI</td>
                <td style="text-align: center;">${filteredSummary.value.transactionCount}</td>
                <td style="text-align: right;">${fmt.format(filteredSummary.value.totalOmzet)}</td>
                <td style="text-align: right;">${fmt.format(rataRata.value)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="footer-note">
            PantauBisnis — System Generated Formal Report · Dicetak pada ${dateLabel}
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
}
</script>

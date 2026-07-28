<template>
  <div class="max-w-2xl mx-auto">
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-500">Memuat detail transaksi...</p>
    </div>

    <div v-else-if="trx" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-900">Detail Transaksi</h2>
          <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">
            Selesai
          </span>
        </div>
        <p class="text-sm font-mono text-primary-600 font-semibold">{{ trx.id }}</p>
      </div>

      <!-- Info -->
      <div class="p-6 border-b border-gray-200 grid grid-cols-2 gap-4">
        <div>
          <p class="text-xs text-gray-400 mb-0.5">Cabang</p>
          <p class="text-sm font-medium text-gray-900">{{ trx.branch.business.name }} - {{ trx.branch.name }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 mb-0.5">Tanggal</p>
          <p class="text-sm font-medium text-gray-900">{{ fmt.formatDateTime(trx.createdAt) }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 mb-0.5">Kasir</p>
          <p class="text-sm font-medium text-gray-900">{{ trx.cashier.name }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 mb-0.5">Metode</p>
          <p class="text-sm font-medium text-gray-900">{{ trx.paymentMethod }}</p>
        </div>
      </div>

      <!-- Items -->
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Item Transaksi</h3>
        <div class="space-y-3">
          <div v-for="item in trx.details" :key="item.id" class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-900">{{ item.product.name }}</p>
              <p class="text-xs text-gray-400">{{ item.qty }} × {{ fmt.format(item.snapshotPrice) }}</p>
            </div>
            <p class="text-sm font-medium text-gray-900">{{ fmt.format(item.subtotal) }}</p>
          </div>
        </div>
      </div>

      <!-- Totals -->
      <div class="p-6 space-y-2">
        <div class="flex justify-between text-base font-bold pt-2 mt-2">
          <span class="text-gray-700">Total Bayar</span>
          <span class="text-primary-600">{{ fmt.format(trx.total) }}</span>
        </div>
      </div>

      <!-- Actions (No Print) -->
      <div class="p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 no-print">
        <button @click="router.push('/riwayat-transaksi')" class="flex-1 py-2.5 px-4 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          ← Kembali
        </button>
        <button v-if="auth.isAdmin" @click="showDeleteModal = true" class="flex-1 py-2.5 px-4 text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1.5">
          <Trash2 class="w-4 h-4" /> Hapus Transaksi
        </button>
        <button @click="printReceipt" class="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center justify-center gap-2">
          <Printer class="w-4 h-4" />
          <span>Cetak Ulang Struk</span>
        </button>
      </div>

      <!-- Thermal Print Area (Only visible during print) -->
      <div id="print-area" class="print-only">
        <div class="print-header">
          <h2>{{ settingsStore.headerStruk || 'PANTAU BISNIS' }}</h2>
          <p v-if="settingsStore.namaToko" class="font-bold">{{ settingsStore.namaToko }} - {{ trx.branch.name }}</p>
          <p v-else class="font-bold">{{ trx.branch.business.name }} - {{ trx.branch.name }}</p>
          <p v-if="settingsStore.alamat">{{ settingsStore.alamat }}</p>
          <p v-if="settingsStore.telepon">Telp: {{ settingsStore.telepon }}</p>
          <div class="divider"></div>
          <p class="reprint-badge">*** CETAK ULANG (DUPLIKAT) ***</p>
          <div class="divider"></div>
        </div>
        <div class="print-info">
          <p>Tgl : {{ fmt.formatDateTime(trx.createdAt) }}</p>
          <p>ID  : {{ trx.id }}</p>
          <p>Ksr : {{ trx.cashier.name }}</p>
          <div class="divider"></div>
        </div>
        <div class="print-items">
          <div v-for="item in trx.details" :key="item.id" class="item-row">
            <p class="item-name">{{ item.product.name }}</p>
            <div class="item-calc">
              <span>{{ item.qty }}x {{ fmt.format(item.snapshotPrice) }}</span>
              <span>{{ fmt.format(item.subtotal) }}</span>
            </div>
          </div>
          <div class="divider"></div>
        </div>
        <div class="print-total">
          <div class="total-row">
            <span>Total:</span>
            <span>{{ fmt.format(trx.total) }}</span>
          </div>
          <div class="total-row">
            <span>Metode:</span>
            <span>{{ trx.paymentMethod }}</span>
          </div>
          <div class="divider"></div>
        </div>
        <div class="print-footer">
          <p>{{ settingsStore.footerStruk || 'Terima kasih atas kunjungan Anda!' }}</p>
          <p class="print-timestamp">Cetak Ulang: {{ fmt.formatDateTime(new Date().toISOString()) }}</p>
        </div>
      </div>
    </div>

    <!-- Not Found (No Print) -->
    <div v-else class="bg-white rounded-xl border border-gray-200 py-16 text-center no-print">
      <Search class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 font-medium">Transaksi tidak ditemukan</p>
      <NuxtLink to="/riwayat-transaksi" class="inline-block mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium">
        ← Kembali ke Riwayat
      </NuxtLink>
    </div>

    <!-- Delete Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl">
            <h3 class="text-lg font-bold text-gray-900 mb-2">Hapus Transaksi</h3>
            <p class="text-sm text-gray-500 mb-5">
              Yakin ingin menghapus transaksi <strong>{{ trx?.id }}</strong>? Stok produk akan dikembalikan otomatis.
            </p>
            <div class="flex gap-3">
              <button @click="showDeleteModal = false" class="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
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
import { ref, onMounted } from 'vue'
import { Search, Trash2, Printer } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const fmt = useFormatCurrency()
const { fetchWithAuth } = useApi()
const toast = useToastStore()
const settingsStore = useSettingsStore()

const isLoading = ref(true)
const isDeleting = ref(false)
const showDeleteModal = ref(false)
const trx = ref<any>(null)

onMounted(async () => {
  const id = route.params.id as string
  try {
    const res = await fetchWithAuth<any>(`/transactions/${id}`)
    if (res.success) {
      trx.value = res.data
    } else {
      toast.error('Transaksi tidak ditemukan')
    }
  } catch (error) {
    toast.error('Gagal memuat transaksi')
  } finally {
    isLoading.value = false
  }
})

function printReceipt() {
  window.print()
}

async function doDelete() {
  if (!trx.value) return
  isDeleting.value = true
  try {
    const res = await fetchWithAuth<any>(`/transactions/${trx.value.id}`, {
      method: 'DELETE'
    })
    if (res.success) {
      toast.success('Transaksi dihapus & stok dikembalikan')
      router.push('/riwayat-transaksi')
    } else {
      toast.error(res.message || 'Gagal menghapus transaksi')
    }
  } catch (e: any) {
    toast.error(e.data?.message || 'Gagal menghapus transaksi')
  } finally {
    isDeleting.value = false
  }
}
</script>

<style>
@media screen {
  .print-only {
    display: none !important;
  }
}

@media print {
  body > * {
    display: none !important;
  }

  .no-print, header, sidebar, aside, nav {
    display: none !important;
  }

  .print-only, #print-area, #print-area * {
    display: block !important;
    visibility: visible !important;
  }

  #print-area {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 58mm !important;
    margin: 0 !important;
    padding: 0 !important;
    font-family: 'Courier New', Courier, monospace !important;
    font-size: 12px !important;
    line-height: 1.3 !important;
    color: #000 !important;
    background: #fff !important;
  }

  .print-header {
    text-align: center !important;
    margin-bottom: 8px !important;
  }

  .print-header h2 {
    font-size: 16px !important;
    font-weight: bold !important;
    margin: 0 !important;
  }

  .reprint-badge {
    text-align: center !important;
    font-weight: bold !important;
    font-size: 12px !important;
    margin: 4px 0 !important;
    display: block !important;
    visibility: visible !important;
  }

  .divider {
    border-top: 1px dashed #000 !important;
    margin: 6px 0 !important;
    display: block !important;
  }

  .print-info p {
    margin: 2px 0 !important;
  }

  .item-row {
    margin-bottom: 6px !important;
  }

  .item-name {
    margin: 0 0 2px !important;
    font-weight: bold !important;
  }

  .item-calc, .total-row {
    display: flex !important;
    justify-content: space-between !important;
  }

  .print-footer {
    text-align: center !important;
    margin-top: 10px !important;
    font-size: 10px !important;
  }

  .print-timestamp {
    font-size: 9px !important;
    margin-top: 4px !important;
  }
}
</style>

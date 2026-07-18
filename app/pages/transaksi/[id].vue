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
        <button @click="$router.back()" class="flex-1 py-2.5 px-4 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          ← Kembali
        </button>
        <button v-if="auth.isAdmin" @click="showDeleteModal = true" class="flex-1 py-2.5 px-4 text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1.5">
          <Trash2 class="w-4 h-4" /> Hapus Transaksi
        </button>
        <button @click="printReceipt" class="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
          Cetak Struk
        </button>
      </div>

      <!-- Thermal Print Area (Hidden on screen) -->
      <div id="print-area" class="hidden">
        <div class="print-header">
          <h2>{{ settingsStore.headerStruk }}</h2>
          <p v-if="settingsStore.namaToko">{{ settingsStore.namaToko }} - {{ trx.branch.name }}</p>
          <p v-else>{{ trx.branch.business.name }} - {{ trx.branch.name }}</p>
          <p v-if="settingsStore.alamat">{{ settingsStore.alamat }}</p>
          <p v-if="settingsStore.telepon">Telp: {{ settingsStore.telepon }}</p>
          <div class="divider"></div>
        </div>
        <div class="print-info">
          <p>Tgl: {{ fmt.formatDateTime(trx.createdAt) }}</p>
          <p>ID: {{ trx.id.split('-')[0] }}</p>
          <p>Ksr: {{ trx.cashier.name }}</p>
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
          <p>{{ settingsStore.footerStruk }}</p>
        </div>
      </div>
    </div>

    <!-- Not Found (No Print) -->
    <div v-else class="bg-white rounded-xl border border-gray-200 py-16 text-center no-print">
      <Search class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 font-medium">Transaksi tidak ditemukan</p>
      <NuxtLink to="/transaksi/riwayat" class="inline-block mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium">
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
import { Search, Trash2 } from 'lucide-vue-next'

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
      router.push('/transaksi/riwayat')
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
@media print {
  body * {
    visibility: hidden;
  }
  #print-area, #print-area * {
    visibility: visible;
  }
  #print-area {
    display: block !important;
    position: absolute;
    left: 0;
    top: 0;
    width: 58mm; /* Standard thermal printer size */
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    color: #000;
  }
  
  .print-header {
    text-align: center;
    margin-bottom: 10px;
  }
  .print-header h2 {
    font-size: 16px;
    font-weight: bold;
    margin: 0;
  }
  .print-header p {
    margin: 2px 0 0;
  }
  
  .divider {
    border-top: 1px dashed #000;
    margin: 8px 0;
  }
  
  .print-info p {
    margin: 2px 0;
  }
  
  .item-row {
    margin-bottom: 6px;
  }
  .item-name {
    margin: 0 0 2px;
  }
  .item-calc {
    display: flex;
    justify-content: space-between;
  }
  
  .total-row {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    margin: 2px 0;
  }
  
  .print-footer {
    text-align: center;
    margin-top: 10px;
  }
}
</style>

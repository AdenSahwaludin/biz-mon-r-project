<template>
  <div class="h-[calc(100vh-7rem)] flex flex-col lg:flex-row gap-4">
    <!-- Left Panel: Products -->
    <div class="flex-1 flex flex-col min-h-0" :class="{ 'hidden lg:flex': showCart }">
      <!-- Barcode + Search -->
      <div class="bg-white rounded-xl border border-gray-200 p-4 mb-4 shrink-0">
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Barcode Input -->
          <div class="flex-1">
            <label class="block text-xs font-medium text-gray-500 mb-1">Scan Barcode</label>
            <input
              ref="barcodeInput"
              v-model="barcodeValue"
              @keydown.enter="handleBarcode"
              type="text"
              placeholder="Scan barcode di sini..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              autofocus
            />
          </div>
          <!-- Search -->
          <div class="flex-1">
            <label class="block text-xs font-medium text-gray-500 mb-1">Cari Produk</label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Ketik nama produk..."
                class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Product Grid -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 text-center">
          <p class="text-gray-500">Memuat produk...</p>
        </div>
        <div v-else-if="filteredProducts.length" class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          <button
            v-for="prod in filteredProducts"
            :key="prod.id"
            @click="cart.addItem(prod)"
            class="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md hover:border-primary-200 transition-all group"
          >
            <div class="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mb-2 group-hover:bg-primary-100 transition-colors text-primary-600">
              <component :is="getBusinessIcon(bizIcon)" class="w-5 h-5" />
            </div>
            <p class="text-sm font-medium text-gray-900 truncate">{{ prod.name }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ prod.category?.name }}</p>
            <p class="text-sm font-bold text-primary-600 mt-1">{{ fmt.format(prod.price) }}</p>
            <p class="text-xs text-gray-400 mt-0.5">Stok: {{ prod.stock }}</p>
          </button>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-16 text-center">
          <Package class="w-10 h-10 text-gray-300 mb-3" />
          <p class="text-gray-500 font-medium">Produk tidak ditemukan</p>
          <p class="text-sm text-gray-400 mt-1">Coba kata kunci lain atau scan barcode</p>
        </div>
      </div>

      <!-- Mobile: Show Cart Button -->
      <button
        @click="showCart = true"
        class="lg:hidden fixed bottom-4 right-4 z-20 bg-primary-600 text-white rounded-full px-5 py-3 shadow-lg flex items-center gap-2 hover:bg-primary-700 transition-colors"
      >
        <ShoppingCart class="w-5 h-5" />
        <span class="font-semibold">{{ cart.totalItems }}</span>
        <span class="text-sm">· {{ fmt.format(cart.subtotal) }}</span>
      </button>
    </div>

    <!-- Right Panel: Cart -->
    <div
      class="w-full lg:w-96 flex flex-col bg-white rounded-xl border border-gray-200 shrink-0 min-h-0"
      :class="{ 'hidden lg:flex': !showCart, 'fixed inset-0 z-40 rounded-none border-none': showCart && isMobile }"
    >
      <!-- Cart Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
        <h3 class="text-base font-semibold text-gray-900 flex items-center gap-2"><ShoppingCart class="w-5 h-5" /> Keranjang <span v-if="cart.totalItems" class="text-primary-600">({{ cart.totalItems }})</span></h3>
        <button @click="showCart = false" class="lg:hidden text-gray-400 hover:text-gray-600">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Cart Items -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div v-if="cart.isEmpty" class="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingCart class="w-12 h-12 text-gray-200 mb-3" />
          <p class="text-gray-400 text-sm">Keranjang masih kosong</p>
          <p class="text-xs text-gray-300 mt-1">Scan barcode atau klik produk</p>
        </div>

        <div
          v-for="item in cart.items"
          :key="item.produk.id"
          class="flex items-start gap-3 bg-gray-50 rounded-lg p-3"
        >
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ item.produk.name }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ fmt.format(item.produk.price) }} / {{ item.produk.unit }}</p>
          </div>

          <!-- Qty Controls -->
          <div class="flex items-center gap-1 shrink-0">
            <button @click="cart.decrementQty(item.produk.id)" class="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100"><Minus class="w-3 h-3" /></button>
            <span class="w-8 text-center text-sm font-semibold">{{ item.qty }}</span>
            <button @click="cart.incrementQty(item.produk.id)" class="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100"><Plus class="w-3 h-3" /></button>
          </div>

          <div class="text-right shrink-0">
            <p class="text-sm font-semibold text-gray-900">{{ fmt.format(item.subtotal) }}</p>
            <button @click="cart.removeItem(item.produk.id)" class="text-xs text-red-400 hover:text-red-600 mt-1">Hapus</button>
          </div>
        </div>
      </div>

      <!-- Cart Footer -->
      <div class="border-t border-gray-200 p-4 space-y-3 shrink-0">
        <!-- Subtotal -->
        <div class="flex items-center justify-between text-lg font-bold text-gray-900">
          <span>Total</span>
          <span>{{ fmt.format(cart.subtotal) }}</span>
        </div>

        <!-- Payment Method -->
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Metode Pembayaran</label>
          <div class="flex gap-2">
            <button
              @click="cart.setMetodePembayaran('Tunai')"
              class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-colors flex items-center justify-center gap-2"
              :class="cart.metodePembayaran === 'Tunai' ? 'bg-primary-50 border-primary-300 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
            ><Banknote class="w-4 h-4" /> Tunai</button>
            <button
              @click="cart.setMetodePembayaran('QRIS')"
              class="flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-colors flex items-center justify-center gap-2"
              :class="cart.metodePembayaran === 'QRIS' ? 'bg-primary-50 border-primary-300 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
            ><Smartphone class="w-4 h-4" /> QRIS</button>
          </div>
        </div>

        <!-- Nominal Bayar -->
        <div v-if="cart.metodePembayaran === 'Tunai'">
          <label class="block text-xs font-medium text-gray-500 mb-1">Nominal Bayar</label>
          <RupiahInput
            v-model="cart.nominalBayar"
            placeholder="0"
            :showPrefix="true"
          />
          <!-- Quick amounts -->
          <div class="flex gap-1.5 mt-2">
            <button
              v-for="amount in quickAmounts"
              :key="amount"
              @click="cart.setNominalBayar(amount)"
              class="flex-1 py-1.5 text-xs font-medium border border-gray-200 rounded-md hover:bg-gray-50 text-gray-600 transition-colors"
            >{{ fmt.formatShort(amount) }}</button>
          </div>
          <div v-if="cart.nominalBayar > 0 && !cart.isEmpty" class="mt-2 flex items-center justify-between text-sm">
            <span class="text-gray-500">Kembalian</span>
            <span :class="cart.kembalian >= 0 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'">
              {{ cart.kembalian >= 0 ? fmt.format(cart.kembalian) : 'Kurang ' + fmt.format(Math.abs(cart.kembalian)) }}
            </span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 pt-1">
          <button
            @click="handleCancel"
            :disabled="cart.isEmpty"
            class="px-4 py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >Batal</button>
          <button
            @click="handlePay"
            :disabled="!canPay || isSaving"
            class="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <span v-if="isSaving" class="mr-2 animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
            Bayar Sekarang
          </button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showSuccess" class="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl">
            <div class="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle class="w-8 h-8" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-1">Berhasil!</h3>

            <div class="bg-gray-50 rounded-lg p-4 mb-4 text-left space-y-2 mt-4">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Total</span>
                <span class="font-semibold text-gray-900">{{ fmt.format(successData?.total || 0) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Bayar</span>
                <span class="font-semibold text-gray-900">{{ fmt.format(successData?.bayar || 0) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Kembalian</span>
                <span class="font-bold text-green-600">{{ fmt.format(successData?.kembalian || 0) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Metode</span>
                <span class="text-gray-700">{{ successData?.metode }}</span>
              </div>
            </div>

            <div class="flex gap-2">
              <button @click="printReceipt" class="flex-1 py-2.5 px-4 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cetak Struk</button>
              <button @click="closeSuccess" class="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">Selesai</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Thermal Print Area (Hidden on screen) -->
    <div id="print-area" class="hidden" v-if="successData">
      <div class="print-header">
        <h2>{{ settingsStore.headerStruk }}</h2>
        <p v-if="settingsStore.namaToko">{{ settingsStore.namaToko }} - {{ biz.activeBranch?.name }}</p>
        <p v-else>{{ biz.activeBusiness?.name }} - {{ biz.activeBranch?.name }}</p>
        <p v-if="settingsStore.alamat">{{ settingsStore.alamat }}</p>
        <p v-if="settingsStore.telepon">Telp: {{ settingsStore.telepon }}</p>
        <div class="divider"></div>
      </div>
      <div class="print-info">
        <p>Tgl: {{ fmt.formatDateTime(successData.createdAt) }}</p>
        <p>ID: {{ successData.id.split('-')[0] }}</p>
        <p>Ksr: {{ auth.user?.name }}</p>
        <div class="divider"></div>
      </div>
      <div class="print-items">
        <div v-for="item in cart.items" :key="item.produk.id" class="item-row">
          <p class="item-name">{{ item.produk.name }}</p>
          <div class="item-calc">
            <span>{{ item.qty }}x {{ fmt.format(item.produk.price) }}</span>
            <span>{{ fmt.format(item.subtotal) }}</span>
          </div>
        </div>
        <div class="divider"></div>
      </div>
      <div class="print-total">
        <div class="total-row">
          <span>Total:</span>
          <span>{{ fmt.format(successData.total) }}</span>
        </div>
        <div class="total-row">
          <span>Metode:</span>
          <span>{{ successData.metode }}</span>
        </div>
        <div class="divider"></div>
      </div>
      <div class="print-footer">
        <p>{{ settingsStore.footerStruk }}</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Package, ShoppingCart, X, Minus, Plus, Banknote, Smartphone, CheckCircle, Soup, CupSoda, Utensils, Store } from 'lucide-vue-next'

const cart = useCartStore()
const auth = useAuthStore()
const biz = useBusinessStore()
const fmt = useFormatCurrency()
const toast = useToastStore()
const settingsStore = useSettingsStore()
const { fetchWithAuth } = useApi()
const { fetchWithCache, invalidateCache } = useCachedFetch()

const barcodeInput = ref<HTMLInputElement>()
const barcodeValue = ref('')
const searchQuery = ref('')
const showCart = ref(false)
const showSuccess = ref(false)
const successData = ref<{ id: string; createdAt: string; total: number; bayar: number; kembalian: number; metode: string } | null>(null)
const isSaving = ref(false)
const isLoading = ref(false)
const products = ref<any[]>([])

const isMobile = ref(false)

onMounted(async () => {
  isMobile.value = window.innerWidth < 1024
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 1024
  })
  
  if (biz.businesses.length === 0) {
    await biz.fetchAll()
  }
  
  await fetchProducts()
  
  // Auto-focus barcode input
  barcodeInput.value?.focus()
})

async function fetchProducts(forceRefresh = false) {
  if (products.value.length === 0) {
    isLoading.value = true
  }
  try {
    const res = await fetchWithCache<any>('/products', {
      forceRefresh,
      onRevalidated: (fresh) => {
        if (fresh.success) products.value = fresh.data
      }
    })
    if (res.data?.success) {
      products.value = res.data.data
    }
  } catch (error) {
    toast.error('Gagal memuat produk')
  } finally {
    isLoading.value = false
  }
}

const bizIcon = computed(() => biz.activeBusiness?.icon || 'Store')

function getBusinessIcon(name: string) {
  return { Soup, CupSoda, Utensils, Store }[name] || Store
}

const bizProducts = computed(() => {
  const branch = biz.activeBranch
  if (!branch) return []
  return products.value.filter((p) => p.businessId === branch.businessId && p.isActive)
})

const filteredProducts = computed(() => {
  if (!searchQuery.value) return bizProducts.value
  const q = searchQuery.value.toLowerCase()
  return bizProducts.value.filter((p) =>
    p.name.toLowerCase().includes(q) || (p.barcode && p.barcode.includes(q))
  )
})

const quickAmounts = computed(() => {
  const sub = cart.subtotal
  if (sub <= 0) return [10000, 20000, 50000, 100000]
  
  const amounts = new Set<number>()
  amounts.add(sub)
  
  amounts.add(Math.ceil(sub / 5000) * 5000)
  amounts.add(Math.ceil(sub / 10000) * 10000)
  amounts.add(Math.ceil(sub / 20000) * 20000)
  amounts.add(Math.ceil(sub / 50000) * 50000)
  amounts.add(Math.ceil(sub / 100000) * 100000)

  const indonesianBills = [5000, 10000, 20000, 50000, 100000]
  indonesianBills.forEach(bill => {
    if (bill > sub) amounts.add(bill)
  })

  return Array.from(amounts)
    .filter(v => v >= sub)
    .sort((a, b) => a - b)
    .slice(0, 4)
})

const canPay = computed(() => {
  if (cart.isEmpty) return false
  if (cart.metodePembayaran === 'QRIS') return true
  return cart.nominalBayar >= cart.subtotal
})

function handleBarcode() {
  const code = barcodeValue.value.trim()
  if (!code) return

  const prod = bizProducts.value.find((p) => p.barcode === code)
  if (prod) {
    cart.addItem(prod)
    toast.success(`${prod.name} ditambahkan`)
  } else {
    toast.error('Produk tidak ditemukan')
  }
  barcodeValue.value = ''
  barcodeInput.value?.focus()
}

function handleCancel() {
  if (confirm('Yakin ingin membatalkan transaksi?')) {
    cart.clearCart()
    toast.info('Transaksi dibatalkan')
  }
}

async function handlePay() {
  if (!biz.activeBranchId) {
    toast.error('Pilih cabang terlebih dahulu')
    return
  }

  isSaving.value = true
  
  try {
    const payload = {
      branchId: biz.activeBranchId,
      paymentMethod: cart.metodePembayaran,
      total: cart.subtotal,
      details: cart.items.map(item => ({
        productId: item.produk.id,
        qty: item.qty,
        price: item.produk.price,
        subtotal: item.subtotal
      }))
    }
    
    const res = await fetchWithAuth<any>('/transactions', {
      method: 'POST',
      body: payload
    })
    
    if (res.success) {
      const bayar = cart.metodePembayaran === 'QRIS' ? cart.subtotal : cart.nominalBayar
      const kembalian = bayar - cart.subtotal

      successData.value = {
        id: res.data.id,
        createdAt: res.data.createdAt,
        total: cart.subtotal,
        bayar,
        kembalian,
        metode: cart.metodePembayaran,
      }
      showSuccess.value = true
      
      // Invalidate caches & refresh products to update stock
      invalidateCache('/products')
      invalidateCache('/transactions')
      invalidateCache('/reports')
      await fetchProducts(true)
    } else {
      toast.error(res.message || 'Gagal menyimpan transaksi')
    }
  } catch (error: any) {
    toast.error(error.data?.message || 'Terjadi kesalahan')
  } finally {
    isSaving.value = false
  }
}

function closeSuccess() {
  showSuccess.value = false
  successData.value = null
  cart.clearCart()
  barcodeInput.value?.focus()
}

function printReceipt() {
  window.print()
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
    width: 58mm;
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    color: #000;
  }
  
  .print-header { text-align: center; margin-bottom: 10px; }
  .print-header h2 { font-size: 16px; font-weight: bold; margin: 0; }
  .print-header p { margin: 2px 0 0; }
  .divider { border-top: 1px dashed #000; margin: 8px 0; }
  .print-info p { margin: 2px 0; }
  .item-row { margin-bottom: 6px; }
  .item-name { margin: 0 0 2px; }
  .item-calc { display: flex; justify-content: space-between; }
  .total-row { display: flex; justify-content: space-between; font-weight: bold; margin: 2px 0; }
  .print-footer { text-align: center; margin-top: 10px; }
}
</style>

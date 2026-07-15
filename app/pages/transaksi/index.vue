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
        <div v-if="filteredProducts.length" class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          <button
            v-for="prod in filteredProducts"
            :key="prod.id"
            @click="cart.addItem(prod)"
            class="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md hover:border-primary-200 transition-all group"
          >
            <div class="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mb-2 group-hover:bg-primary-100 transition-colors text-primary-600">
              <component :is="getBusinessIcon(bizIcon)" class="w-5 h-5" />
            </div>
            <p class="text-sm font-medium text-gray-900 truncate">{{ prod.nama }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ prod.kategori }}</p>
            <p class="text-sm font-bold text-primary-600 mt-1">{{ fmt.format(prod.harga) }}</p>
            <p class="text-xs text-gray-400 mt-0.5">Stok: {{ prod.stok }}</p>
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
            <p class="text-sm font-medium text-gray-900 truncate">{{ item.produk.nama }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ fmt.format(item.produk.harga) }} / {{ item.produk.satuan }}</p>
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
          <input
            :value="cart.nominalBayar || ''"
            @input="(e) => cart.setNominalBayar(Number((e.target as HTMLInputElement).value) || 0)"
            type="number"
            min="0"
            placeholder="0"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
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
            :disabled="!canPay"
            class="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >Bayar Sekarang</button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showSuccess" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl">
            <div class="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle class="w-8 h-8" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-1">Berhasil!</h3>
            <p class="text-sm text-gray-500 mb-4">{{ successData?.id }}</p>

            <div class="bg-gray-50 rounded-lg p-4 mb-4 text-left space-y-2">
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
  </div>
</template>

<script setup lang="ts">
import { products } from '~/data/products'
import { Search, Package, ShoppingCart, X, Minus, Plus, Banknote, Smartphone, CheckCircle, Soup, CupSoda, Utensils, Store } from 'lucide-vue-next'

const cart = useCartStore()
const auth = useAuthStore()
const biz = useBusinessStore()
const fmt = useFormatCurrency()
const toast = useToastStore()

const barcodeInput = ref<HTMLInputElement>()
const barcodeValue = ref('')
const searchQuery = ref('')
const showCart = ref(false)
const showSuccess = ref(false)
const successData = ref<{ id: string; total: number; bayar: number; kembalian: number; metode: string } | null>(null)

const isMobile = ref(false)

onMounted(() => {
  isMobile.value = window.innerWidth < 1024
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 1024
  })
  // Auto-focus barcode input
  barcodeInput.value?.focus()
})

const bizIcon = computed(() => biz.activeBusinessInfo?.icon || 'Store')

function getBusinessIcon(name: string) {
  return { Soup, CupSoda, Utensils, Store }[name] || Store
}

const bizProducts = computed(() => {
  const activeName = biz.activeBisnis
  return products.filter((p) => p.bisnis === activeName && p.status === 'Aktif')
})

const filteredProducts = computed(() => {
  if (!searchQuery.value) return bizProducts.value
  const q = searchQuery.value.toLowerCase()
  return bizProducts.value.filter((p) =>
    p.nama.toLowerCase().includes(q) || p.barcode.includes(q)
  )
})

const quickAmounts = computed(() => {
  const sub = cart.subtotal
  if (sub <= 0) return [10000, 20000, 50000, 100000]
  const rounded = Math.ceil(sub / 10000) * 10000
  return [sub, rounded, rounded + 10000, rounded + 50000].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 4)
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
    toast.success(`${prod.nama} ditambahkan`)
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

function handlePay() {
  const bayar = cart.metodePembayaran === 'QRIS' ? cart.subtotal : cart.nominalBayar
  const kembalian = bayar - cart.subtotal

  successData.value = {
    id: cart.generateTransactionId(),
    total: cart.subtotal,
    bayar,
    kembalian,
    metode: cart.metodePembayaran,
  }
  showSuccess.value = true
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

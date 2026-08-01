<template>
  <div class="h-[calc(100vh-7rem)] flex flex-col lg:flex-row gap-4">
    <!-- Left Panel: Products -->
    <div class="flex-1 flex flex-col min-h-0" :class="{ 'hidden lg:flex': showCart }">
      <!-- Top Control Bar: Toggle Filter & Product Count -->
      <div class="flex items-center justify-between mb-3 shrink-0 bg-white rounded-xl border border-gray-200 px-3 sm:px-4 py-2 sm:py-2.5 shadow-2xs gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <button
            @click="showFilter = !showFilter"
            type="button"
            class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none whitespace-nowrap shrink-0"
            :class="showFilter
              ? 'bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100'
              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'"
          >
            <SlidersHorizontal class="w-3.5 h-3.5 shrink-0" />
            <span class="whitespace-nowrap">
              <span class="hidden sm:inline">{{ showFilter ? 'Sembunyikan' : 'Tampilkan' }} </span>Filter
            </span>
            <ChevronUp v-if="showFilter" class="w-3.5 h-3.5 text-primary-500 shrink-0" />
            <ChevronDown v-else class="w-3.5 h-3.5 text-gray-500 shrink-0" />
          </button>

          <!-- Active Filter Badge -->
          <div v-if="isAnyFilterActive" class="flex items-center gap-1 shrink-0">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span class="hidden sm:inline">Filter </span>Aktif
            </span>
            <button
              @click="resetFilters"
              class="text-gray-400 hover:text-red-600 transition-colors p-1 shrink-0"
              title="Reset Semua Filter"
            >
              <XCircle class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div class="text-xs font-medium text-gray-500 whitespace-nowrap shrink-0">
          Total: <span class="font-bold text-gray-900">{{ filteredProducts.length }}</span> Produk
        </div>
      </div>

      <!-- Collapsible Filter Section -->
      <Transition name="expand">
        <div v-show="showFilter" class="mb-3 shrink-0">
          <div class="bg-white rounded-xl border border-gray-200 p-3">
            <div class="grid grid-cols-2 gap-2">
              <!-- Barcode Input -->
              <div class="relative col-span-2 sm:col-span-1">
                <input
                  ref="barcodeInput"
                  v-model="barcodeValue"
                  @keydown.enter="handleBarcode"
                  type="text"
                  placeholder="Scan barcode..."
                  class="w-full pl-3 pr-32 sm:pr-36 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  autofocus
                />
                <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    v-if="barcodeValue"
                    @click="barcodeValue = ''"
                    type="button"
                    class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  >
                    <X class="w-4 h-4" />
                  </button>
                  <button
                    @click="openScanner"
                    type="button"
                    class="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 rounded-md text-xs font-semibold transition-colors"
                    title="Buka Scanner Kamera HP (Fitur Beta)"
                  >
                    <Camera class="w-3.5 h-3.5" />
                    <span class="hidden sm:inline">Scan</span>
                    <span class="text-[9px] px-1 py-0.2 bg-amber-100 text-amber-700 border border-amber-300 rounded font-bold">BETA</span>
                  </button>
                </div>
              </div>
              <!-- Search Input -->
              <div class="relative col-span-2 sm:col-span-1">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Cari produk/sku/kategori"
                  class="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
                <button
                  v-if="searchQuery"
                  @click="searchQuery = ''"
                  type="button"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full hover:bg-gray-100"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
              <!-- Category Dropdown -->
              <select
                v-if="categories.length > 0"
                v-model="selectedCategory"
                class="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white font-medium truncate cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
              <!-- Sort Dropdown -->
              <select
                v-model="sortBy"
                class="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white font-medium truncate cursor-pointer"
              >
                <option value="">Urutkan</option>
                <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Mini Active Filter Summary Bar when Filter is Collapsed -->
      <div
        v-if="!showFilter && isAnyFilterActive"
        class="mb-3 shrink-0 flex items-center justify-between gap-2 bg-amber-50/90 border border-amber-200 rounded-xl px-3.5 py-2 text-xs text-amber-900 shadow-2xs"
      >
        <div class="flex items-center gap-2 truncate">
          <SlidersHorizontal class="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span class="truncate">
            <span class="font-semibold">Filter aktif:</span>
            <span v-if="searchQuery" class="ml-1 font-medium bg-amber-100/80 px-1.5 py-0.5 rounded text-amber-800">"{{ searchQuery }}"</span>
            <span v-if="selectedCategory" class="ml-1 font-medium bg-amber-100/80 px-1.5 py-0.5 rounded text-amber-800">{{ getCategoryName(selectedCategory) }}</span>
            <span v-if="sortBy" class="ml-1 font-medium bg-amber-100/80 px-1.5 py-0.5 rounded text-amber-800">{{ getSortLabel(sortBy) }}</span>
          </span>
        </div>
        <button
          @click="resetFilters"
          class="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 hover:underline shrink-0"
        >
          <X class="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      <!-- Product Grid -->
      <div class="flex-1 overflow-y-auto min-h-0">
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 text-center">
          <p class="text-gray-500">Memuat produk...</p>
        </div>
        <div v-else-if="filteredProducts.length" class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          <button
            v-for="prod in filteredProducts"
            :key="prod.id"
            @click="cart.addItem(prod)"
            class="rounded-xl p-3.5 text-left transition-all group flex flex-col justify-between relative overflow-hidden select-none"
            :class="prod.stock <= 0
              ? 'bg-gray-100/90 border border-gray-200 opacity-60 cursor-not-allowed shadow-none'
              : 'bg-white border border-gray-200 hover:shadow-md hover:border-primary-300'"
            :title="prod.stock <= 0 ? `${prod.name} (Stok Habis)` : prod.name"
          >
            <div>
              <div class="flex items-center justify-between mb-2">
                <div
                  class="w-9 h-9 rounded-lg flex items-center justify-center transition-colors shrink-0"
                  :class="prod.stock <= 0 ? 'bg-gray-200/80 text-gray-400' : 'bg-primary-50 text-primary-600 group-hover:bg-primary-100'"
                >
                  <component :is="getBusinessIcon(bizIcon)" class="w-4 h-4" />
                </div>
                
                <!-- Stock Badge or Unit Badge -->
                <span
                  v-if="prod.stock <= 0"
                  class="text-[10px] font-extrabold text-gray-600 bg-gray-200/90 border border-gray-300/60 px-2 py-0.5 rounded-md uppercase tracking-wider shadow-2xs"
                >
                  Stok Habis
                </span>
                <span
                  v-else-if="prod.unit && prod.unit !== 'pcs'"
                  class="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded truncate max-w-[50%]"
                >
                  {{ prod.unit }}
                </span>
              </div>

              <p
                class="text-xs sm:text-sm font-semibold line-clamp-2 leading-tight min-h-[2.25rem] transition-colors"
                :class="prod.stock <= 0 ? 'text-gray-400' : 'text-gray-900 group-hover:text-primary-600'"
                :title="prod.name"
              >
                {{ prod.name }}
              </p>
              <p class="text-[11px] text-gray-400 mt-1 truncate">{{ prod.category?.name || 'Umum' }}</p>
            </div>

            <div class="mt-2 pt-2 border-t flex items-baseline justify-between gap-1" :class="prod.stock <= 0 ? 'border-gray-200/60' : 'border-gray-100'">
              <div>
                <p
                  class="text-xs sm:text-sm font-bold"
                  :class="prod.stock <= 0 ? 'text-gray-400 line-through' : 'text-primary-600'"
                >
                  {{ fmt.format(prod.price) }}
                </p>
                <p v-if="prod.stock <= 0" class="text-[10px] font-bold text-red-500">Stok: 0 (Habis)</p>
                <p v-else-if="prod.stock <= 5" class="text-[10px] font-bold text-amber-600">Stok: {{ prod.stock }} (Sisa sedikit)</p>
                <p v-else class="text-[10px] text-gray-400">Stok: {{ prod.stock }}</p>
              </div>
              <p v-if="sortBy === 'terlaris'" class="text-[10px] text-orange-500 font-medium flex items-center gap-0.5 shrink-0">
                <TrendingUp class="w-3 h-3" /> {{ prod.totalSold || 0 }}
              </p>
            </div>
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
            <button
              @click="cart.incrementQty(item.produk.id)"
              :disabled="item.qty >= item.produk.stock"
              class="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
              :title="item.qty >= item.produk.stock ? 'Mencapai batas stok yang tersedia' : 'Tambah Qty'"
            >
              <Plus class="w-3 h-3" />
            </button>
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
              class="flex-1 py-1.5 text-xs font-medium border rounded-md transition-colors"
              :class="amount === cart.subtotal && cart.subtotal > 0
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 shadow-2xs'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
            >
              {{ amount === cart.subtotal && cart.subtotal > 0 ? 'Uang Pas' : fmt.formatShort(amount) }}
            </button>
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

    <!-- Thermal Print Area (Only visible during print) -->
    <div id="print-area" class="print-only" v-if="successData">
      <div class="print-header">
        <h2>{{ settingsStore.headerStruk || 'PANTAU BISNIS' }}</h2>
        <p v-if="settingsStore.namaToko" class="font-bold">{{ settingsStore.namaToko }} - {{ biz.activeBranch?.name }}</p>
        <p v-else class="font-bold">{{ biz.activeBusiness?.name }} - {{ biz.activeBranch?.name }}</p>
        <p v-if="settingsStore.alamat">{{ settingsStore.alamat }}</p>
        <p v-if="settingsStore.telepon">Telp: {{ settingsStore.telepon }}</p>
        <div class="divider"></div>
        <p class="print-type-badge">STRUK PEMBAYARAN</p>
        <div class="divider"></div>
      </div>
      <div class="print-info">
        <p>Tgl : {{ fmt.formatDateTime(successData.createdAt) }}</p>
        <p>ID  : {{ successData.id }}</p>
        <p>Ksr : {{ auth.user?.name || auth.user?.username }}</p>
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
        <div class="total-row" v-if="successData.metode === 'Tunai'">
          <span>Bayar:</span>
          <span>{{ fmt.format(successData.bayar) }}</span>
        </div>
        <div class="total-row" v-if="successData.metode === 'Tunai'">
          <span>Kembali:</span>
          <span>{{ fmt.format(successData.kembalian) }}</span>
        </div>
        <div class="total-row">
          <span>Metode:</span>
          <span>{{ successData.metode }}</span>
        </div>
        <div class="divider"></div>
      </div>
      <div class="print-footer">
        <p>{{ settingsStore.footerStruk || 'Terima kasih atas kunjungan Anda!' }}</p>
      </div>
    </div>

    <!-- Barcode Scanner Modal Component -->
    <BarcodeScannerModal
      :is-open="isScannerOpen"
      :cart-items="cart.items"
      :total-amount="cart.subtotal"
      :last-scanned-item="lastScannedName"
      @close="isScannerOpen = false"
      @scan="handleCameraScan"
      @pay="openPaymentModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Search, Package, ShoppingCart, X, Minus, Plus, Banknote, Smartphone, CheckCircle, Soup, CupSoda, Utensils, Store, ArrowUpDown, ArrowDownUp, SortAsc, SortDesc, TrendingUp, SlidersHorizontal, ChevronUp, ChevronDown, XCircle, Camera } from 'lucide-vue-next'

const cart = useCartStore()
const auth = useAuthStore()
const biz = useBusinessStore()
const fmt = useFormatCurrency()
const toast = useToastStore()
const settingsStore = useSettingsStore()
const { fetchWithAuth } = useApi()
const { fetchWithCache, invalidateCache } = useCachedFetch()
const { playSuccessBeep, playErrorBeep, unlockAudio } = useAudioBeep()

const isScannerOpen = ref(false)

function openScanner() {
  unlockAudio()
  isScannerOpen.value = true
}

const barcodeInput = ref<HTMLInputElement>()
const barcodeValue = ref('')
const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('')
const showFilter = ref(true)
const showCart = ref(false)
const showSuccess = ref(false)
const successData = ref<{ id: string; createdAt: string; total: number; bayar: number; kembalian: number; metode: string } | null>(null)
const isSaving = ref(false)
const isLoading = ref(false)
const products = ref<any[]>([])

const isMobile = ref(false)

let barcodeBuffer = ''
let barcodeTimer: any = null

function handleGlobalKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

  if (e.key === 'Enter') {
    if (barcodeBuffer.length >= 2) {
      const code = barcodeBuffer.trim().toLowerCase()
      const prod = bizProducts.value.find((p) => (p.barcode && p.barcode.toLowerCase() === code) || (p.sku && p.sku.toLowerCase() === code))
      if (prod) {
        cart.addItem(prod)
        playSuccessBeep()
        toast.success(`${prod.name} ditambahkan (+1)`)
      } else {
        playErrorBeep()
        toast.error(`Barcode "${barcodeBuffer}" tidak ditemukan`)
      }
    }
    barcodeBuffer = ''
    return
  }

  if (e.key.length === 1) {
    barcodeBuffer += e.key
    clearTimeout(barcodeTimer)
    barcodeTimer = setTimeout(() => {
      barcodeBuffer = ''
    }, 200)
  }
}

function handleResize() {
  isMobile.value = window.innerWidth < 1024
}

onMounted(async () => {
  isMobile.value = window.innerWidth < 1024
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleGlobalKeydown)
  
  if (biz.businesses.length === 0) {
    await biz.fetchAll()
  }
  
  await fetchProducts()
  
  // Auto-focus barcode input
  if (showFilter.value) {
    barcodeInput.value?.focus()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleGlobalKeydown)
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

const categories = computed(() => {
  const map = new Map<string, string>()
  bizProducts.value.forEach((p) => {
    if (p.category?.id && p.category?.name) {
      map.set(p.category.id, p.category.name)
    }
  })
  return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
})

const isAnyFilterActive = computed(() => !!searchQuery.value || !!selectedCategory.value || !!sortBy.value)

function resetFilters() {
  searchQuery.value = ''
  selectedCategory.value = ''
  sortBy.value = ''
}

function getCategoryName(id: string) {
  const found = categories.value.find((c) => c.id === id)
  return found ? found.name : ''
}

function getSortLabel(val: string) {
  const found = sortOptions.find((s) => s.value === val)
  return found ? found.label : ''
}

const sortOptions = [
  { value: 'price_asc',  label: 'Harga Terendah', icon: ArrowUpDown },
  { value: 'price_desc', label: 'Harga Tertinggi', icon: ArrowDownUp },
  { value: 'name_asc',   label: 'Nama A–Z',        icon: SortAsc },
  { value: 'name_desc',  label: 'Nama Z–A',        icon: SortDesc },
  { value: 'terlaris',   label: 'Terlaris',         icon: TrendingUp },
]

const filteredProducts = computed(() => {
  let list = bizProducts.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.barcode && p.barcode.toLowerCase().includes(q)) ||
      (p.category?.name && p.category.name.toLowerCase().includes(q))
    )
  }
  if (selectedCategory.value) {
    list = list.filter((p) => p.category?.id === selectedCategory.value || p.categoryId === selectedCategory.value)
  }
  switch (sortBy.value) {
    case 'price_asc':  return [...list].sort((a, b) => a.price - b.price)
    case 'price_desc': return [...list].sort((a, b) => b.price - a.price)
    case 'name_asc':   return [...list].sort((a, b) => a.name.localeCompare(b.name, 'id'))
    case 'name_desc':  return [...list].sort((a, b) => b.name.localeCompare(a.name, 'id'))
    case 'terlaris':   return [...list].sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
    default:           return list
  }
})

const quickAmounts = computed(() => {
  const sub = cart.subtotal
  if (sub <= 0) return [10000, 20000, 50000, 100000]
  
  const roundedUp = Math.ceil(sub / 10000) * 10000
  const next50 = Math.ceil(sub / 50000) * 50000
  const next100 = Math.ceil(sub / 100000) * 100000

  const set = new Set<number>()
  if (sub > 0) set.add(sub)
  set.add(roundedUp)
  set.add(next50)
  set.add(next100)

  return Array.from(set).sort((a, b) => a - b).slice(0, 4)
})

const canPay = computed(() => {
  if (cart.isEmpty) return false
  if (cart.metodePembayaran === 'QRIS') return true
  return cart.nominalBayar >= cart.subtotal
})

function handleBarcode() {
  const code = barcodeValue.value.trim().toLowerCase()
  if (!code) return

  const prod = bizProducts.value.find((p) => (p.barcode && p.barcode.toLowerCase() === code) || (p.sku && p.sku.toLowerCase() === code))
  if (prod) {
    cart.addItem(prod)
    playSuccessBeep()
    toast.success(`${prod.name} ditambahkan (+1)`)
  } else {
    playErrorBeep()
    toast.error('Produk tidak ditemukan')
  }
  barcodeValue.value = ''
  barcodeInput.value?.focus()
}

const lastScannedName = ref('')

async function handleCameraScan(scannedCode: string) {
  const code = scannedCode.trim().toLowerCase()
  if (!code) return

  // 1. Search locally in business products for sub-millisecond response
  const prod = bizProducts.value.find((p) => (p.barcode && p.barcode.toLowerCase() === code) || (p.sku && p.sku.toLowerCase() === code))
  if (prod) {
    cart.addItem(prod)
    playSuccessBeep()
    lastScannedName.value = prod.name
    toast.success(`${prod.name} ditambahkan (+1)`)
    return
  }

  // 2. Fallback API lookup if not found in local array
  try {
    const bizId = biz.activeBusinessId
    const url = `/products/barcode/${encodeURIComponent(scannedCode)}${bizId ? `?businessId=${bizId}` : ''}`
    const res = await fetchWithAuth(url) as any
    if (res && res.success && res.data) {
      cart.addItem(res.data)
      playSuccessBeep()
      lastScannedName.value = res.data.name
      toast.success(`${res.data.name} ditambahkan (+1)`)
      return
    }
  } catch (err) {
    // ignore api error, fallback to not found
  }

  // 3. Not found handling
  playErrorBeep()
  toast.error(`Barcode ${scannedCode} tidak ditemukan`)
}

function handleCancel() {
  if (confirm('Yakin ingin membatalkan transaksi?')) {
    cart.clearCart()
    toast.info('Transaksi dibatalkan')
  }
}

async function handlePay() {
  const targetBranchId = biz.activeBranchId || (auth.isKaryawan ? auth.userBranch?.id : null)

  if (!targetBranchId) {
    toast.error('Pilih cabang terlebih dahulu')
    return
  }

  isSaving.value = true
  
  try {
    const payload = {
      branchId: targetBranchId,
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
.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 500px;
  opacity: 1;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

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

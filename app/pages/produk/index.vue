<template>
  <div>
    <!-- Toolbar -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input v-model="search" type="text" placeholder="Cari produk atau barcode..." class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
        </div>
        <select v-model="filterBisnis" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">Semua Bisnis</option>
          <option v-for="b in businessList" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
        <select v-model="filterKategori" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">Semua Kategori</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }} ({{ c.business?.name }})</option>
        </select>
        <select v-model="filterStatus" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
          <option value="">Semua Status</option>
          <option :value="true">Aktif</option>
          <option :value="false">Nonaktif</option>
        </select>
        <NuxtLink to="/produk/tambah" class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors shrink-0">
          <Plus class="w-4 h-4" /> Tambah Produk
        </NuxtLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-500">Memuat produk...</p>
    </div>

    <!-- Desktop Table -->
    <div v-else class="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Produk</th>
            <th class="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Bisnis</th>
            <th class="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Kategori</th>
            <th class="text-right text-xs font-medium text-gray-500 uppercase py-3 px-4">Harga</th>
            <th class="text-center text-xs font-medium text-gray-500 uppercase py-3 px-4">Stok</th>
            <th class="text-center text-xs font-medium text-gray-500 uppercase py-3 px-4">Status</th>
            <th class="text-center text-xs font-medium text-gray-500 uppercase py-3 px-4">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prod in paginatedData" :key="prod.id" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <td class="py-3 px-4">
              <p class="text-sm font-medium text-gray-900">{{ prod.name }}</p>
              <p class="text-xs text-gray-400 font-mono">{{ prod.barcode }}</p>
            </td>
            <td class="py-3 px-4 text-sm text-gray-600">{{ prod.business?.name }}</td>
            <td class="py-3 px-4 text-sm text-gray-600">{{ prod.category?.name }}</td>
            <td class="py-3 px-4 text-sm font-medium text-gray-900 text-right">{{ fmt.format(prod.price) }}</td>
            <td class="py-3 px-4 text-sm text-center">
              <span :class="prod.stock <= 10 ? 'text-red-600 font-semibold' : 'text-gray-600'">{{ prod.stock }} {{ prod.unit }}</span>
            </td>
            <td class="py-3 px-4 text-center">
              <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="prod.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                {{ prod.isActive ? 'Aktif' : 'Nonaktif' }}
              </span>
            </td>
            <td class="py-3 px-4 text-center">
              <div class="flex items-center justify-center gap-2">
                <NuxtLink :to="`/produk/edit/${prod.id}`" class="text-gray-400 hover:text-primary-600 transition-colors" title="Edit"><Edit class="w-4 h-4" /></NuxtLink>
                <button @click="confirmDelete(prod)" class="text-gray-400 hover:text-red-500 transition-colors" title="Hapus"><Trash2 class="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!paginatedData.length" class="py-12 text-center">
        <Package class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500 font-medium">Belum ada produk</p>
        <NuxtLink to="/produk/tambah" class="inline-flex items-center gap-1 mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"><Plus class="w-4 h-4" /> Tambah Produk</NuxtLink>
      </div>
    </div>

    <!-- Mobile Cards -->
    <div v-if="!isLoading" class="sm:hidden space-y-3">
      <div v-for="prod in paginatedData" :key="prod.id" class="bg-white border border-gray-200 rounded-xl p-4">
        <div class="flex items-start justify-between mb-2">
          <div>
            <p class="text-sm font-semibold text-gray-900">{{ prod.name }}</p>
            <p class="text-xs text-gray-400">{{ prod.business?.name }} · {{ prod.category?.name }}</p>
          </div>
          <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="prod.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
            {{ prod.isActive ? 'Aktif' : 'Nonaktif' }}
          </span>
        </div>
        <div class="flex items-center justify-between mt-2">
          <p class="text-base font-bold text-primary-600">{{ fmt.format(prod.price) }}</p>
          <p class="text-xs text-gray-400">Stok: <span :class="prod.stock <= 10 ? 'text-red-500 font-semibold' : ''">{{ prod.stock }}</span></p>
        </div>
        <div class="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <NuxtLink :to="`/produk/edit/${prod.id}`" class="flex-1 py-2 text-sm text-center font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Edit</NuxtLink>
          <button @click="confirmDelete(prod)" class="flex-1 py-2 text-sm text-center font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Hapus</button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!isLoading && totalPages > 1" class="flex items-center justify-between mt-4 bg-white rounded-xl border border-gray-200 px-4 py-3">
      <p class="text-sm text-gray-500">{{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, filteredData.length) }} dari {{ filteredData.length }}</p>
      <div class="flex gap-1">
        <button @click="page = Math.max(1, page - 1)" :disabled="page === 1" class="px-3 py-1 text-sm border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40">←</button>
        <button v-for="p in visiblePages" :key="p" @click="page = p" class="px-3 py-1 text-sm rounded-md" :class="p === page ? 'bg-primary-600 text-white' : 'border border-gray-200 hover:bg-gray-50'">{{ p }}</button>
        <button @click="page = Math.min(totalPages, page + 1)" :disabled="page === totalPages" class="px-3 py-1 text-sm border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40">→</button>
      </div>
    </div>

    <!-- Delete Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="deleteTarget" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl">
            <h3 class="text-lg font-bold text-gray-900 mb-2">Hapus Produk</h3>
            <p class="text-sm text-gray-500 mb-5">Apakah Anda yakin ingin menghapus <strong>{{ deleteTarget.name }}</strong>?</p>
            <div class="flex gap-3">
              <button @click="deleteTarget = null" class="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button @click="doDelete" :disabled="isSaving" class="flex-1 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50">
                {{ isSaving ? '...' : 'Hapus' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Search, Plus, Edit, Trash2, Package } from 'lucide-vue-next'

const route = useRoute()
const bizStore = useBusinessStore()
const businessList = computed(() => bizStore.businesses)

const fmt = useFormatCurrency()
const toast = useToastStore()
const { fetchWithAuth } = useApi()
const { fetchWithCache, invalidateCache } = useCachedFetch()

const search = ref('')
const filterBisnis = ref('')
const filterKategori = ref('')
const filterStatus = ref<boolean | string>('')
const page = ref(1)
const perPage = 10
const deleteTarget = ref<any | null>(null)
const isSaving = ref(false)
const isLoading = ref(false)

const products = ref<any[]>([])
const categories = ref<any[]>([])

onMounted(async () => {
  if (businessList.value.length === 0) {
    await bizStore.fetchAll()
  }
  await fetchCategories()
  await fetchProducts()

  if (route.query.categoryId) {
    filterKategori.value = route.query.categoryId as string
  }
})

async function fetchCategories() {
  try {
    const res = await fetchWithCache<any>('/categories', {
      onRevalidated: (fresh) => {
        if (fresh.success) categories.value = fresh.data
      }
    })
    if (res.data?.success) {
      categories.value = res.data.data
    }
  } catch (error) {
    // optional
  }
}

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

const filteredData = computed(() => {
  let data = [...products.value]
  if (filterBisnis.value) data = data.filter((p) => p.businessId === filterBisnis.value)
  if (filterKategori.value) data = data.filter((p) => p.categoryId === filterKategori.value)
  if (filterStatus.value !== '') data = data.filter((p) => p.isActive === filterStatus.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    data = data.filter((p) => p.name.toLowerCase().includes(q) || p.barcode.includes(q))
  }
  return data
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / perPage))
const paginatedData = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredData.value.slice(start, start + perPage)
})
const visiblePages = computed(() => {
  const pages: number[] = []
  for (let i = Math.max(1, page.value - 2); i <= Math.min(totalPages.value, page.value + 2); i++) pages.push(i)
  return pages
})

watch([search, filterBisnis, filterKategori, filterStatus], () => { page.value = 1 })

function confirmDelete(prod: any) {
  deleteTarget.value = prod
}

async function doDelete() {
  if (!deleteTarget.value) return
  isSaving.value = true
  try {
    const res = await fetchWithAuth<any>(`/products/${deleteTarget.value.id}`, {
      method: 'DELETE'
    })
    if (res.success) {
      toast.success('Produk berhasil dihapus')
      invalidateCache('/products')
      await fetchProducts(true)
    } else {
      toast.error(res.message || 'Gagal menghapus produk')
    }
    deleteTarget.value = null
  } catch (e: any) {
    toast.error(e.data?.message || 'Gagal menghapus produk')
  } finally {
    isSaving.value = false
  }
}
</script>

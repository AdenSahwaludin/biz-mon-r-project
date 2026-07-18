<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-gray-900">Kategori Produk</h2>
      <button @click="openAddModal" class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
        <Plus class="w-4 h-4" /> Kategori
      </button>
    </div>

    <!-- Tab Bisnis -->
    <div class="flex gap-1 mb-4 bg-white rounded-lg border border-gray-200 p-1 overflow-x-auto">
      <button
        v-for="b in businessList"
        :key="b.id"
        @click="activeTabId = b.id"
        class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap"
        :class="activeTabId === b.id ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'"
      >
        <component :is="getBusinessIcon(b.icon)" class="w-4 h-4" /> {{ b.name }}
      </button>
    </div>

    <!-- Category List -->
    <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
      <div v-if="isLoading" class="p-8 text-center text-gray-500">Memuat kategori...</div>
      
      <template v-else>
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div>
              <p class="text-sm font-semibold text-gray-900">{{ cat.name }}</p>
              <span class="inline-block mt-0.5 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                {{ cat.products?.length || 0 }} Barang / Produk
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="openViewProductsModal(cat)"
              class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              title="Lihat Barang di Kategori Ini"
            >
              <Eye class="w-3.5 h-3.5" /> Lihat Barang
            </button>
            <button @click="openEditModal(cat)" class="text-gray-400 hover:text-primary-600 transition-colors p-1.5" title="Edit"><Edit class="w-4 h-4" /></button>
            <button @click="openDeleteModal(cat)" class="text-gray-400 hover:text-red-500 transition-colors p-1.5" title="Hapus"><Trash2 class="w-4 h-4" /></button>
          </div>
        </div>
        <div v-if="!categories.length" class="py-12 text-center">
          <Tag class="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p class="text-gray-500 text-sm">Belum ada kategori untuk bisnis ini</p>
        </div>
      </template>
    </div>

    <!-- View Products in Category Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="viewingCategory" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl max-h-[85vh] flex flex-col">
            <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div>
                <h3 class="text-lg font-bold text-gray-900">Barang dalam Kategori: {{ viewingCategory.name }}</h3>
                <p class="text-xs text-gray-500">Total {{ viewingCategory.products?.length || 0 }} barang terdaftar</p>
              </div>
              <button @click="viewingCategory = null" class="text-gray-400 hover:text-gray-600 text-lg font-bold">✕</button>
            </div>

            <!-- Products List inside Modal -->
            <div class="overflow-y-auto flex-1 space-y-2 pr-1">
              <div
                v-for="prod in viewingCategory.products"
                :key="prod.id"
                class="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-semibold text-gray-900">{{ prod.name }}</p>
                    <span
                      class="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      :class="prod.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                    >
                      {{ prod.isActive ? 'Aktif' : 'Nonaktif' }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-400 font-mono mt-0.5">Barcode: {{ prod.barcode }} · Unit: {{ prod.unit }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-primary-600">{{ fmt.format(prod.price) }}</p>
                  <p class="text-xs text-gray-500">Stok: <span :class="prod.stock <= 10 ? 'text-red-500 font-semibold' : ''">{{ prod.stock }}</span></p>
                </div>
              </div>

              <div v-if="!viewingCategory.products?.length" class="py-10 text-center">
                <Package class="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p class="text-gray-500 text-sm">Tidak ada barang/produk di dalam kategori ini</p>
              </div>
            </div>

            <div class="flex justify-end pt-4 border-t border-gray-100 mt-4">
              <button @click="viewingCategory = null" class="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">
                Tutup
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl">
            <h3 class="text-lg font-bold text-gray-900 mb-4">{{ isEditing ? 'Edit Kategori' : 'Tambah Kategori' }}</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Nama Kategori <span class="text-red-500">*</span></label>
                <input v-model="modalForm.name" type="text" placeholder="Masukkan nama kategori" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': modalError }" />
                <p v-if="modalError" class="mt-1 text-xs text-red-500">{{ modalError }}</p>
              </div>
            </div>
            <div class="flex gap-3 mt-5">
              <button @click="closeModal" class="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button @click="saveCategory" :disabled="isSaving" class="flex-1 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50">
                {{ isSaving ? '...' : 'Simpan' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="deleteTarget" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl">
            <h3 class="text-lg font-bold text-gray-900 mb-2">Hapus Kategori</h3>
            <p class="text-sm text-gray-500 mb-5">Yakin ingin menghapus <strong>{{ deleteTarget.name }}</strong>?</p>
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
import { ref, computed, watch, onMounted, reactive } from 'vue'
import { Plus, Edit, Trash2, Tag, Soup, CupSoda, Utensils, Store, Eye, Package } from 'lucide-vue-next'

const bizStore = useBusinessStore()
const businessList = computed(() => bizStore.businesses)
const fmt = useFormatCurrency()
const toast = useToastStore()
const { fetchWithAuth } = useApi()
const { fetchWithCache, invalidateCache } = useCachedFetch()

function getBusinessIcon(name: string) {
  return { Soup, CupSoda, Utensils, Store }[name] || Store
}

const activeTabId = ref<string | null>(null)
const categories = ref<any[]>([])
const isLoading = ref(false)
const isSaving = ref(false)

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const modalForm = reactive({ name: '' })
const modalError = ref('')
const deleteTarget = ref<any | null>(null)
const viewingCategory = ref<any | null>(null)

onMounted(async () => {
  if (businessList.value.length === 0) {
    await bizStore.fetchAll()
  }
  if (businessList.value.length > 0) {
    activeTabId.value = businessList.value[0].id
  }
})

watch(activeTabId, async (newVal) => {
  if (newVal) {
    await fetchCategories(newVal)
  }
})

async function fetchCategories(businessId: string, forceRefresh = false) {
  if (categories.value.length === 0) {
    isLoading.value = true
  }
  try {
    const url = `/categories?businessId=${businessId}`
    const res = await fetchWithCache<any>(url, {
      forceRefresh,
      onRevalidated: (fresh) => {
        if (fresh.success) categories.value = fresh.data
      }
    })
    if (res.data?.success) {
      categories.value = res.data.data
    }
  } catch (error) {
    toast.error('Gagal memuat kategori')
  } finally {
    isLoading.value = false
  }
}

function openViewProductsModal(cat: any) {
  viewingCategory.value = cat
}

function openAddModal() {
  if (!activeTabId.value) return toast.error('Pilih bisnis terlebih dahulu')
  isEditing.value = false
  editingId.value = null
  modalForm.name = ''
  modalError.value = ''
  showModal.value = true
}

function openEditModal(cat: any) {
  isEditing.value = true
  editingId.value = cat.id
  modalForm.name = cat.name
  modalError.value = ''
  showModal.value = true
}

function openDeleteModal(cat: any) {
  deleteTarget.value = cat
}

function closeModal() {
  showModal.value = false
}

async function saveCategory() {
  if (!modalForm.name || modalForm.name.length < 3) {
    modalError.value = 'Nama kategori minimal 3 karakter'
    return
  }

  isSaving.value = true
  modalError.value = ''

  try {
    if (isEditing.value && editingId.value) {
      const res = await fetchWithAuth<any>(`/categories/${editingId.value}`, {
        method: 'PUT',
        body: { name: modalForm.name }
      })
      if (res.success) toast.success('Kategori berhasil diperbarui')
    } else {
      const res = await fetchWithAuth<any>(`/categories`, {
        method: 'POST',
        body: { name: modalForm.name, businessId: activeTabId.value }
      })
      if (res.success) toast.success('Kategori berhasil ditambahkan')
    }
    invalidateCache('/categories')
    closeModal()
    await fetchCategories(activeTabId.value!, true)
  } catch (e: any) {
    modalError.value = e.data?.message || 'Terjadi kesalahan'
  } finally {
    isSaving.value = false
  }
}

async function doDelete() {
  if (!deleteTarget.value) return
  isSaving.value = true
  try {
    const res = await fetchWithAuth<any>(`/categories/${deleteTarget.value.id}`, {
      method: 'DELETE'
    })
    if (res.success) {
      toast.success('Kategori dihapus')
      invalidateCache('/categories')
      await fetchCategories(activeTabId.value!, true)
    }
    deleteTarget.value = null
  } catch (e: any) {
    toast.error(e.data?.message || 'Gagal menghapus kategori')
  } finally {
    isSaving.value = false
  }
}
</script>

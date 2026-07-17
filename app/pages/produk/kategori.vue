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
          <div>
            <p class="text-sm font-medium text-gray-900">{{ cat.name }}</p>
          </div>
          <div class="flex gap-2">
            <button @click="openEditModal(cat)" class="text-gray-400 hover:text-primary-600 transition-colors"><Edit class="w-4 h-4" /></button>
            <button @click="openDeleteModal(cat)" class="text-gray-400 hover:text-red-500 transition-colors"><Trash2 class="w-4 h-4" /></button>
          </div>
        </div>
        <div v-if="!categories.length" class="py-12 text-center">
          <Tag class="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p class="text-gray-500 text-sm">Belum ada kategori untuk bisnis ini</p>
        </div>
      </template>
    </div>

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
import { ref, computed, watch, onMounted } from 'vue'
import { Plus, Edit, Trash2, Tag, Soup, CupSoda, Utensils, Store } from 'lucide-vue-next'

const bizStore = useBusinessStore()
const businessList = computed(() => bizStore.businesses)
const toast = useToastStore()
const { fetchWithAuth } = useApi()

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

async function fetchCategories(businessId: string) {
  isLoading.value = true
  try {
    const res = await fetchWithAuth<any>(`/categories?businessId=${businessId}`)
    if (res.success) {
      categories.value = res.data
    }
  } catch (error) {
    toast.error('Gagal memuat kategori')
  } finally {
    isLoading.value = false
  }
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
    closeModal()
    await fetchCategories(activeTabId.value!)
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
      await fetchCategories(activeTabId.value!)
    }
    deleteTarget.value = null
  } catch (e: any) {
    toast.error(e.data?.message || 'Gagal menghapus kategori')
  } finally {
    isSaving.value = false
  }
}
</script>

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
        :key="b.slug"
        @click="activeTab = b.nama"
        class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap"
        :class="activeTab === b.nama ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'"
      >
        <component :is="getBusinessIcon(b.icon)" class="w-4 h-4" /> {{ b.nama }}
      </button>
    </div>

    <!-- Category List -->
    <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
      <div
        v-for="cat in filteredCategories"
        :key="cat.id"
        class="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div>
          <p class="text-sm font-medium text-gray-900">{{ cat.nama }}</p>
          <p class="text-xs text-gray-400">{{ cat.jumlah_produk }} produk</p>
        </div>
        <div class="flex gap-2">
          <button @click="openEditModal(cat)" class="text-gray-400 hover:text-primary-600 transition-colors"><Edit class="w-4 h-4" /></button>
          <button @click="openDeleteModal(cat)" class="text-gray-400 hover:text-red-500 transition-colors"><Trash2 class="w-4 h-4" /></button>
        </div>
      </div>
      <div v-if="!filteredCategories.length" class="py-12 text-center">
        <Tag class="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p class="text-gray-500 text-sm">Belum ada kategori untuk {{ activeTab }}</p>
      </div>
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
                <input v-model="modalForm.nama" type="text" placeholder="Masukkan nama kategori" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': modalError }" />
                <p v-if="modalError" class="mt-1 text-xs text-red-500">{{ modalError }}</p>
              </div>
            </div>
            <div class="flex gap-3 mt-5">
              <button @click="closeModal" class="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button @click="saveCategory" class="flex-1 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg">Simpan</button>
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
            <p class="text-sm text-gray-500 mb-5">Yakin ingin menghapus <strong>{{ deleteTarget.nama }}</strong>?</p>
            <div class="flex gap-3">
              <button @click="deleteTarget = null" class="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button @click="doDelete" class="flex-1 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg">Hapus</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { categories, type Category } from '~/data/categories'
import { businessList } from '~/data/dashboard'
import { Plus, Edit, Trash2, Tag, Soup, CupSoda, Utensils, Store } from 'lucide-vue-next'

const toast = useToastStore()

function getBusinessIcon(name: string) {
  return { Soup, CupSoda, Utensils, Store }[name] || Store
}

const activeTab = ref('Wonton')
const localCategories = ref([...categories])

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const modalForm = reactive({ nama: '' })
const modalError = ref('')
const deleteTarget = ref<Category | null>(null)

const filteredCategories = computed(() => localCategories.value.filter((c) => c.bisnis === activeTab.value))

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  modalForm.nama = ''
  modalError.value = ''
  showModal.value = true
}

function openEditModal(cat: Category) {
  isEditing.value = true
  editingId.value = cat.id
  modalForm.nama = cat.nama
  modalError.value = ''
  showModal.value = true
}

function openDeleteModal(cat: Category) {
  deleteTarget.value = cat
}

function closeModal() {
  showModal.value = false
}

function saveCategory() {
  if (!modalForm.nama || modalForm.nama.length < 3) {
    modalError.value = 'Nama kategori minimal 3 karakter'
    return
  }

  const exists = localCategories.value.some(
    (c) => c.bisnis === activeTab.value && c.nama.toLowerCase() === modalForm.nama.toLowerCase() && c.id !== editingId.value
  )
  if (exists) {
    modalError.value = 'Kategori sudah ada'
    return
  }

  if (isEditing.value && editingId.value) {
    const cat = localCategories.value.find((c) => c.id === editingId.value)
    if (cat) cat.nama = modalForm.nama
    toast.success('Kategori berhasil diperbarui')
  } else {
    localCategories.value.push({
      id: `CAT-${Date.now()}`,
      nama: modalForm.nama,
      bisnis: activeTab.value,
      jumlah_produk: 0,
    })
    toast.success('Kategori berhasil ditambahkan')
  }

  closeModal()
}

function doDelete() {
  if (deleteTarget.value) {
    localCategories.value = localCategories.value.filter((c) => c.id !== deleteTarget.value!.id)
    toast.success(`Kategori "${deleteTarget.value.nama}" berhasil dihapus`)
    deleteTarget.value = null
  }
}
</script>

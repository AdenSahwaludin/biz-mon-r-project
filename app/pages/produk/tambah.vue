<template>
  <div class="max-w-2xl mx-auto">
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h2 class="text-lg font-bold text-gray-900 mb-6">Tambah Produk Baru</h2>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Bisnis -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Bisnis <span class="text-red-500">*</span></label>
          <select v-model="form.businessId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': errors.businessId }">
            <option value="">Pilih bisnis</option>
            <option v-for="b in businessList" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
          <p v-if="errors.businessId" class="mt-1 text-xs text-red-500">{{ errors.businessId }}</p>
        </div>

        <!-- Nama -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Nama Produk <span class="text-red-500">*</span></label>
          <input v-model="form.name" type="text" placeholder="Masukkan nama produk" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': errors.name }" />
          <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
        </div>

        <!-- Barcode -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Barcode</label>
          <input v-model="form.barcode" type="text" placeholder="Scan atau masukkan barcode" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
          <p v-if="errors.barcode" class="mt-1 text-xs text-red-500">{{ errors.barcode }}</p>
        </div>

        <!-- Kategori -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Kategori <span class="text-red-500">*</span></label>
          <select v-model="form.categoryId" :disabled="!form.businessId || isCategoriesLoading" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-100" :class="{ 'border-red-400': errors.categoryId }">
            <option value="">{{ form.businessId ? (isCategoriesLoading ? 'Memuat kategori...' : 'Pilih kategori') : 'Pilih bisnis terlebih dahulu' }}</option>
            <option v-for="cat in availableCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
          <p v-if="errors.categoryId" class="mt-1 text-xs text-red-500">{{ errors.categoryId }}</p>
        </div>

        <!-- Harga + Stok -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Harga <span class="text-red-500">*</span></label>
            <RupiahInput v-model="form.price" :error="!!errors.price" placeholder="0" />
            <p v-if="errors.price" class="mt-1 text-xs text-red-500">{{ errors.price }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Stok <span class="text-red-500">*</span></label>
            <input v-model.number="form.stock" type="number" min="0" placeholder="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': errors.stock }" />
            <p v-if="errors.stock" class="mt-1 text-xs text-red-500">{{ errors.stock }}</p>
          </div>
        </div>

        <!-- Satuan -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Satuan <span class="text-red-500">*</span></label>
          <input v-model="form.unit" type="text" placeholder="pcs / porsi / kg / botol" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': errors.unit }" />
          <p v-if="errors.unit" class="mt-1 text-xs text-red-500">{{ errors.unit }}</p>
        </div>

        <!-- Status Toggle -->
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-gray-700">Status Produk</label>
          <button type="button" @click="form.isActive = !form.isActive" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors" :class="form.isActive ? 'bg-primary-600' : 'bg-gray-300'">
            <span class="inline-block h-4 w-4 rounded-full bg-white transition-transform" :class="form.isActive ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4 border-t border-gray-200">
          <NuxtLink to="/produk" class="flex-1 py-2.5 text-sm font-medium text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Batal</NuxtLink>
          <button type="submit" :disabled="isLoading" class="flex-1 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <svg v-if="isLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            {{ isLoading ? 'Menyimpan...' : 'Simpan Produk' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'

const bizStore = useBusinessStore()
const businessList = computed(() => bizStore.businesses)
const toast = useToastStore()
const { fetchWithAuth } = useApi()

const isLoading = ref(false)
const isCategoriesLoading = ref(false)
const availableCategories = ref<any[]>([])

const form = reactive({
  businessId: '',
  name: '',
  barcode: '',
  categoryId: '',
  price: 0,
  stock: 0,
  unit: '',
  isActive: true,
})

const errors = reactive({
  businessId: '',
  name: '',
  barcode: '',
  categoryId: '',
  price: '',
  stock: '',
  unit: '',
})

onMounted(async () => {
  if (businessList.value.length === 0) {
    await bizStore.fetchAll()
  }
})

watch(() => form.businessId, async (newId) => {
  form.categoryId = ''
  availableCategories.value = []
  if (newId) {
    isCategoriesLoading.value = true
    try {
      const res = await fetchWithAuth<any>(`/categories?businessId=${newId}`)
      if (res.success) availableCategories.value = res.data
    } catch (e) {
      toast.error('Gagal memuat kategori')
    } finally {
      isCategoriesLoading.value = false
    }
  }
})

function validate(): boolean {
  let valid = true
  Object.keys(errors).forEach((k) => ((errors as any)[k] = ''))

  if (!form.businessId) { errors.businessId = 'Bisnis wajib dipilih'; valid = false }
  if (!form.name || form.name.length < 3) { errors.name = form.name ? 'Nama produk minimal 3 karakter' : 'Nama produk wajib diisi'; valid = false }
  if (!form.categoryId) { errors.categoryId = 'Kategori wajib dipilih'; valid = false }
  if (!form.price || form.price <= 0) { errors.price = 'Harga harus lebih dari 0'; valid = false }
  else if (form.price > 2000000000) { errors.price = 'Maksimal harga adalah Rp 2.000.000.000'; valid = false }

  if (form.stock < 0) { errors.stock = 'Stok tidak boleh negatif'; valid = false }
  else if (form.stock > 2000000000) { errors.stock = 'Maksimal stok adalah 2.000.000.000'; valid = false }
  if (!form.unit || form.unit.length < 2) { errors.unit = 'Satuan wajib diisi'; valid = false }

  return valid
}

async function handleSubmit() {
  if (!validate()) return
  isLoading.value = true
  try {
    const res = await fetchWithAuth<any>('/products', {
      method: 'POST',
      body: form
    })
    
    if (res.success) {
      toast.success('Produk berhasil ditambahkan')
      navigateTo('/produk')
    } else {
      toast.error(res.message || 'Gagal menyimpan produk')
      if (res.message?.includes('Barcode')) {
        errors.barcode = res.message
      }
    }
  } catch (e: any) {
    toast.error(e.data?.message || 'Terjadi kesalahan saat menyimpan produk')
  } finally {
    isLoading.value = false
  }
}
</script>

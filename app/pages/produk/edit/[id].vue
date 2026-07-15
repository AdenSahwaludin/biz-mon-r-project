<template>
  <div class="max-w-2xl mx-auto">
    <div v-if="product" class="bg-white rounded-xl border border-gray-200 p-6">
      <h2 class="text-lg font-bold text-gray-900 mb-6">Edit Produk</h2>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Bisnis (readonly) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Bisnis</label>
          <input :value="form.bisnis" type="text" disabled class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-500 cursor-not-allowed" />
        </div>

        <!-- Nama -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Nama Produk <span class="text-red-500">*</span></label>
          <input v-model="form.nama" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': errors.nama }" />
          <p v-if="errors.nama" class="mt-1 text-xs text-red-500">{{ errors.nama }}</p>
        </div>

        <!-- Barcode -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Barcode</label>
          <input v-model="form.barcode" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>

        <!-- Kategori -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Kategori <span class="text-red-500">*</span></label>
          <select v-model="form.kategori" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': errors.kategori }">
            <option value="">Pilih kategori</option>
            <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <p v-if="errors.kategori" class="mt-1 text-xs text-red-500">{{ errors.kategori }}</p>
        </div>

        <!-- Harga + Stok -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Harga <span class="text-red-500">*</span></label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
              <input v-model.number="form.harga" type="number" min="0" class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': errors.harga }" />
            </div>
            <p v-if="errors.harga" class="mt-1 text-xs text-red-500">{{ errors.harga }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Stok <span class="text-red-500">*</span></label>
            <input v-model.number="form.stok" type="number" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': errors.stok }" />
            <p v-if="errors.stok" class="mt-1 text-xs text-red-500">{{ errors.stok }}</p>
          </div>
        </div>

        <!-- Satuan -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Satuan <span class="text-red-500">*</span></label>
          <input v-model="form.satuan" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': errors.satuan }" />
          <p v-if="errors.satuan" class="mt-1 text-xs text-red-500">{{ errors.satuan }}</p>
        </div>

        <!-- Status -->
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-gray-700">Status Produk</label>
          <button type="button" @click="form.status = form.status === 'Aktif' ? 'Nonaktif' : 'Aktif'" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors" :class="form.status === 'Aktif' ? 'bg-primary-600' : 'bg-gray-300'">
            <span class="inline-block h-4 w-4 rounded-full bg-white transition-transform" :class="form.status === 'Aktif' ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>

        <div class="flex gap-3 pt-4 border-t border-gray-200">
          <NuxtLink to="/produk" class="flex-1 py-2.5 text-sm font-medium text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Batal</NuxtLink>
          <button type="submit" :disabled="isLoading" class="flex-1 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50">
            {{ isLoading ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </form>
    </div>
    <div v-else class="bg-white rounded-xl border border-gray-200 py-16 text-center">
      <span class="text-4xl block mb-3">🔍</span>
      <p class="text-gray-500 font-medium">Produk tidak ditemukan</p>
      <NuxtLink to="/produk" class="inline-block mt-3 text-sm text-primary-600 font-medium">← Kembali</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { products } from '~/data/products'
import { categoriesByBisnis } from '~/data/categories'

const route = useRoute()
const toast = useToastStore()
const isLoading = ref(false)

const product = computed(() => products.find((p) => p.id === route.params.id))

const form = reactive({
  bisnis: product.value?.bisnis || '',
  nama: product.value?.nama || '',
  barcode: product.value?.barcode || '',
  kategori: product.value?.kategori || '',
  harga: product.value?.harga || 0,
  stok: product.value?.stok || 0,
  satuan: product.value?.satuan || '',
  status: (product.value?.status || 'Aktif') as 'Aktif' | 'Nonaktif',
})

const errors = reactive({ nama: '', kategori: '', harga: '', stok: '', satuan: '' })
const availableCategories = computed(() => categoriesByBisnis[form.bisnis] || [])

function validate(): boolean {
  let valid = true
  Object.keys(errors).forEach((k) => ((errors as any)[k] = ''))
  if (!form.nama || form.nama.length < 3) { errors.nama = 'Nama produk minimal 3 karakter'; valid = false }
  if (!form.kategori) { errors.kategori = 'Kategori wajib dipilih'; valid = false }
  if (!form.harga || form.harga <= 0) { errors.harga = 'Harga harus lebih dari 0'; valid = false }
  if (form.stok < 0) { errors.stok = 'Stok tidak boleh negatif'; valid = false }
  if (!form.satuan || form.satuan.length < 2) { errors.satuan = 'Satuan wajib diisi'; valid = false }
  return valid
}

async function handleSubmit() {
  if (!validate()) return
  isLoading.value = true
  await new Promise((r) => setTimeout(r, 1000))
  isLoading.value = false
  toast.success('Produk berhasil diperbarui')
  navigateTo('/produk')
}
</script>

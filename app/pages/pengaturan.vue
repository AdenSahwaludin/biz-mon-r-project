<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Umum -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="text-base font-semibold text-gray-900 mb-4">Umum</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Nama Toko</label>
          <input v-model="settings.namaToko" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label>
          <textarea v-model="settings.alamat" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">No. Telepon</label>
          <input v-model="settings.telepon" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
      </div>
    </div>

    <!-- Tampilan -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="text-base font-semibold text-gray-900 mb-4">Tampilan</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-gray-700">Tema</label>
          <select v-model="settings.tema" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
            <option value="terang">Terang</option>
            <option value="gelap">Gelap</option>
          </select>
        </div>
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-gray-700">Bahasa</label>
          <select disabled class="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-500 cursor-not-allowed">
            <option>Indonesia</option>
          </select>
        </div>
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-gray-700">Format Tanggal</label>
          <select v-model="settings.formatTanggal" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-gray-700">Item per Halaman</label>
          <select v-model.number="settings.itemPerHalaman" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Struk -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="text-base font-semibold text-gray-900 mb-4">Struk</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Header Struk</label>
          <input v-model="settings.headerStruk" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Footer Struk</label>
          <input v-model="settings.footerStruk" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-gray-700">Tampilkan Logo</label>
          <button type="button" @click="settings.tampilkanLogo = !settings.tampilkanLogo" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors" :class="settings.tampilkanLogo ? 'bg-primary-600' : 'bg-gray-300'">
            <span class="inline-block h-4 w-4 rounded-full bg-white transition-transform" :class="settings.tampilkanLogo ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
      </div>
    </div>

    <!-- Save -->
    <button @click="saveSettings" class="w-full sm:w-auto px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
      Simpan Pengaturan
    </button>
  </div>
</template>

<script setup lang="ts">
const toast = useToastStore()

const settings = reactive({
  namaToko: 'Biz-Mon-R',
  alamat: 'Jl. Contoh No. 1, Kota Bandung',
  telepon: '0812-3456-7890',
  tema: 'terang',
  formatTanggal: 'DD/MM/YYYY',
  itemPerHalaman: 10,
  headerStruk: 'BIZ-MON-R',
  footerStruk: 'Terima Kasih!',
  tampilkanLogo: true,
})

function saveSettings() {
  toast.success('Pengaturan berhasil disimpan')
}
</script>

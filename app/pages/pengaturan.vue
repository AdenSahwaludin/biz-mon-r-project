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

    <!-- Kelola Bisnis -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 class="text-base font-bold text-gray-900">Kelola Bisnis & Cabang</h3>
          <p class="text-xs text-gray-500 mt-0.5">Aktifkan, nonaktifkan, atau hapus bisnis dan cabang di dalam sistem.</p>
        </div>
        
        <button
          type="button"
          @click="navigateTo('/pilih-bisnis')"
          class="px-3.5 py-2 text-xs font-bold text-primary-600 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
        >
          <Building class="w-4 h-4 text-primary-600" /> Atur Semua Bisnis →
        </button>
      </div>

      <div class="space-y-4">
        <div v-for="biz in bizStore.groupedBusinesses" :key="biz.id" class="border border-gray-200 rounded-lg overflow-hidden">
          <!-- Business Row -->
          <div class="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white" :style="{ backgroundColor: biz.color }">
                <span class="font-bold text-xs">{{ biz.name.charAt(0) }}</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ biz.name }}</p>
                <p class="text-xs text-gray-500">{{ biz.isActive ? 'Aktif' : 'Nonaktif' }}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <button type="button" @click="bizStore.toggleBusinessStatus(biz.id)" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors" :class="biz.isActive ? 'bg-primary-600' : 'bg-gray-300'" title="Status Aktif/Nonaktif">
                <span class="inline-block h-4 w-4 rounded-full bg-white transition-transform" :class="biz.isActive ? 'translate-x-6' : 'translate-x-1'" />
              </button>
              
              <button
                type="button"
                @click="confirmDelete('business', biz.id, biz.name)"
                class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Hapus Bisnis"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Branches List -->
          <div class="p-2 space-y-1 bg-white">
            <div v-for="branch in (biz.branches || [])" :key="branch.id" class="flex items-center justify-between p-3 rounded-md hover:bg-gray-50">
              <div class="pl-2">
                <p class="text-sm font-medium text-gray-800">{{ branch.name }}</p>
                <p class="text-xs text-gray-500">{{ branch.isActive ? 'Aktif' : 'Nonaktif' }}</p>
              </div>

              <div class="flex items-center gap-2.5">
                <button type="button" @click="bizStore.toggleBranchStatus(branch.id)" class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors" :class="branch.isActive ? 'bg-green-500' : 'bg-gray-300'" title="Status Aktif/Nonaktif">
                  <span class="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform" :class="branch.isActive ? 'translate-x-4' : 'translate-x-1'" />
                </button>

                <button
                  type="button"
                  @click="confirmDelete('branch', branch.id, branch.name, biz.name)"
                  class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Hapus Cabang"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div v-if="!biz.branches?.length" class="text-xs text-center text-gray-400 py-3">
              Belum ada cabang
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Save -->
    <button @click="saveSettings" class="w-full sm:w-auto px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
      Simpan Pengaturan
    </button>

    <!-- Modal Konfirmasi Hapus -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
        <div class="bg-white rounded-2xl w-full max-w-md p-6 text-center shadow-xl">
          <div class="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Trash2 class="w-6 h-6" />
          </div>
          
          <h3 class="text-lg font-bold text-gray-900 mb-1">
            Konfirmasi Hapus {{ deleteTarget?.type === 'business' ? 'Bisnis' : 'Cabang' }}
          </h3>
          
          <p class="text-sm text-gray-600 mb-4">
            Apakah Anda yakin ingin menghapus <strong class="text-gray-900">{{ deleteTarget?.name }}</strong>
            <span v-if="deleteTarget?.type === 'branch'"> pada bisnis <strong>{{ deleteTarget?.parentName }}</strong></span>?
          </p>

          <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs mb-4 text-left font-medium">
            ⚠️ {{ errorMessage }}
          </div>

          <div class="flex gap-3">
            <button
              @click="closeDeleteModal"
              :disabled="isDeleting"
              class="flex-1 py-2.5 px-4 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              @click="executeDelete"
              :disabled="isDeleting"
              class="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span v-if="isDeleting" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
              <span>Hapus Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Building, Trash2 } from 'lucide-vue-next'

const toast = useToastStore()
const bizStore = useBusinessStore()
const settingsStore = useSettingsStore()

const settings = reactive({
  namaToko: settingsStore.namaToko,
  alamat: settingsStore.alamat,
  telepon: settingsStore.telepon,
  tema: 'terang',
  formatTanggal: 'DD/MM/YYYY',
  itemPerHalaman: 10,
  headerStruk: settingsStore.headerStruk,
  footerStruk: settingsStore.footerStruk,
  tampilkanLogo: true,
})

const showDeleteModal = ref(false)
const deleteTarget = ref<{ type: 'business' | 'branch', id: string, name: string, parentName?: string } | null>(null)
const isDeleting = ref(false)
const errorMessage = ref('')

function confirmDelete(type: 'business' | 'branch', id: string, name: string, parentName?: string) {
  deleteTarget.value = { type, id, name, parentName }
  errorMessage.value = ''
  showDeleteModal.value = true
}

function closeDeleteModal(force = false) {
  if (isDeleting.value && !force) return
  showDeleteModal.value = false
  deleteTarget.value = null
  errorMessage.value = ''
}

async function executeDelete() {
  if (!deleteTarget.value) return
  isDeleting.value = true
  errorMessage.value = ''

  try {
    let res: any
    if (deleteTarget.value.type === 'business') {
      res = await bizStore.deleteBusiness(deleteTarget.value.id)
    } else {
      res = await bizStore.deleteBranch(deleteTarget.value.id)
    }

    if (res.success) {
      toast.success(res.message || 'Berhasil dihapus')
      isDeleting.value = false
      closeDeleteModal(true)
    } else {
      errorMessage.value = res.message || 'Gagal menghapus'
      toast.error(res.message || 'Gagal menghapus')
    }
  } catch (e: any) {
    const msg = e.data?.message || e.message || 'Gagal menghapus'
    errorMessage.value = msg
    toast.error(msg)
  } finally {
    isDeleting.value = false
  }
}

function saveSettings() {
  settingsStore.saveSettings(settings)
  toast.success('Pengaturan berhasil disimpan')
}
</script>

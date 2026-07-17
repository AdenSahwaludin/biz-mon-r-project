<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Pilih Bisnis & Cabang</h1>
      <p class="text-gray-500 mt-1">Pilih cabang bisnis yang ingin Anda kelola</p>
    </div>

    <div v-if="bizStore.isLoading" class="text-center py-12">
      <p class="text-gray-500">Memuat data...</p>
    </div>
    
    <div v-else class="space-y-8">
      <!-- Group by Business -->
      <div v-for="biz in bizStore.groupedBusinesses" :key="biz.id" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        <!-- Business Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between" :style="{ backgroundColor: biz.color + '05' }">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0" :style="{ backgroundColor: biz.color + '15', color: biz.color }">
              <component :is="getBusinessIcon(biz.icon)" class="w-6 h-6" />
            </div>
            <h2 class="text-lg font-bold text-gray-900">{{ biz.name }}</h2>
          </div>
          <button @click="openAddBranchModal(biz)" class="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
            <Plus class="w-4 h-4" /> Tambah Cabang
          </button>
        </div>

        <!-- Branches Grid -->
        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            v-for="branch in biz.branches"
            :key="branch.id"
            @click="selectBranch(branch.id)"
            class="group bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md hover:border-gray-300 transition-all duration-200 relative overflow-hidden flex flex-col"
          >
            <div class="absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-1.5" :style="{ backgroundColor: biz.color }" />
            
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-semibold text-gray-900 group-hover:text-gray-700">{{ branch.name }}</h3>
                <span v-if="!branch.isActive" class="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">Nonaktif</span>
              </div>
              <div class="text-gray-300 group-hover:text-gray-500 transition-colors">
                <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </div>
            </div>
          </button>
          
          <div v-if="!biz.branches || biz.branches.length === 0" class="col-span-full text-center py-4 text-sm text-gray-400 font-medium">
            Belum ada cabang.
          </div>
        </div>
      </div>

      <!-- Add New Business -->
      <div class="text-center pt-4">
        <button
          @click="showAddBusinessModal = true"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition-colors font-medium"
        >
          <Plus class="w-5 h-5" />
          Daftarkan Bisnis Baru
        </button>
      </div>
    </div>

    <!-- Modal Tambah Cabang -->
    <div v-if="showAddBranchModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-md p-6">
        <h2 class="text-xl font-bold mb-1">Tambah Cabang Baru</h2>
        <p class="text-sm text-gray-500 mb-5">Untuk bisnis: <strong>{{ targetBusiness?.name }}</strong></p>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Cabang</label>
            <input v-model="newBranchName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500 outline-none" placeholder="Misal: Cabang 3" />
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button @click="showAddBranchModal = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Batal</button>
          <button @click="handleAddBranch" :disabled="!newBranchName || isSaving" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-semibold flex items-center">
            <span v-if="isSaving" class="mr-2">...</span> Simpan Cabang
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Tambah Bisnis -->
    <div v-if="showAddBusinessModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-md p-6">
        <h2 class="text-xl font-bold mb-4">Daftarkan Bisnis Baru</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Bisnis Utama</label>
            <input v-model="newBiz.nama" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500 outline-none" placeholder="Misal: Kopi Kenangan" />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Ikon</label>
            <div class="flex gap-2">
              <button v-for="icon in ['Store', 'Soup', 'CupSoda', 'Utensils']" :key="icon" @click="newBiz.icon = icon" :class="['w-10 h-10 flex items-center justify-center rounded-lg border', newBiz.icon === icon ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50']">
                <component :is="getBusinessIcon(icon)" class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Warna Aksen</label>
            <div class="flex gap-2">
              <button v-for="color in ['#3B82F6', '#14B8A6', '#F97316', '#F43F5E', '#8B5CF6', '#22C55E']" :key="color" @click="newBiz.color = color" class="w-8 h-8 rounded-full border-2 focus:outline-none" :class="[newBiz.color === color ? 'border-gray-900 shadow-md scale-110' : 'border-transparent']" :style="{ backgroundColor: color }"></button>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button @click="showAddBusinessModal = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Batal</button>
          <button @click="handleAddBusiness" :disabled="!newBiz.nama || isSaving" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-semibold flex items-center">
            <span v-if="isSaving" class="mr-2">...</span> Simpan Bisnis
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Soup, CupSoda, Utensils, Store, Plus } from 'lucide-vue-next'
import type { Business } from '~/stores/business'

definePageMeta({ layout: 'select' })

const bizStore = useBusinessStore()
const toast = useToastStore()

onMounted(async () => {
  await bizStore.fetchAll()
})

const showAddBusinessModal = ref(false)
const showAddBranchModal = ref(false)
const targetBusiness = ref<Business | null>(null)
const newBranchName = ref('')
const isSaving = ref(false)

const newBiz = ref({
  nama: '',
  icon: 'Store',
  color: '#3B82F6'
})

function getBusinessIcon(name: string) {
  return { Soup, CupSoda, Utensils, Store }[name] || Store
}

function selectBranch(branchId: string) {
  bizStore.setBranch(branchId)
  navigateTo(`/dashboard`)
}

function openAddBranchModal(biz: Business) {
  targetBusiness.value = biz
  newBranchName.value = ''
  showAddBranchModal.value = true
}

async function handleAddBranch() {
  if (!newBranchName.value || !targetBusiness.value) return
  isSaving.value = true
  try {
    const res = await bizStore.addBranch({
      name: newBranchName.value,
      businessId: targetBusiness.value.id
    })
    if (res.success) {
      toast.success('Cabang berhasil ditambahkan')
      showAddBranchModal.value = false
    } else {
      toast.error(res.message || 'Gagal menambahkan cabang')
    }
  } catch (e: any) {
    toast.error(e.message || 'Gagal menambahkan cabang')
  } finally {
    isSaving.value = false
  }
}

async function handleAddBusiness() {
  if (!newBiz.value.nama) return
  isSaving.value = true
  try {
    const slug = newBiz.value.nama.toLowerCase().replace(/\s+/g, '-')
    const res = await bizStore.addBusiness({
      name: newBiz.value.nama,
      slug: slug,
      icon: newBiz.value.icon,
      color: newBiz.value.color
    })
    
    if (res.success) {
      // API currently creates business but wait, does API create default branch? No, API POST /businesses doesn't.
      // But let's assume business is created, user can add branch manually.
      toast.success('Bisnis berhasil didaftarkan')
      showAddBusinessModal.value = false
      newBiz.value = { nama: '', icon: 'Store', color: '#3B82F6' }
    } else {
      toast.error(res.message || 'Gagal mendaftar bisnis')
    }
  } catch (e: any) {
    toast.error(e.message || 'Gagal mendaftar bisnis')
  } finally {
    isSaving.value = false
  }
}
</script>

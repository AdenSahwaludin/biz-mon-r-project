<template>
  <div>
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
      <div class="relative flex-1 w-full sm:max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input v-model="search" type="text" placeholder="Cari nama atau username..." class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
      </div>
      <button @click="openModal()" class="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors shrink-0">
        <Plus class="w-4 h-4" /> Tambah User
      </button>
    </div>

    <!-- Desktop Table -->
    <div class="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Pengguna</th>
            <th class="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Username</th>
            <th class="text-center text-xs font-medium text-gray-500 uppercase py-3 px-4">Role</th>
            <th class="text-center text-xs font-medium text-gray-500 uppercase py-3 px-4">Cabang</th>
            <th class="text-center text-xs font-medium text-gray-500 uppercase py-3 px-4">Status</th>
            <th class="text-center text-xs font-medium text-gray-500 uppercase py-3 px-4">Aksi</th>
          </tr>
        </thead>
        <tbody v-if="isLoading">
          <tr>
            <td colspan="6" class="py-8 text-center text-gray-500">Memuat pengguna...</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr v-for="u in filteredUsers" :key="u.id" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <td class="py-3 px-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold shrink-0">
                  {{ getInitials(u.name) }}
                </div>
                <span class="text-sm font-medium text-gray-900">{{ u.name }}</span>
              </div>
            </td>
            <td class="py-3 px-4 text-sm text-gray-600">{{ u.username }}</td>
            <td class="py-3 px-4 text-center">
              <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'">{{ u.role }}</span>
            </td>
            <td class="py-3 px-4 text-sm text-gray-500 text-center">{{ u.branch ? (u.branch.business.name + ' - ' + u.branch.name) : '—' }}</td>
            <td class="py-3 px-4 text-center">
              <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">{{ u.isActive ? 'Aktif' : 'Nonaktif' }}</span>
            </td>
            <td class="py-3 px-4 text-center">
              <div class="flex items-center justify-center gap-2">
                <button @click="openModal(u)" class="text-gray-400 hover:text-primary-600 transition-colors"><Edit class="w-4 h-4" /></button>
                <button v-if="u.role !== 'ADMIN'" @click="confirmDeleteUser = u" class="text-gray-400 hover:text-red-500 transition-colors"><Trash2 class="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div class="sm:hidden space-y-3">
      <div v-if="isLoading" class="text-center py-8 text-gray-500">Memuat pengguna...</div>
      <div v-else v-for="u in filteredUsers" :key="u.id" class="bg-white border border-gray-200 rounded-xl p-4">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">{{ getInitials(u.name) }}</div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-gray-900">{{ u.name }}</p>
            <p class="text-xs text-gray-400">{{ u.username }}</p>
          </div>
          <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">{{ u.isActive ? 'Aktif' : 'Nonaktif' }}</span>
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <span class="font-medium px-2 py-0.5 rounded-full" :class="u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'">{{ u.role }}</span>
          <span v-if="u.branch">· {{ u.branch.business.name }} - {{ u.branch.name }}</span>
        </div>
        <div class="flex gap-2 pt-3 border-t border-gray-100">
          <button @click="openModal(u)" class="flex-1 py-2 text-sm text-center font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Edit</button>
          <button v-if="u.role !== 'ADMIN'" @click="confirmDeleteUser = u" class="flex-1 py-2 text-sm text-center font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50">Hapus</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4">
          <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 class="text-lg font-bold text-gray-900 mb-4">{{ isEditing ? 'Edit Pengguna' : 'Tambah Pengguna' }}</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama <span class="text-red-500">*</span></label>
                <input v-model="mForm.name" type="text" placeholder="Masukkan nama" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': mErrors.name }" />
                <p v-if="mErrors.name" class="mt-1 text-xs text-red-500">{{ mErrors.name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Username <span class="text-red-500">*</span></label>
                <input v-model="mForm.username" type="text" placeholder="Masukkan username login" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': mErrors.username }" />
                <p v-if="mErrors.username" class="mt-1 text-xs text-red-500">{{ mErrors.username }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Role <span class="text-red-500">*</span></label>
                <select v-model="mForm.role" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': mErrors.role }" :disabled="isEditing && (localUsers.find(u => u.id === editingId)?.role === 'ADMIN')">
                  <option value="">Pilih role</option>
                  <option value="ADMIN">Admin</option>
                  <option value="KARYAWAN">Karyawan</option>
                </select>
                <p v-if="mErrors.role" class="mt-1 text-xs text-red-500">{{ mErrors.role }}</p>
              </div>
              <div v-if="mForm.role === 'KARYAWAN'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Cabang <span class="text-red-500">*</span></label>
                <select v-model="mForm.branchId" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': mErrors.branchId }">
                  <option value="">Pilih cabang</option>
                  <optgroup v-for="biz in businessList" :key="biz.id" :label="biz.name">
                    <option v-for="branch in biz.branches" :key="branch.id" :value="branch.id">
                      {{ branch.name }}
                    </option>
                  </optgroup>
                </select>
                <p v-if="mErrors.branchId" class="mt-1 text-xs text-red-500">{{ mErrors.branchId }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password <span v-if="!isEditing" class="text-red-500">*</span></label>
                <input v-model="mForm.password" type="password" :placeholder="isEditing ? 'Kosongkan jika tidak diubah' : 'Min. 6 karakter'" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': mErrors.password }" />
                <p v-if="mErrors.password" class="mt-1 text-xs text-red-500">{{ mErrors.password }}</p>
              </div>
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-700">Status</label>
                <button type="button" @click="mForm.isActive = !mForm.isActive" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors" :class="mForm.isActive ? 'bg-primary-600' : 'bg-gray-300'">
                  <span class="inline-block h-4 w-4 rounded-full bg-white transition-transform" :class="mForm.isActive ? 'translate-x-6' : 'translate-x-1'" />
                </button>
              </div>
            </div>
            <div class="flex gap-3 mt-5">
              <button @click="showModal = false" class="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button @click="saveUser" :disabled="isSaving" class="flex-1 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50">
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
        <div v-if="confirmDeleteUser" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl">
            <h3 class="text-lg font-bold text-gray-900 mb-2">Hapus Pengguna</h3>
            <p class="text-sm text-gray-500 mb-5">Yakin ingin menghapus <strong>{{ confirmDeleteUser.name }}</strong>?</p>
            <div class="flex gap-3">
              <button @click="confirmDeleteUser = null" class="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button @click="deleteUser" :disabled="isSaving" class="flex-1 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50">
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
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Plus, Edit, Trash2 } from 'lucide-vue-next'

const bizStore = useBusinessStore()
const businessList = computed(() => bizStore.groupedBusinesses)
const toast = useToastStore()
const { fetchWithAuth } = useApi()

const search = ref('')
const localUsers = ref<any[]>([])
const isLoading = ref(false)
const isSaving = ref(false)

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const confirmDeleteUser = ref<any | null>(null)

const mForm = reactive({
  name: '', username: '', role: '' as string, branchId: '', password: '', isActive: true,
})
const mErrors = reactive({ name: '', username: '', role: '', branchId: '', password: '' })

onMounted(async () => {
  if (businessList.value.length === 0) {
    await bizStore.fetchAll()
  }
  await fetchUsers()
})

async function fetchUsers() {
  isLoading.value = true
  try {
    const res = await fetchWithAuth<any>('/users')
    if (res.success) {
      localUsers.value = res.data
    }
  } catch (e) {
    toast.error('Gagal memuat pengguna')
  } finally {
    isLoading.value = false
  }
}

const filteredUsers = computed(() => {
  if (!search.value) return localUsers.value
  const q = search.value.toLowerCase()
  return localUsers.value.filter((u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q))
})

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function openModal(user?: any) {
  Object.keys(mErrors).forEach((k) => ((mErrors as any)[k] = ''))
  if (user) {
    isEditing.value = true
    editingId.value = user.id
    mForm.name = user.name
    mForm.username = user.username
    mForm.role = user.role
    mForm.branchId = user.branchId || ''
    mForm.password = ''
    mForm.isActive = user.isActive
  } else {
    isEditing.value = false
    editingId.value = null
    mForm.name = ''; mForm.username = ''; mForm.role = ''; mForm.branchId = ''; mForm.password = ''; mForm.isActive = true
  }
  showModal.value = true
}

async function saveUser() {
  let valid = true
  Object.keys(mErrors).forEach((k) => ((mErrors as any)[k] = ''))
  if (!mForm.name || mForm.name.length < 3) { mErrors.name = 'Nama minimal 3 karakter'; valid = false }
  if (!mForm.username || mForm.username.length < 3) { mErrors.username = 'Username minimal 3 karakter'; valid = false }
  if (!mForm.role) { mErrors.role = 'Role wajib dipilih'; valid = false }
  if (mForm.role === 'KARYAWAN' && !mForm.branchId) { mErrors.branchId = 'Cabang wajib dipilih'; valid = false }
  if (!isEditing.value && (!mForm.password || mForm.password.length < 6)) { mErrors.password = 'Password minimal 6 karakter'; valid = false }
  if (!valid) return

  isSaving.value = true
  try {
    const payload: any = { ...mForm }
    if (isEditing.value && !payload.password) delete payload.password

    const method = isEditing.value ? 'PUT' : 'POST'
    const url = isEditing.value ? `/users/${editingId.value}` : '/users'

    const res = await fetchWithAuth<any>(url, {
      method,
      body: payload
    })

    if (res.success) {
      toast.success(isEditing.value ? 'Pengguna berhasil diperbarui' : 'Pengguna berhasil ditambahkan')
      showModal.value = false
      await fetchUsers()
    } else {
      toast.error(res.message || 'Gagal menyimpan pengguna')
    }
  } catch (e: any) {
    toast.error(e.data?.message || 'Terjadi kesalahan')
  } finally {
    isSaving.value = false
  }
}

async function deleteUser() {
  if (!confirmDeleteUser.value) return
  isSaving.value = true
  try {
    const res = await fetchWithAuth<any>(`/users/${confirmDeleteUser.value.id}`, {
      method: 'DELETE'
    })
    
    if (res.success) {
      toast.success('Pengguna berhasil dihapus')
      await fetchUsers()
    } else {
      toast.error(res.message || 'Gagal menghapus pengguna')
    }
  } catch (e: any) {
    toast.error(e.data?.message || 'Terjadi kesalahan saat menghapus')
  } finally {
    isSaving.value = false
    confirmDeleteUser.value = null
  }
}
</script>

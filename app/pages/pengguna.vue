<template>
  <div>
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
      <div class="relative flex-1 w-full sm:max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input v-model="search" type="text" placeholder="Cari nama atau email..." class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
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
            <th class="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Email</th>
            <th class="text-center text-xs font-medium text-gray-500 uppercase py-3 px-4">Role</th>
            <th class="text-center text-xs font-medium text-gray-500 uppercase py-3 px-4">Bisnis</th>
            <th class="text-center text-xs font-medium text-gray-500 uppercase py-3 px-4">Status</th>
            <th class="text-center text-xs font-medium text-gray-500 uppercase py-3 px-4">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u.id" class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <td class="py-3 px-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold shrink-0">
                  {{ getInitials(u.nama) }}
                </div>
                <span class="text-sm font-medium text-gray-900">{{ u.nama }}</span>
              </div>
            </td>
            <td class="py-3 px-4 text-sm text-gray-600">{{ u.email }}</td>
            <td class="py-3 px-4 text-center">
              <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'">{{ u.role }}</span>
            </td>
            <td class="py-3 px-4 text-sm text-gray-500 text-center">{{ u.bisnis || '—' }}</td>
            <td class="py-3 px-4 text-center">
              <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="u.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">{{ u.status }}</span>
            </td>
            <td class="py-3 px-4 text-center">
              <div class="flex items-center justify-center gap-2">
                <button @click="openModal(u)" class="text-gray-400 hover:text-primary-600 transition-colors"><Edit class="w-4 h-4" /></button>
                <button v-if="u.role !== 'Admin'" @click="confirmDeleteUser = u" class="text-gray-400 hover:text-red-500 transition-colors"><Trash2 class="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div class="sm:hidden space-y-3">
      <div v-for="u in filteredUsers" :key="u.id" class="bg-white border border-gray-200 rounded-xl p-4">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">{{ getInitials(u.nama) }}</div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-gray-900">{{ u.nama }}</p>
            <p class="text-xs text-gray-400">{{ u.email }}</p>
          </div>
          <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="u.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">{{ u.status }}</span>
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <span class="font-medium px-2 py-0.5 rounded-full" :class="u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'">{{ u.role }}</span>
          <span v-if="u.bisnis">· {{ u.bisnis }}</span>
        </div>
        <div class="flex gap-2 pt-3 border-t border-gray-100">
          <button @click="openModal(u)" class="flex-1 py-2 text-sm text-center font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Edit</button>
          <button v-if="u.role !== 'Admin'" @click="confirmDeleteUser = u" class="flex-1 py-2 text-sm text-center font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50">Hapus</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 class="text-lg font-bold text-gray-900 mb-4">{{ isEditing ? 'Edit Pengguna' : 'Tambah Pengguna' }}</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama <span class="text-red-500">*</span></label>
                <input v-model="mForm.nama" type="text" placeholder="Masukkan nama" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': mErrors.nama }" />
                <p v-if="mErrors.nama" class="mt-1 text-xs text-red-500">{{ mErrors.nama }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
                <input v-model="mForm.email" type="email" placeholder="Masukkan email" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': mErrors.email }" />
                <p v-if="mErrors.email" class="mt-1 text-xs text-red-500">{{ mErrors.email }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Role <span class="text-red-500">*</span></label>
                <select v-model="mForm.role" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': mErrors.role }">
                  <option value="">Pilih role</option>
                  <option value="Admin">Admin</option>
                  <option value="Karyawan">Karyawan</option>
                </select>
                <p v-if="mErrors.role" class="mt-1 text-xs text-red-500">{{ mErrors.role }}</p>
              </div>
              <div v-if="mForm.role === 'Karyawan'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Bisnis <span class="text-red-500">*</span></label>
                <select v-model="mForm.bisnis" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': mErrors.bisnis }">
                  <option value="">Pilih bisnis</option>
                  <option v-for="b in businessList" :key="b.slug" :value="b.nama">{{ b.nama }}</option>
                </select>
                <p v-if="mErrors.bisnis" class="mt-1 text-xs text-red-500">{{ mErrors.bisnis }}</p>
              </div>
              <div v-if="!isEditing">
                <label class="block text-sm font-medium text-gray-700 mb-1">Password <span class="text-red-500">*</span></label>
                <input v-model="mForm.password" type="password" placeholder="Min. 6 karakter" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': mErrors.password }" />
                <p v-if="mErrors.password" class="mt-1 text-xs text-red-500">{{ mErrors.password }}</p>
              </div>
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-700">Status</label>
                <button type="button" @click="mForm.status = mForm.status === 'Aktif' ? 'Nonaktif' : 'Aktif'" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors" :class="mForm.status === 'Aktif' ? 'bg-primary-600' : 'bg-gray-300'">
                  <span class="inline-block h-4 w-4 rounded-full bg-white transition-transform" :class="mForm.status === 'Aktif' ? 'translate-x-6' : 'translate-x-1'" />
                </button>
              </div>
            </div>
            <div class="flex gap-3 mt-5">
              <button @click="showModal = false" class="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button @click="saveUser" class="flex-1 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg">Simpan</button>
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
            <p class="text-sm text-gray-500 mb-5">Yakin ingin menghapus <strong>{{ confirmDeleteUser.nama }}</strong>?</p>
            <div class="flex gap-3">
              <button @click="confirmDeleteUser = null" class="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button @click="deleteUser" class="flex-1 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg">Hapus</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { users, type User } from '~/data/users'
import { businessList } from '~/data/dashboard'
import { Search, Plus, Edit, Trash2 } from 'lucide-vue-next'

const toast = useToastStore()
const search = ref('')
const localUsers = ref([...users])
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const confirmDeleteUser = ref<User | null>(null)

const mForm = reactive({
  nama: '', email: '', role: '' as string, bisnis: '', password: '', status: 'Aktif' as 'Aktif' | 'Nonaktif',
})
const mErrors = reactive({ nama: '', email: '', role: '', bisnis: '', password: '' })

const filteredUsers = computed(() => {
  if (!search.value) return localUsers.value
  const q = search.value.toLowerCase()
  return localUsers.value.filter((u) => u.nama.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
})

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function openModal(user?: User) {
  Object.keys(mErrors).forEach((k) => ((mErrors as any)[k] = ''))
  if (user) {
    isEditing.value = true
    editingId.value = user.id
    mForm.nama = user.nama
    mForm.email = user.email
    mForm.role = user.role
    mForm.bisnis = user.bisnis || ''
    mForm.password = ''
    mForm.status = user.status
  } else {
    isEditing.value = false
    editingId.value = null
    mForm.nama = ''; mForm.email = ''; mForm.role = ''; mForm.bisnis = ''; mForm.password = ''; mForm.status = 'Aktif'
  }
  showModal.value = true
}

function saveUser() {
  let valid = true
  Object.keys(mErrors).forEach((k) => ((mErrors as any)[k] = ''))
  if (!mForm.nama || mForm.nama.length < 3) { mErrors.nama = 'Nama minimal 3 karakter'; valid = false }
  if (!mForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mForm.email)) { mErrors.email = 'Email tidak valid'; valid = false }
  if (!mForm.role) { mErrors.role = 'Role wajib dipilih'; valid = false }
  if (mForm.role === 'Karyawan' && !mForm.bisnis) { mErrors.bisnis = 'Bisnis wajib dipilih'; valid = false }
  if (!isEditing.value && (!mForm.password || mForm.password.length < 6)) { mErrors.password = 'Password minimal 6 karakter'; valid = false }
  if (!valid) return

  if (isEditing.value && editingId.value) {
    const u = localUsers.value.find((u) => u.id === editingId.value)
    if (u) {
      u.nama = mForm.nama; u.email = mForm.email; u.role = mForm.role as any; u.bisnis = mForm.bisnis; u.status = mForm.status
    }
    toast.success('Pengguna berhasil diperbarui')
  } else {
    localUsers.value.push({
      id: `USR-${Date.now()}`,
      nama: mForm.nama,
      email: mForm.email,
      password: mForm.password,
      role: mForm.role as any,
      bisnis: mForm.bisnis || undefined,
      status: mForm.status,
      tanggal_bergabung: new Date().toISOString().slice(0, 10),
    })
    toast.success('Pengguna berhasil ditambahkan')
  }
  showModal.value = false
}

function deleteUser() {
  if (confirmDeleteUser.value) {
    localUsers.value = localUsers.value.filter((u) => u.id !== confirmDeleteUser.value!.id)
    toast.success(`Pengguna "${confirmDeleteUser.value.nama}" berhasil dihapus`)
    confirmDeleteUser.value = null
  }
}
</script>

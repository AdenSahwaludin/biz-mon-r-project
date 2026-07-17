<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Profile Card -->
    <div class="bg-white rounded-xl border border-gray-200 p-6 text-center">
      <div class="w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
        {{ auth.userInitials }}
      </div>
      <h2 class="text-xl font-bold text-gray-900">{{ auth.user?.name }}</h2>
      <p class="text-sm text-gray-500 mt-0.5">{{ auth.user?.role }}</p>
      <p class="text-sm text-gray-400 mt-1">{{ auth.user?.username }}</p>
    </div>

    <!-- Edit Profile -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="text-base font-semibold text-gray-900 mb-4">Informasi Pribadi</h3>
      <form @submit.prevent="saveProfile" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Nama <span class="text-red-500">*</span></label>
          <input v-model="profileForm.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Username <span class="text-red-500">*</span></label>
          <input v-model="profileForm.username" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
        </div>
        <button type="submit" class="w-full sm:w-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
          Simpan Perubahan
        </button>
      </form>
    </div>

    <!-- Change Password -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h3 class="text-base font-semibold text-gray-900 mb-4">Ubah Password</h3>
      <form @submit.prevent="changePassword" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Password Lama</label>
          <input v-model="pwForm.old" type="password" placeholder="Masukkan password lama" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': pwErrors.old }" />
          <p v-if="pwErrors.old" class="mt-1 text-xs text-red-500">{{ pwErrors.old }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Password Baru</label>
          <input v-model="pwForm.new_" type="password" placeholder="Min. 6 karakter" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': pwErrors.new_ }" />
          <p v-if="pwErrors.new_" class="mt-1 text-xs text-red-500">{{ pwErrors.new_ }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password</label>
          <input v-model="pwForm.confirm" type="password" placeholder="Ulangi password baru" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" :class="{ 'border-red-400': pwErrors.confirm }" />
          <p v-if="pwErrors.confirm" class="mt-1 text-xs text-red-500">{{ pwErrors.confirm }}</p>
        </div>
        <button type="submit" class="w-full sm:w-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
          Ubah Password
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const fmt = useFormatCurrency()
const toast = useToastStore()

const profileForm = reactive({
  name: auth.user?.name || '',
  username: auth.user?.username || '',
})

const pwForm = reactive({ old: '', new_: '', confirm: '' })
const pwErrors = reactive({ old: '', new_: '', confirm: '' })

async function saveProfile() {
  if (!profileForm.name || profileForm.name.length < 3) {
    toast.error('Nama minimal 3 karakter')
    return
  }
  const res = await auth.updateProfile(profileForm.name, profileForm.username)
  if (res.success) {
    toast.success('Profil berhasil diperbarui')
  } else {
    toast.error(res.message || 'Gagal menyimpan profil')
  }
}

async function changePassword() {
  let valid = true
  Object.keys(pwErrors).forEach((k) => ((pwErrors as any)[k] = ''))

  if (!pwForm.old) { pwErrors.old = 'Password lama wajib diisi'; valid = false }
  if (!pwForm.new_ || pwForm.new_.length < 6) { pwErrors.new_ = 'Password baru minimal 6 karakter'; valid = false }
  if (pwForm.new_ !== pwForm.confirm) { pwErrors.confirm = 'Konfirmasi password tidak sesuai'; valid = false }
  if (!valid) return

  const res = await auth.changePassword(pwForm.old, pwForm.new_)
  if (res.success) {
    toast.success('Password berhasil diubah')
    pwForm.old = ''; pwForm.new_ = ''; pwForm.confirm = ''
  } else {
    toast.error(res.message || 'Gagal mengubah password')
    if (res.message?.includes('Password lama')) {
      pwErrors.old = res.message
    }
  }
}
</script>

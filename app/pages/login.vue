<template>
  <div class="w-full max-w-md mx-auto">
    <div class="bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-primary-200">
          B
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Selamat Datang</h1>
        <p class="text-sm text-gray-500 mt-1">Masuk ke akun Anda</p>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600">
        <AlertCircle class="w-4 h-4 shrink-0" />
        {{ errorMessage }}
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="nama@email.com"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
            :class="{ 'border-red-400 focus:ring-red-400': errors.email }"
          />
          <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Masukkan password"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm pr-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
              :class="{ 'border-red-400 focus:ring-red-400': errors.password }"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>
            </button>
          </div>
          <p v-if="errors.password" class="mt-1 text-xs text-red-500">{{ errors.password }}</p>
        </div>

        <!-- Remember -->
        <div class="flex items-center">
          <input id="remember" v-model="remember" type="checkbox" class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
          <label for="remember" class="ml-2 text-sm text-gray-600">Ingat saya</label>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg v-if="isLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
          {{ isLoading ? 'Memproses...' : 'Masuk' }}
        </button>
      </form>

      <!-- Demo Accounts -->
      <div class="mt-6 pt-6 border-t border-gray-100">
        <p class="text-xs text-gray-400 text-center mb-3">Demo: klik untuk mengisi otomatis</p>
        <div class="space-y-2">
          <button
            v-for="demo in demoAccounts"
            :key="demo.email"
            @click="fillDemo(demo)"
            class="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs transition-colors flex items-center justify-between"
          >
            <span class="text-gray-600"><strong>{{ demo.role }}</strong> — {{ demo.email }}</span>
            <span class="text-gray-400">→</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <p class="text-center text-xs text-white/60 mt-6">© 2026 Biz-Mon-R. All rights reserved.</p>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'
definePageMeta({ layout: 'auth' })

const auth = useAuthStore()

const email = ref('')
const password = ref('')
const remember = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const errors = reactive({ email: '', password: '' })

const demoAccounts = [
  { email: 'aden@bizmonr.com', password: 'admin123', role: 'Admin' },
  { email: 'dedi@bizmonr.com', password: 'karyawan123', role: 'Karyawan (Sembako)' },
  { email: 'siti@bizmonr.com', password: 'karyawan123', role: 'Karyawan (Wonton)' },
  { email: 'budi@bizmonr.com', password: 'karyawan123', role: 'Karyawan (Es Teh)' },
]

function fillDemo(demo: { email: string; password: string }) {
  email.value = demo.email
  password.value = demo.password
}

function validate(): boolean {
  errors.email = ''
  errors.password = ''
  let valid = true

  if (!email.value) {
    errors.email = 'Email wajib diisi'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.email = 'Format email tidak valid'
    valid = false
  }

  if (!password.value) {
    errors.password = 'Password wajib diisi'
    valid = false
  } else if (password.value.length < 6) {
    errors.password = 'Password minimal 6 karakter'
    valid = false
  }

  return valid
}

async function handleLogin() {
  errorMessage.value = ''
  if (!validate()) return

  isLoading.value = true
  await new Promise((r) => setTimeout(r, 1000))

  const result = auth.login(email.value, password.value)
  isLoading.value = false

  if (!result.success) {
    errorMessage.value = result.message
    return
  }

  if (auth.isAdmin) {
    navigateTo('/pilih-bisnis')
  } else {
    const biz = useBusinessStore()
    const slug = biz.nameToSlug(auth.user!.bisnis!)
    biz.setBisnis(slug)
    navigateTo('/transaksi')
  }
}
</script>

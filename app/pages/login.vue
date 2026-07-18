<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <!-- Logo & Title -->
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-sm">
          B
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Masuk ke Biz-Mon-R</h1>
        <p class="text-sm text-gray-500 mt-2">Silakan masuk menggunakan akun Anda</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <!-- Username -->
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="Masukkan username admin / karyawan"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
            :class="{ 'border-red-400 focus:ring-red-400': errors.username }"
          />
          <p v-if="errors.username" class="mt-1 text-xs text-red-500">{{ errors.username }}</p>
        </div>

        <!-- Password -->
        <div>
          <div class="relative">
            <input
              id="password"
              v-model="form.password"
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
              <Eye v-if="!showPassword" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
            </button>
          </div>
          <p v-if="errors.password" class="mt-1 text-xs text-red-500">{{ errors.password }}</p>
        </div>

        <button type="submit" :disabled="isLoading" class="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors flex justify-center items-center">
          <span v-if="isLoading" class="mr-2 animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
          Masuk ke Dashboard
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

definePageMeta({
  layout: false,
})

const auth = useAuthStore()

const form = reactive({
  username: '',
  password: '',
})
const showPassword = ref(false)
const isLoading = ref(false)

const errors = reactive({ username: '', password: '' })

async function handleLogin() {
  if (isLoading.value) return
  
  errors.username = ''
  errors.password = ''

  if (!form.username) errors.username = 'Username wajib diisi'
  if (!form.password) errors.password = 'Password wajib diisi'
  if (errors.username || errors.password) return

  isLoading.value = true
  const result = await auth.login(form.username, form.password)
  isLoading.value = false

  if (result.success) {
    navigateTo(auth.isAdmin ? '/pilih-bisnis' : '/transaksi')
  } else {
    errors.username = result.message
  }
}
</script>

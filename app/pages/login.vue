<template>
  <div class="min-h-screen w-full flex flex-col lg:flex-row bg-slate-900 text-gray-800 font-sans overflow-hidden">
    <!-- Left Hero Banner (Desktop / Tablet Large) -->
    <div class="hidden lg:flex lg:w-7/12 xl:w-2/3 relative bg-cover bg-center flex-col justify-between p-12 text-white overflow-hidden" style="background-image: url('/bg.png');">
      <!-- Dark overlay gradient -->
      <div class="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-transparent z-0"></div>
      
      <!-- Brand Header -->
      <div class="relative z-10 flex items-center gap-3">
        <div class="w-10 h-10 bg-white/95 rounded-xl shadow-md border border-white/20 flex items-center justify-center overflow-hidden p-0.5 backdrop-blur-sm">
          <img src="/logo.png" alt="PantauBisnis Logo" class="w-12 h-12 object-contain" />
        </div>
        <div>
          <span class="text-2xl font-bold tracking-tight text-white">Pantau<span class="text-cyan-400">Bisnis</span></span>
          <p class="text-xs text-cyan-200/80 font-medium">Enterprise Multi-Business Management</p>
        </div>
      </div>

      <!-- Main Visual & Content -->
      <div class="relative z-10 max-w-xl my-auto space-y-6 py-12">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold backdrop-blur-md">
          <Sparkles class="w-3.5 h-3.5" />
          <span>Sistem Monitoring Real-Time & POS Multi Cabang</span>
        </div>

        <h1 class="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
          Kelola Banyak Bisnis dalam <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Satu Portal Terpadu</span>
        </h1>
        
        <p class="text-slate-300 text-base leading-relaxed">
          Pantau stok produk, alur kasir POS, riwayat transaksi, hingga laporan keuangan cabang secara langsung dan akurat dari mana saja.
        </p>

        <!-- Feature Badges -->
        <div class="grid grid-cols-3 gap-4 pt-4">
          <div class="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl space-y-1">
            <div class="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300 mb-2">
              <TrendingUp class="w-4 h-4" />
            </div>
            <p class="text-xs text-slate-300 font-medium">Laporan Real-Time</p>
            <p class="text-sm font-bold text-white">Analitik Akurat</p>
          </div>

          <div class="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl space-y-1">
            <div class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-300 mb-2">
              <Building2 class="w-4 h-4" />
            </div>
            <p class="text-xs text-slate-300 font-medium">Multi Cabang</p>
            <p class="text-sm font-bold text-white">Satu Akun Admin</p>
          </div>

          <div class="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl space-y-1">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300 mb-2">
              <ShieldCheck class="w-4 h-4" />
            </div>
            <p class="text-xs text-slate-300 font-medium">Keamanan Akses</p>
            <p class="text-sm font-bold text-white">Role Admin & Kasir</p>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="relative z-10 text-xs text-slate-400 flex items-center justify-between border-t border-white/10 pt-4">
        <span>&copy; {{ new Date().getFullYear() }} PantauBisnis System. All rights reserved.</span>
        <span class="flex items-center gap-1 text-slate-300 font-medium">
          <CheckCircle2 class="w-3.5 h-3.5 text-cyan-400" /> Version 2.0 (Nuxt 4)
        </span>
      </div>
    </div>

    <!-- Right Login Form Section -->
    <div class="w-full lg:w-5/12 xl:w-1/3 min-h-screen flex flex-col justify-center items-center p-6 sm:p-10 bg-slate-900 lg:bg-white relative">
      <!-- Mobile Background image with dark overlay -->
      <div class="lg:hidden absolute inset-0 bg-cover bg-center" style="background-image: url('/bg.png');">
        <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
      </div>

      <div class="w-full max-w-md relative z-10 bg-white lg:bg-transparent p-6 sm:p-8 lg:p-0 rounded-2xl shadow-2xl lg:shadow-none border border-slate-100 lg:border-none">
        <!-- Brand Header for Mobile / Tablet -->
        <div class="text-center mb-6">
          <div class="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200/80 flex items-center justify-center mx-auto mb-3 overflow-hidden p-0.5">
            <img src="/logo.png" alt="PantauBisnis Logo" class="w-20 h-20 object-contain" />
          </div>
          <h2 class="text-xl font-extrabold text-slate-900 tracking-tight">Masuk ke PantauBisnis</h2>
          <p class="text-xs text-slate-500 mt-1">Masukkan kredensial akun Anda untuk mengakses sistem</p>
        </div>
        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Username Input -->
          <div>
            <label for="username" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Username
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User class="w-4 h-4" />
              </div>
              <input
                id="username"
                v-model="form.username"
                type="text"
                placeholder="Masukkan username"
                class="w-full pl-10 pr-4 py-3 bg-slate-50 lg:bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                :class="{ 'border-red-400 focus:ring-red-400 bg-red-50/30': errors.username }"
              />
            </div>
            <p v-if="errors.username" class="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
              <span>{{ errors.username }}</span>
            </p>
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock class="w-4 h-4" />
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan password"
                class="w-full pl-10 pr-11 py-3 bg-slate-50 lg:bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                :class="{ 'border-red-400 focus:ring-red-400 bg-red-50/30': errors.password }"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                title="Tampilkan password"
              >
                <Eye v-if="!showPassword" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
            <p v-if="errors.password" class="mt-1.5 text-xs text-red-500 font-medium">
              {{ errors.password }}
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
            <span v-else class="flex items-center gap-2">
              Masuk ke Dashboard
              <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { User, Lock, Eye, EyeOff, ShieldCheck, TrendingUp, Building2, Sparkles, CheckCircle2, ArrowRight } from 'lucide-vue-next'

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

function fillDemo(user: string, pass: string) {
  form.username = user
  form.password = pass
  errors.username = ''
  errors.password = ''
}

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

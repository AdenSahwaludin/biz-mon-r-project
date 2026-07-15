<template>
  <div class="min-h-screen bg-background">
    <!-- Navbar only -->
    <nav class="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 shadow-sm flex items-center px-6">
      <NuxtLink to="/pilih-bisnis" class="flex items-center gap-2">
        <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">B</div>
        <span class="text-lg font-bold text-gray-900">Biz-Mon-R</span>
      </NuxtLink>
      <div class="flex-1" />
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-600 hidden sm:block">{{ auth.user?.nama }}</span>
        <button
          @click="auth.logout()"
          class="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          Keluar
        </button>
      </div>
    </nav>
    <!-- Content -->
    <main class="p-6">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()
</script>

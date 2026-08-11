<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-950">
    <div class="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
  </div>
</template>

<script setup lang="ts">
const token = useCookie('auth_token')
if (token.value) {
  navigateTo('/transaksi')
} else {
  navigateTo('/login')
}
</script>

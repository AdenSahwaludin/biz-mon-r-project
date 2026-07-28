<template>
  <div class="p-8 text-center text-gray-500">
    Mengarahkan ke Riwayat Transaksi...
  </div>
</template>

<script setup lang="ts">
onMounted(() => {
  navigateTo('/riwayat-transaksi', { replace: true })
})
</script>

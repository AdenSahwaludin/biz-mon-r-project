<template>
  <div class="p-8 text-center text-gray-500">
    Mengarahkan ke Detail Transaksi...
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

onMounted(() => {
  const id = route.params.id as string
  navigateTo(`/riwayat-transaksi/${encodeURIComponent(id)}`, { replace: true })
})
</script>

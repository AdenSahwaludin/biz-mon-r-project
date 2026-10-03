<template>
  <NuxtLoadingIndicator color="#4f46e5" :height="3" />
  <NuxtLayout>
    <!-- KeepAlive: halaman yang sudah dibuka tidak di-mount ulang -> pindah menu satset -->
    <NuxtPage :keepalive="{ max: 10 }" />
  </NuxtLayout>
  <ToastContainer />
</template>

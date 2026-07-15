<template>
  <div class="max-w-2xl mx-auto">
    <div v-if="trx" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-900">Detail Transaksi</h2>
          <span class="text-xs font-medium px-2.5 py-1 rounded-full" :class="trx.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
            {{ trx.status }}
          </span>
        </div>
        <p class="text-sm font-mono text-primary-600 font-semibold">{{ trx.id }}</p>
      </div>

      <!-- Info -->
      <div class="p-6 border-b border-gray-200 grid grid-cols-2 gap-4">
        <div>
          <p class="text-xs text-gray-400 mb-0.5">Bisnis</p>
          <p class="text-sm font-medium text-gray-900">{{ trx.bisnis }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 mb-0.5">Tanggal</p>
          <p class="text-sm font-medium text-gray-900">{{ fmt.formatDateTime(trx.tanggal) }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 mb-0.5">Kasir</p>
          <p class="text-sm font-medium text-gray-900">{{ trx.kasir }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400 mb-0.5">Metode</p>
          <p class="text-sm font-medium text-gray-900">{{ trx.metode_pembayaran }}</p>
        </div>
      </div>

      <!-- Items -->
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Item Transaksi</h3>
        <div class="space-y-3">
          <div v-for="(item, idx) in trx.items" :key="idx" class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-900">{{ item.produk }}</p>
              <p class="text-xs text-gray-400">{{ item.qty }} × {{ fmt.format(item.harga) }}</p>
            </div>
            <p class="text-sm font-medium text-gray-900">{{ fmt.format(item.subtotal) }}</p>
          </div>
        </div>
      </div>

      <!-- Totals -->
      <div class="p-6 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Subtotal</span>
          <span class="text-gray-900 font-medium">{{ fmt.format(trx.total) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Bayar</span>
          <span class="text-gray-900 font-medium">{{ fmt.format(trx.bayar) }}</span>
        </div>
        <div class="flex justify-between text-base font-bold border-t border-gray-100 pt-2 mt-2">
          <span class="text-gray-700">Kembalian</span>
          <span class="text-green-600">{{ fmt.format(trx.kembalian) }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="p-6 border-t border-gray-200 flex gap-3">
        <button @click="$router.back()" class="flex-1 py-2.5 px-4 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          ← Kembali
        </button>
        <button @click="window.print()" class="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
          Cetak Struk
        </button>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="bg-white rounded-xl border border-gray-200 py-16 text-center">
      <Search class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 font-medium">Transaksi tidak ditemukan</p>
      <NuxtLink to="/transaksi/riwayat" class="inline-block mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium">
        ← Kembali ke Riwayat
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { transactions } from '~/data/transactions'
import { Search } from 'lucide-vue-next'

const route = useRoute()
const fmt = useFormatCurrency()

const trx = computed(() => {
  const id = route.params.id as string
  return transactions.find((t) => t.id === id) || null
})
</script>

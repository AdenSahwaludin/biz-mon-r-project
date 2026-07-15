<template>
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Pilih Bisnis</h1>
      <p class="text-gray-500 mt-1">Pilih bisnis yang ingin Anda kelola</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        v-for="biz in businessList"
        :key="biz.slug"
        @click="selectBusiness(biz.slug)"
        class="group bg-white border border-gray-200 rounded-xl p-6 text-left hover:shadow-lg hover:border-gray-300 transition-all duration-200 relative overflow-hidden"
      >
        <!-- Accent Top -->
        <div class="absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-1.5" :style="{ backgroundColor: biz.color }" />

        <div class="flex items-start gap-4">
          <!-- Icon -->
          <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0" :style="{ backgroundColor: biz.color + '15', color: biz.color }">
            <component :is="getBusinessIcon(biz.icon)" class="w-8 h-8" />
          </div>

          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-gray-900 group-hover:text-gray-700">{{ biz.nama }}</h3>
            <div class="mt-2 space-y-1">
              <p class="text-sm text-gray-500">Omzet Hari Ini</p>
              <p class="text-xl font-bold" :style="{ color: biz.color }">{{ fmt.format(dashData[biz.slug].omzet_hari_ini) }}</p>
              <p class="text-xs text-gray-400">{{ dashData[biz.slug].jumlah_transaksi_hari_ini }} transaksi</p>
            </div>
          </div>

          <!-- Arrow -->
          <div class="text-gray-300 group-hover:text-gray-500 transition-colors mt-2">
            <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { dashboardData, businessList } from '~/data/dashboard'
import { Soup, CupSoda, Utensils, Store } from 'lucide-vue-next'

definePageMeta({ layout: 'select' })

const bizStore = useBusinessStore()
const fmt = useFormatCurrency()
const dashData = dashboardData

function getBusinessIcon(name: string) {
  return { Soup, CupSoda, Utensils, Store }[name] || Store
}

function selectBusiness(slug: string) {
  bizStore.setBisnis(slug)
  navigateTo(`/dashboard/${slug}`)
}
</script>

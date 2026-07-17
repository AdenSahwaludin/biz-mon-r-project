<template>
  <div class="min-h-screen bg-background">
    <!-- Mobile Overlay -->
    <Transition name="fade">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transition-all duration-200 flex flex-col',
        sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-64',
      ]"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center gap-3 px-5 border-b border-gray-200 shrink-0">
        <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">B</div>
        <span class="text-lg font-bold text-gray-900">Biz-Mon-R</span>
        <button @click="sidebarOpen = false" class="ml-auto lg:hidden text-gray-400 hover:text-gray-600">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Business Indicator -->
      <div v-if="biz.activeBusiness" class="mx-4 mt-4 mb-2 px-3 py-2 rounded-lg text-sm font-medium flex items-center" :style="{ backgroundColor: biz.activeBusiness.color + '15', color: biz.activeBusiness.color }">
        <component :is="getBusinessIcon(biz.activeBusiness.icon)" class="w-4 h-4 mr-2 shrink-0" />
        <span class="truncate">{{ biz.activeBusiness.name }} - {{ biz.activeBranch?.name }}</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <template v-for="item in navItems" :key="item.label">
          <p v-if="item.divider" class="px-3 pt-4 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{{ item.label }}</p>
          <NuxtLink
            v-else-if="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            :class="isActive(item.to) ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            @click="sidebarOpen = false"
          >
            <component :is="item.icon" class="w-5 h-5 shrink-0" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </template>
      </nav>

      <!-- User Footer -->
      <div class="border-t border-gray-200 p-4 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
            {{ auth.userInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ auth.user?.name }}</p>
            <p class="text-xs text-gray-500">{{ auth.user?.role }}</p>
          </div>
          <button @click="auth.logout()" class="text-gray-400 hover:text-red-500 transition-colors" title="Keluar">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="lg:ml-64 min-h-screen flex flex-col">
      <!-- Navbar -->
      <header class="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 shadow-sm flex items-center px-4 lg:px-6 shrink-0">
        <!-- Hamburger -->
        <button @click="sidebarOpen = true" class="lg:hidden mr-3 text-gray-500 hover:text-gray-700">
          <Menu class="w-6 h-6" />
        </button>

        <!-- Page Title / Breadcrumb -->
        <div class="flex-1 min-w-0">
          <h1 class="text-lg font-semibold text-gray-900 truncate">{{ pageTitle }}</h1>
        </div>

        <!-- Right section -->
        <div class="flex items-center gap-4">
          <!-- Business Indicator for Karyawan -->
          <div v-if="auth.isKaryawan && auth.userBranch" class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
            <component :is="getBusinessIcon(auth.userBusiness?.name)" class="w-4 h-4 text-gray-500" />
            <span class="text-sm font-medium text-gray-700">
              {{ auth.userBusiness?.name }}
              <span class="text-gray-400 font-normal"> - {{ auth.userBranch.name }}</span>
            </span>
          </div>

          <!-- Business Selector Dropdown for Admin -->
          <div class="relative" v-else-if="biz.activeBusiness">
            <button
              @click="showBizDropdown = !showBizDropdown"
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm transition-colors"
            >
              <component :is="getBusinessIcon(biz.activeBusiness.icon)" class="w-4 h-4" :style="{ color: biz.activeBusiness.color }" />
              <span class="hidden sm:block text-gray-700">{{ biz.activeBusiness.name }} - {{ biz.activeBranch?.name }}</span>
              <ChevronDown class="w-4 h-4 text-gray-400" />
            </button>
            <Transition name="fade">
              <div v-if="showBizDropdown" class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div class="max-h-64 overflow-y-auto">
                  <div v-for="b in biz.groupedBusinesses" :key="b.id">
                    <div class="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 flex items-center gap-2">
                      <component :is="getBusinessIcon(b.icon)" class="w-3 h-3" :style="{ color: b.color }" />
                      {{ b.name }}
                    </div>
                    <button
                      v-for="branch in b.branches"
                      :key="branch.id"
                      @click="switchBranch(branch.id)"
                      class="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      :class="branch.id === biz.activeBranchId ? 'bg-primary-50 text-primary-600' : 'text-gray-700'"
                    >
                      <span class="ml-5">{{ branch.name }}</span>
                    </button>
                  </div>
                </div>
                <div class="border-t border-gray-100 mt-1 pt-1">
                  <NuxtLink
                    to="/pilih-bisnis"
                    @click="showBizDropdown = false"
                    class="block px-4 py-2 text-sm text-center text-primary-600 font-medium hover:bg-gray-50"
                  >
                    Atur Semua Bisnis
                  </NuxtLink>
                </div>
              </div>
            </Transition>
          </div>

          <!-- User Avatar -->
          <div class="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold">
            {{ auth.userInitials }}
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-4 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { BarChart2, CreditCard, Package, Tag, ClipboardList, TrendingUp, Users, User, Settings, LogOut, Menu, ChevronDown, ChevronLeft, ChevronRight, X, Soup, CupSoda, Utensils, Store } from 'lucide-vue-next'

const auth = useAuthStore()
const biz = useBusinessStore()
const route = useRoute()

const sidebarOpen = ref(false)
const showBizDropdown = ref(false)

function getBusinessIcon(name: string | undefined) {
  if (!name) return Store
  return { Soup, CupSoda, Utensils, Store }[name] || Store
}

const pageTitle = computed(() => {
  const name = route.name as string
  const titles: Record<string, string> = {
    'dashboard': `Dashboard ${biz.activeBusiness?.name || ''}`,
    'produk': 'Produk',
    'produk-tambah': 'Tambah Produk',
    'produk-edit-id': 'Edit Produk',
    'produk-kategori': 'Kategori Produk',
    'transaksi': 'Transaksi',
    'transaksi-riwayat': 'Riwayat Transaksi',
    'transaksi-id': 'Detail Transaksi',
    'laporan': 'Laporan',
    'pengguna': 'Pengguna',
    'profil': 'Profil',
    'pengaturan': 'Pengaturan',
  }
  return titles[name] || 'Biz-Mon-R'
})

const navItems = computed(() => {
  if (auth.isKaryawan) {
    return [
      { label: 'Menu', divider: true },
      { to: '/transaksi', label: 'Transaksi', icon: CreditCard },
      { to: '/transaksi/riwayat', label: 'Riwayat', icon: ClipboardList },
      { label: 'Akun', divider: true },
      { to: '/profil', label: 'Profil', icon: User },
    ]
  }
  return [
    { label: 'Utama', divider: true },
    { to: `/dashboard`, label: 'Dashboard', icon: BarChart2 },
    { to: '/transaksi', label: 'Transaksi', icon: CreditCard },
    { label: 'Kelola', divider: true },
    { to: '/produk', label: 'Produk', icon: Package },
    { to: '/produk/kategori', label: 'Kategori', icon: Tag },
    { to: '/transaksi/riwayat', label: 'Riwayat Transaksi', icon: ClipboardList },
    { to: '/laporan', label: 'Laporan', icon: TrendingUp },
    { label: 'Administrasi', divider: true },
    { to: '/pengguna', label: 'Pengguna', icon: Users },
    { to: '/profil', label: 'Profil', icon: User },
    { to: '/pengaturan', label: 'Pengaturan', icon: Settings },
  ]
})

function isActive(to: string): boolean {
  if (!to) return false
  if (route.path === to) return true
  
  if (to === '/transaksi' && route.path.startsWith('/transaksi/riwayat')) return false
  if (to === '/produk' && route.path.startsWith('/produk/kategori')) return false

  return route.path.startsWith(to + '/')
}

function switchBranch(branchId: string) {
  biz.setBranch(branchId)
  showBizDropdown.value = false
  // Stay on the same page and reload to fetch data for the new branch
  window.location.reload()
}

// Close dropdown on click outside
onMounted(async () => {
  if (biz.businesses.length === 0) {
    await biz.fetchAll()
  }

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      showBizDropdown.value = false
    }
  })
})
</script>

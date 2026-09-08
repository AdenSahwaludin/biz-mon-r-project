// KARYAWAN boleh buka (sesuai sidebar default.vue): /transaksi, /riwayat-transaksi,
// /produk, /produk/kategori, /laporan/harian, /profil.
// Yang admin-only: dashboard, laporan penuh, pengguna, pengaturan, pilih-bisnis.
const ADMIN_ONLY_PREFIXES = ['/dashboard', '/pengguna', '/pengaturan', '/pilih-bisnis', '/laporan']

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  // Samakan dengan stores/auth.ts (7 hari) agar tidak logout prematur/loop
  const token = useCookie('auth_token', { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })

  // 1. Restore auth state if cookie exists but store state is not hydrated
  if (token.value && !authStore.isLoggedIn) {
    const ok = await authStore.fetchUser()
    if (!ok) {
      token.value = null
      if (to.path !== '/login') {
        return navigateTo('/login')
      }
      return
    }
    const bizStore = useBusinessStore()
    if (authStore.user?.role === 'KARYAWAN' && authStore.user?.branch?.id) {
      bizStore.setBranch(authStore.user.branch.id)
    }
    await bizStore.fetchAll()
  }

  // 2. Protect non-public routes (all pages except /login)
  if (!authStore.isLoggedIn && to.path !== '/login') {
    return navigateTo('/login')
  }

  // 3. Prevent logged-in users from seeing the login page
  if (authStore.isLoggedIn && to.path === '/login') {
    return navigateTo(authStore.isAdmin ? '/pilih-bisnis' : '/transaksi')
  }

  // 4. Role guard: KARYAWAN tidak boleh buka halaman admin via URL langsung.
  // /laporan/harian tetap boleh untuk karyawan, yang diblokir hanya /laporan penuh.
  if (authStore.isLoggedIn && !authStore.isAdmin) {
    if (to.path === '/laporan/harian' || to.path.startsWith('/laporan/harian/')) {
      return
    }
    const isAdminPage = ADMIN_ONLY_PREFIXES.some((p) => to.path === p || to.path.startsWith(p + '/'))
    if (isAdminPage) {
      return navigateTo('/transaksi')
    }
  }
})

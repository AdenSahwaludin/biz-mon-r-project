export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  // Login di simpan selama 3 hari
  const token = useCookie('auth_token', { path: '/', maxAge: 60 * 60 * 24 * 3, sameSite: 'lax' })

  // 1. Restore auth state if cookie exists but store state is not hydrated
  if (token.value && !authStore.isLoggedIn) {
    await authStore.fetchUser()
    if (authStore.user?.role === 'KARYAWAN' && authStore.user?.branch?.id) {
      console.log('Middleware: Setting branch for employee', authStore.user.branch.id)
      const bizStore = useBusinessStore()
      bizStore.setBranch(authStore.user.branch.id)
    }
  }

  // 2. Protect non-public routes (all pages except /login)
  if (!authStore.isLoggedIn && to.path !== '/login') {
    return navigateTo('/login')
  }

  // 3. Prevent logged-in users from seeing the login page
  if (authStore.isLoggedIn && to.path === '/login') {
    return navigateTo(authStore.isAdmin ? '/pilih-bisnis' : '/transaksi')
  }
})

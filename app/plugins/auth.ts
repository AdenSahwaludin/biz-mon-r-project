export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore()
  const token = useCookie('auth_token', { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })

  if (token.value && !authStore.isLoggedIn) {
    await authStore.fetchUser()
  }
})

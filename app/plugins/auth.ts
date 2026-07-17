export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore()
  const token = useCookie('auth_token')

  if (token.value && !authStore.isLoggedIn) {
    await authStore.fetchUser()
  }
})

export const useApi = () => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')

  const fetchWithAuth = async <T>(url: string, options: any = {}) => {
    const headers = options.headers || {}
    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }

    try {
      const response = await $fetch<T>(url, {
        ...options,
        baseURL: '/api',
        headers
      })
      return response
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Unauthorized, maybe clear token and redirect to login
        token.value = null
        const auth = useAuthStore()
        auth.isLoggedIn = false
        auth.user = null
        navigateTo('/login')
      }
      throw error
    }
  }

  return { fetchWithAuth }
}

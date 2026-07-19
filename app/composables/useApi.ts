export const useApi = () => {
  const token = useCookie('auth_token', { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })

  const fetchWithAuth = async <T>(url: string, options: any = {}) => {
    const headers = options.headers || {}

    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }

    if (import.meta.server) {
      const reqHeaders = useRequestHeaders(['cookie'])
      if (reqHeaders.cookie) {
        headers['cookie'] = reqHeaders.cookie
      }
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
        token.value = null
        const auth = useAuthStore()
        auth.isLoggedIn = false
        auth.user = null
        if (import.meta.client) {
          navigateTo('/login')
        }
      }
      throw error
    }
  }

  return { fetchWithAuth }
}

import { defineStore } from 'pinia'

interface User {
  id: string
  name: string
  username: string
  role: string
  branch?: { id: string; name: string } | null
  business?: { id: string; name: string } | null
}

interface AuthState {
  user: User | null
  isLoggedIn: boolean
}

const COOKIE_OPTS = { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' as const }

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isLoggedIn: false,
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'ADMIN',
    isKaryawan: (state) => state.user?.role === 'KARYAWAN',
    userBranch: (state) => state.user?.branch || null,
    userBusiness: (state) => state.user?.business || null,
    userInitials: (state) => {
      if (!state.user) return ''
      return state.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },
  },

  actions: {
    async login(username: string, password: string): Promise<{ success: boolean; message: string }> {
      try {
        const { fetchWithAuth } = useApi()
        const response = await fetchWithAuth<any>('/auth/login', {
          method: 'POST',
          body: { username, password }
        })
        
        if (response.success) {
          const token = useCookie('auth_token', COOKIE_OPTS)
          token.value = response.data.token
          
          this.user = response.data.user
          this.isLoggedIn = true
          return { success: true, message: 'Login berhasil' }
        }
        return { success: false, message: response.message || 'Login gagal' }
      } catch (error: any) {
        return { success: false, message: error.data?.message || 'Terjadi kesalahan' }
      }
    },

    async fetchUser() {
      const token = useCookie('auth_token', COOKIE_OPTS)
      if (!token.value) {
        this.isLoggedIn = false
        this.user = null
        return false
      }
      
      try {
        const { fetchWithAuth } = useApi()
        const response = await fetchWithAuth<any>('/auth/me')
        if (response.success) {
          this.user = response.data
          this.isLoggedIn = true
          return true
        }
        token.value = null
        this.isLoggedIn = false
        this.user = null
        return false
      } catch (error) {
        token.value = null
        this.isLoggedIn = false
        this.user = null
        return false
      }
    },

    logout() {
      const token = useCookie('auth_token', COOKIE_OPTS)
      token.value = null
      this.user = null
      this.isLoggedIn = false
      navigateTo('/login')
    },

    async updateProfile(name: string, username: string) {
      try {
        const { fetchWithAuth } = useApi()
        const response = await fetchWithAuth<any>('/auth/profile', {
          method: 'PUT',
          body: { name, username }
        })
        
        if (response.success && this.user) {
          this.user = { ...this.user, name, username }
          return { success: true }
        }
        return { success: false, message: response.message }
      } catch (error: any) {
        return { success: false, message: error.data?.message || 'Gagal menyimpan profil' }
      }
    },

    async changePassword(oldPassword: string, newPassword: string) {
      try {
        const { fetchWithAuth } = useApi()
        const response = await fetchWithAuth<any>('/auth/profile', {
          method: 'PUT',
          body: { oldPassword, password: newPassword }
        })
        
        if (response.success) {
          return { success: true }
        }
        return { success: false, message: response.message }
      } catch (error: any) {
        return { success: false, message: error.data?.message || 'Gagal mengubah password' }
      }
    },
  },
})

import { defineStore } from 'pinia'
import { users, type User } from '~/data/users'

interface AuthState {
  user: User | null
  isLoggedIn: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isLoggedIn: false,
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'Admin',
    isKaryawan: (state) => state.user?.role === 'Karyawan',
    userBisnis: (state) => state.user?.bisnis || null,
    userInitials: (state) => {
      if (!state.user) return ''
      return state.user.nama
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },
  },

  actions: {
    login(email: string, password: string): { success: boolean; message: string } {
      const user = users.find((u) => u.email === email && u.password === password)
      if (!user) {
        return { success: false, message: 'Email atau password salah' }
      }
      if (user.status === 'Nonaktif') {
        return { success: false, message: 'Akun Anda sudah dinonaktifkan' }
      }
      this.user = user
      this.isLoggedIn = true
      return { success: true, message: 'Login berhasil' }
    },

    logout() {
      this.user = null
      this.isLoggedIn = false
      navigateTo('/login')
    },

    updateProfile(nama: string, email: string) {
      if (this.user) {
        this.user = { ...this.user, nama, email }
      }
    },
  },
})

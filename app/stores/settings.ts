import { defineStore } from 'pinia'
import { useCookie } from '#app'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    namaToko: useCookie('set_namaToko', { default: () => 'PantauBisnis' }),
    alamat: useCookie('set_alamat', { default: () => 'Jl. Contoh No. 1, Kota Bandung' }),
    telepon: useCookie('set_telepon', { default: () => '0812-3456-7890' }),
    headerStruk: useCookie('set_headerStruk', { default: () => 'PANTAU BISNIS' }),
    footerStruk: useCookie('set_footerStruk', { default: () => 'Terima Kasih!' }),
  }),
  actions: {
    saveSettings(payload: any) {
      this.namaToko = payload.namaToko
      this.alamat = payload.alamat
      this.telepon = payload.telepon
      this.headerStruk = payload.headerStruk
      this.footerStruk = payload.footerStruk
    }
  }
})

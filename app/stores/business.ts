import { defineStore } from 'pinia'
import { businessList } from '~/data/dashboard'

export const useBusinessStore = defineStore('business', {
  state: () => ({
    activeBisnis: null as string | null,
    activeSlug: null as string | null,
  }),

  getters: {
    activeBusinessInfo: (state) => {
      if (!state.activeSlug) return null
      return businessList.find((b) => b.slug === state.activeSlug) || null
    },
    bisnisList: () => businessList,
  },

  actions: {
    setBisnis(slug: string) {
      const biz = businessList.find((b) => b.slug === slug)
      if (biz) {
        this.activeBisnis = biz.nama
        this.activeSlug = biz.slug
      }
    },

    clearBisnis() {
      this.activeBisnis = null
      this.activeSlug = null
    },

    slugToName(slug: string): string {
      const biz = businessList.find((b) => b.slug === slug)
      return biz?.nama || slug
    },

    nameToSlug(nama: string): string {
      const biz = businessList.find((b) => b.nama === nama)
      return biz?.slug || nama.toLowerCase().replace(/\s+/g, '-')
    },
  },
})

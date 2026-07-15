import { defineStore } from 'pinia'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

let toastIdCounter = 0

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [] as Toast[],
  }),

  actions: {
    add(message: string, type: Toast['type'] = 'info') {
      const id = ++toastIdCounter
      this.toasts.push({ id, message, type })
      setTimeout(() => {
        this.remove(id)
      }, 4000)
    },

    remove(id: number) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },

    success(message: string) {
      this.add(message, 'success')
    },

    error(message: string) {
      this.add(message, 'error')
    },

    warning(message: string) {
      this.add(message, 'warning')
    },

    info(message: string) {
      this.add(message, 'info')
    },
  },
})

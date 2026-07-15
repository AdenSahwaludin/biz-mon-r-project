import { defineStore } from 'pinia'
import type { Product } from '~/data/products'

export interface CartItem {
  produk: Product
  qty: number
  subtotal: number
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    metodePembayaran: 'Tunai' as 'Tunai' | 'QRIS',
    nominalBayar: 0,
  }),

  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.qty, 0),
    subtotal: (state) => state.items.reduce((sum, item) => sum + item.subtotal, 0),
    kembalian: (state) => {
      const sub = state.items.reduce((sum, item) => sum + item.subtotal, 0)
      return state.nominalBayar - sub
    },
    isPayable: (state) => {
      const sub = state.items.reduce((sum, item) => sum + item.subtotal, 0)
      return state.items.length > 0 && state.nominalBayar >= sub
    },
    isEmpty: (state) => state.items.length === 0,
  },

  actions: {
    addItem(product: Product) {
      const existing = this.items.find((item) => item.produk.id === product.id)
      if (existing) {
        existing.qty += 1
        existing.subtotal = existing.qty * existing.produk.harga
      } else {
        this.items.push({
          produk: product,
          qty: 1,
          subtotal: product.harga,
        })
      }
    },

    removeItem(productId: string) {
      this.items = this.items.filter((item) => item.produk.id !== productId)
    },

    updateQty(productId: string, qty: number) {
      const item = this.items.find((item) => item.produk.id === productId)
      if (item) {
        if (qty <= 0) {
          this.removeItem(productId)
        } else {
          item.qty = qty
          item.subtotal = item.qty * item.produk.harga
        }
      }
    },

    incrementQty(productId: string) {
      const item = this.items.find((item) => item.produk.id === productId)
      if (item) {
        item.qty += 1
        item.subtotal = item.qty * item.produk.harga
      }
    },

    decrementQty(productId: string) {
      const item = this.items.find((item) => item.produk.id === productId)
      if (item) {
        if (item.qty <= 1) {
          this.removeItem(productId)
        } else {
          item.qty -= 1
          item.subtotal = item.qty * item.produk.harga
        }
      }
    },

    setMetodePembayaran(metode: 'Tunai' | 'QRIS') {
      this.metodePembayaran = metode
    },

    setNominalBayar(nominal: number) {
      this.nominalBayar = nominal
    },

    generateTransactionId() {
      const now = new Date()
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
      const rand = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
      return `TRX-${dateStr}-${rand}`
    },

    clearCart() {
      this.items = []
      this.nominalBayar = 0
      this.metodePembayaran = 'Tunai'
    },
  },
})

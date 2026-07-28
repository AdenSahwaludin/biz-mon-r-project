import { defineStore } from 'pinia'

export interface Product {
  id: string
  name: string
  barcode?: string
  price: number
  stock: number
  unit: string
  businessId: string
  categoryId: string
  isActive: boolean
}

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
      const toast = useToastStore()
      if (product.stock <= 0) {
        toast.error(`Stok "${product.name}" habis (Tersisa: 0)`)
        return false
      }

      const existing = this.items.find((item) => item.produk.id === product.id)
      if (existing) {
        if (existing.qty >= product.stock) {
          toast.error(`Maksimal pembelian untuk "${product.name}" adalah ${product.stock} ${product.unit || 'pcs'}`)
          return false
        }
        existing.qty += 1
        existing.subtotal = existing.qty * existing.produk.price
      } else {
        this.items.push({
          produk: product,
          qty: 1,
          subtotal: product.price,
        })
      }
      return true
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
          const maxStock = item.produk.stock
          if (qty > maxStock) {
            const toast = useToastStore()
            toast.error(`Maksimal pembelian untuk "${item.produk.name}" adalah ${maxStock} ${item.produk.unit || 'pcs'}`)
            item.qty = maxStock
          } else {
            item.qty = qty
          }
          item.subtotal = item.qty * item.produk.price
        }
      }
    },

    incrementQty(productId: string) {
      const item = this.items.find((item) => item.produk.id === productId)
      if (item) {
        if (item.qty >= item.produk.stock) {
          const toast = useToastStore()
          toast.error(`Maksimal pembelian untuk "${item.produk.name}" adalah ${item.produk.stock} ${item.produk.unit || 'pcs'}`)
          return
        }
        item.qty += 1
        item.subtotal = item.qty * item.produk.price
      }
    },

    decrementQty(productId: string) {
      const item = this.items.find((item) => item.produk.id === productId)
      if (item) {
        if (item.qty <= 1) {
          this.removeItem(productId)
        } else {
          item.qty -= 1
          item.subtotal = item.qty * item.produk.price
        }
      }
    },

    setMetodePembayaran(metode: 'Tunai' | 'QRIS') {
      this.metodePembayaran = metode
    },

    setNominalBayar(nominal: number) {
      this.nominalBayar = nominal
    },

    clearCart() {
      this.items = []
      this.nominalBayar = 0
      this.metodePembayaran = 'Tunai'
    },
  },
})
